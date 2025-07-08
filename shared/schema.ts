import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Companies/Branches
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  type: text("type").notNull().default("main"), // main, branch
  parentId: integer("parent_id"),
  location: text("location"),
  locationAr: text("location_ar"),
  phone: text("phone"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Users/Employees
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  email: text("email"),
  phone: text("phone"),
  role: text("role").notNull().default("employee"), // ceo, manager, supervisor, employee, worker
  department: text("department"),
  departmentAr: text("department_ar"),
  companyId: integer("company_id").notNull(),
  managerId: integer("manager_id"),
  salary: decimal("salary", { precision: 15, scale: 2 }),
  hireDate: timestamp("hire_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Projects
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  description: text("description"),
  descriptionAr: text("description_ar"),
  location: text("location"),
  locationAr: text("location_ar"),
  status: text("status").notNull().default("planning"), // planning, active, completed, cancelled, on_hold
  priority: text("priority").notNull().default("medium"), // low, medium, high, critical
  
  // IFRS 15 & Global Enhancement Fields
  contractValue: decimal("contract_value", { precision: 15, scale: 2 }).notNull().default('0'),
  contractCurrency: text("contract_currency").notNull().default("YER"), // YER, USD, EUR, GBP, SAR, AED
  estimatedTotalCosts: decimal("estimated_total_costs", { precision: 15, scale: 2 }).notNull().default('0'),
  costsIncurredToDate: decimal("costs_incurred_to_date", { precision: 15, scale: 2 }).notNull().default('0'),
  revenueRecognizedToDate: decimal("revenue_recognized_to_date", { precision: 15, scale: 2 }).notNull().default('0'),
  billingToDate: decimal("billing_to_date", { precision: 15, scale: 2 }).notNull().default('0'),
  
  // Global Expansion Fields
  region: text("region").default("MENA"), // MENA, APAC, EMEA, AMERICAS
  countryCode: text("country_code").default("YE"), // ISO country codes
  timeZone: text("time_zone").default("Asia/Aden"),
  localRegulations: jsonb("local_regulations").default('{}'), // Local building codes, standards
  
  // Advanced Project Fields
  projectType: text("project_type").default("residential"), // residential, commercial, infrastructure, industrial
  complexity: text("complexity").default("medium"), // simple, medium, complex, luxury
  sustainabilityRating: text("sustainability_rating"), // LEED, BREEAM, Green Star
  climateZone: text("climate_zone").default("arid"), // tropical, arid, temperate, cold
  budget: decimal("budget", { precision: 15, scale: 2 }),
  spent: decimal("spent", { precision: 15, scale: 2 }).default("0"),
  progress: integer("progress").default(0), // percentage 0-100
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  companyId: integer("company_id").notNull(),
  managerId: integer("manager_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Financial Transactions
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // income, expense, transfer
  category: text("category").notNull(),
  categoryAr: text("category_ar").notNull(),
  description: text("description"),
  descriptionAr: text("description_ar"),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("YER"), // YER, USD, EUR
  exchangeRate: decimal("exchange_rate", { precision: 10, scale: 4 }).default("1"),
  projectId: integer("project_id"),
  companyId: integer("company_id").notNull(),
  createdBy: integer("created_by").notNull(),
  transactionDate: timestamp("transaction_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Equipment
export const equipment = pgTable("equipment", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  type: text("type").notNull(),
  typeAr: text("type_ar").notNull(),
  model: text("model"),
  serialNumber: text("serial_number"),
  status: text("status").notNull().default("available"), // available, in_use, maintenance, offline
  location: text("location"),
  locationAr: text("location_ar"),
  companyId: integer("company_id").notNull(),
  assignedProjectId: integer("assigned_project_id"),
  purchaseDate: timestamp("purchase_date"),
  purchasePrice: decimal("purchase_price", { precision: 15, scale: 2 }),
  lastMaintenanceDate: timestamp("last_maintenance_date"),
  nextMaintenanceDate: timestamp("next_maintenance_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Warehouses
export const warehouses = pgTable("warehouses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  location: text("location"),
  locationAr: text("location_ar"),
  companyId: integer("company_id").notNull(),
  managerId: integer("manager_id"),
  capacity: integer("capacity"),
  currentStock: integer("current_stock").default(0),
  status: text("status").notNull().default("active"), // active, inactive, maintenance
  createdAt: timestamp("created_at").defaultNow(),
});

// Documents
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  type: text("type").notNull(), // pdf, doc, xls, img, other
  size: integer("size"), // in bytes
  path: text("path").notNull(),
  projectId: integer("project_id"),
  companyId: integer("company_id").notNull(),
  uploadedBy: integer("uploaded_by").notNull(),
  tags: text("tags").array(),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const companiesRelations = relations(companies, ({ one, many }) => ({
  parent: one(companies, {
    fields: [companies.parentId],
    references: [companies.id],
  }),
  children: many(companies),
  users: many(users),
  projects: many(projects),
  transactions: many(transactions),
  equipment: many(equipment),
  warehouses: many(warehouses),
  documents: many(documents),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
  manager: one(users, {
    fields: [users.managerId],
    references: [users.id],
  }),
  subordinates: many(users),
  managedProjects: many(projects),
  managedWarehouses: many(warehouses),
  transactions: many(transactions),
  uploadedDocuments: many(documents),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  company: one(companies, {
    fields: [projects.companyId],
    references: [companies.id],
  }),
  manager: one(users, {
    fields: [projects.managerId],
    references: [users.id],
  }),
  transactions: many(transactions),
  equipment: many(equipment),
  documents: many(documents),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  project: one(projects, {
    fields: [transactions.projectId],
    references: [projects.id],
  }),
  company: one(companies, {
    fields: [transactions.companyId],
    references: [companies.id],
  }),
  creator: one(users, {
    fields: [transactions.createdBy],
    references: [users.id],
  }),
}));

export const equipmentRelations = relations(equipment, ({ one }) => ({
  company: one(companies, {
    fields: [equipment.companyId],
    references: [companies.id],
  }),
  assignedProject: one(projects, {
    fields: [equipment.assignedProjectId],
    references: [projects.id],
  }),
}));

export const warehousesRelations = relations(warehouses, ({ one }) => ({
  company: one(companies, {
    fields: [warehouses.companyId],
    references: [companies.id],
  }),
  manager: one(users, {
    fields: [warehouses.managerId],
    references: [users.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  project: one(projects, {
    fields: [documents.projectId],
    references: [projects.id],
  }),
  company: one(companies, {
    fields: [documents.companyId],
    references: [companies.id],
  }),
  uploader: one(users, {
    fields: [documents.uploadedBy],
    references: [users.id],
  }),
}));

// Insert Schemas
export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertEquipmentSchema = createInsertSchema(equipment).omit({
  id: true,
  createdAt: true,
});

export const insertWarehouseSchema = createInsertSchema(warehouses).omit({
  id: true,
  createdAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
});

// Types
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Equipment = typeof equipment.$inferSelect;
export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;

export type Warehouse = typeof warehouses.$inferSelect;
export type InsertWarehouse = z.infer<typeof insertWarehouseSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
