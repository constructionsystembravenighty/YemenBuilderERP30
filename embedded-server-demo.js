#!/usr/bin/env node

/**
 * Embedded Server Demonstration
 * Shows the complete self-hosted architecture for mobile deployment
 */

import express from 'express';
import Database from 'better-sqlite3';

console.log('🚀 Construction Management Embedded Server Demo');
console.log('📱 منصة إدارة البناء - Self-Hosted Architecture\n');

class ConstructionEmbeddedServer {
  constructor() {
    this.app = express();
    this.db = new Database(':memory:');
    this.port = 3000;
    
    this.initializeDatabase();
    this.setupMiddleware();
    this.setupRoutes();
  }

  initializeDatabase() {
    console.log('🗄️  Initializing SQLite database...');
    
    // Create companies table
    this.db.exec(`
      CREATE TABLE companies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        name_ar TEXT NOT NULL,
        location TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create projects table
    this.db.exec(`
      CREATE TABLE projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        name_ar TEXT NOT NULL,
        budget REAL NOT NULL,
        status TEXT DEFAULT 'planning',
        company_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies (id)
      )
    `);
    
    // Seed sample data
    this.seedData();
    console.log('✅ Database initialized with Yemen construction data');
  }

  seedData() {
    // Insert sample company
    const insertCompany = this.db.prepare(`
      INSERT INTO companies (name, name_ar, location) 
      VALUES (?, ?, ?)
    `);
    
    insertCompany.run('Yemen Construction Co.', 'شركة اليمن للإنشاءات', 'Sanaa');
    
    // Insert sample project
    const insertProject = this.db.prepare(`
      INSERT INTO projects (name, name_ar, budget, company_id) 
      VALUES (?, ?, ?, ?)
    `);
    
    insertProject.run(
      'Modern Residential Complex', 
      'مجمع سكني حديث', 
      2500000, 
      1
    );
  }

  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.static('dist'));
  }

  setupRoutes() {
    // API routes for construction management
    this.app.get('/api/projects', (req, res) => {
      const projects = this.db.prepare('SELECT * FROM projects').all();
      res.json(projects);
    });
    
    this.app.get('/api/companies', (req, res) => {
      const companies = this.db.prepare('SELECT * FROM companies').all();
      res.json(companies);
    });
    
    // Business intelligence endpoint
    this.app.get('/api/dashboard/stats', (req, res) => {
      const stats = this.db.prepare(`
        SELECT 
          COUNT(*) as totalProjects,
          SUM(budget) as totalBudget,
          AVG(budget) as avgBudget
        FROM projects
      `).get();
      
      res.json({
        totalProjects: stats.totalProjects,
        totalBudget: stats.totalBudget,
        avgBudget: stats.avgBudget,
        currency: 'YER'
      });
    });
    
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        server: 'embedded-construction-server',
        timestamp: new Date().toISOString()
      });
    });
  }

  start() {
    this.app.listen(this.port, 'localhost', () => {
      console.log(`🌐 Embedded server running on http://localhost:${this.port}`);
      console.log('📊 Available endpoints:');
      console.log('   • GET /api/projects - Project management');
      console.log('   • GET /api/companies - Company data');
      console.log('   • GET /api/dashboard/stats - Business intelligence');
      console.log('   • GET /health - Server health check');
      console.log('\n✅ Complete offline construction management ready!');
    });
  }
}

// Demonstrate the embedded server
const server = new ConstructionEmbeddedServer();
server.start();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔄 Shutting down embedded server...');
  process.exit(0);
});