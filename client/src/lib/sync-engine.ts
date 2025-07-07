/**
 * Advanced Synchronization Engine
 * Handles real-time data synchronization between client and server
 * Supports conflict resolution, batch operations, and versioning
 */

import { clientDB } from './client-database';
import { VersionManager } from './version-manager';

export interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: string | null;
  pendingActions: number;
  conflictCount: number;
  syncProgress: number; // 0-100
  errors: SyncError[];
}

export interface SyncError {
  id: string;
  type: 'network' | 'conflict' | 'validation' | 'server';
  message: string;
  timestamp: string;
  entity?: string;
  entityId?: number;
  retryCount: number;
  maxRetries: number;
}

export interface SyncConflict {
  id: string;
  entity: string;
  entityId: number;
  localData: any;
  serverData: any;
  timestamp: string;
  resolved: boolean;
  resolution?: 'local' | 'server' | 'merge';
}

export interface SyncBatch {
  id: string;
  operations: SyncOperation[];
  timestamp: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  retryCount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  entityId?: number;
  data: any;
  localTimestamp: string;
  serverTimestamp?: string;
  checksum: string;
}

export class SyncEngine {
  private static instance: SyncEngine;
  private syncState: SyncState;
  private syncQueue: SyncBatch[] = [];
  private conflicts: SyncConflict[] = [];
  private isProcessing = false;
  private syncInterval?: NodeJS.Timeout;
  private listeners: ((state: SyncState) => void)[] = [];
  
  private readonly SYNC_INTERVAL = 30 * 1000; // 30 seconds
  private readonly BATCH_SIZE = 50;
  private readonly MAX_RETRIES = 3;
  private readonly CONFLICT_RESOLUTION_TIMEOUT = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.syncState = {
      isOnline: navigator.onLine,
      isSyncing: false,
      lastSyncTime: localStorage.getItem('lastSyncTime'),
      pendingActions: 0,
      conflictCount: 0,
      syncProgress: 0,
      errors: []
    };

