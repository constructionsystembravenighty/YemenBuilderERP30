/**
 * Version Management System
 * Handles app versioning, update detection, and migration management
 */

export interface AppVersion {
  major: number;
  minor: number;
  patch: number;
  build: string;
  timestamp: string;
  features: string[];
  migrations: string[];
}

export interface VersionComparison {
  current: AppVersion;
  latest: AppVersion;
  updateAvailable: boolean;
  updateType: 'major' | 'minor' | 'patch' | 'build' | 'none';
  requiresDataMigration: boolean;
  breaking: boolean;
}

export class VersionManager {
  private static readonly CURRENT_VERSION: AppVersion = {
    major: 1,
    minor: 2,
    patch: 0,
    build: Date.now().toString(),
    timestamp: new Date().toISOString(),
    features: [
      'PWA_OFFLINE_SUPPORT',
      'ARABIC_RTL_INTERFACE', 
      'BUSINESS_INTELLIGENCE',
      'REAL_TIME_SYNC',
      'VERSION_TRACKING',
      'DATA_MIGRATION'
    ],
    migrations: [
      'initial_schema_v1.0.0',
      'sync_status_v1.1.0',
      'version_tracking_v1.2.0'
    ]
  };

  private static readonly VERSION_KEY = 'app_version';
  private static readonly UPDATE_CHECK_INTERVAL = 30 * 60 * 1000; // 30 minutes

  static getCurrentVersion(): AppVersion {
    return { ...this.CURRENT_VERSION };
  }

  static getStoredVersion(): AppVersion | null {
    try {
      const stored = localStorage.getItem(this.VERSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Version: Failed to parse stored version:', error);
      return null;
    }
  }

  static setStoredVersion(version: AppVersion): void {
    try {
      localStorage.setItem(this.VERSION_KEY, JSON.stringify(version));
    } catch (error) {
      console.error('Version: Failed to store version:', error);
    }
  }

  static compareVersions(current: AppVersion, latest: AppVersion): VersionComparison {
    let updateType: 'major' | 'minor' | 'patch' | 'build' | 'none' = 'none';
    let updateAvailable = false;
    let breaking = false;

    if (latest.major > current.major) {
      updateType = 'major';
      updateAvailable = true;
      breaking = true;
    } else if (latest.major === current.major && latest.minor > current.minor) {
      updateType = 'minor';
      updateAvailable = true;
    } else if (
      latest.major === current.major && 
      latest.minor === current.minor && 
      latest.patch > current.patch
    ) {
      updateType = 'patch';
      updateAvailable = true;
    } else if (
      latest.major === current.major && 
      latest.minor === current.minor && 
      latest.patch === current.patch &&
      latest.build !== current.build
    ) {
      updateType = 'build';
      updateAvailable = true;
    }

    const requiresDataMigration = latest.migrations.some(
      migration => !current.migrations.includes(migration)
    );

    return {
      current,
      latest,
      updateAvailable,
      updateType,
      requiresDataMigration,
      breaking
    };
  }

  static async checkForUpdates(): Promise<VersionComparison> {
    try {
      // Check server for latest version
      const response = await fetch('/api/version', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      let latestVersion: AppVersion;
      
      if (response.ok) {
        latestVersion = await response.json();
      } else {
        // Fallback to current version if server unavailable
        latestVersion = this.getCurrentVersion();
      }

      const storedVersion = this.getStoredVersion() || this.getCurrentVersion();
      
      return this.compareVersions(storedVersion, latestVersion);
    } catch (error) {
      console.warn('Version: Update check failed, using current version:', error);
      const currentVersion = this.getCurrentVersion();
      return {
        current: currentVersion,
        latest: currentVersion,
        updateAvailable: false,
        updateType: 'none',
        requiresDataMigration: false,
        breaking: false
      };
    }
  }

  static async handleAppUpdate(): Promise<boolean> {
    try {
      const versionCheck = await this.checkForUpdates();
      
      if (versionCheck.updateAvailable) {
        console.log(`Version: Update available ${versionCheck.updateType}`, versionCheck);

        // Handle data migrations if needed
        if (versionCheck.requiresDataMigration) {
          await this.performDataMigrations(versionCheck.current, versionCheck.latest);
        }

        // Update stored version
        this.setStoredVersion(versionCheck.latest);

        // Notify user of update
        const event = new CustomEvent('appUpdated', {
          detail: versionCheck
        });
        window.dispatchEvent(event);

        return true;
      }

      return false;
    } catch (error) {
      console.error('Version: Failed to handle app update:', error);
      return false;
    }
  }

  static async performDataMigrations(from: AppVersion, to: AppVersion): Promise<void> {
    const pendingMigrations = to.migrations.filter(
      migration => !from.migrations.includes(migration)
    );

    if (pendingMigrations.length === 0) {
      return;
    }

    console.log('Version: Performing data migrations:', pendingMigrations);

    for (const migration of pendingMigrations) {
      try {
        await this.runMigration(migration);
        console.log(`Version: Migration completed: ${migration}`);
      } catch (error) {
        console.error(`Version: Migration failed: ${migration}`, error);
        throw error;
      }
    }
  }

  private static async runMigration(migrationName: string): Promise<void> {
    switch (migrationName) {
      case 'initial_schema_v1.0.0':
        // Initial database setup - already handled
        break;
        
      case 'sync_status_v1.1.0':
        // Add sync status to existing records
        const { clientDB } = await import('./client-database');
        
        // Update all existing records to have sync status
        await clientDB.transaction('rw', [
          clientDB.projects, 
          clientDB.transactions, 
          clientDB.users,
          clientDB.equipment,
          clientDB.warehouses
        ], async () => {
          // Add syncStatus to records missing it
          await clientDB.projects.toCollection().modify({ syncStatus: 'synced' });
          await clientDB.transactions.toCollection().modify({ syncStatus: 'synced' });
          await clientDB.users.toCollection().modify({ syncStatus: 'synced' });
          await clientDB.equipment.toCollection().modify({ syncStatus: 'synced' });
          await clientDB.warehouses.toCollection().modify({ syncStatus: 'synced' });
        });
        break;
        
      case 'version_tracking_v1.2.0':
        // Add version tracking to app metadata
        localStorage.setItem('migration_v1.2.0_completed', new Date().toISOString());
        break;
        
      default:
        console.warn(`Version: Unknown migration: ${migrationName}`);
    }
  }

  static async initialize(): Promise<void> {
    try {
      const storedVersion = this.getStoredVersion();
      const currentVersion = this.getCurrentVersion();

      if (!storedVersion) {
        // First app run - store current version
        this.setStoredVersion(currentVersion);
        console.log('Version: First app run, version stored:', currentVersion);
      } else {
        // Check for updates
        const updateHandled = await this.handleAppUpdate();
        if (updateHandled) {
          console.log('Version: App updated successfully');
        }
      }

      // Set up periodic update checks
      setInterval(() => {
        this.checkForUpdates().then(comparison => {
          if (comparison.updateAvailable) {
            const event = new CustomEvent('updateAvailable', {
              detail: comparison
            });
            window.dispatchEvent(event);
          }
        });
      }, this.UPDATE_CHECK_INTERVAL);

    } catch (error) {
      console.error('Version: Initialization failed:', error);
    }
  }

  static getVersionString(): string {
    const version = this.getCurrentVersion();
    return `${version.major}.${version.minor}.${version.patch}`;
  }

  static getBuildInfo(): string {
    const version = this.getCurrentVersion();
    return `Build ${version.build} (${new Date(version.timestamp).toLocaleDateString('ar-YE')})`;
  }
}