/**
 * Offline-First API Adapter
 * Seamlessly switches between online API and offline storage
 * Provides identical interface whether online or offline
 */

import { offlineStorage } from './offline-storage';

// Network status management
class NetworkManager {
  private isOnline: boolean = navigator.onLine;
  private listeners: Array<(online: boolean) => void> = [];

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
    // Sync offline data when reconnected
    try {
      await offlineStorage.syncWithServer();
      console.log('Network: Offline data synced successfully');
    } catch (error) {
      console.error('Network: Failed to sync offline data:', error);
    }
  }
}

export const networkManager = new NetworkManager();

// Offline-first API client
class OfflineFirstAPI {
  private baseURL = '/api';

  // Generic request handler with offline fallback
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    offlineHandler?: () => Promise<T>
  ): Promise<T> {
    // Try online API first if available
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
          console.log(`API: Online request successful - ${endpoint}`);
          return data;
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.warn(`API: Online request failed for ${endpoint}, falling back to offline`);
        console.error(error);
      }
    }

    // Fallback to offline storage
    if (offlineHandler) {
      console.log(`API: Using offline storage for ${endpoint}`);
      return await offlineHandler();
    } else {
      throw new Error(`No offline handler available for ${endpoint}`);
    }
  }

  // Projects API
  async getProjects(companyId: number = 1) {
    return this.request(
      `/projects?companyId=${companyId}`,
      { method: 'GET' },
      () => offlineStorage.getProjects(companyId)
    );
  }

  async getProject(id: number) {
    return this.request(
      `/projects/${id}`,
      { method: 'GET' },
      () => offlineStorage.getProject(id)
    );
  }

  async createProject(projectData: any) {
    // Generate ID for offline mode
    const id = Date.now();
    const project = {
      ...projectData,
      id,
      createdAt: new Date().toISOString(),
    };

    return this.request(
      '/projects',
      {
        method: 'POST',
        body: JSON.stringify(project),
      },
      () => offlineStorage.saveProject(project)
    );
  }

  async updateProject(id: number, projectData: any) {
    return this.request(
      `/projects/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(projectData),
      },
      async () => {
        const existing = await offlineStorage.getProject(id);
        if (!existing) throw new Error('Project not found');
        return offlineStorage.saveProject({ ...existing, ...projectData });
      }
    );
  }

  async deleteProject(id: number) {
    return this.request(
      `/projects/${id}`,
      { method: 'DELETE' },
      () => offlineStorage.deleteProject(id)
    );
  }

  // Transactions API
  async getTransactions(companyId: number = 1) {
    return this.request(
      `/transactions?companyId=${companyId}`,
      { method: 'GET' },
      () => offlineStorage.getTransactions(companyId)
    );
  }

  async createTransaction(transactionData: any) {
    const id = Date.now();
    const transaction = {
      ...transactionData,
      id,
      createdAt: new Date().toISOString(),
    };

    return this.request(
      '/transactions',
      {
        method: 'POST',
        body: JSON.stringify(transaction),
      },
      () => offlineStorage.saveTransaction(transaction)
    );
  }

  async updateTransaction(id: number, transactionData: any) {
    return this.request(
      `/transactions/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(transactionData),
      },
      async () => {
        const transactions = await offlineStorage.getTransactions(transactionData.companyId || 1);
        const existing = transactions.find(t => t.id === id);
        if (!existing) throw new Error('Transaction not found');
        return offlineStorage.saveTransaction({ ...existing, ...transactionData });
      }
    );
  }

  // Users API
  async getUsers(companyId: number = 1) {
    return this.request(
      `/users?companyId=${companyId}`,
      { method: 'GET' },
      () => offlineStorage.getUsers(companyId)
    );
  }

  async createUser(userData: any) {
    const id = Date.now();
    const user = {
      ...userData,
      id,
      createdAt: new Date().toISOString(),
    };

    return this.request(
      '/users',
      {
        method: 'POST',
        body: JSON.stringify(user),
      },
      () => offlineStorage.saveUser(user)
    );
  }

  async updateUser(id: number, userData: any) {
    return this.request(
      `/users/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(userData),
      },
      async () => {
        const users = await offlineStorage.getUsers(userData.companyId || 1);
        const existing = users.find(u => u.id === id);
        if (!existing) throw new Error('User not found');
        return offlineStorage.saveUser({ ...existing, ...userData });
      }
    );
  }

  // Equipment API
  async getEquipment(companyId: number = 1) {
    return this.request(
      `/equipment?companyId=${companyId}`,
      { method: 'GET' },
      () => offlineStorage.getEquipment(companyId)
    );
  }

  async createEquipment(equipmentData: any) {
    const id = Date.now();
    const equipment = {
      ...equipmentData,
      id,
      createdAt: new Date().toISOString(),
    };

    return this.request(
      '/equipment',
      {
        method: 'POST',
        body: JSON.stringify(equipment),
      },
      () => offlineStorage.saveEquipment(equipment)
    );
  }

  async updateEquipment(id: number, equipmentData: any) {
    return this.request(
      `/equipment/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(equipmentData),
      },
      async () => {
        const equipment = await offlineStorage.getEquipment(equipmentData.companyId || 1);
        const existing = equipment.find(e => e.id === id);
        if (!existing) throw new Error('Equipment not found');
        return offlineStorage.saveEquipment({ ...existing, ...equipmentData });
      }
    );
  }

  // Companies API
  async getCompanies() {
    return this.request(
      '/companies',
      { method: 'GET' },
      () => offlineStorage.getCompanies()
    );
  }

  // Warehouses API
  async getWarehouses(companyId: number = 1) {
    return this.request(
      `/warehouses?companyId=${companyId}`,
      { method: 'GET' },
      () => offlineStorage.getWarehouses(companyId)
    );
  }

  // Dashboard API
  async getDashboardStats(companyId: number = 1) {
    return this.request(
      `/dashboard/stats?companyId=${companyId}`,
      { method: 'GET' },
      () => offlineStorage.getDashboardStats(companyId)
    );
  }

  // Business Intelligence API
  async getCostEstimation(projectData: any) {
    return this.request(
      '/intelligence/cost-estimation',
      {
        method: 'POST',
        body: JSON.stringify(projectData),
      },
      async () => {
        // Offline cost estimation algorithm
        const { projectType, area, location, complexity } = projectData;
        
        // Yemen market rates (offline calculation)
        const baseRates = {
          residential: { material: 180000, labor: 80000, equipment: 15000 },
          commercial: { material: 220000, labor: 120000, equipment: 25000 },
          infrastructure: { material: 300000, labor: 150000, equipment: 40000 },
          industrial: { material: 250000, labor: 140000, equipment: 35000 }
        };

        const rates = baseRates[projectType as keyof typeof baseRates] || baseRates.residential;
        const complexityMultiplier = complexity === 'simple' ? 0.8 : complexity === 'complex' ? 1.3 : 1.1;
        const locationMultiplier = location?.toLowerCase().includes('sanaa') ? 1.2 : 1.0;

        const materialCost = rates.material * area * complexityMultiplier * locationMultiplier;
        const laborCost = rates.labor * area * complexityMultiplier;
        const equipmentCost = rates.equipment * area;
        const overheadCost = (materialCost + laborCost + equipmentCost) * 0.15;

        const estimatedCost = materialCost + laborCost + equipmentCost + overheadCost;

        return {
          estimatedCost,
          breakdown: {
            materials: materialCost,
            labor: laborCost,
            equipment: equipmentCost,
            overhead: overheadCost
          },
          confidence: 0.85,
          factors: [
            'معدلات السوق اليمنية',
            'تكلفة المواد المحلية',
            'أسعار العمالة الحالية',
            'تقديرات المعدات'
          ],
          timeline: Math.ceil(area / 100) * 30 // days
        };
      }
    );
  }

  async getFinancialTrends(companyId: number = 1) {
    return this.request(
      `/intelligence/financial-trends?companyId=${companyId}`,
      { method: 'GET' },
      async () => {
        const transactions = await offlineStorage.getTransactions(companyId);
        
        // Group by month
        const monthlyData = transactions.reduce((acc, transaction) => {
          const month = new Date(transaction.transactionDate).toISOString().slice(0, 7);
          if (!acc[month]) {
            acc[month] = { income: 0, expenses: 0 };
          }
          
          if (transaction.type === 'income') {
            acc[month].income += transaction.amount;
          } else if (transaction.type === 'expense') {
            acc[month].expenses += transaction.amount;
          }
          
          return acc;
        }, {} as Record<string, { income: number; expenses: number }>);

        const monthlyTrends = Object.entries(monthlyData).map(([month, data]) => ({
          month,
          income: data.income,
          expenses: data.expenses,
          profit: data.income - data.expenses,
          profitMargin: data.income > 0 ? ((data.income - data.expenses) / data.income) * 100 : 0
        }));

        return {
          monthlyTrends,
          insights: [
            'البيانات محسوبة محلياً',
            'تحليل الاتجاهات المالية',
            'متوفر بدون اتصال إنترنت'
          ],
          alerts: [],
          projections: {
            nextMonthRevenue: monthlyTrends.length > 0 ? monthlyTrends[monthlyTrends.length - 1].income * 1.1 : 0,
            nextMonthExpenses: monthlyTrends.length > 0 ? monthlyTrends[monthlyTrends.length - 1].expenses * 1.05 : 0,
            yearEndProjection: monthlyTrends.reduce((sum, trend) => sum + trend.profit, 0) * 2
          }
        };
      }
    );
  }

  // Sync status check
  async getSyncStatus() {
    const offlineActions = await offlineStorage.getOfflineActions();
    return {
      isOnline: networkManager.getStatus(),
      pendingActions: offlineActions.length,
      lastSync: localStorage.getItem('lastSyncTime') || 'Never'
    };
  }

  // Manual sync trigger
  async syncNow() {
    if (!networkManager.getStatus()) {
      throw new Error('Cannot sync while offline');
    }
    
    await offlineStorage.syncWithServer();
    localStorage.setItem('lastSyncTime', new Date().toISOString());
    
    return { success: true, syncTime: new Date().toISOString() };
  }
}

// Singleton instance
export const offlineAPI = new OfflineFirstAPI();

// Initialize offline storage with sample data when module loads
offlineStorage.seedInitialData().catch(console.error);

// Hook for React components to monitor network status
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = React.useState(networkManager.getStatus());

  React.useEffect(() => {
    const handleStatusChange = (online: boolean) => setIsOnline(online);
    
    networkManager.addListener(handleStatusChange);
    
    return () => networkManager.removeListener(handleStatusChange);
  }, []);

  return isOnline;
}

// React import for the hook
import React from 'react';