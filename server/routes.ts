import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { businessIntelligence } from "./business-intelligence";
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
      const companyId = parseInt(req.query.companyId as string);
      if (!companyId) {
        return res.status(400).json({ message: "Company ID is required" });
      }
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
      const companyId = parseInt(req.query.companyId as string);
      if (!companyId) {
        return res.status(400).json({ message: "Company ID is required" });
      }
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
      const companyId = parseInt(req.query.companyId as string);
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      
      if (!companyId) {
        return res.status(400).json({ message: "Company ID is required" });
      }

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
      const companyId = parseInt(req.query.companyId as string);
      if (!companyId) {
        return res.status(400).json({ message: "Company ID is required" });
      }
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
      const companyId = parseInt(req.query.companyId as string);
      if (!companyId) {
        return res.status(400).json({ message: "Company ID is required" });
      }
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
      const companyId = parseInt(req.query.companyId as string);
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      
      if (!companyId) {
        return res.status(400).json({ message: "Company ID is required" });
      }

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
      res.status(500).json({ message: "Failed to analyze financial trends" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
