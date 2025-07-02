import { 
  companies, users, projects, transactions, equipment, warehouses, documents,
  type Company, type User, type Project, type Transaction, type Equipment, type Warehouse, type Document,
  type InsertCompany, type InsertUser, type InsertProject, type InsertTransaction, 
  type InsertEquipment, type InsertWarehouse, type InsertDocument
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like, sql } from "drizzle-orm";

export interface IStorage {
  // Companies
  getCompany(id: number): Promise<Company | undefined>;
  getCompanies(): Promise<Company[]>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company>;
  
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsersByCompany(companyId: number): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  deleteUser(id: number): Promise<void>;
  
  // Projects
  getProject(id: number): Promise<Project | undefined>;
  getProjectsByCompany(companyId: number): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: number): Promise<void>;
  
  // Transactions
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionsByCompany(companyId: number): Promise<Transaction[]>;
  getTransactionsByProject(projectId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction>;
  deleteTransaction(id: number): Promise<void>;
  
  // Equipment
  getEquipment(id: number): Promise<Equipment | undefined>;
  getEquipmentByCompany(companyId: number): Promise<Equipment[]>;
  createEquipment(equipment: InsertEquipment): Promise<Equipment>;
  updateEquipment(id: number, equipment: Partial<InsertEquipment>): Promise<Equipment>;
  deleteEquipment(id: number): Promise<void>;
  
  // Warehouses
  getWarehouse(id: number): Promise<Warehouse | undefined>;
  getWarehousesByCompany(companyId: number): Promise<Warehouse[]>;
  createWarehouse(warehouse: InsertWarehouse): Promise<Warehouse>;
  updateWarehouse(id: number, warehouse: Partial<InsertWarehouse>): Promise<Warehouse>;
  deleteWarehouse(id: number): Promise<void>;
  
  // Documents
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentsByCompany(companyId: number): Promise<Document[]>;
  getDocumentsByProject(projectId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document>;
  deleteDocument(id: number): Promise<void>;
  
  // Dashboard Stats
  getDashboardStats(companyId: number): Promise<{
    totalRevenue: number;
    totalExpenses: number;
    activeProjects: number;
    totalEmployees: number;
    equipmentCount: number;
    recentTransactions: Transaction[];
  }>;
}

export class DatabaseStorage implements IStorage {
  // Companies
  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company || undefined;
  }

  async getCompanies(): Promise<Company[]> {
    return await db.select().from(companies).orderBy(companies.name);
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db.insert(companies).values(company).returning();
    return newCompany;
  }

  async updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company> {
    const [updatedCompany] = await db
      .update(companies)
      .set(company)
      .where(eq(companies.id, id))
      .returning();
    return updatedCompany;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUsersByCompany(companyId: number): Promise<User[]> {
    return await db.select().from(users).where(eq(users.companyId, companyId)).orderBy(users.name);
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(user)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Projects
  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async getProjectsByCompany(companyId: number): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.companyId, companyId))
      .orderBy(desc(projects.createdAt));
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project> {
    const [updatedProject] = await db
      .update(projects)
      .set(project)
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  async deleteProject(id: number): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  // Transactions
  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction || undefined;
  }

  async getTransactionsByCompany(companyId: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.companyId, companyId))
      .orderBy(desc(transactions.transactionDate));
  }

  async getTransactionsByProject(projectId: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.projectId, projectId))
      .orderBy(desc(transactions.transactionDate));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }

  async updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction> {
    const [updatedTransaction] = await db
      .update(transactions)
      .set(transaction)
      .where(eq(transactions.id, id))
      .returning();
    return updatedTransaction;
  }

  async deleteTransaction(id: number): Promise<void> {
    await db.delete(transactions).where(eq(transactions.id, id));
  }

  // Equipment
  async getEquipment(id: number): Promise<Equipment | undefined> {
    const [equipmentItem] = await db.select().from(equipment).where(eq(equipment.id, id));
    return equipmentItem || undefined;
  }

  async getEquipmentByCompany(companyId: number): Promise<Equipment[]> {
    return await db
      .select()
      .from(equipment)
      .where(eq(equipment.companyId, companyId))
      .orderBy(equipment.name);
  }

  async createEquipment(equipmentData: InsertEquipment): Promise<Equipment> {
    const [newEquipment] = await db.insert(equipment).values(equipmentData).returning();
    return newEquipment;
  }

  async updateEquipment(id: number, equipmentData: Partial<InsertEquipment>): Promise<Equipment> {
    const [updatedEquipment] = await db
      .update(equipment)
      .set(equipmentData)
      .where(eq(equipment.id, id))
      .returning();
    return updatedEquipment;
  }

  async deleteEquipment(id: number): Promise<void> {
    await db.delete(equipment).where(eq(equipment.id, id));
  }

  // Warehouses
  async getWarehouse(id: number): Promise<Warehouse | undefined> {
    const [warehouse] = await db.select().from(warehouses).where(eq(warehouses.id, id));
    return warehouse || undefined;
  }

  async getWarehousesByCompany(companyId: number): Promise<Warehouse[]> {
    return await db
      .select()
      .from(warehouses)
      .where(eq(warehouses.companyId, companyId))
      .orderBy(warehouses.name);
  }

  async createWarehouse(warehouse: InsertWarehouse): Promise<Warehouse> {
    const [newWarehouse] = await db.insert(warehouses).values(warehouse).returning();
    return newWarehouse;
  }

  async updateWarehouse(id: number, warehouse: Partial<InsertWarehouse>): Promise<Warehouse> {
    const [updatedWarehouse] = await db
      .update(warehouses)
      .set(warehouse)
      .where(eq(warehouses.id, id))
      .returning();
    return updatedWarehouse;
  }

  async deleteWarehouse(id: number): Promise<void> {
    await db.delete(warehouses).where(eq(warehouses.id, id));
  }

  // Documents
  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document || undefined;
  }

  async getDocumentsByCompany(companyId: number): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(eq(documents.companyId, companyId))
      .orderBy(desc(documents.createdAt));
  }

  async getDocumentsByProject(projectId: number): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(eq(documents.projectId, projectId))
      .orderBy(desc(documents.createdAt));
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db.insert(documents).values(document).returning();
    return newDocument;
  }

  async updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document> {
    const [updatedDocument] = await db
      .update(documents)
      .set(document)
      .where(eq(documents.id, id))
      .returning();
    return updatedDocument;
  }

  async deleteDocument(id: number): Promise<void> {
    await db.delete(documents).where(eq(documents.id, id));
  }

  // Dashboard Stats
  async getDashboardStats(companyId: number): Promise<{
    totalRevenue: number;
    totalExpenses: number;
    activeProjects: number;
    totalEmployees: number;
    equipmentCount: number;
    recentTransactions: Transaction[];
  }> {
    const [revenueResult] = await db
      .select({ total: sql<number>`sum(${transactions.amount})` })
      .from(transactions)
      .where(and(eq(transactions.companyId, companyId), eq(transactions.type, 'income')));

    const [expenseResult] = await db
      .select({ total: sql<number>`sum(${transactions.amount})` })
      .from(transactions)
      .where(and(eq(transactions.companyId, companyId), eq(transactions.type, 'expense')));

    const [projectsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(projects)
      .where(and(eq(projects.companyId, companyId), eq(projects.status, 'active')));

    const [employeesResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(and(eq(users.companyId, companyId), eq(users.isActive, true)));

    const [equipmentResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(equipment)
      .where(eq(equipment.companyId, companyId));

    const recentTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.companyId, companyId))
      .orderBy(desc(transactions.transactionDate))
      .limit(10);

    return {
      totalRevenue: Number(revenueResult?.total || 0),
      totalExpenses: Number(expenseResult?.total || 0),
      activeProjects: Number(projectsResult?.count || 0),
      totalEmployees: Number(employeesResult?.count || 0),
      equipmentCount: Number(equipmentResult?.count || 0),
      recentTransactions,
    };
  }
}

export const storage = new DatabaseStorage();
