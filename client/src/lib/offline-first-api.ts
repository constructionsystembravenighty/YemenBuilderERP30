/**
 * Advanced Offline-First API System
 * Provides seamless API interface that works completely offline
 * Falls back to server sync when available
 */

import { clientDB, ClientProject, ClientTransaction, ClientUser, ClientEquipment, 
         ClientWarehouse, ClientDocument, ClientCompany, ClientDashboardStats } from './client-database';

// Network status management
class NetworkManager {
  private isOnline: boolean = navigator.onLine;
  private listeners: Array<(online: boolean) => void> = [];
  private syncInProgress = false;

  constructor() {
    window.addEventListener('online', () => {
      console.log('Network: Back online');
      this.isOnline = true;
      this.notifyListeners();
      this.handleReconnection();
    });

    window.addEventListener('offline', () => {
      console.log('Network: Gone offline');
      this.isOnline = false;
      this.notifyListeners();
    });
  }

  public getStatus(): boolean {
    return this.isOnline;
  }

  public addListener(callback: (online: boolean) => void): void {
    this.listeners.push(callback);
  }

  public removeListener(callback: (online: boolean) => void): void {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.isOnline));
  }

  private async handleReconnection(): Promise<void> {
    if (this.syncInProgress) return;
    this.syncInProgress = true;

    try {
      console.log('Network: Starting background sync');
      await this.syncOfflineActions();
      console.log('Network: Background sync completed');
    } catch (error) {
      console.error('Network: Background sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncOfflineActions(): Promise<void> {
    const pendingActions = await clientDB.getPendingActions();
    console.log(`Network: Found ${pendingActions.length} pending actions to sync`);

    for (const action of pendingActions) {
      try {
        const response = await fetch(action.url, {
          method: action.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data)
        });

        if (response.ok) {
          await clientDB.markActionCompleted(action.id!);
          console.log(`Network: Synced action ${action.id} successfully`);
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.error(`Network: Failed to sync action ${action.id}:`, error);
        await clientDB.markActionFailed(action.id!, error instanceof Error ? error.message : 'Unknown error');
      }
    }
  }
}

export const networkManager = new NetworkManager();

// Main offline-first API class
export class OfflineFirstAPI {
  private baseURL = '/api';

  // Generic request with offline-first approach
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    offlineHandler: () => Promise<T>
  ): Promise<T> {
    // Always try offline first for guaranteed performance
    try {
      const offlineResult = await offlineHandler();
      console.log(`API: Using offline data for ${endpoint}`);
      
      // If online, attempt background sync but don't wait for it
      if (networkManager.getStatus()) {
        this.backgroundSync(endpoint, options).catch(error => {
          console.warn(`API: Background sync failed for ${endpoint}:`, error);
        });
      }
      
      return offlineResult;
    } catch (offlineError) {
      console.error(`API: Offline handler failed for ${endpoint}:`, offlineError);
      
      // Fallback to online API if offline fails
      if (networkManager.getStatus()) {
        try {
          const response = await fetch(`${this.baseURL}${endpoint}`, {
            headers: {
              'Content-Type': 'application/json',
              ...options.headers,
            },
            ...options,
          });

          if (response.ok) {
            const data = await response.json();
            console.log(`API: Online fallback successful for ${endpoint}`);
            return data;
          } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        } catch (onlineError) {
          console.error(`API: Online fallback failed for ${endpoint}:`, onlineError);
        }
      }
      
      throw new Error(`Both offline and online requests failed for ${endpoint}`);
    }
  }

  private async backgroundSync(endpoint: string, options: RequestInit): Promise<void> {
    // Optional background sync - doesn't affect main operation
    try {
      await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });
      console.log(`API: Background sync completed for ${endpoint}`);
    } catch (error) {
      console.warn(`API: Background sync failed for ${endpoint}:`, error);
    }
  }

  // Projects API
  async getProjects(companyId: number): Promise<ClientProject[]> {
    return this.request(
      `/projects?companyId=${companyId}`,
      { method: 'GET' },
      () => clientDB.projects.where('companyId').equals(companyId).orderBy('lastModified').reverse().toArray()
    );
  }

  async getProject(id: number): Promise<ClientProject | null> {
    return this.request(
      `/projects/${id}`,
      { method: 'GET' },
      async () => {
        const project = await clientDB.projects.get(id);
        return project || null;
      }
    );
  }

  async createProject(project: Omit<ClientProject, 'id' | 'createdAt' | 'lastModified' | 'syncStatus'>): Promise<ClientProject> {
    const newProject = await clientDB.projects.add(project as ClientProject);
    const createdProject = await clientDB.projects.get(newProject);
    
    // Queue for sync when online
    await clientDB.addOfflineAction({
      type: 'create',
      entity: 'projects',
      data: createdProject,
      url: '/api/projects',
      method: 'POST'
    });

    console.log('API: Project created offline, queued for sync');
    return createdProject!;
  }

  async updateProject(id: number, updates: Partial<ClientProject>): Promise<ClientProject> {
    await clientDB.projects.update(id, updates);
    const updatedProject = await clientDB.projects.get(id);
    
    // Queue for sync when online
    await clientDB.addOfflineAction({
      type: 'update',
      entity: 'projects',
      entityId: id,
      data: updatedProject,
      url: `/api/projects/${id}`,
      method: 'PUT'
    });

    console.log('API: Project updated offline, queued for sync');
    return updatedProject!;
  }

  async deleteProject(id: number): Promise<void> {
    await clientDB.projects.delete(id);
    
    // Queue for sync when online
    await clientDB.addOfflineAction({
      type: 'delete',
      entity: 'projects',
      entityId: id,
      data: {},
      url: `/api/projects/${id}`,
      method: 'DELETE'
    });

    console.log('API: Project deleted offline, queued for sync');
  }

  // Transactions API
  async getTransactions(companyId: number): Promise<ClientTransaction[]> {
    return this.request(
      `/transactions?companyId=${companyId}`,
      { method: 'GET' },
      () => clientDB.transactions
        .orderBy('transactionDate')
        .reverse()
        .filter(transaction => transaction.companyId === companyId)
        .toArray()
    );
  }

  async createTransaction(transaction: Omit<ClientTransaction, 'id' | 'createdAt' | 'lastModified' | 'syncStatus'>): Promise<ClientTransaction> {
    const newTransaction = await clientDB.transactions.add(transaction as ClientTransaction);
    const createdTransaction = await clientDB.transactions.get(newTransaction);
    
    // Queue for sync when online
    await clientDB.addOfflineAction({
      type: 'create',
      entity: 'transactions',
      data: createdTransaction,
      url: '/api/transactions',
      method: 'POST'
    });

    console.log('API: Transaction created offline, queued for sync');
    return createdTransaction!;
  }

  async updateTransaction(id: number, updates: Partial<ClientTransaction>): Promise<ClientTransaction> {
    await clientDB.transactions.update(id, updates);
    const updatedTransaction = await clientDB.transactions.get(id);
    
    // Queue for sync when online
    await clientDB.addOfflineAction({
      type: 'update',
      entity: 'transactions',
      entityId: id,
      data: updatedTransaction,
      url: `/api/transactions/${id}`,
      method: 'PUT'
    });

    console.log('API: Transaction updated offline, queued for sync');
    return updatedTransaction!;
  }

  async deleteTransaction(id: number): Promise<void> {
    await clientDB.transactions.delete(id);
    
    // Queue for sync when online
    await clientDB.addOfflineAction({
      type: 'delete',
      entity: 'transactions',
      entityId: id,
      data: {},
      url: `/api/transactions/${id}`,
      method: 'DELETE'
    });

    console.log('API: Transaction deleted offline, queued for sync');
  }

  // Users API
  async getUsers(companyId: number): Promise<ClientUser[]> {
    return this.request(
      `/users?companyId=${companyId}`,
      { method: 'GET' },
      () => clientDB.users
        .orderBy('name')
        .filter(user => user.companyId === companyId)
        .toArray()
    );
  }

  async createUser(user: Omit<ClientUser, 'id' | 'createdAt' | 'lastModified' | 'syncStatus'>): Promise<ClientUser> {
    const newUser = await clientDB.users.add(user as ClientUser);
    const createdUser = await clientDB.users.get(newUser);
    
    // Queue for sync when online
    await clientDB.addOfflineAction({
      type: 'create',
      entity: 'users',
      data: createdUser,
      url: '/api/users',
      method: 'POST'
    });

    console.log('API: User created offline, queued for sync');
    return createdUser!;
  }

  async updateUser(id: number, updates: Partial<ClientUser>): Promise<ClientUser> {
    await clientDB.users.update(id, updates);
    const updatedUser = await clientDB.users.get(id);
    
    // Queue for sync when online
    await clientDB.addOfflineAction({
      type: 'update',
      entity: 'users',
      entityId: id,
      data: updatedUser,
      url: `/api/users/${id}`,
      method: 'PUT'
    });

    console.log('API: User updated offline, queued for sync');
    return updatedUser!;
  }

  async deleteUser(id: number): Promise<void> {
    await clientDB.users.delete(id);
    
    // Queue for sync when online
    await clientDB.addOfflineAction({
      type: 'delete',
      entity: 'users',
      entityId: id,
      data: {},
      url: `/api/users/${id}`,
      method: 'DELETE'
    });

    console.log('API: User deleted offline, queued for sync');
  }

  // Equipment API
  async getEquipment(companyId: number): Promise<ClientEquipment[]> {
    return this.request(
      `/equipment?companyId=${companyId}`,
      { method: 'GET' },
      () => clientDB.equipment
        .orderBy('name')
        .filter(equipment => equipment.companyId === companyId)
        .toArray()
    );
  }

  async createEquipment(equipment: Omit<ClientEquipment, 'id' | 'createdAt' | 'lastModified' | 'syncStatus'>): Promise<ClientEquipment> {
    const newEquipment = await clientDB.equipment.add(equipment as ClientEquipment);
    const createdEquipment = await clientDB.equipment.get(newEquipment);
    
    // Queue for sync when online
    await clientDB.addOfflineAction({
      type: 'create',
      entity: 'equipment',
      data: createdEquipment,
      url: '/api/equipment',
      method: 'POST'
    });

    console.log('API: Equipment created offline, queued for sync');
    return createdEquipment!;
  }

  async updateEquipment(id: number, updates: Partial<ClientEquipment>): Promise<ClientEquipment> {
    await clientDB.equipment.update(id, updates);
    const updatedEquipment = await clientDB.equipment.get(id);
    
    // Queue for sync when online
    await clientDB.addOfflineAction({
      type: 'update',
      entity: 'equipment',
      entityId: id,
      data: updatedEquipment,
      url: `/api/equipment/${id}`,
      method: 'PUT'
    });

    console.log('API: Equipment updated offline, queued for sync');
    return updatedEquipment!;
  }

  async deleteEquipment(id: number): Promise<void> {
    await clientDB.equipment.delete(id);
    
    // Queue for sync when online
    await clientDB.addOfflineAction({
      type: 'delete',
      entity: 'equipment',
      entityId: id,
      data: {},
      url: `/api/equipment/${id}`,
      method: 'DELETE'
    });

    console.log('API: Equipment deleted offline, queued for sync');
  }

  // Warehouses API
  async getWarehouses(companyId: number): Promise<ClientWarehouse[]> {
    return this.request(
      `/warehouses?companyId=${companyId}`,
      { method: 'GET' },
      () => clientDB.warehouses
        .orderBy('name')
        .filter(warehouse => warehouse.companyId === companyId)
        .toArray()
    );
  }

  async createWarehouse(warehouse: Omit<ClientWarehouse, 'id' | 'createdAt' | 'lastModified' | 'syncStatus'>): Promise<ClientWarehouse> {
    const newWarehouse = await clientDB.warehouses.add(warehouse as ClientWarehouse);
    const createdWarehouse = await clientDB.warehouses.get(newWarehouse);
    
    // Queue for sync when online
    await clientDB.addOfflineAction({
      type: 'create',
      entity: 'warehouses',
      data: createdWarehouse,
      url: '/api/warehouses',
      method: 'POST'
    });

    console.log('API: Warehouse created offline, queued for sync');
    return createdWarehouse!;
  }

  async updateWarehouse(id: number, updates: Partial<ClientWarehouse>): Promise<ClientWarehouse> {
    await clientDB.warehouses.update(id, updates);
    const updatedWarehouse = await clientDB.warehouses.get(id);
    
    // Queue for sync when online
    await clientDB.addOfflineAction({
      type: 'update',
      entity: 'warehouses',
      entityId: id,
      data: updatedWarehouse,
      url: `/api/warehouses/${id}`,
      method: 'PUT'
    });

    console.log('API: Warehouse updated offline, queued for sync');
    return updatedWarehouse!;
  }

  async deleteWarehouse(id: number): Promise<void> {
    await clientDB.warehouses.delete(id);
    
    // Queue for sync when online
    await clientDB.addOfflineAction({
      type: 'delete',
      entity: 'warehouses',
      entityId: id,
      data: {},
      url: `/api/warehouses/${id}`,
      method: 'DELETE'
    });

    console.log('API: Warehouse deleted offline, queued for sync');
  }

  // Dashboard API
  async getDashboardStats(companyId: number): Promise<ClientDashboardStats> {
    return this.request(
      `/dashboard/stats?companyId=${companyId}`,
      { method: 'GET' },
      () => clientDB.calculateDashboardStats(companyId)
    );
  }

  // Companies API
  async getCompanies(): Promise<ClientCompany[]> {
    return this.request(
      '/companies',
      { method: 'GET' },
      () => clientDB.companies.orderBy('name').toArray()
    );
  }

  // Business Intelligence API with financial trends
  async getFinancialTrends(companyId: number): Promise<any> {
    return this.request(
      `/intelligence/financial-trends?companyId=${companyId}`,
      { method: 'GET' },
      async () => {
        const transactions = await clientDB.transactions.where('companyId').equals(companyId).toArray();
        
        // Calculate monthly trends
        const monthlyData = new Map<string, { revenue: number; expenses: number; profit: number }>();
        
        transactions.forEach(transaction => {
          const date = new Date(transaction.transactionDate);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          if (!monthlyData.has(monthKey)) {
            monthlyData.set(monthKey, { revenue: 0, expenses: 0, profit: 0 });
          }
          
          const monthData = monthlyData.get(monthKey)!;
          if (transaction.type === 'income') {
            monthData.revenue += transaction.amount;
          } else if (transaction.type === 'expense') {
            monthData.expenses += transaction.amount;
          }
        });

        // Calculate profits and format data
        monthlyData.forEach(data => {
          data.profit = data.revenue - data.expenses;
        });

        const monthlyTrends = Array.from(monthlyData.entries())
          .map(([month, data]) => ({ month, ...data }))
          .sort((a, b) => a.month.localeCompare(b.month))
          .slice(-12); // Last 12 months

        // Calculate expense breakdown
        const expenseBreakdown = new Map<string, number>();
        transactions
          .filter(t => t.type === 'expense')
          .forEach(transaction => {
            expenseBreakdown.set(
              transaction.category,
              (expenseBreakdown.get(transaction.category) || 0) + transaction.amount
            );
          });

        const expenseCategories = Array.from(expenseBreakdown.entries())
          .map(([category, amount]) => ({ category, amount }))
          .sort((a, b) => b.amount - a.amount);

        // Revenue vs expenses comparison
        const totalRevenue = transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const totalExpenses = transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);

        const revenueVsExpenses = [
          { type: 'Revenue', amount: totalRevenue },
          { type: 'Expenses', amount: totalExpenses },
          { type: 'Profit', amount: totalRevenue - totalExpenses }
        ];

        console.log('API: Financial trends calculated offline');

        return {
          monthlyTrends,
          expenseCategories,
          revenueVsExpenses,
          totalRevenue,
          totalExpenses,
          profitMargin: totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0
        };
      }
    );
  }

  // Business Intelligence API (fully offline)
  async getCostEstimation(params: {
    projectType: string;
    area: number;
    location: string;
    complexity: string;
    specifications?: string[];
  }): Promise<any> {
    // This is now fully client-side using Yemen market rates
    const yemenMarketRates = {
      residential: { material: 180000, labor: 120000, equipment: 80000 },
      commercial: { material: 220000, labor: 140000, equipment: 100000 },
      infrastructure: { material: 200000, labor: 130000, equipment: 90000 },
      industrial: { material: 250000, labor: 160000, equipment: 120000 }
    };

    const locationMultipliers = {
      sanaa: 1.0,
      aden: 1.1,
      taiz: 0.9,
      hodeidah: 0.95,
      ibb: 0.85
    };

    const complexityMultipliers = {
      simple: 0.8,
      medium: 1.0,
      complex: 1.3
    };

    const baseRates = yemenMarketRates[params.projectType as keyof typeof yemenMarketRates] || yemenMarketRates.residential;
    const locationMultiplier = locationMultipliers[params.location.toLowerCase() as keyof typeof locationMultipliers] || 1.0;
    const complexityMultiplier = complexityMultipliers[params.complexity as keyof typeof complexityMultipliers] || 1.0;

    const materialCost = Math.round(baseRates.material * params.area * locationMultiplier * complexityMultiplier);
    const laborCost = Math.round(baseRates.labor * params.area * locationMultiplier * complexityMultiplier);
    const equipmentCost = Math.round(baseRates.equipment * params.area * locationMultiplier * complexityMultiplier);
    const overheadCost = Math.round((materialCost + laborCost + equipmentCost) * 0.15);

    const estimatedCost = materialCost + laborCost + equipmentCost + overheadCost;
    
    const confidence = 0.85 - (params.complexity === 'complex' ? 0.1 : 0) + (params.specifications?.length || 0) * 0.02;

    const timeline = Math.ceil((params.area / 100) * (complexityMultiplier * 30)); // Estimated days

    console.log('API: Cost estimation calculated offline');

    return {
      estimatedCost,
      breakdown: {
        materials: materialCost,
        labor: laborCost,
        equipment: equipmentCost,
        overhead: overheadCost
      },
      confidence: Math.min(confidence, 0.95),
      factors: [
        `Project type: ${params.projectType}`,
        `Location factor: ${locationMultiplier}x`,
        `Complexity: ${params.complexity}`,
        `Area: ${params.area} m²`
      ],
      timeline
    };
  }

  // Data management
  async exportAllData(): Promise<string> {
    console.log('API: Exporting all offline data');
    return await clientDB.exportData();
  }

  async importAllData(jsonData: string): Promise<void> {
    console.log('API: Importing data to offline database');
    await clientDB.importData(jsonData);
  }

  async getOfflineStatus(): Promise<{
    isOffline: boolean;
    pendingActions: number;
    lastSync: string | null;
    dataSize: {
      projects: number;
      transactions: number;
      users: number;
      equipment: number;
      warehouses: number;
    }
  }> {
    const pendingActions = await clientDB.getPendingActions();
    const lastSync = localStorage.getItem('lastSyncTime');
    
    const dataSize = {
      projects: await clientDB.projects.count(),
      transactions: await clientDB.transactions.count(),
      users: await clientDB.users.count(),
      equipment: await clientDB.equipment.count(),
      warehouses: await clientDB.warehouses.count()
    };

    return {
      isOffline: !networkManager.getStatus(),
      pendingActions: pendingActions.length,
      lastSync,
      dataSize
    };
  }

  async getSyncStatus(): Promise<{
    pendingActions: number;
    lastSync: string;
  }> {
    const pendingActions = await clientDB.getPendingActions();
    
    return {
      pendingActions: pendingActions.length,
      lastSync: localStorage.getItem('lastSyncTime') || 'Never'
    };
  }

  async syncNow(): Promise<void> {
    if (!networkManager.getStatus()) {
      throw new Error('No internet connection available for sync');
    }

    console.log('API: Manual sync triggered');
    
    // This would typically trigger the background sync
    const event = new CustomEvent('forcedSync', { detail: { immediate: true } });
    window.dispatchEvent(event);
    
    // Update last sync time
    localStorage.setItem('lastSyncTime', new Date().toISOString());
  }
}

// Global API instance
export const offlineAPI = new OfflineFirstAPI();

// Initialize the offline API system
export const initializeOfflineAPI = async (): Promise<void> => {
  try {
    console.log('Offline API: Initializing system');
    // Add network status listener for UI updates
    networkManager.addListener((isOnline) => {
      const event = new CustomEvent('networkStatusChanged', { detail: { isOnline } });
      window.dispatchEvent(event);
    });
    
    console.log('Offline API: System initialized successfully');
  } catch (error) {
    console.error('Offline API: Failed to initialize:', error);
    throw error;
  }
};