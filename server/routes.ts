import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { businessIntelligence } from "./business-intelligence";
import { multiPlatformEngine } from "./multi-platform-engine";
import { ifrsEngine } from "./ifrs-engine";
import { registerFileRoutes } from "./file-routes";
import { 
  insertCompanySchema, insertUserSchema, insertProjectSchema, 
  insertTransactionSchema, insertEquipmentSchema, insertWarehouseSchema, insertDocumentSchema 
} from "@shared/schema";
import multer from "multer";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  dest: uploadsDir,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Companies routes
  app.get("/api/companies", async (req, res) => {
    try {
      const companies = await storage.getCompanies();
      res.json(companies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  app.get("/api/companies/:id", async (req, res) => {
    try {
      const company = await storage.getCompany(parseInt(req.params.id));
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch company" });
    }
  });

  app.post("/api/companies", async (req, res) => {
    try {
      const validatedData = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(validatedData);
      res.status(201).json(company);
    } catch (error) {
      res.status(400).json({ message: "Invalid company data" });
    }
  });

  // Users routes
  app.get("/api/users", async (req, res) => {
    try {
      const companyId = parseInt(req.query.companyId as string) || 1; // Default to company 1
      const users = await storage.getUsersByCompany(companyId);
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(id, validatedData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      await storage.deleteUser(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Projects routes
  app.get("/api/projects", async (req, res) => {
    try {
      const companyId = parseInt(req.query.companyId as string) || 1; // Default to company 1
      const projects = await storage.getProjectsByCompany(companyId);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(parseInt(req.params.id));
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ message: "Invalid project data" });
    }
  });

  app.put("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(id, validatedData);
      res.json(project);
    } catch (error) {
      res.status(400).json({ message: "Invalid project data" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      await storage.deleteProject(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Transactions routes
  app.get("/api/transactions", async (req, res) => {
    try {
      const companyId = parseInt(req.query.companyId as string) || 1; // Default to company 1
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;

      let transactions;
      if (projectId) {
        transactions = await storage.getTransactionsByProject(projectId);
      } else {
        transactions = await storage.getTransactionsByCompany(companyId);
      }
      
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid transaction data" });
    }
  });

  // Equipment routes
  app.get("/api/equipment", async (req, res) => {
    try {
      const companyId = parseInt(req.query.companyId as string) || 1; // Default to company 1
      const equipment = await storage.getEquipmentByCompany(companyId);
      res.json(equipment);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch equipment" });
    }
  });

  app.post("/api/equipment", async (req, res) => {
    try {
      const validatedData = insertEquipmentSchema.parse(req.body);
      const equipment = await storage.createEquipment(validatedData);
      res.status(201).json(equipment);
    } catch (error) {
      res.status(400).json({ message: "Invalid equipment data" });
    }
  });

  // Warehouses routes
  app.get("/api/warehouses", async (req, res) => {
    try {
      const companyId = parseInt(req.query.companyId as string) || 1; // Default to company 1
      const warehouses = await storage.getWarehousesByCompany(companyId);
      res.json(warehouses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch warehouses" });
    }
  });

  app.post("/api/warehouses", async (req, res) => {
    try {
      const validatedData = insertWarehouseSchema.parse(req.body);
      const warehouse = await storage.createWarehouse(validatedData);
      res.status(201).json(warehouse);
    } catch (error) {
      res.status(400).json({ message: "Invalid warehouse data" });
    }
  });

  // Documents routes
  app.get("/api/documents", async (req, res) => {
    try {
      const companyId = parseInt(req.query.companyId as string) || 1; // Default to company 1
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;

      let documents;
      if (projectId) {
        documents = await storage.getDocumentsByProject(projectId);
      } else {
        documents = await storage.getDocumentsByCompany(companyId);
      }
      
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post("/api/documents/upload", upload.single('file'), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { companyId, projectId, name, nameAr, uploadedBy } = req.body;
      
      const documentData = {
        name: name || req.file.originalname,
        nameAr: nameAr || "",
        type: path.extname(req.file.originalname).slice(1).toLowerCase(),
        size: req.file.size,
        path: req.file.path,
        companyId: parseInt(companyId),
        projectId: projectId ? parseInt(projectId) : null,
        uploadedBy: parseInt(uploadedBy),
        tags: [],
        isPublic: false,
      };

      const document = await storage.createDocument(documentData);
      res.status(201).json(document);
    } catch (error) {
      res.status(400).json({ message: "Failed to upload document" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const companyId = parseInt(req.query.companyId as string);
      if (!companyId) {
        return res.status(400).json({ message: "Company ID is required" });
      }
      const stats = await storage.getDashboardStats(companyId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Exchange rates (mock endpoint)
  app.get("/api/exchange-rates", async (req, res) => {
    res.json({
      YER_USD: 250.75,
      USD_YER: 0.00399,
      lastUpdated: new Date().toISOString(),
    });
  });

  // Business Intelligence endpoints
  app.post("/api/intelligence/cost-estimation", async (req, res) => {
    try {
      const { projectType, area, location, complexity, specifications } = req.body;
      
      if (!projectType || !area || !location || !complexity) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const estimate = businessIntelligence.calculateProjectCost(
        projectType,
        parseFloat(area),
        location,
        complexity,
        specifications || []
      );
      
      res.json(estimate);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate cost estimate" });
    }
  });

  app.post("/api/intelligence/project-insights", async (req, res) => {
    try {
      const { projectId } = req.body;
      
      if (!projectId) {
        return res.status(400).json({ message: "Project ID is required" });
      }

      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const transactions = await storage.getTransactionsByProject(projectId);
      const insights = businessIntelligence.analyzeProject(project, transactions);
      
      res.json(insights);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate project insights" });
    }
  });

  app.get("/api/intelligence/financial-trends", async (req, res) => {
    try {
      const companyId = parseInt(req.query.companyId as string);
      
      if (!companyId) {
        return res.status(400).json({ message: "Company ID is required" });
      }

      const transactions = await storage.getTransactionsByCompany(companyId);
      const analysis = businessIntelligence.analyzeFinancialTrends(transactions);
      
      res.json(analysis);
    } catch (error) {
      console.error("Financial trends analysis error:", error);
      res.status(500).json({ 
        message: "Failed to analyze financial trends",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Version Management API
  app.get("/api/version", async (req, res) => {
    try {
      const version = {
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
      
      res.json(version);
    } catch (error) {
      console.error('Failed to get version:', error);
      res.status(500).json({ error: 'Failed to retrieve version information' });
    }
  });

  // Synchronization API
  app.post("/api/sync/batch", async (req, res) => {
    try {
      const batch = req.body;
      console.log(`Sync: Processing batch ${batch.id} with ${batch.operations.length} operations`);
      
      const results = {
        successful: [],
        conflicts: [],
        errors: []
      };

      for (const operation of batch.operations) {
        try {
          await processSyncOperation(operation, results);
        } catch (error) {
          console.error(`Sync: Operation ${operation.id} failed:`, error);
          results.errors.push({
            operationId: operation.id,
            error: error.message
          });
        }
      }

      console.log(`Sync: Batch ${batch.id} completed. Success: ${results.successful.length}, Conflicts: ${results.conflicts.length}, Errors: ${results.errors.length}`);
      res.json(results);
      
    } catch (error) {
      console.error('Sync: Batch processing failed:', error);
      res.status(500).json({ error: 'Failed to process sync batch' });
    }
  });

  app.get("/api/sync/changes", async (req, res) => {
    try {
      const since = req.query.since as string;
      console.log(`Sync: Fetching changes since ${since || 'beginning'}`);
      
      const changes = [];
      const sinceDate = since ? new Date(since) : new Date(0);
      
      // For now, return empty changes array
      // In production, implement proper change tracking
      console.log(`Sync: Returning ${changes.length} changes`);
      res.json(changes);
      
    } catch (error) {
      console.error('Sync: Failed to fetch changes:', error);
      res.status(500).json({ error: 'Failed to fetch changes' });
    }
  });

  async function processSyncOperation(operation: any, results: any): Promise<void> {
    const { type, entity, entityId, data } = operation;
    
    try {
      switch (entity) {
        case 'projects':
          if (type === 'create') {
            const created = await storage.createProject(data);
            results.successful.push({
              operationId: operation.id,
              entity,
              entityId: created.id,
              serverData: created
            });
          } else if (type === 'update') {
            const updated = await storage.updateProject(entityId, data);
            results.successful.push({
              operationId: operation.id,
              entity,
              entityId,
              serverData: updated
            });
          } else if (type === 'delete') {
            await storage.deleteProject(entityId);
            results.successful.push({
              operationId: operation.id,
              entity,
              entityId
            });
          }
          break;
          
        case 'transactions':
          if (type === 'create') {
            const created = await storage.createTransaction(data);
            results.successful.push({
              operationId: operation.id,
              entity,
              entityId: created.id,
              serverData: created
            });
          } else if (type === 'update') {
            const updated = await storage.updateTransaction(entityId, data);
            results.successful.push({
              operationId: operation.id,
              entity,
              entityId,
              serverData: updated
            });
          } else if (type === 'delete') {
            await storage.deleteTransaction(entityId);
            results.successful.push({
              operationId: operation.id,
              entity,
              entityId
            });
          }
          break;
          
        case 'users':
          if (type === 'create') {
            const created = await storage.createUser(data);
            results.successful.push({
              operationId: operation.id,
              entity,
              entityId: created.id,
              serverData: created
            });
          } else if (type === 'update') {
            const updated = await storage.updateUser(entityId, data);
            results.successful.push({
              operationId: operation.id,
              entity,
              entityId,
              serverData: updated
            });
          } else if (type === 'delete') {
            await storage.deleteUser(entityId);
            results.successful.push({
              operationId: operation.id,
              entity,
              entityId
            });
          }
          break;
          
        case 'equipment':
          if (type === 'create') {
            const created = await storage.createEquipment(data);
            results.successful.push({
              operationId: operation.id,
              entity,
              entityId: created.id,
              serverData: created
            });
          } else if (type === 'update') {
            const updated = await storage.updateEquipment(entityId, data);
            results.successful.push({
              operationId: operation.id,
              entity,
              entityId,
              serverData: updated
            });
          } else if (type === 'delete') {
            await storage.deleteEquipment(entityId);
            results.successful.push({
              operationId: operation.id,
              entity,
              entityId
            });
          }
          break;
          
        case 'warehouses':
          if (type === 'create') {
            const created = await storage.createWarehouse(data);
            results.successful.push({
              operationId: operation.id,
              entity,
              entityId: created.id,
              serverData: created
            });
          } else if (type === 'update') {
            const updated = await storage.updateWarehouse(entityId, data);
            results.successful.push({
              operationId: operation.id,
              entity,
              entityId,
              serverData: updated
            });
          } else if (type === 'delete') {
            await storage.deleteWarehouse(entityId);
            results.successful.push({
              operationId: operation.id,
              entity,
              entityId
            });
          }
          break;
          
        default:
          throw new Error(`Unknown entity type: ${entity}`);
      }
    } catch (error) {
      // Check if it's a conflict error
      if (error.message?.includes('conflict') || error.message?.includes('version')) {
        results.conflicts.push({
          operationId: operation.id,
          entity,
          entityId,
          localData: data,
          serverData: null, // Would fetch from database in production
          reason: error.message
        });
      } else {
        throw error;
      }
    }
  }

  // IFRS 15 Revenue Recognition endpoints
  app.post("/api/ifrs/progress-billing", async (req, res) => {
    try {
      const { projectId } = req.body;
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const { ifrsEngine } = await import("./ifrs-engine");
      const billing = ifrsEngine.calculateProgressBilling({
        contractValue: parseFloat(project.contractValue || '0'),
        costsIncurredToDate: parseFloat(project.costsIncurredToDate || '0'),
        estimatedTotalCosts: parseFloat(project.estimatedTotalCosts || '0'),
        billingToDate: parseFloat(project.billingToDate || '0'),
        contractCurrency: project.contractCurrency || 'YER',
      });
      
      res.json(billing);
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate progress billing" });
    }
  });

  app.post("/api/ifrs/revenue-recognition", async (req, res) => {
    try {
      const { projectId } = req.body;
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const { ifrsEngine } = await import("./ifrs-engine");
      const recognition = ifrsEngine.calculateRevenueRecognition({
        contractValue: parseFloat(project.contractValue || '0'),
        costsIncurredToDate: parseFloat(project.costsIncurredToDate || '0'),
        estimatedTotalCosts: parseFloat(project.estimatedTotalCosts || '0'),
        revenueRecognizedToDate: parseFloat(project.revenueRecognizedToDate || '0'),
      });
      
      res.json(recognition);
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate revenue recognition" });
    }
  });

  app.get("/api/ifrs/wip-schedule", async (req, res) => {
    try {
      const companyId = parseInt(req.query.companyId as string) || 1;
      const projects = await storage.getProjectsByCompany(companyId);
      
      const wipData = projects.map(project => ({
        id: project.id,
        name: project.name,
        contractValue: parseFloat(project.contractValue || '0'),
        costsIncurredToDate: parseFloat(project.costsIncurredToDate || '0'),
        estimatedTotalCosts: parseFloat(project.estimatedTotalCosts || '0'),
        billingToDate: parseFloat(project.billingToDate || '0'),
        revenueRecognizedToDate: parseFloat(project.revenueRecognizedToDate || '0'),
      }));

      const { ifrsEngine } = await import("./ifrs-engine");
      const wipSchedule = ifrsEngine.generateWIPSchedule(wipData);
      const complianceReport = ifrsEngine.generateComplianceReport(wipSchedule);
      
      res.json({
        wipSchedule,
        complianceReport,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate WIP schedule" });
    }
  });

  // Multi-Currency endpoints
  app.get("/api/currency/rates", async (req, res) => {
    try {
      const { currencyEngine } = await import("./currency-engine");
      const rates = currencyEngine.getSupportedCurrencies();
      res.json(rates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch currency rates" });
    }
  });

  app.post("/api/currency/convert", async (req, res) => {
    try {
      const { amount, fromCurrency, toCurrency, precision } = req.body;
      
      if (!amount || !fromCurrency || !toCurrency) {
        return res.status(400).json({ message: "Amount, fromCurrency, and toCurrency are required" });
      }

      const { currencyEngine } = await import("./currency-engine");
      const conversion = currencyEngine.convert(
        parseFloat(amount), 
        fromCurrency, 
        toCurrency, 
        precision || 2
      );
      
      res.json(conversion);
    } catch (error) {
      res.status(500).json({ message: "Failed to convert currency" });
    }
  });

  app.post("/api/currency/multi-convert", async (req, res) => {
    try {
      const { amount, baseCurrency, targetCurrencies } = req.body;
      
      if (!amount || !baseCurrency || !Array.isArray(targetCurrencies)) {
        return res.status(400).json({ message: "Amount, baseCurrency, and targetCurrencies array are required" });
      }

      const { currencyEngine } = await import("./currency-engine");
      const conversions = currencyEngine.calculateMultiCurrencyValue(
        parseFloat(amount), 
        baseCurrency, 
        targetCurrencies
      );
      
      res.json(conversions);
    } catch (error) {
      res.status(500).json({ message: "Failed to convert to multiple currencies" });
    }
  });

  app.get("/api/currency/historical/:from/:to", async (req, res) => {
    try {
      const { from, to } = req.params;
      const days = parseInt(req.query.days as string) || 30;
      
      const { currencyEngine } = await import("./currency-engine");
      const historical = currencyEngine.getHistoricalRates(from, to, days);
      res.json(historical);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch historical rates" });
    }
  });

  app.post("/api/currency/update-rates", async (req, res) => {
    try {
      const { currencyEngine } = await import("./currency-engine");
      const result = await currencyEngine.updateExchangeRates();
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to update exchange rates" });
    }
  });

  // Global Market Intelligence endpoint
  app.post("/api/intelligence/global-cost-estimation", async (req, res) => {
    try {
      const { projectType, area, region, country, complexity, targetCurrency } = req.body;
      
      if (!projectType || !area || !region || !country) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Get base estimate in YER
      const estimate = businessIntelligence.calculateProjectCost(
        projectType,
        parseFloat(area),
        country,
        complexity || 'medium',
        []
      );
      
      // Convert to target currency if specified
      let convertedEstimate = estimate;
      if (targetCurrency && targetCurrency !== 'YER') {
        const { currencyEngine } = await import("./currency-engine");
        const conversion = currencyEngine.convert(
          estimate.totalCost,
          'YER',
          targetCurrency
        );
        
        convertedEstimate = {
          ...estimate,
          totalCost: conversion.convertedAmount,
          currency: targetCurrency,
          exchangeRate: conversion.exchangeRate,
          volatilityRisk: conversion.volatilityRisk,
        };
      }
      
      res.json(convertedEstimate);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate global cost estimate" });
    }
  });

  // Enhanced project analytics endpoint
  app.get("/api/analytics/project/:id", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const transactions = await storage.getTransactionsByProject(projectId);
      
      // Basic project insights
      const insights = businessIntelligence.analyzeProject(project, transactions);
      
      // IFRS revenue recognition
      const { ifrsEngine } = await import("./ifrs-engine");
      const revenueRecognition = ifrsEngine.calculateRevenueRecognition({
        contractValue: parseFloat(project.contractValue || '0'),
        costsIncurredToDate: parseFloat(project.costsIncurredToDate || '0'),
        estimatedTotalCosts: parseFloat(project.estimatedTotalCosts || '0'),
        revenueRecognizedToDate: parseFloat(project.revenueRecognizedToDate || '0'),
      });
      
      // Multi-currency analysis if project currency is not YER
      let currencyAnalysis = null;
      if (project.contractCurrency && project.contractCurrency !== 'YER') {
        const { currencyEngine } = await import("./currency-engine");
        const contractValueInYER = currencyEngine.convert(
          parseFloat(project.contractValue || '0'),
          project.contractCurrency,
          'YER'
        );
        
        currencyAnalysis = {
          originalCurrency: project.contractCurrency,
          contractValue: parseFloat(project.contractValue || '0'),
          contractValueInYER: contractValueInYER.convertedAmount,
          exchangeRate: contractValueInYER.exchangeRate,
          volatilityRisk: contractValueInYER.volatilityRisk,
        };
      }
      
      res.json({
        project: insights,
        ifrs: revenueRecognition,
        currency: currencyAnalysis,
        globalFactors: {
          region: project.region || 'MENA',
          countryCode: project.countryCode || 'YE',
          complexity: project.complexity || 'medium',
          projectType: project.projectType || 'residential',
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate project analytics" });
    }
  });

  // Multi-Platform Engine API endpoints
  app.get("/api/platforms/status", async (req, res) => {
    try {
      const status = multiPlatformEngine.getPlatformStatus();
      res.json({
        platforms: status,
        lastUpdate: new Date(),
        totalPlatforms: status.length,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get platform status" });
    }
  });

  app.get("/api/platforms/roadmap", async (req, res) => {
    try {
      const roadmap = multiPlatformEngine.getImplementationRoadmap();
      res.json({
        phases: roadmap,
        totalDuration: "16 weeks",
        totalFeatures: 50,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get implementation roadmap" });
    }
  });

  app.get("/api/platforms/config/windows", async (req, res) => {
    try {
      const config = multiPlatformEngine.getWindowsServerConfig();
      res.json(config);
    } catch (error) {
      res.status(500).json({ message: "Failed to get Windows configuration" });
    }
  });

  app.get("/api/platforms/config/mobile", async (req, res) => {
    try {
      const config = multiPlatformEngine.getMobileAppConfig();
      res.json(config);
    } catch (error) {
      res.status(500).json({ message: "Failed to get mobile configuration" });
    }
  });

  app.get("/api/platforms/config/glassmorphism", async (req, res) => {
    try {
      const config = multiPlatformEngine.getGlassmorphismConfig();
      res.json(config);
    } catch (error) {
      res.status(500).json({ message: "Failed to get glassmorphism configuration" });
    }
  });

  app.post("/api/platforms/sync", async (req, res) => {
    try {
      const result = await multiPlatformEngine.syncAllPlatforms();
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to sync platforms" });
    }
  });

  app.get("/api/platforms/technical-specs", async (req, res) => {
    try {
      const specs = multiPlatformEngine.generateTechnicalSpecs();
      res.json(specs);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate technical specifications" });
    }
  });

  // IFRS Compliance API endpoints
  app.post("/api/ifrs/revenue-recognition", async (req, res) => {
    try {
      const { contractValue, costsIncurredToDate, estimatedTotalCosts, revenueRecognizedToDate } = req.body;
      
      if (!contractValue || !costsIncurredToDate || !estimatedTotalCosts) {
        return res.status(400).json({ message: "Missing required IFRS fields" });
      }

      const calculation = ifrsEngine.calculateRevenueRecognition({
        contractValue: parseFloat(contractValue),
        costsIncurredToDate: parseFloat(costsIncurredToDate),
        estimatedTotalCosts: parseFloat(estimatedTotalCosts),
        revenueRecognizedToDate: parseFloat(revenueRecognizedToDate || '0'),
      });
      
      res.json(calculation);
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate IFRS revenue recognition" });
    }
  });

  app.post("/api/ifrs/percentage-completion", async (req, res) => {
    try {
      const { costsIncurredToDate, estimatedTotalCosts, method } = req.body;
      
      if (!costsIncurredToDate || !estimatedTotalCosts) {
        return res.status(400).json({ message: "Missing required fields for percentage completion" });
      }

      const percentage = ifrsEngine.calculatePercentageOfCompletion(
        parseFloat(costsIncurredToDate),
        parseFloat(estimatedTotalCosts),
        method || 'cost-to-cost'
      );
      
      res.json({ 
        percentageComplete: percentage,
        method: method || 'cost-to-cost',
        costsIncurredToDate: parseFloat(costsIncurredToDate),
        estimatedTotalCosts: parseFloat(estimatedTotalCosts),
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate percentage of completion" });
    }
  });

  app.get("/api/ifrs/compliance-check/:projectId", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const complianceCheck = ifrsEngine.generateComplianceReport({
        contractValue: parseFloat(project.contractValue || '0'),
        costsIncurredToDate: parseFloat(project.costsIncurredToDate || '0'),
        estimatedTotalCosts: parseFloat(project.estimatedTotalCosts || '0'),
        revenueRecognizedToDate: parseFloat(project.revenueRecognizedToDate || '0'),
      });
      
      res.json({
        projectId,
        projectName: project.name,
        compliance: complianceCheck,
        lastChecked: new Date(),
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to perform IFRS compliance check" });
    }
  });

  // Enhanced development plan endpoints
  app.get("/api/development/plan", async (req, res) => {
    try {
      const developmentPlan = {
        overview: {
          title: "Yemen Construction Management Platform - Enterprise Multi-Platform Strategy",
          status: "Phase 1 Implementation - IFRS Foundation",
          completion: "25%",
          nextMilestone: "IFRS 15 Revenue Recognition Engine",
          estimatedCompletion: "16 weeks total",
        },
        currentPhase: {
          name: "Phase 1: IFRS Compliance Foundation",
          duration: "4 weeks",
          progress: "50%",
          features: [
            "IFRS 15 Revenue Recognition Engine",
            "IFRS 16 Lease Management System", 
            "Yemen-specific compliance calculations",
            "Automated progress billing interface",
          ],
          platforms: ["web"],
          priority: "high",
        },
        technicalStack: {
          frontend: "React 18 + TypeScript + Vite",
          backend: "Node.js + Express + PostgreSQL",
          mobile: "React Native/Expo + Native iOS/Android",
          windows: ".NET 8 + Entity Framework + WPF",
          design: "Glassmorphism UI + 8K optimization",
          compliance: "IFRS 15/16 + Yemen regulations",
        },
        marketPosition: {
          targetMarket: "Yemen construction companies (416+ contractors)",
          competitiveAdvantage: "Offline-first + IFRS compliance + Arabic RTL",
          globalExpansion: "MENA region, then international",
          revenueProjection: "$5M ARR by Year 2",
        },
      };
      
      res.json(developmentPlan);
    } catch (error) {
      res.status(500).json({ message: "Failed to get development plan" });
    }
  });

  app.get("/api/development/user-personas", async (req, res) => {
    try {
      const userPersonas = [
        {
          name: "Ahmed Al-Hashimi",
          role: "Construction Company CEO",
          demographics: "Male, 45-55, Sana'a-based, Engineering background",
          technicalSkills: "Basic computer literacy, smartphone power user",
          primaryGoals: [
            "Real-time project oversight across multiple sites",
            "Financial transparency and IFRS compliance for international partnerships",
            "Cost optimization and profit margin improvement",
          ],
          painPoints: [
            "Lack of real-time project visibility",
            "Manual financial reporting and compliance challenges", 
            "Difficulty accessing data while traveling between sites",
          ],
          useCases: [
            "Daily dashboard reviews on mobile during site visits",
            "Weekly financial reports generation for board meetings",
            "Monthly IFRS compliance reporting for international clients",
          ],
        },
        {
          name: "Fatima Al-Shamiri",
          role: "Project Manager",
          demographics: "Female, 30-40, University education, Bilingual",
          technicalSkills: "Advanced computer skills, familiar with project management software",
          primaryGoals: [
            "Efficient project timeline management with Gantt chart visualization",
            "Resource allocation optimization across multiple projects",
            "Real-time collaboration with site supervisors and teams",
          ],
          painPoints: [
            "Manual project tracking and reporting",
            "Communication delays with field teams",
            "Lack of centralized document management",
          ],
          useCases: [
            "Interactive Gantt chart management from desktop and tablet",
            "Real-time project updates via mobile notifications",
            "Document sharing and version control across teams",
          ],
        },
        {
          name: "Omar Al-Zahra",
          role: "Financial Controller", 
          demographics: "Male, 35-45, Accounting background, English proficient",
          technicalSkills: "Advanced Excel user, familiar with accounting software",
          primaryGoals: [
            "IFRS-compliant financial reporting and revenue recognition",
            "Multi-currency support for international projects",
            "Automated financial controls and audit trail maintenance",
          ],
          painPoints: [
            "Manual percentage completion calculations",
            "Lack of automated IFRS compliance checking",
            "Difficulty managing multi-currency transactions",
          ],
          useCases: [
            "Monthly IFRS 15 revenue recognition calculations",
            "Real-time cash flow monitoring and forecasting",
            "Automated audit trail generation for compliance",
          ],
        },
      ];
      
      res.json(userPersonas);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user personas" });
    }
  });

  // Register file management routes
  registerFileRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
