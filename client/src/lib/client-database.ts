/**
 * Advanced Client-Side Database System
 * Provides complete relational database functionality using Dexie.js
 * Supports complex queries, transactions, and full CRUD operations
 */

import Dexie, { Table } from 'dexie';

// Extended interfaces for client-side operations
export interface ClientProject {
  id?: number;
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
  
  // Advanced project fields
  contractType?: 'fixed_price' | 'cost_plus' | 'time_material';
  clientName?: string;
  clientNameAr?: string;
  estimatedDuration?: number; // in days
  riskLevel?: 'low' | 'medium' | 'high';
  profitMargin?: number;
  tags?: string[];
}

export interface ClientTransaction {
  id?: number;
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
  
  // Advanced transaction fields
  invoiceNumber?: string;
  paymentMethod?: 'cash' | 'bank_transfer' | 'check' | 'credit';
  approvedBy?: number;
  attachments?: string[];
  taxAmount?: number;
  discountAmount?: number;
}

export interface ClientUser {
  id?: number;
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
  
  // Advanced user fields
  employeeId?: string;
  position?: string;
  positionAr?: string;
  skills?: string[];
  certifications?: string[];
  emergencyContact?: string;
  address?: string;
  addressAr?: string;
}

export interface ClientEquipment {
  id?: number;
  name: string;
  nameAr: string;
  type: string;
  typeAr: string;
  model?: string;
  serialNumber?: string;
  status: 'available' | 'in_use' | 'maintenance' | 'retired';
  location?: string;
  locationAr?: string;
  companyId: number;
  assignedProjectId?: number;
  purchaseDate?: string;
  purchasePrice?: number;
  createdAt: string;
  lastModified: string;
  syncStatus: 'synced' | 'pending' | 'conflict';
  
  // Advanced equipment fields
  manufacturer?: string;
  warrantyExpiry?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  operatingHours?: number;
  fuelType?: string;
  dailyRate?: number;
}

export interface ClientWarehouse {
  id?: number;
  name: string;
  nameAr: string;
  location: string;
  locationAr: string;
  capacity?: number;
  currentStock?: number;
  managerId?: number;
  companyId: number;
  createdAt: string;
  lastModified: string;
  syncStatus: 'synced' | 'pending' | 'conflict';
  
  // Advanced warehouse fields
  address?: string;
  addressAr?: string;
  contactPhone?: string;
  operatingHours?: string;
  securityLevel?: 'basic' | 'medium' | 'high';
  climateControlled?: boolean;
}

export interface ClientDocument {
  id?: number;
  name: string;
  nameAr: string;
  type: string;
  size: number;
  mimeType: string;
  filePath: string;
  projectId?: number;
  companyId: number;
  uploadedBy: number;
  createdAt: string;
  lastModified: string;
  syncStatus: 'synced' | 'pending' | 'conflict';
  
  // Advanced document fields
  version?: string;
  description?: string;
  descriptionAr?: string;
  tags?: string[];
  accessLevel?: 'public' | 'private' | 'restricted';
  expiryDate?: string;
}

export interface ClientCompany {
  id?: number;
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
  
  // Advanced company fields
  registrationNumber?: string;
  taxId?: string;
  industry?: string;
  website?: string;
  foundedYear?: number;
  employeeCount?: number;
  logo?: string;
}

export interface ClientDashboardStats {
  companyId: number;
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  profitMargin: number;
  activeProjects: number;
  completedProjects: number;
  totalEmployees: number;
  equipmentCount: number;
  pendingInvoices: number;
  overduePayments: number;
  monthlyRevenue: Array<{ month: string; revenue: number; expenses: number; }>;
  projectStatusDistribution: Array<{ status: string; count: number; }>;
  topPerformingProjects: Array<{ projectId: number; name: string; profitMargin: number; }>;
  calculatedAt: string;
}

// Advanced offline action tracking
export interface OfflineAction {
  id?: number;
  type: 'create' | 'update' | 'delete';
  entity: 'projects' | 'transactions' | 'users' | 'equipment' | 'warehouses' | 'documents' | 'companies';
  entityId?: number;
  data: any;
  url: string;
  method: string;
  timestamp: string;
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed' | 'completed';
  error?: string;
}

