import express from 'express';
import { Database } from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Mobile-optimized embedded server for complete offline functionality
export class EmbeddedConstructionServer {
  private app: express.Application;
  private db: Database;
  private port = 3000;
  private isRunning = false;

  constructor() {
    this.app = express();
    this.initializeDatabase();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private initializeDatabase() {
    // Initialize SQLite database for complete offline storage
    this.db = new Database(':memory:'); // In-memory for now, can be file-based
    
    // Create all necessary tables
    this.createTables();
    this.seedSampleData();
  }

  private createTables() {
    // Companies table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS companies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        name_ar TEXT NOT NULL,
        type TEXT DEFAULT 'main',
        location TEXT,
        location_ar TEXT,
        phone TEXT,
        email TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Users table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        name_ar TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        role TEXT DEFAULT 'employee',
        department TEXT,
        department_ar TEXT,
        company_id INTEGER NOT NULL,
        manager_id INTEGER,
        salary DECIMAL(12,2),
        hire_date DATE,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id)
      )
    `);

    // Projects table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        name_ar TEXT NOT NULL,
        description TEXT,
        description_ar TEXT,
        status TEXT DEFAULT 'planning',
        priority TEXT DEFAULT 'medium',
        budget DECIMAL(15,2) NOT NULL,
        company_id INTEGER NOT NULL,
        manager_id INTEGER,
        location TEXT,
        location_ar TEXT,
        start_date DATE,
        end_date DATE,
        progress INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id)
      )
    `);

    // Transactions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        category TEXT NOT NULL,
        category_ar TEXT NOT NULL,
        description TEXT,
        description_ar TEXT,
        amount DECIMAL(15,2) NOT NULL,
        currency TEXT DEFAULT 'YER',
        exchange_rate DECIMAL(10,4) DEFAULT 1.0000,
        company_id INTEGER NOT NULL,
        project_id INTEGER,
        created_by INTEGER NOT NULL,
        transaction_date DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id),
        FOREIGN KEY (project_id) REFERENCES projects(id)
      )
    `);

    console.log('✅ Embedded server: Database tables created');
  }

  private seedSampleData() {
    // Insert sample company
    const insertCompany = this.db.prepare(`
      INSERT OR IGNORE INTO companies (name, name_ar, location, location_ar, phone, email)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    insertCompany.run(
      'Yemen Construction Corp',
      'شركة اليمن للإنشاءات',
      'Sanaa, Yemen',
      'صنعاء، اليمن',
      '+967-1-234567',
      'info@yemenconstruction.com'
    );

    // Insert sample user
    const insertUser = this.db.prepare(`
      INSERT OR IGNORE INTO users (username, password, name, name_ar, email, role, company_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    insertUser.run(
      'admin',
      '$2b$10$hashedpassword', // In real app, properly hash password
      'Ahmed Al-Yemeni',
      'أحمد اليمني',
      'ahmed@yemenconstruction.com',
      'ceo',
      1
    );

    // Insert sample project
    const insertProject = this.db.prepare(`
      INSERT OR IGNORE INTO projects (name, name_ar, description, description_ar, budget, company_id, manager_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    insertProject.run(
      'Modern Residential Complex',
      'مجمع سكني حديث',
      'A modern residential complex in Sanaa',
      'مجمع سكني حديث في صنعاء',
      5000000,
      1,
      1,
      'active'
    );

    console.log('✅ Embedded server: Sample data seeded');
  }

  private setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // CORS for mobile app
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });
  }

  private setupRoutes() {
    // Health check
    this.app.get('/api/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        server: 'embedded-construction-server',
        timestamp: new Date().toISOString(),
        offline: true
      });
    });

    // Companies endpoints
    this.app.get('/api/companies', (req, res) => {
      const companies = this.db.prepare('SELECT * FROM companies').all();
      res.json(companies);
    });

    // Users endpoints
    this.app.get('/api/users', (req, res) => {
      const { companyId } = req.query;
      let query = 'SELECT * FROM users';
      let params: any[] = [];
      
      if (companyId) {
        query += ' WHERE company_id = ?';
        params.push(companyId);
      }
      
      const users = this.db.prepare(query).all(...params);
      res.json(users);
    });

    // Projects endpoints
    this.app.get('/api/projects', (req, res) => {
      const { companyId, status } = req.query;
      let query = 'SELECT * FROM projects WHERE 1=1';
      let params: any[] = [];
      
      if (companyId) {
        query += ' AND company_id = ?';
        params.push(companyId);
      }
      
      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }
      
      const projects = this.db.prepare(query).all(...params);
      res.json(projects);
    });

    this.app.post('/api/projects', (req, res) => {
      const { name, nameAr, description, descriptionAr, budget, companyId, managerId } = req.body;
      
      const insert = this.db.prepare(`
        INSERT INTO projects (name, name_ar, description, description_ar, budget, company_id, manager_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = insert.run(name, nameAr, description, descriptionAr, budget, companyId, managerId);
      
      const project = this.db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid);
      res.status(201).json(project);
    });

    // Transactions endpoints
    this.app.get('/api/transactions', (req, res) => {
      const { companyId, projectId } = req.query;
      let query = 'SELECT * FROM transactions WHERE 1=1';
      let params: any[] = [];
      
      if (companyId) {
        query += ' AND company_id = ?';
        params.push(companyId);
      }
      
      if (projectId) {
        query += ' AND project_id = ?';
        params.push(projectId);
      }
      
      const transactions = this.db.prepare(query).all(...params);
      res.json(transactions);
    });

    // Dashboard stats
    this.app.get('/api/dashboard/stats', (req, res) => {
      const { companyId = 1 } = req.query;
      
      const revenue = this.db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total 
        FROM transactions 
        WHERE company_id = ? AND type = 'income'
      `).get(companyId);
      
      const expenses = this.db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total 
        FROM transactions 
        WHERE company_id = ? AND type = 'expense'
      `).get(companyId);
      
      const activeProjects = this.db.prepare(`
        SELECT COUNT(*) as count 
        FROM projects 
        WHERE company_id = ? AND status = 'active'
      `).get(companyId);
      
      const totalEmployees = this.db.prepare(`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE company_id = ? AND is_active = 1
      `).get(companyId);

      res.json({
        totalRevenue: revenue?.total || 0,
        totalExpenses: expenses?.total || 0,
        activeProjects: activeProjects?.count || 0,
        totalEmployees: totalEmployees?.count || 0,
        equipmentCount: 5, // Sample data
        recentTransactions: []
      });
    });

    // Business Intelligence endpoints (using embedded algorithms)
    this.app.get('/api/intelligence/financial-trends', (req, res) => {
      // Sample financial trends data
      res.json({
        monthlyTrends: [
          { month: '2025-01', income: 1200000, expenses: 800000, profit: 400000, profitMargin: 33.33 },
          { month: '2025-02', income: 1500000, expenses: 900000, profit: 600000, profitMargin: 40.0 },
          { month: '2025-03', income: 1800000, expenses: 1000000, profit: 800000, profitMargin: 44.44 }
        ],
        insights: [
          'إيرادات مستقرة مع نمو 15% شهرياً',
          'هامش ربح صحي يتراوح بين 30-45%',
          'تحكم جيد في التكاليف'
        ],
        alerts: [],
        projections: {
          nextMonthRevenue: 2000000,
          nextMonthExpenses: 1100000,
          yearEndProjection: 20000000
        }
      });
    });

    // Sync endpoints (for when back online)
    this.app.get('/api/sync/changes', (req, res) => {
      res.json([]); // No changes when running offline
    });

    // Version endpoint
    this.app.get('/api/version', (req, res) => {
      res.json({
        major: 1,
        minor: 2,
        patch: 0,
        build: `embedded-${Date.now()}`,
        embedded: true,
        offline: true
      });
    });

    console.log('✅ Embedded server: API routes configured');
  }

  public async start(): Promise<void> {
    return new Promise((resolve) => {
      if (this.isRunning) {
        console.log('⚠️ Embedded server already running');
        resolve();
        return;
      }

      this.app.listen(this.port, 'localhost', () => {
        this.isRunning = true;
        console.log(`🚀 Embedded Construction Management Server running on http://localhost:${this.port}`);
        console.log('📱 Mobile app server operational - complete offline functionality available');
        resolve();
      });
    });
  }

  public stop(): void {
    if (this.db) {
      this.db.close();
    }
    this.isRunning = false;
    console.log('🔒 Embedded server stopped');
  }

  public isServerRunning(): boolean {
    return this.isRunning;
  }
}

// Export singleton instance
export const embeddedServer = new EmbeddedConstructionServer();