    this.setupNetworkListeners();
    this.loadPersistedState();
  }

  static getInstance(): SyncEngine {
    if (!SyncEngine.instance) {
      SyncEngine.instance = new SyncEngine();
    }
    return SyncEngine.instance;
  }

  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.updateSyncState({ isOnline: true });
      this.triggerSync();
    });

    window.addEventListener('offline', () => {
      this.updateSyncState({ isOnline: false });
      this.pauseSync();
    });

    // Listen for app updates
    window.addEventListener('appUpdated', () => {
      this.triggerFullSync();
    });
  }

  private async loadPersistedState(): Promise<void> {
    try {
      // Load pending operations from IndexedDB
      const pendingActions = await clientDB.getPendingActions();
      const conflicts = await this.loadConflicts();
      
      this.updateSyncState({
        pendingActions: pendingActions.length,
        conflictCount: conflicts.length
      });
      
      this.conflicts = conflicts;
    } catch (error) {
      console.error('Sync: Failed to load persisted state:', error);
    }
  }

  private async loadConflicts(): Promise<SyncConflict[]> {
    try {
      const stored = localStorage.getItem('sync_conflicts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveConflicts(): void {
    try {
      localStorage.setItem('sync_conflicts', JSON.stringify(this.conflicts));
    } catch (error) {
      console.error('Sync: Failed to save conflicts:', error);
    }
  }

  public addListener(callback: (state: SyncState) => void): void {
    this.listeners.push(callback);
  }

  public removeListener(callback: (state: SyncState) => void): void {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  private updateSyncState(updates: Partial<SyncState>): void {
    this.syncState = { ...this.syncState, ...updates };
    this.listeners.forEach(listener => listener(this.syncState));
  }

  public getSyncState(): SyncState {
    return { ...this.syncState };
  }

  public async initialize(): Promise<void> {
    console.log('Sync: Initializing synchronization engine');
    
    await this.loadPersistedState();
    
    if (this.syncState.isOnline) {
      this.startPeriodicSync();
      // Trigger initial sync after a short delay
      setTimeout(() => this.triggerSync(), 2000);
    }
  }

  private startPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      if (this.syncState.isOnline && !this.isProcessing) {
        this.triggerSync();
      }
    }, this.SYNC_INTERVAL);
  }

  private pauseSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = undefined;
    }
  }

  public async triggerSync(): Promise<void> {
    if (this.isProcessing || !this.syncState.isOnline) {
      return;
    }

    try {
      this.isProcessing = true;
      this.updateSyncState({ isSyncing: true, syncProgress: 0 });

      console.log('Sync: Starting synchronization cycle');

      // Step 1: Check for app version updates
      await this.checkVersionUpdates();

      // Step 2: Push local changes to server
      await this.pushLocalChanges();

      // Step 3: Pull server changes
      await this.pullServerChanges();

      // Step 4: Resolve conflicts
      await this.resolveConflicts();

      // Step 5: Update last sync time
      const now = new Date().toISOString();
      localStorage.setItem('lastSyncTime', now);
      
      this.updateSyncState({
        isSyncing: false,
        lastSyncTime: now,
        syncProgress: 100
      });

      console.log('Sync: Synchronization completed successfully');

    } catch (error) {
      console.error('Sync: Synchronization failed:', error);
      this.handleSyncError(error);
    } finally {
      this.isProcessing = false;
      this.updateSyncState({ isSyncing: false });
    }
  }

  public async triggerFullSync(): Promise<void> {
    console.log('Sync: Triggering full synchronization');
    
    // Clear last sync time to force full sync
    localStorage.removeItem('lastSyncTime');
    this.updateSyncState({ lastSyncTime: null });
    
    await this.triggerSync();
  }

  private async checkVersionUpdates(): Promise<void> {
    try {
      this.updateSyncState({ syncProgress: 10 });
      
      const versionComparison = await VersionManager.checkForUpdates();
      
      if (versionComparison.updateAvailable) {
        console.log('Sync: App update detected, handling update');
        await VersionManager.handleAppUpdate();
      }
    } catch (error) {
      console.warn('Sync: Version check failed:', error);
    }
  }

  private async pushLocalChanges(): Promise<void> {
    this.updateSyncState({ syncProgress: 25 });
    
    const pendingActions = await clientDB.getPendingActions();
    
    if (pendingActions.length === 0) {
      return;
    }

    console.log(`Sync: Pushing ${pendingActions.length} local changes`);

    // Group actions into batches
    const batches = this.createSyncBatches(pendingActions);

    for (const batch of batches) {
      await this.processSyncBatch(batch);
    }

    this.updateSyncState({ 
      pendingActions: await clientDB.getPendingActions().then(actions => actions.length)
    });
  }

  private createSyncBatches(actions: any[]): SyncBatch[] {
    const batches: SyncBatch[] = [];
    
    for (let i = 0; i < actions.length; i += this.BATCH_SIZE) {
      const batchActions = actions.slice(i, i + this.BATCH_SIZE);
      
      batches.push({
        id: `batch_${Date.now()}_${i}`,
        operations: batchActions.map(action => ({
          id: action.id || `op_${Date.now()}_${Math.random()}`,
          type: action.type,
          entity: action.entity,
          entityId: action.entityId,
          data: action.data,
          localTimestamp: action.timestamp || new Date().toISOString(),
          checksum: this.calculateChecksum(action.data)
        })),
        timestamp: new Date().toISOString(),
        priority: 'normal',
        retryCount: 0,
        status: 'pending'
      });
    }

    return batches;
  }

  private calculateChecksum(data: any): string {
    // Simple checksum calculation (in production, use a proper hash function)
    return btoa(JSON.stringify(data)).slice(0, 16);
  }

  private async processSyncBatch(batch: SyncBatch): Promise<void> {
    try {
      batch.status = 'processing';
      
      const response = await fetch('/api/sync/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batch)
      });

      if (response.ok) {
        const result = await response.json();
        
        // Handle successful operations
        for (const success of result.successful || []) {
          await clientDB.removeOfflineAction(success.operationId);
        }

        // Handle conflicts
        for (const conflict of result.conflicts || []) {
          await this.handleConflict(conflict);
        }

        batch.status = 'completed';
        console.log(`Sync: Batch ${batch.id} completed successfully`);
        
      } else {
        throw new Error(`Batch sync failed: ${response.status} ${response.statusText}`);
      }
      
    } catch (error) {
      batch.status = 'failed';
      batch.retryCount++;
      
      if (batch.retryCount < this.MAX_RETRIES) {
        console.warn(`Sync: Batch ${batch.id} failed, will retry (${batch.retryCount}/${this.MAX_RETRIES})`);
        this.syncQueue.push(batch);
      } else {
        console.error(`Sync: Batch ${batch.id} failed permanently:`, error);
        this.addSyncError({
          type: 'network',
          message: `Failed to sync batch after ${this.MAX_RETRIES} retries`,
          entity: 'batch',
          entityId: undefined
        });
      }
    }
  }

  private async pullServerChanges(): Promise<void> {
    this.updateSyncState({ syncProgress: 60 });
    
    try {
      const lastSyncTime = this.syncState.lastSyncTime;
      const url = lastSyncTime 
        ? `/api/sync/changes?since=${encodeURIComponent(lastSyncTime)}`
        : '/api/sync/changes';

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch server changes: ${response.status}`);
      }

      const changes = await response.json();
      
      if (changes.length > 0) {
        console.log(`Sync: Applying ${changes.length} server changes`);
        await this.applyServerChanges(changes);
      }
      
    } catch (error) {
      console.error('Sync: Failed to pull server changes:', error);
      this.addSyncError({
        type: 'network',
        message: 'Failed to fetch server updates'
      });
    }
  }

  private async applyServerChanges(changes: any[]): Promise<void> {
    for (const change of changes) {
      try {
        await this.applyServerChange(change);
      } catch (error) {
        console.error(`Sync: Failed to apply change ${change.id}:`, error);
        
        if (this.isConflict(error)) {
          await this.handleConflict({
            entity: change.entity,
            entityId: change.entityId,
            serverData: change.data,
            localData: await this.getLocalData(change.entity, change.entityId)
          });
        }
      }
    }
  }

  private async applyServerChange(change: any): Promise<void> {
    const { entity, entityId, type, data } = change;

    switch (entity) {
      case 'projects':
        if (type === 'delete') {
          await clientDB.projects.delete(entityId);
        } else {
          await clientDB.projects.put(data);
        }
        break;
        
      case 'transactions':
        if (type === 'delete') {
          await clientDB.transactions.delete(entityId);
        } else {
          await clientDB.transactions.put(data);
        }
        break;
        
      case 'users':
        if (type === 'delete') {
          await clientDB.users.delete(entityId);
        } else {
          await clientDB.users.put(data);
        }
        break;
        
      case 'equipment':
        if (type === 'delete') {
          await clientDB.equipment.delete(entityId);
        } else {
          await clientDB.equipment.put(data);
        }
        break;
        
      case 'warehouses':
        if (type === 'delete') {
          await clientDB.warehouses.delete(entityId);
        } else {
          await clientDB.warehouses.put(data);
        }
        break;
        
      default:
        console.warn(`Sync: Unknown entity type: ${entity}`);
    }
  }

  private isConflict(error: any): boolean {
    // Detect if error is due to data conflict
    return error.name === 'ConstraintError' || 
           error.message?.includes('conflict') ||
           error.message?.includes('version');
  }

  private async getLocalData(entity: string, entityId: number): Promise<any> {
    switch (entity) {
      case 'projects':
        return await clientDB.projects.get(entityId);
      case 'transactions':
        return await clientDB.transactions.get(entityId);
      case 'users':
        return await clientDB.users.get(entityId);
      case 'equipment':
        return await clientDB.equipment.get(entityId);
      case 'warehouses':
        return await clientDB.warehouses.get(entityId);
      default:
        return null;
    }
  }

  private async handleConflict(conflictData: any): Promise<void> {
    const conflict: SyncConflict = {
      id: `conflict_${Date.now()}_${Math.random()}`,
      entity: conflictData.entity,
      entityId: conflictData.entityId,
      localData: conflictData.localData,
      serverData: conflictData.serverData,
      timestamp: new Date().toISOString(),
      resolved: false
    };

    this.conflicts.push(conflict);
    this.saveConflicts();
    
    this.updateSyncState({ 
      conflictCount: this.conflicts.filter(c => !c.resolved).length 
    });

    console.log(`Sync: Conflict detected for ${conflict.entity}:${conflict.entityId}`);

    // Notify UI about conflict
    const event = new CustomEvent('syncConflict', { detail: conflict });
    window.dispatchEvent(event);

    // Auto-resolve simple conflicts
    await this.attemptAutoResolve(conflict);
  }

  private async attemptAutoResolve(conflict: SyncConflict): Promise<void> {
    // Simple auto-resolution strategy: server wins for most cases
    // In production, implement more sophisticated conflict resolution
    
    if (!conflict.localData) {
      // Local data was deleted, accept server data
      await this.resolveConflict(conflict.id, 'server');
    } else if (!conflict.serverData) {
      // Server data was deleted, keep local for user decision
      // Don't auto-resolve deletion conflicts
      return;
    } else {
      // Both exist, compare timestamps if available
      const localTime = new Date(conflict.localData.lastModified || conflict.localData.createdAt);
      const serverTime = new Date(conflict.serverData.lastModified || conflict.serverData.createdAt);
      
      if (serverTime > localTime) {
        await this.resolveConflict(conflict.id, 'server');
      }
      // Otherwise, keep conflict for manual resolution
    }
  }

  public async resolveConflict(conflictId: string, resolution: 'local' | 'server' | 'merge'): Promise<void> {
    const conflict = this.conflicts.find(c => c.id === conflictId);
    if (!conflict) {
      return;
    }

    try {
      let finalData: any;

      switch (resolution) {
        case 'local':
          finalData = conflict.localData;
          break;
        case 'server':
          finalData = conflict.serverData;
          break;
        case 'merge':
          finalData = this.mergeConflictData(conflict.localData, conflict.serverData);
          break;
      }

      // Apply resolution
      await this.applyServerChange({
        entity: conflict.entity,
        entityId: conflict.entityId,
        type: finalData ? 'update' : 'delete',
        data: finalData
      });

      // Mark conflict as resolved
      conflict.resolved = true;
      conflict.resolution = resolution;
      this.saveConflicts();

      this.updateSyncState({ 
        conflictCount: this.conflicts.filter(c => !c.resolved).length 
      });

      console.log(`Sync: Conflict ${conflictId} resolved with ${resolution}`);

    } catch (error) {
      console.error(`Sync: Failed to resolve conflict ${conflictId}:`, error);
    }
  }

  private mergeConflictData(localData: any, serverData: any): any {
    // Simple merge strategy - in production, implement field-level merging
    return {
      ...localData,
      ...serverData,
      lastModified: new Date().toISOString()
    };
  }

  private async resolveConflicts(): Promise<void> {
    this.updateSyncState({ syncProgress: 85 });
    
    // Clean up old resolved conflicts
    const now = Date.now();
    this.conflicts = this.conflicts.filter(conflict => {
      const age = now - new Date(conflict.timestamp).getTime();
      return !conflict.resolved || age < this.CONFLICT_RESOLUTION_TIMEOUT;
    });
    
    this.saveConflicts();
  }

  private addSyncError(errorData: Partial<SyncError>): void {
    const error: SyncError = {
      id: `error_${Date.now()}_${Math.random()}`,
      type: errorData.type || 'network',
      message: errorData.message || 'Unknown sync error',
      timestamp: new Date().toISOString(),
      entity: errorData.entity,
      entityId: errorData.entityId,
      retryCount: errorData.retryCount || 0,
      maxRetries: this.MAX_RETRIES
    };

    this.syncState.errors.push(error);
    
    // Keep only recent errors
    if (this.syncState.errors.length > 50) {
      this.syncState.errors = this.syncState.errors.slice(-50);
    }

    this.updateSyncState({ errors: [...this.syncState.errors] });
  }

  private handleSyncError(error: any): void {
    this.addSyncError({
      type: 'network',
      message: error.message || 'Synchronization failed'
    });

    this.updateSyncState({ isSyncing: false, syncProgress: 0 });
  }

  public getConflicts(): SyncConflict[] {
    return this.conflicts.filter(c => !c.resolved);
  }

  public async clearErrors(): Promise<void> {
    this.updateSyncState({ errors: [] });
  }

  public async retryFailedOperations(): Promise<void> {
    if (this.syncQueue.length > 0) {
      console.log(`Sync: Retrying ${this.syncQueue.length} failed operations`);
      
      const failedBatches = [...this.syncQueue];
      this.syncQueue = [];
      
      for (const batch of failedBatches) {
        await this.processSyncBatch(batch);
      }
    }
  }
}

// Export singleton instance
export const syncEngine = SyncEngine.getInstance();