// Enhanced client-side database
export class ClientDatabase extends Dexie {
  projects!: Table<ClientProject>;
  transactions!: Table<ClientTransaction>;
  users!: Table<ClientUser>;
  equipment!: Table<ClientEquipment>;
  warehouses!: Table<ClientWarehouse>;
  documents!: Table<ClientDocument>;
  companies!: Table<ClientCompany>;
  dashboardStats!: Table<ClientDashboardStats>;
  offlineActions!: Table<OfflineAction>;

  constructor() {
    super('ConstructionMgmtClientDB');
    
    this.version(2).stores({
      projects: '++id, name, nameAr, status, priority, companyId, managerId, startDate, endDate, syncStatus, contractType, riskLevel',
      transactions: '++id, type, category, amount, currency, projectId, companyId, createdBy, transactionDate, syncStatus, paymentMethod',
      users: '++id, username, name, nameAr, role, department, companyId, managerId, isActive, syncStatus, employeeId',
      equipment: '++id, name, nameAr, type, status, companyId, assignedProjectId, purchaseDate, syncStatus, manufacturer',
      warehouses: '++id, name, nameAr, location, companyId, managerId, syncStatus',
      documents: '++id, name, nameAr, type, projectId, companyId, uploadedBy, syncStatus, accessLevel',
      companies: '++id, name, nameAr, type, parentId, syncStatus',
      dashboardStats: '++id, companyId, calculatedAt',
      offlineActions: '++id, type, entity, entityId, timestamp, status, retryCount'
    });

    // Add hooks for automatic timestamp updates
    this.projects.hook('creating', (primKey, obj, trans) => {
      const now = new Date().toISOString();
      obj.createdAt = now;
      obj.lastModified = now;
      obj.syncStatus = 'pending';
    });

    this.projects.hook('updating', (modifications, primKey, obj, trans) => {
      modifications.lastModified = new Date().toISOString();
      modifications.syncStatus = 'pending';
    });

    // Apply similar hooks to other tables
    const tables = [this.transactions, this.users, this.equipment, this.warehouses, this.documents, this.companies];
    tables.forEach(table => {
      table.hook('creating', (primKey, obj, trans) => {
        const now = new Date().toISOString();
        obj.createdAt = now;
        obj.lastModified = now;
        obj.syncStatus = 'pending';
      });

      table.hook('updating', (modifications, primKey, obj, trans) => {
        modifications.lastModified = new Date().toISOString();
        modifications.syncStatus = 'pending';
      });
    });
  }

  // Advanced query methods
  async getProjectsByStatus(companyId: number, status: string): Promise<ClientProject[]> {
    return await this.projects
      .where({ companyId, status })
      .orderBy('lastModified')
      .reverse()
      .toArray();
  }

  async getTransactionsByDateRange(companyId: number, startDate: string, endDate: string): Promise<ClientTransaction[]> {
    return await this.transactions
      .where('companyId').equals(companyId)
      .and(transaction => transaction.transactionDate >= startDate && transaction.transactionDate <= endDate)
      .orderBy('transactionDate')
      .reverse()
      .toArray();
  }

  async getUsersByRole(companyId: number, role: string): Promise<ClientUser[]> {
    return await this.users
      .where({ companyId, role, isActive: true })
      .orderBy('name')
      .toArray();
  }

  async getEquipmentByStatus(companyId: number, status: string): Promise<ClientEquipment[]> {
    return await this.equipment
      .where({ companyId, status })
      .orderBy('name')
      .toArray();
  }

  // Advanced analytics calculations
  async calculateDashboardStats(companyId: number): Promise<ClientDashboardStats> {
    const [projects, transactions, users, equipment] = await Promise.all([
      this.projects.where('companyId').equals(companyId).toArray(),
      this.transactions.where('companyId').equals(companyId).toArray(),
      this.users.where('companyId').equals(companyId).toArray(),
      this.equipment.where('companyId').equals(companyId).toArray()
    ]);

    const totalRevenue = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const profit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const totalEmployees = users.filter(u => u.isActive).length;
    const equipmentCount = equipment.length;

    // Calculate monthly revenue trends
    const monthlyData = new Map<string, { revenue: number; expenses: number }>();
    transactions.forEach(transaction => {
      const date = new Date(transaction.transactionDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { revenue: 0, expenses: 0 });
      }
      
      const monthData = monthlyData.get(monthKey)!;
      if (transaction.type === 'income') {
        monthData.revenue += transaction.amount;
      } else if (transaction.type === 'expense') {
        monthData.expenses += transaction.amount;
      }
    });

