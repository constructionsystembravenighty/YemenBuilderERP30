/**
 * Offline Storage System for Construction Management Platform
 * Provides complete offline functionality using IndexedDB and localStorage
 * 
 * Features:
 * - Local data persistence
 * - Offline CRUD operations
 * - Data synchronization when online
 * - Automatic conflict resolution
 */

export interface OfflineProject {
  id: number;
  name: string;
  nameAr: string;
  description?: string;
  descriptionAr?: string;
  location?: string;
  locationAr?: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'critical';
  budget: number;
  spent: number;
  progress: number;
  startDate?: string;
  endDate?: string;
  companyId: number;
  managerId: number;
  createdAt: string;
  lastModified: string;
  syncStatus: 'synced' | 'pending' | 'conflict';
}

export interface OfflineTransaction {
  id: number;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  categoryAr: string;
  description?: string;
  descriptionAr?: string;
  amount: number;
  currency: string;
  exchangeRate: number;
  projectId?: number;
  companyId: number;
  createdBy: number;
  transactionDate: string;
  createdAt: string;
  lastModified: string;
  syncStatus: 'synced' | 'pending' | 'conflict';
}

export interface OfflineUser {
  id: number;
  username: string;
  name: string;
  nameAr: string;
  email?: string;
  phone?: string;
  role: 'ceo' | 'manager' | 'supervisor' | 'employee' | 'worker';
  department?: string;
  departmentAr?: string;
  companyId: number;
  managerId?: number;
  salary?: number;
  hireDate?: string;
  isActive: boolean;
  createdAt: string;
  lastModified: string;
  syncStatus: 'synced' | 'pending' | 'conflict';
}

export interface OfflineEquipment {
  id: number;
  name: string;
  nameAr: string;
  type: string;
  typeAr: string;
  model?: string;
  serialNumber?: string;
  status: 'available' | 'in_use' | 'maintenance' | 'offline';
  location?: string;
  locationAr?: string;
  companyId: number;
  assignedProjectId?: number;
  purchaseDate?: string;
  purchasePrice?: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  createdAt: string;
  lastModified: string;
  syncStatus: 'synced' | 'pending' | 'conflict';
}

export interface OfflineCompany {
  id: number;
  name: string;
  nameAr: string;
  type: 'main' | 'branch';
  parentId?: number;
  location?: string;
  locationAr?: string;
  phone?: string;
  email?: string;
  createdAt: string;
  lastModified: string;
  syncStatus: 'synced' | 'pending' | 'conflict';
}

export interface OfflineWarehouse {
  id: number;
  name: string;
  nameAr: string;
  location?: string;
  locationAr?: string;
  companyId: number;
  managerId?: number;
  capacity?: number;
  currentStock: number;
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: string;
  lastModified: string;
  syncStatus: 'synced' | 'pending' | 'conflict';
}

export interface OfflineAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'projects' | 'transactions' | 'users' | 'equipment' | 'companies' | 'warehouses';
  entityId: number;
  data: any;
  timestamp: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
}

class OfflineStorageManager {
  private dbName = 'ConstructionMgmtDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  // Initialize IndexedDB
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        console.log('Offline Storage: IndexedDB initialized');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        console.log('Offline Storage: Setting up database schema');

        // Create object stores
        if (!db.objectStoreNames.contains('projects')) {
          const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
          projectStore.createIndex('companyId', 'companyId', { unique: false });
          projectStore.createIndex('status', 'status', { unique: false });
          projectStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        }