    const monthlyRevenue = Array.from(monthlyData.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12); // Last 12 months

    // Project status distribution
    const statusCounts = new Map<string, number>();
    projects.forEach(project => {
      statusCounts.set(project.status, (statusCounts.get(project.status) || 0) + 1);
    });

    const projectStatusDistribution = Array.from(statusCounts.entries())
      .map(([status, count]) => ({ status, count }));

    // Top performing projects by profit margin
    const topPerformingProjects = projects
      .map(project => {
        const projectTransactions = transactions.filter(t => t.projectId === project.id);
        const projectRevenue = projectTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
        const projectExpenses = projectTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
        const projectProfit = projectRevenue - projectExpenses;
        const profitMargin = projectRevenue > 0 ? (projectProfit / projectRevenue) * 100 : 0;

        return {
          projectId: project.id!,
          name: project.name,
          profitMargin
        };
      })
      .sort((a, b) => b.profitMargin - a.profitMargin)
      .slice(0, 5);

    const stats: ClientDashboardStats = {
      companyId,
      totalRevenue,
      totalExpenses,
      profit,
      profitMargin,
      activeProjects,
      completedProjects,
      totalEmployees,
      equipmentCount,
      pendingInvoices: 0, // TODO: Calculate from invoices
      overduePayments: 0, // TODO: Calculate from payments
      monthlyRevenue,
      projectStatusDistribution,
      topPerformingProjects,
      calculatedAt: new Date().toISOString()
    };

    // Cache the calculated stats
    await this.dashboardStats.clear();
    await this.dashboardStats.add(stats);

    return stats;
  }

  // Offline action management
  async addOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount' | 'status'>): Promise<void> {
    await this.offlineActions.add({
      ...action,
      timestamp: new Date().toISOString(),
      retryCount: 0,
      status: 'pending'
    });
  }

  async getPendingActions(): Promise<OfflineAction[]> {
    return await this.offlineActions
      .where('status').equals('pending')
      .orderBy('timestamp')
      .toArray();
  }

  async markActionCompleted(actionId: number): Promise<void> {
    await this.offlineActions.update(actionId, { status: 'completed' });
  }

  async markActionFailed(actionId: number, error: string): Promise<void> {
    await this.offlineActions.update(actionId, { 
      status: 'failed',
      error,
      retryCount: (await this.offlineActions.get(actionId))?.retryCount! + 1
    });
  }

  // Data seeding for offline mode
  async seedInitialData(): Promise<void> {
    const existingProjects = await this.projects.count();
    if (existingProjects > 0) {
      console.log('Client DB: Data already seeded');
      return;
    }

    console.log('Client DB: Seeding comprehensive initial data');
    const now = new Date().toISOString();

    // Seed company
    await this.companies.add({
      id: 1,
      name: 'Yemen Construction Company',
      nameAr: 'شركة اليمن للإنشاءات',
      type: 'main',
      location: 'Sana\'a',
      locationAr: 'صنعاء',
      phone: '+967-1-234567',
      email: 'info@yemen-construction.com',
      registrationNumber: 'YCC-2020-001',
      taxId: 'TAX-1234567890',
      industry: 'Construction',
      website: 'https://yemen-construction.com',
      foundedYear: 2020,
      employeeCount: 150,
      createdAt: now,
      lastModified: now,
      syncStatus: 'synced'
    });

    // Seed users with comprehensive data
    const users: ClientUser[] = [
      {
        id: 1,
        username: 'ahmed.ali',
        name: 'Ahmed Al-Yamani',
        nameAr: 'أحمد اليماني',
        email: 'ahmed@yemen-construction.com',
        phone: '+967-773-123456',
        role: 'ceo',
        department: 'Management',
        departmentAr: 'الإدارة',
        companyId: 1,
        salary: 150000,
        hireDate: '2020-01-01',
        isActive: true,
        employeeId: 'EMP-001',
        position: 'Chief Executive Officer',
        positionAr: 'المدير التنفيذي',
        skills: ['Leadership', 'Strategic Planning', 'Construction Management'],
        certifications: ['PMP', 'MBA'],
        emergencyContact: '+967-773-789012',
        address: 'Hadda District, Sana\'a',
        addressAr: 'حي حدة، صنعاء',
        createdAt: now,
        lastModified: now,
        syncStatus: 'synced'
      },
      {
        id: 2,
        username: 'fatima.hassan',
        name: 'Fatima Hassan',
        nameAr: 'فاطمة حسن',
        email: 'fatima@yemen-construction.com',
        phone: '+967-773-234567',
        role: 'manager',
        department: 'Projects',
        departmentAr: 'المشاريع',
        companyId: 1,
        managerId: 1,
        salary: 80000,
        hireDate: '2020-03-15',
        isActive: true,
        employeeId: 'EMP-002',
        position: 'Project Manager',
        positionAr: 'مدير المشاريع',
        skills: ['Project Management', 'Civil Engineering', 'Team Leadership'],
        certifications: ['PMP', 'Civil Engineering License'],
        emergencyContact: '+967-773-890123',
        address: 'Sawan District, Sana\'a',
        addressAr: 'حي السوان، صنعاء',
        createdAt: now,
        lastModified: now,
        syncStatus: 'synced'
      }
    ];

    await this.users.bulkAdd(users);

    // Seed comprehensive projects
    const projects: ClientProject[] = [
      {
        id: 1,
        name: 'Modern Villa Complex',
        nameAr: 'مجمع الفلل الحديثة',
        description: 'Luxury residential complex with 20 villas featuring modern amenities',
        descriptionAr: 'مجمع سكني فاخر يحتوي على 20 فيلا مع وسائل الراحة الحديثة',
        location: 'Sana\'a - Hadda District',
        locationAr: 'صنعاء - حي حدة',
        status: 'active',
        priority: 'high',
        budget: 5000000,
        spent: 1800000,
        progress: 36,
        startDate: '2024-01-15',
        endDate: '2025-06-30',
        companyId: 1,
        managerId: 2,
        contractType: 'fixed_price',
        clientName: 'Al-Yamani Real Estate',
        clientNameAr: 'شركة اليماني العقارية',
        estimatedDuration: 530,
        riskLevel: 'medium',
        profitMargin: 15,
        tags: ['residential', 'luxury', 'villas'],
        createdAt: now,
        lastModified: now,
        syncStatus: 'synced'
      },
      {
        id: 2,
        name: 'Commercial Tower',
        nameAr: 'البرج التجاري',
        description: 'High-rise commercial building with 25 floors downtown',
        descriptionAr: 'مبنى تجاري عالي من 25 طابق وسط المدينة',
        location: 'Sana\'a - Tahrir Square',
        locationAr: 'صنعاء - ميدان التحرير',
        status: 'active',
        priority: 'critical',
        budget: 8000000,
        spent: 4200000,
        progress: 52,
        startDate: '2024-03-01',
        endDate: '2025-12-31',
        companyId: 1,
        managerId: 2,
        contractType: 'cost_plus',
        clientName: 'Yemen Investment Group',
        clientNameAr: 'مجموعة اليمن للاستثمار',
        estimatedDuration: 670,
        riskLevel: 'high',
        profitMargin: 12,
        tags: ['commercial', 'high-rise', 'downtown'],
        createdAt: now,
        lastModified: now,
        syncStatus: 'synced'
      }
    ];

    await this.projects.bulkAdd(projects);

    // Seed detailed transactions
    const transactions: ClientTransaction[] = [
      {
        id: 1,
        type: 'income',
        category: 'project_payment',
        categoryAr: 'دفعة مشروع',
        description: 'First milestone payment for Modern Villa Complex',
        descriptionAr: 'دفعة المرحلة الأولى لمجمع الفلل الحديثة',
        amount: 1500000,
        currency: 'YER',
        exchangeRate: 1,
        projectId: 1,
        companyId: 1,
        createdBy: 1,
        transactionDate: '2024-02-15',
        invoiceNumber: 'INV-2024-001',
        paymentMethod: 'bank_transfer',
        approvedBy: 1,
        taxAmount: 0,
        discountAmount: 0,
        createdAt: now,
        lastModified: now,
        syncStatus: 'synced'
      },
      {
        id: 2,
        type: 'expense',
        category: 'materials',
        categoryAr: 'مواد البناء',
        description: 'Cement, steel rebar, and construction materials',
        descriptionAr: 'أسمنت وحديد تسليح ومواد بناء',
        amount: 800000,
        currency: 'YER',
        exchangeRate: 1,
        projectId: 1,
        companyId: 1,
        createdBy: 2,
        transactionDate: '2024-02-20',
        invoiceNumber: 'PURC-2024-001',
        paymentMethod: 'cash',
        approvedBy: 2,
        taxAmount: 40000,
        discountAmount: 20000,
        createdAt: now,
        lastModified: now,
        syncStatus: 'synced'
      }
    ];

    await this.transactions.bulkAdd(transactions);

    // Seed equipment with detailed specifications
    const equipment: ClientEquipment[] = [
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
        manufacturer: 'Liebherr',
        warrantyExpiry: '2026-08-15',
        lastMaintenanceDate: '2024-01-10',
        nextMaintenanceDate: '2024-04-10',
        operatingHours: 1850,
        fuelType: 'diesel',
        dailyRate: 5000,
        createdAt: now,
        lastModified: now,
        syncStatus: 'synced'
      }
    ];

    await this.equipment.bulkAdd(equipment);

    // Seed warehouses
    const warehouses: ClientWarehouse[] = [
      {
        id: 1,
        name: 'Main Warehouse Sana\'a',
        nameAr: 'المخزن الرئيسي صنعاء',
        location: 'Sana\'a Industrial Zone',
        locationAr: 'المنطقة الصناعية صنعاء',
        capacity: 10000,
        currentStock: 7500,
        managerId: 2,
        companyId: 1,
        address: 'Industrial Zone, Block 15, Sana\'a',
        addressAr: 'المنطقة الصناعية، المربع 15، صنعاء',
        contactPhone: '+967-1-345678',
        operatingHours: '7:00 AM - 5:00 PM',
        securityLevel: 'high',
        climateControlled: false,
        createdAt: now,
        lastModified: now,
        syncStatus: 'synced'
      }
    ];

    await this.warehouses.bulkAdd(warehouses);

    console.log('Client DB: Comprehensive data seeding completed');
  }

  // Import/Export functionality for data portability
  async exportData(): Promise<string> {
    const data = {
      companies: await this.companies.toArray(),
      projects: await this.projects.toArray(),
      transactions: await this.transactions.toArray(),
      users: await this.users.toArray(),
      equipment: await this.equipment.toArray(),
      warehouses: await this.warehouses.toArray(),
      documents: await this.documents.toArray(),
      exportedAt: new Date().toISOString(),
      version: '2.0'
    };

    return JSON.stringify(data, null, 2);
  }

  async importData(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData);
    
    // Clear existing data
    await this.transaction('rw', this.companies, this.projects, this.transactions, 
                          this.users, this.equipment, this.warehouses, this.documents, async () => {
      await this.companies.clear();
      await this.projects.clear();
      await this.transactions.clear();
      await this.users.clear();
      await this.equipment.clear();
      await this.warehouses.clear();
      await this.documents.clear();

      // Import new data
      if (data.companies) await this.companies.bulkAdd(data.companies);
      if (data.projects) await this.projects.bulkAdd(data.projects);
      if (data.transactions) await this.transactions.bulkAdd(data.transactions);
      if (data.users) await this.users.bulkAdd(data.users);
      if (data.equipment) await this.equipment.bulkAdd(data.equipment);
      if (data.warehouses) await this.warehouses.bulkAdd(data.warehouses);
      if (data.documents) await this.documents.bulkAdd(data.documents);
    });

    console.log('Client DB: Data import completed');
  }
}

// Global database instance
export const clientDB = new ClientDatabase();

// Initialize database
export const initializeClientDatabase = async (): Promise<void> => {
  try {
    await clientDB.open();
    await clientDB.seedInitialData();
    console.log('Client DB: Database initialized successfully');
  } catch (error) {
    console.error('Client DB: Failed to initialize database:', error);
    throw error;
  }
};