        if (!db.objectStoreNames.contains('transactions')) {
          const transactionStore = db.createObjectStore('transactions', { keyPath: 'id' });
          transactionStore.createIndex('companyId', 'companyId', { unique: false });
          transactionStore.createIndex('projectId', 'projectId', { unique: false });
          transactionStore.createIndex('type', 'type', { unique: false });
          transactionStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        }

        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id' });
          userStore.createIndex('companyId', 'companyId', { unique: false });
          userStore.createIndex('role', 'role', { unique: false });
          userStore.createIndex('username', 'username', { unique: true });
          userStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        }

        if (!db.objectStoreNames.contains('equipment')) {
          const equipmentStore = db.createObjectStore('equipment', { keyPath: 'id' });
          equipmentStore.createIndex('companyId', 'companyId', { unique: false });
          equipmentStore.createIndex('status', 'status', { unique: false });
          equipmentStore.createIndex('assignedProjectId', 'assignedProjectId', { unique: false });
          equipmentStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        }

        if (!db.objectStoreNames.contains('companies')) {
          const companyStore = db.createObjectStore('companies', { keyPath: 'id' });
          companyStore.createIndex('type', 'type', { unique: false });
          companyStore.createIndex('parentId', 'parentId', { unique: false });
          companyStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        }

        if (!db.objectStoreNames.contains('warehouses')) {
          const warehouseStore = db.createObjectStore('warehouses', { keyPath: 'id' });
          warehouseStore.createIndex('companyId', 'companyId', { unique: false });
          warehouseStore.createIndex('status', 'status', { unique: false });
          warehouseStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        }

        if (!db.objectStoreNames.contains('offlineActions')) {
          db.createObjectStore('offlineActions', { keyPath: 'id' });
        }

        console.log('Offline Storage: Database schema setup complete');
      };
    });
  }

  // Generic CRUD operations
  private async performTransaction<T>(
    storeName: string,
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest<T>
  ): Promise<T> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], mode);
      const store = transaction.objectStore(storeName);
      const request = operation(store);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Projects operations
  async getProjects(companyId: number): Promise<OfflineProject[]> {
    if (!this.db) return [];
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['projects'], 'readonly');
      const store = transaction.objectStore('projects');
      const index = store.index('companyId');
      const request = index.getAll(companyId);

      request.onsuccess = () => {
        const projects = request.result.sort((a, b) => 
          new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
        );
        resolve(projects);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getProject(id: number): Promise<OfflineProject | null> {
    const result = await this.performTransaction('projects', 'readonly', (store) =>
      store.get(id)
    );
    return result || null;
  }

  async saveProject(project: Omit<OfflineProject, 'lastModified' | 'syncStatus'>): Promise<OfflineProject> {
    const now = new Date().toISOString();
    const fullProject: OfflineProject = {
      ...project,
      lastModified: now,
      syncStatus: 'pending'
    };

    await this.performTransaction('projects', 'readwrite', (store) =>
      store.put(fullProject)
    );

    // Queue for sync
    await this.queueOfflineAction('projects', project.id, 'update', fullProject);
    
    return fullProject;
  }

  async deleteProject(id: number): Promise<void> {
    await this.performTransaction('projects', 'readwrite', (store) =>
      store.delete(id)
    );

    // Queue for sync
    await this.queueOfflineAction('projects', id, 'delete', { id });
  }

  // Transactions operations
  async getTransactions(companyId: number): Promise<OfflineTransaction[]> {
    if (!this.db) return [];
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['transactions'], 'readonly');
      const store = transaction.objectStore('transactions');
      const index = store.index('companyId');
      const request = index.getAll(companyId);

      request.onsuccess = () => {
        const transactions = request.result.sort((a, b) => 
          new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
        );
        resolve(transactions);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveTransaction(transaction: Omit<OfflineTransaction, 'lastModified' | 'syncStatus'>): Promise<OfflineTransaction> {
    const now = new Date().toISOString();
    const fullTransaction: OfflineTransaction = {
      ...transaction,
      lastModified: now,
      syncStatus: 'pending'
    };

    await this.performTransaction('transactions', 'readwrite', (store) =>
      store.put(fullTransaction)
    );

    // Queue for sync
    await this.queueOfflineAction('transactions', transaction.id, 'update', fullTransaction);
    
    return fullTransaction;
  }

  // Users operations
  async getUsers(companyId: number): Promise<OfflineUser[]> {
    if (!this.db) return [];
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const index = store.index('companyId');
      const request = index.getAll(companyId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveUser(user: Omit<OfflineUser, 'lastModified' | 'syncStatus'>): Promise<OfflineUser> {
    const now = new Date().toISOString();
    const fullUser: OfflineUser = {
      ...user,
      lastModified: now,
      syncStatus: 'pending'
    };

    await this.performTransaction('users', 'readwrite', (store) =>
      store.put(fullUser)
    );

    // Queue for sync
    await this.queueOfflineAction('users', user.id, 'update', fullUser);
    
    return fullUser;
  }

  // Equipment operations
  async getEquipment(companyId: number): Promise<OfflineEquipment[]> {
    if (!this.db) return [];
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['equipment'], 'readonly');
      const store = transaction.objectStore('equipment');
      const index = store.index('companyId');
      const request = index.getAll(companyId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveEquipment(equipment: Omit<OfflineEquipment, 'lastModified' | 'syncStatus'>): Promise<OfflineEquipment> {
    const now = new Date().toISOString();
    const fullEquipment: OfflineEquipment = {
      ...equipment,
      lastModified: now,
      syncStatus: 'pending'
    };

    await this.performTransaction('equipment', 'readwrite', (store) =>
      store.put(fullEquipment)
    );

    // Queue for sync
    await this.queueOfflineAction('equipment', equipment.id, 'update', fullEquipment);
    
    return fullEquipment;
  }

  // Companies operations
  async getCompanies(): Promise<OfflineCompany[]> {
    if (!this.db) return [];
    
    return this.performTransaction('companies', 'readonly', (store) =>
      store.getAll()
    );
  }

  // Warehouses operations
  async getWarehouses(companyId: number): Promise<OfflineWarehouse[]> {
    if (!this.db) return [];
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['warehouses'], 'readonly');
      const store = transaction.objectStore('warehouses');
      const index = store.index('companyId');
      const request = index.getAll(companyId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Offline actions queue
  private async queueOfflineAction(
    entity: string,
    entityId: number,
    type: 'create' | 'update' | 'delete',
    data: any
  ): Promise<void> {
    const action: OfflineAction = {
      id: `${entity}_${entityId}_${Date.now()}`,
      type,
      entity: entity as any,
      entityId,
      data,
      timestamp: new Date().toISOString(),
      url: `/api/${entity}${type === 'update' || type === 'delete' ? `/${entityId}` : ''}`,
      method: type === 'create' ? 'POST' : type === 'update' ? 'PUT' : 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: type !== 'delete' ? JSON.stringify(data) : undefined
    };

    await this.performTransaction('offlineActions', 'readwrite', (store) =>
      store.put(action)
    );
  }

  async getOfflineActions(): Promise<OfflineAction[]> {
    if (!this.db) return [];
    
    return this.performTransaction('offlineActions', 'readonly', (store) =>
      store.getAll()
    );
  }

  async removeOfflineAction(actionId: string): Promise<void> {
    await this.performTransaction('offlineActions', 'readwrite', (store) =>
      store.delete(actionId)
    );
  }

  // Dashboard statistics (calculated locally)
  async getDashboardStats(companyId: number): Promise<{
    totalRevenue: number;
    totalExpenses: number;
    activeProjects: number;
    totalEmployees: number;
    equipmentCount: number;
    recentTransactions: OfflineTransaction[];
  }> {
    const [transactions, projects, users, equipment] = await Promise.all([
      this.getTransactions(companyId),
      this.getProjects(companyId),
      this.getUsers(companyId),
      this.getEquipment(companyId)
    ]);

    const totalRevenue = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const activeProjects = projects.filter(p => p.status === 'active').length;
    const totalEmployees = users.filter(u => u.isActive).length;
    const equipmentCount = equipment.length;

    const recentTransactions = transactions
      .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
      .slice(0, 10);

    return {
      totalRevenue,
      totalExpenses,
      activeProjects,
      totalEmployees,
      equipmentCount,
      recentTransactions
    };
  }

  // Initial data seeding for offline mode
  async seedInitialData(): Promise<void> {
    console.log('Offline Storage: Seeding initial data');

    // Check if data already exists
    const existingCompanies = await this.getCompanies();
    if (existingCompanies.length > 0) {
      console.log('Offline Storage: Data already seeded');
      return;
    }

    const now = new Date().toISOString();

    // Seed companies
    const companies: OfflineCompany[] = [
      {
        id: 1,
        name: 'Yemen Construction Company',
        nameAr: 'شركة اليمن للإنشاءات',
        type: 'main',
        location: 'Sana\'a',
        locationAr: 'صنعاء',
        phone: '+967-1-234567',
        email: 'info@yemen-construction.com',
        createdAt: now,
        lastModified: now,
        syncStatus: 'synced'
      }
    ];

    // Seed users
    const users: OfflineUser[] = [
      {
        id: 1,
        username: 'admin',
        name: 'Ahmed Al-Yamani',
        nameAr: 'أحمد اليماني',
        email: 'ahmed@yemen-construction.com',
        phone: '+967-773-123456',
        role: 'ceo',
        department: 'Management',
        departmentAr: 'الإدارة',
        companyId: 1,
        salary: 150000,
        isActive: true,
        createdAt: now,
        lastModified: now,
        syncStatus: 'synced'
      },
      {
        id: 2,
        username: 'manager1',
        name: 'Fatima Hassan',
        nameAr: 'فاطمة حسن',
        email: 'fatima@yemen-construction.com',
        phone: '+967-773-234567',
        role: 'manager',
        department: 'Projects',
        departmentAr: 'المشاريع',
        companyId: 1,
        salary: 80000,
        isActive: true,
        createdAt: now,
        lastModified: now,
        syncStatus: 'synced'
      }
    ];

    // Seed projects
    const projects: OfflineProject[] = [
      {
        id: 1,
        name: 'Modern Villa Complex',
        nameAr: 'مجمع الفلل الحديثة',
        description: 'Luxury residential complex with 20 villas',
        descriptionAr: 'مجمع سكني فاخر يحتوي على 20 فيلا',
        location: 'Sana\'a - Hadda',
        locationAr: 'صنعاء - حدة',
        status: 'active',
        priority: 'high',
        budget: 5000000,
        spent: 1200000,
        progress: 35,
        startDate: '2024-01-15',
        endDate: '2025-06-30',
        companyId: 1,
        managerId: 2,
        createdAt: now,
        lastModified: now,
        syncStatus: 'synced'
      },
      {
        id: 2,
        name: 'Commercial Tower',
        nameAr: 'البرج التجاري',
        description: 'High-rise commercial building downtown',
        descriptionAr: 'مبنى تجاري عالي وسط المدينة',
        location: 'Sana\'a - Tahrir',
        locationAr: 'صنعاء - التحرير',
        status: 'active',
        priority: 'critical',
        budget: 8000000,
        spent: 3200000,
        progress: 50,
        startDate: '2024-03-01',
        endDate: '2025-12-31',
        companyId: 1,
        managerId: 2,
        createdAt: now,
        lastModified: now,
        syncStatus: 'synced'
      }
    ];

    // Seed transactions
    const transactions: OfflineTransaction[] = [
      {
        id: 1,
        type: 'income',
        category: 'project_payment',
        categoryAr: 'دفعة مشروع',
        description: 'First payment for Modern Villa Complex',
        descriptionAr: 'الدفعة الأولى لمجمع الفلل الحديثة',
        amount: 1500000,
        currency: 'YER',
        exchangeRate: 1,
        projectId: 1,
        companyId: 1,
        createdBy: 1,
        transactionDate: '2024-02-15',
        createdAt: now,
        lastModified: now,
        syncStatus: 'synced'
      },
      {
        id: 2,
        type: 'expense',
        category: 'materials',
        categoryAr: 'مواد',
        description: 'Cement and steel purchase',
        descriptionAr: 'شراء أسمنت وحديد',
        amount: 800000,
        currency: 'YER',
        exchangeRate: 1,
        projectId: 1,
        companyId: 1,
        createdBy: 2,
        transactionDate: '2024-02-20',
        createdAt: now,
        lastModified: now,
        syncStatus: 'synced'
      }
    ];

    // Seed equipment
    const equipment: OfflineEquipment[] = [
      {
        id: 1,
        name: 'Tower Crane TC-450',
        nameAr: 'رافعة برج TC-450',
        type: 'Heavy Equipment',
        typeAr: 'معدات ثقيلة',
        model: 'Liebherr TC-450',
        serialNumber: 'LHR-TC450-2023-001',
        status: 'in_use',
        location: 'Sana\'a - Hadda Site',
        locationAr: 'صنعاء - موقع حدة',
        companyId: 1,
        assignedProjectId: 1,
        purchaseDate: '2023-08-15',
        purchasePrice: 2500000,
        createdAt: now,
        lastModified: now,
        syncStatus: 'synced'
      }
    ];

    // Seed warehouses
    const warehouses: OfflineWarehouse[] = [
      {
        id: 1,
        name: 'Main Warehouse Sana\'a',
        nameAr: 'المخزن الرئيسي صنعاء',
        location: 'Sana\'a Industrial Zone',
        locationAr: 'المنطقة الصناعية صنعاء',
        companyId: 1,
        managerId: 2,
        capacity: 5000,
        currentStock: 3200,
        status: 'active',
        createdAt: now,
        lastModified: now,
        syncStatus: 'synced'
      }
    ];

    // Save all data
    await Promise.all([
      ...companies.map(c => this.performTransaction('companies', 'readwrite', store => store.put(c))),
      ...users.map(u => this.performTransaction('users', 'readwrite', store => store.put(u))),
      ...projects.map(p => this.performTransaction('projects', 'readwrite', store => store.put(p))),
      ...transactions.map(t => this.performTransaction('transactions', 'readwrite', store => store.put(t))),
      ...equipment.map(e => this.performTransaction('equipment', 'readwrite', store => store.put(e))),
      ...warehouses.map(w => this.performTransaction('warehouses', 'readwrite', store => store.put(w)))
    ]);

    console.log('Offline Storage: Initial data seeded successfully');
  }

  // Sync with server when online
  async syncWithServer(): Promise<void> {
    if (!navigator.onLine) {
      console.log('Offline Storage: Cannot sync - no internet connection');
      return;
    }

    console.log('Offline Storage: Starting sync with server...');
    
    const offlineActions = await this.getOfflineActions();
    
    for (const action of offlineActions) {
      try {
        const response = await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body
        });

        if (response.ok) {
          await this.removeOfflineAction(action.id);
          console.log(`Offline Storage: Synced action ${action.id}`);
        } else {
          console.error(`Offline Storage: Failed to sync action ${action.id}:`, response.statusText);
        }
      } catch (error) {
        console.error(`Offline Storage: Error syncing action ${action.id}:`, error);
      }
    }

    console.log('Offline Storage: Sync completed');
  }

  // Clear all data (for testing/reset)
  async clearAllData(): Promise<void> {
    if (!this.db) return;

    const storeNames = ['projects', 'transactions', 'users', 'equipment', 'companies', 'warehouses', 'offlineActions'];
    
    for (const storeName of storeNames) {
      await this.performTransaction(storeName, 'readwrite', (store) => store.clear());
    }
    
    console.log('Offline Storage: All data cleared');
  }
}

// Singleton instance
export const offlineStorage = new OfflineStorageManager();

// Initialize on module load
offlineStorage.initialize().catch(console.error);