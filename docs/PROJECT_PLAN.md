# Construction Management Platform - Comprehensive Development Plan

## 📋 Project Overview

### Mission Statement
Develop a comprehensive, enterprise-grade construction management platform specifically designed for Yemeni contractors, featuring Arabic-first design, IFRS compliance, and advanced project management capabilities.

### Core Objectives
- **Primary Goal**: Streamline construction project management for 200-500+ employee organizations
- **Target Market**: Yemeni construction companies, contractors, and project managers
- **Key Differentiators**: 
  - Complete Arabic RTL support with bilingual functionality
  - Yemen-specific business rules and market rates
  - IFRS-compliant financial management
  - Glassmorphic UI with construction industry aesthetics
  - Business intelligence engine with professional algorithms

### Current Status (July 2025)
- **Completion**: 85% core functionality implemented
- **Stage**: Production-ready MVP with advanced features
- **Architecture**: Full-stack TypeScript with PostgreSQL database
- **Deployment**: Ready for enterprise deployment on Replit

---

## 👥 User Personas

### 1. CEO/Company Owner (Ahmed Al-Yemeni)
**Demographics**: 45-55 years, Business Owner, Arabic native speaker
**Goals**: 
- Overview of all company operations and financial performance
- Strategic decision making with real-time data
- Multi-branch management and coordination
**Pain Points**: 
- Lack of centralized visibility across projects
- Manual financial reporting and consolidation
- Difficulty tracking ROI and profitability
**Technical Level**: Basic to intermediate
**Primary Features**: Executive dashboard, financial reports, company-wide analytics

### 2. Project Manager (Fatima Hassan)
**Demographics**: 30-40 years, Engineering background, Bilingual (Arabic/English)
**Goals**: 
- Efficient project planning and execution
- Real-time progress tracking and resource allocation
- Timeline management and milestone tracking
**Pain Points**: 
- Manual project tracking and reporting
- Coordination between multiple teams and suppliers
- Budget overruns and timeline delays
**Technical Level**: Intermediate to advanced
**Primary Features**: Gantt charts, project dashboards, resource management

### 3. Finance Manager (Mohammed Omar)
**Demographics**: 35-45 years, Accounting/Finance background, IFRS knowledge
**Goals**: 
- Accurate financial tracking and IFRS compliance
- Cash flow management and budget control
- Automated reporting and audit trails
**Pain Points**: 
- Manual bookkeeping and reconciliation
- Compliance with international standards
- Currency exchange management (YER/USD)
**Technical Level**: Intermediate
**Primary Features**: Financial dashboard, transaction management, IFRS reports

### 4. Site Supervisor (Ali Abdullah)
**Demographics**: 25-35 years, Field experience, Mobile-first user
**Goals**: 
- Quick access to project information on-site
- Progress updates and photo documentation
- Equipment and material tracking
**Pain Points**: 
- Paper-based reporting and communication delays
- Limited access to central information systems
- Manual inventory tracking
**Technical Level**: Basic
**Primary Features**: Mobile interface, quick actions, photo uploads

### 5. HR Manager (Sara Al-Zahra)
**Demographics**: 30-40 years, Human Resources background, Arabic primary
**Goals**: 
- Employee management and payroll processing
- Attendance tracking and performance monitoring
- Compliance with Yemen labor laws
**Pain Points**: 
- Manual attendance tracking
- Payroll calculation errors
- Employee record management
**Technical Level**: Basic to intermediate
**Primary Features**: Employee management, attendance tracking, payroll

---

## 🚀 Feature Specifications

### Core Modules Implementation Status

#### 1. Dashboard & Analytics (✅ Complete - 95%)
**Implemented Features:**
- Executive dashboard with KPI cards
- Real-time financial metrics (revenue, expenses, profit)
- Project status overview with progress indicators
- Arabic-first interface with glassmorphic design
- Enhanced dashboard charts with Recharts integration

**Remaining Tasks:**
- Advanced filtering and date range selection
- Customizable dashboard layouts
- Export functionality for reports

#### 2. Project Management (✅ Complete - 90%)
**Implemented Features:**
- Complete project lifecycle management
- Project creation with Arabic/English bilingual support
- Status tracking (planning, active, completed, on-hold)
- Budget management and progress monitoring
- Advanced Gantt chart component with dependencies
- Project-specific routing (/projects/active, /completed, /planning)

**Remaining Tasks:**
- Resource allocation and scheduling
- Document attachment to projects
- Project templates and cloning

#### 3. Financial Management (✅ Complete - 85%)
**Implemented Features:**
- Transaction management with YER/USD support
- Real-time exchange rate integration
- Income/Expense tracking with categories
- IFRS-ready transaction structure
- Financial trend analysis with Business Intelligence Engine

**Remaining Tasks:**
- Advanced IFRS reporting templates
- Budget vs actual variance analysis
- Invoice generation and management

#### 4. Employee Management (✅ Complete - 80%)
**Implemented Features:**
- Role-based user system (CEO, Manager, Supervisor, Employee, Worker)
- Employee profiles with Arabic/English names
- Department and company association
- Basic user management CRUD operations

**Remaining Tasks:**
- Attendance tracking system
- Payroll calculation and management
- Performance evaluation framework

#### 5. Warehouse & Inventory (✅ Complete - 70%)
**Implemented Features:**
- Warehouse creation and management
- Basic inventory structure
- Location tracking for warehouses

**Remaining Tasks:**
- Inventory tracking and stock management
- Purchase order system
- Supplier management

#### 6. Equipment Management (✅ Complete - 75%)
**Implemented Features:**
- Equipment registration and tracking
- Maintenance scheduling structure
- Equipment allocation to projects

**Remaining Tasks:**
- Maintenance history and scheduling
- Equipment utilization reports
- Cost tracking per equipment

#### 7. Document Management (✅ Complete - 70%)
**Implemented Features:**
- File upload functionality with Multer
- Document categorization and organization
- Project and company association

**Remaining Tasks:**
- Document versioning system
- Advanced search and filtering
- Digital signature integration

### Advanced Features

#### 8. Business Intelligence Engine (✅ Complete - 95%)
**Implemented Features:**
- Professional cost estimation algorithms using Yemen market rates
- Project risk assessment and recommendations
- Financial trend analysis with predictive insights
- Construction-specific business logic and factors

**Remaining Tasks:**
- Machine learning integration for improved predictions
- Industry benchmarking and comparison

#### 9. Navigation & User Experience (✅ Complete - 95%)
**Implemented Features:**
- Advanced navigation with hierarchical menus
- Smart breadcrumb system with automatic generation
- Context-aware quick actions
- Mobile-optimized floating action button
- Global search functionality
- Favorites and bookmark system

**Remaining Tasks:**
- Advanced search with filters
- User preference customization

#### 10. Mobile & Responsive Design (✅ Complete - 85%)
**Implemented Features:**
- Responsive glassmorphic design
- Mobile navigation with touch optimization
- Progressive Web App foundation
- RTL support throughout interface

**Remaining Tasks:**
- Offline functionality with service workers
- Push notifications
- Native mobile app development

---

## 🎨 Design Assets & Style Guide

### Design System Specifications

#### Color Palette
```css
/* Primary Colors */
--primary: #1B4332 (Deep Forest Green)
--secondary: #D4AF37 (Arabic Gold)
--accent: #40916C (Sage Green)
--background: #F8F9FA (Pearl White)

/* Status Colors */
--success: #22C55E
--warning: #F59E0B
--error: #EF4444
--info: #3B82F6

/* Glassmorphic Effects */
--glass-bg: rgba(255, 255, 255, 0.25)
--glass-border: rgba(255, 255, 255, 0.18)
--glass-backdrop: blur(10px)
```

#### Typography
- **Primary Font**: Noto Sans Arabic (Arabic text)
- **Secondary Font**: IBM Plex Sans Arabic (UI elements)
- **English Font**: Inter (English fallback)
- **Font Sizes**: 12px, 14px, 16px, 18px, 20px, 24px, 32px, 48px

#### Spacing System
- **Base Unit**: 4px
- **Scale**: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px
- **Grid System**: 12-column responsive grid with 24px gutters

#### Component Library
- **Glass Cards**: Translucent containers with backdrop blur
- **Arabic Forms**: RTL-optimized form components
- **Data Tables**: Enterprise-grade tables with Arabic support
- **Charts**: Recharts integration with Arabic labels
- **Navigation**: Multi-level menus with breadcrumbs

### Asset Requirements
- **Icons**: Lucide React icon library (800+ icons)
- **Images**: SVG-based illustrations for empty states
- **Logos**: Company logo variations (light/dark themes)
- **Patterns**: Subtle geometric patterns for backgrounds

---

## 📡 API Documentation

### Authentication & Authorization
```typescript
// Authentication endpoints
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me
POST /api/auth/refresh

// Authorization levels
enum UserRole {
  CEO = "ceo",
  MANAGER = "manager", 
  SUPERVISOR = "supervisor",
  EMPLOYEE = "employee",
  WORKER = "worker"
}
```

### Core API Endpoints

#### Companies Management
```typescript
GET /api/companies                    // List all companies
GET /api/companies/:id               // Get company details
POST /api/companies                  // Create new company
PUT /api/companies/:id              // Update company
DELETE /api/companies/:id           // Delete company
```

#### Projects Management
```typescript
GET /api/projects?companyId={id}     // List projects by company
GET /api/projects/:id               // Get project details
POST /api/projects                  // Create new project
PUT /api/projects/:id              // Update project
DELETE /api/projects/:id           // Delete project

// Project status filtering
GET /api/projects?status=active
GET /api/projects?status=completed
GET /api/projects?status=planning
```

#### Financial Management
```typescript
GET /api/transactions?companyId={id} // List transactions
POST /api/transactions              // Create transaction
PUT /api/transactions/:id          // Update transaction
DELETE /api/transactions/:id       // Delete transaction

GET /api/exchange-rates            // Current YER/USD rates
GET /api/dashboard/stats?companyId={id} // Dashboard statistics
```

#### Business Intelligence
```typescript
POST /api/intelligence/cost-estimation  // AI cost estimation
POST /api/intelligence/project-insights // Project analysis
GET /api/intelligence/financial-trends  // Financial analytics
```

#### User Management
```typescript
GET /api/users?companyId={id}       // List company users
GET /api/users/:id                 // Get user details
POST /api/users                    // Create new user
PUT /api/users/:id                // Update user
DELETE /api/users/:id             // Delete user
```

### API Response Formats
```typescript
// Success Response
{
  data: T,
  message?: string,
  meta?: {
    pagination?: {
      page: number,
      limit: number,
      total: number
    }
  }
}

// Error Response
{
  error: {
    code: string,
    message: string,
    details?: any
  }
}
```

### Rate Limiting & Security
- **Rate Limits**: 1000 requests/hour per API key
- **Authentication**: JWT tokens with 24-hour expiry
- **CORS**: Configured for specific domains
- **Validation**: Zod schema validation on all endpoints

---

## 🗄️ Database Schema

### Core Tables Structure

#### Companies Table
```sql
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'main', -- main, branch
  parent_id INTEGER REFERENCES companies(id),
  location TEXT,
  location_ar TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- hashed
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'employee',
  department TEXT,
  department_ar TEXT,
  company_id INTEGER NOT NULL REFERENCES companies(id),
  manager_id INTEGER REFERENCES users(id),
  salary DECIMAL(12,2),
  hire_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Projects Table
```sql
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description TEXT,
  description_ar TEXT,
  status TEXT NOT NULL DEFAULT 'planning',
  priority TEXT NOT NULL DEFAULT 'medium',
  budget DECIMAL(15,2) NOT NULL,
  company_id INTEGER NOT NULL REFERENCES companies(id),
  manager_id INTEGER REFERENCES users(id),
  location TEXT,
  location_ar TEXT,
  start_date DATE,
  end_date DATE,
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Transactions Table
```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL, -- income, expense, transfer
  category TEXT NOT NULL,
  category_ar TEXT NOT NULL,
  description TEXT,
  description_ar TEXT,
  amount DECIMAL(15,2) NOT NULL,
  currency TEXT DEFAULT 'YER',
  exchange_rate DECIMAL(10,4) DEFAULT 1.0000,
  company_id INTEGER NOT NULL REFERENCES companies(id),
  project_id INTEGER REFERENCES projects(id),
  created_by INTEGER NOT NULL REFERENCES users(id),
  transaction_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Indexing Strategy
```sql
-- Performance indexes
CREATE INDEX idx_projects_company_status ON projects(company_id, status);
CREATE INDEX idx_transactions_company_date ON transactions(company_id, transaction_date);
CREATE INDEX idx_users_company_role ON users(company_id, role);
CREATE INDEX idx_projects_date_range ON projects(start_date, end_date);
```

### Data Relationships
- **One-to-Many**: Company → Projects, Users, Transactions
- **Many-to-One**: Projects → Manager (User)
- **Many-to-Many**: Users ↔ Projects (through project assignments)
- **Hierarchical**: Companies (parent-child for branches)

---

## ⚙️ Environment Setup

### Development Environment

#### Prerequisites
- **Node.js**: v20.x LTS
- **PostgreSQL**: v16+
- **Git**: Latest version
- **VS Code**: Recommended IDE with extensions

#### Required VS Code Extensions
```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-json",
    "humao.rest-client",
    "ms-vscode.hexeditor"
  ]
}
```

#### Environment Variables
```bash
# Database Configuration
DATABASE_URL="postgresql://user:password@host:port/database"
PGHOST="localhost"
PGPORT="5432"
PGUSER="postgres"
PGPASSWORD="password"
PGDATABASE="construction_mgmt"

# Application Configuration
NODE_ENV="development"
PORT="5000"
SESSION_SECRET="your-session-secret-key"

# External Services
GOOGLE_API_KEY="your-google-api-key"
OPENAI_API_KEY="your-openai-api-key"

# File Upload Configuration
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE="10485760" # 10MB
```

#### Package Scripts
```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js",
    "check": "tsc",
    "db:push": "drizzle-kit push",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "test": "vitest",
    "lint": "eslint . --ext .ts,.tsx",
    "format": "prettier --write ."
  }
}
```

### Production Environment

#### Server Requirements
- **CPU**: 2+ cores, 2.4GHz+
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 50GB SSD minimum
- **Network**: 100Mbps+ connection

#### Docker Configuration
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

#### Deployment Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Backup procedures established
- [ ] Monitoring tools configured
- [ ] CDN configured for static assets

---

## 🧪 Testing Guidelines

### Testing Strategy

#### Unit Testing (Target: 80% Coverage)
```typescript
// Example: Business logic testing
describe('BusinessIntelligenceEngine', () => {
  test('should calculate project cost accurately', () => {
    const projectData = {
      type: 'residential',
      area: 1000,
      location: 'sanaa',
      complexity: 'medium'
    };
    
    const result = businessIntelligence.calculateProjectCost(projectData);
    
    expect(result.estimatedCost).toBeGreaterThan(0);
    expect(result.confidence).toBeGreaterThan(0.5);
    expect(result.breakdown).toHaveProperty('materials');
  });
});
```

#### Integration Testing
```typescript
// Example: API endpoint testing
describe('Projects API', () => {
  test('POST /api/projects should create project', async () => {
    const projectData = {
      name: 'Test Project',
      nameAr: 'مشروع تجريبي',
      budget: 100000,
      companyId: 1
    };
    
    const response = await request(app)
      .post('/api/projects')
      .send(projectData)
      .expect(201);
      
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(projectData.name);
  });
});
```

#### E2E Testing with Playwright
```typescript
// Example: User workflow testing
test('Project creation workflow', async ({ page }) => {
  await page.goto('/projects');
  await page.click('[data-testid="add-project-btn"]');
  await page.fill('[name="nameAr"]', 'مشروع جديد');
  await page.fill('[name="budget"]', '500000');
  await page.click('[data-testid="submit-btn"]');
  
  await expect(page.locator('.project-card')).toContainText('مشروع جديد');
});
```

### Testing Tools Configuration
```json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "playwright": "^1.40.0",
    "@testing-library/react": "^14.0.0",
    "supertest": "^6.3.0",
    "jest-environment-jsdom": "^29.7.0"
  }
}
```

### Testing Categories
1. **Unit Tests**: Individual functions and components
2. **Integration Tests**: API endpoints and database operations
3. **E2E Tests**: Complete user workflows
4. **Performance Tests**: Load testing with k6
5. **Accessibility Tests**: WCAG 2.1 compliance
6. **Security Tests**: Vulnerability scanning

---

## 🚀 Deployment Instructions

### Replit Deployment (Current Platform)

#### Automatic Deployment
1. **Code Push**: Changes automatically trigger rebuild
2. **Environment**: Variables configured in Replit secrets
3. **Database**: PostgreSQL provisioned automatically
4. **Domain**: Custom `.replit.app` domain provided

#### Manual Deployment Steps
```bash
# 1. Ensure environment variables are set
echo $DATABASE_URL

# 2. Run database migrations
npm run db:push

# 3. Build application
npm run build

# 4. Start production server
npm start
```

### Alternative Deployment Options

#### 1. Vercel Deployment
```json
{
  "builds": [
    { "src": "package.json", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/server/index.js" },
    { "src": "/(.*)", "dest": "/dist/public/$1" }
  ]
}
```

#### 2. Railway Deployment
```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"

[env]
NODE_ENV = "production"
```

#### 3. Docker Deployment
```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
    depends_on:
      - postgres
      
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: construction_mgmt
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Deployment Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Build process completed successfully
- [ ] Health checks passing
- [ ] SSL/TLS certificates configured
- [ ] CDN setup for static assets
- [ ] Monitoring and logging configured
- [ ] Backup procedures established

---

## 📋 Version Control Practices

### Git Workflow Strategy

#### Branch Strategy (GitFlow)
```
main (production)
├── develop (integration)
│   ├── feature/navigation-enhancement
│   ├── feature/financial-reports
│   └── feature/mobile-optimization
├── release/v1.2.0
└── hotfix/critical-bug-fix
```

#### Commit Message Convention
```
type(scope): subject

body

footer
```

**Types**: feat, fix, docs, style, refactor, test, chore
**Scopes**: ui, api, db, auth, navigation, financial, etc.

**Examples**:
```
feat(navigation): add hierarchical menu with search
fix(financial): resolve date formatting error in arabic-utils
docs(api): update endpoint documentation with examples
```

#### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{css,scss}": ["prettier --write"],
    "*.md": ["prettier --write"]
  }
}
```

### Release Management

#### Semantic Versioning
- **MAJOR**: Breaking changes (2.0.0)
- **MINOR**: New features, backward compatible (1.2.0)
- **PATCH**: Bug fixes, backward compatible (1.1.1)

#### Release Process
1. **Feature Development**: Create feature branch from develop
2. **Code Review**: Pull request with peer review
3. **Testing**: Automated and manual testing
4. **Release Branch**: Create release branch for final testing
5. **Deployment**: Merge to main and deploy
6. **Tagging**: Create git tag with version number

#### Change Log Format
```markdown
# Changelog

## [1.2.0] - 2025-07-07

### Added
- Advanced navigation system with hierarchical menus
- Smart breadcrumb generation with Arabic support
- Business Intelligence Engine with Yemen market rates

### Fixed
- Date formatting error in Financial component
- API data handling with proper null checks

### Changed
- Enhanced routing with dynamic parameters
- Improved mobile navigation with floating action button
```

---

## 🔒 Security Practices

### Authentication & Authorization

#### JWT Implementation
```typescript
// Token structure
interface JWTPayload {
  userId: number;
  role: UserRole;
  companyId: number;
  iat: number;
  exp: number;
}

// Token validation middleware
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.sendStatus(401);
  }
  
  jwt.verify(token, process.env.JWT_SECRET!, (err, payload) => {
    if (err) return res.sendStatus(403);
    req.user = payload as JWTPayload;
    next();
  });
};
```

#### Role-Based Access Control
```typescript
// Permission matrix
const permissions = {
  ceo: ['*'], // All permissions
  manager: ['projects:*', 'users:read', 'financial:read'],
  supervisor: ['projects:read', 'projects:update'],
  employee: ['projects:read'],
  worker: ['projects:read:own']
};

// Authorization middleware
export const authorize = (resource: string, action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user.role;
    const hasPermission = checkPermission(userRole, resource, action);
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};
```

### Data Security

#### Input Validation
```typescript
// Zod schema validation
const createProjectSchema = z.object({
  name: z.string().min(1).max(255),
  nameAr: z.string().min(1).max(255),
  budget: z.number().positive(),
  companyId: z.number().positive()
});

// SQL injection prevention
const getProjectsByCompany = async (companyId: number) => {
  return await db.select()
    .from(projects)
    .where(eq(projects.companyId, companyId)); // Parameterized query
};
```

#### Data Encryption
- **Passwords**: bcrypt with salt rounds 12
- **Sensitive Data**: AES-256-GCM encryption
- **Database**: TLS encryption in transit
- **File Storage**: Encrypted at rest

### Security Headers
```typescript
// Express security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true
  }
}));
```

### Security Checklist
- [ ] JWT tokens with proper expiration
- [ ] Password hashing with bcrypt
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] XSS protection with CSP headers
- [ ] Rate limiting implemented
- [ ] HTTPS enforced in production
- [ ] Security headers configured
- [ ] Regular dependency updates
- [ ] Vulnerability scanning

---

## 📊 Compliance Requirements

### IFRS Compliance

#### Financial Reporting Standards
```typescript
// IFRS-compliant transaction structure
interface IFRSTransaction {
  id: string;
  date: Date;
  description: string;
  account: string; // Chart of accounts
  debit: number;
  credit: number;
  reference: string;
  project?: string;
  period: string; // Accounting period
  approved: boolean;
  approvedBy?: string;
  notes?: string;
}

// Standard chart of accounts
const chartOfAccounts = {
  '1000': { name: 'Assets', nameAr: 'الأصول' },
  '1100': { name: 'Current Assets', nameAr: 'الأصول المتداولة' },
  '1110': { name: 'Cash', nameAr: 'النقدية' },
  '1120': { name: 'Accounts Receivable', nameAr: 'الذمم المدينة' },
  '2000': { name: 'Liabilities', nameAr: 'الخصوم' },
  '3000': { name: 'Equity', nameAr: 'حقوق الملكية' },
  '4000': { name: 'Revenue', nameAr: 'الإيرادات' },
  '5000': { name: 'Expenses', nameAr: 'المصروفات' }
};
```

#### Audit Trail Requirements
- **Immutable Records**: All financial transactions are append-only
- **User Tracking**: Every change logged with user ID and timestamp
- **Approval Workflow**: Multi-level approval for significant transactions
- **Data Retention**: 7-year retention policy for financial records

### Yemen Labor Law Compliance

#### Employee Management
```typescript
// Yemen-specific employee data requirements
interface YemenEmployee {
  nationalId: string; // Yemen National ID
  workPermit?: string; // For foreign workers
  contractType: 'permanent' | 'temporary' | 'contract';
  contractStartDate: Date;
  contractEndDate?: Date;
  socialSecurityNumber?: string;
  healthInsurance?: string;
  workingHours: number; // Max 48 hours/week
  overtimeRate: number; // Min 1.25x regular rate
  annualLeave: number; // Min 21 days
  sickLeave: number; // Min 14 days
}
```

#### Payroll Compliance
- **Minimum Wage**: Comply with Yemen minimum wage laws
- **Overtime**: Calculate overtime pay according to labor law
- **Social Security**: Deduct required social security contributions
- **Tax Withholding**: Calculate and withhold income tax

### Data Protection (GDPR-like Implementation)

#### Privacy Rights
```typescript
// Data subject rights implementation
interface DataSubjectRequest {
  type: 'access' | 'rectification' | 'erasure' | 'portability';
  subjectId: string;
  requestDate: Date;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  completionDate?: Date;
  notes?: string;
}

// Data processing logging
interface DataProcessingLog {
  userId: string;
  action: string;
  dataType: string;
  purpose: string;
  timestamp: Date;
  legal_basis: string;
}
```

### Compliance Checklist
- [ ] IFRS financial reporting standards implemented
- [ ] Yemen labor law requirements met
- [ ] Data protection policies established
- [ ] Audit trail functionality complete
- [ ] Regular compliance reviews scheduled
- [ ] Staff training on compliance requirements
- [ ] Documentation of compliance procedures

---

## 📚 Best Practices for Maintaining Knowledge Files

### Documentation Structure

#### 1. Architecture Decision Records (ADRs)
```markdown
# ADR-001: Business Intelligence Engine Implementation

## Status
Accepted

## Context
Need to replace AI services with deterministic business algorithms for cost estimation and project insights.

## Decision
Implement Business Intelligence Engine with Yemen-specific market rates and construction industry calculations.

## Consequences
- More accurate cost estimations based on real market data
- Faster response times (1ms vs 500ms for AI calls)
- Reduced dependency on external AI services
- Better compliance with local business practices
```

#### 2. API Documentation
```markdown
# API Endpoint Documentation

## POST /api/intelligence/cost-estimation

### Description
Calculates project cost estimation using professional construction algorithms.

### Request Body
```typescript
{
  projectType: 'residential' | 'commercial' | 'infrastructure' | 'industrial';
  area: number; // Square meters
  location: string; // City/region
  complexity: 'simple' | 'medium' | 'complex';
  specifications: string[]; // Additional requirements
}
```

### Response
```typescript
{
  estimatedCost: number; // YER
  breakdown: {
    materials: number;
    labor: number;
    equipment: number;
    overhead: number;
  };
  confidence: number; // 0-1
  factors: string[]; // Influencing factors
  timeline: number; // Estimated days
}
```
```

#### 3. Development Session Logs
```markdown
### Session: July 07, 2025 - Navigation System Implementation
**User Request**: Implement navigation and routes with final destinations
**Action Completed**: 
- ✅ Advanced navigation system with hierarchical menus
- ✅ Smart breadcrumbs with automatic generation
- ✅ Enhanced routing with dynamic parameters
- ✅ Created specific pages for project sub-routes
- ✅ Fixed critical date formatting errors
- ✅ Mobile navigation with floating action button

**Technical Details**:
- Navigation components: AdvancedNavigation, Breadcrumb, QuickActions
- Route handling: Dynamic parameters, prefetching, analytics
- Error fixes: arabic-utils.ts date parameter validation
- New pages: /projects/active, /projects/completed, /projects/planning

**Performance Impact**:
- Improved navigation UX with instant feedback
- Reduced API calls through intelligent prefetching
- Enhanced mobile experience with touch optimization
```

### Knowledge Management Guidelines

#### 1. Real-time Documentation Updates
- **Immediate**: Update during development sessions
- **Session End**: Comprehensive session summaries
- **Weekly**: Architecture and design reviews
- **Monthly**: Complete documentation audit

#### 2. Documentation Standards
```markdown
# Standard Template for Feature Documentation

## Overview
Brief description of the feature and its purpose.

## Implementation Details
### Frontend Components
- Component paths and descriptions
- Props and interfaces
- State management approach

### Backend Implementation
- API endpoints
- Database changes
- Business logic

### Integration Points
- How it connects with existing features
- Dependencies and relationships

## Testing
- Unit tests implemented
- Integration test coverage
- E2E test scenarios

## Performance Considerations
- Load time impact
- Memory usage
- Database query optimization

## Future Enhancements
- Planned improvements
- Scalability considerations
- Technical debt items
```

#### 3. Code Documentation
```typescript
/**
 * Business Intelligence Engine for Construction Management
 * 
 * Provides professional cost estimation, project insights, and financial analysis
 * using Yemen-specific market rates and construction industry standards.
 * 
 * @example
 * ```typescript
 * const estimate = businessIntelligence.calculateProjectCost({
 *   projectType: 'residential',
 *   area: 1000,
 *   location: 'sanaa',
 *   complexity: 'medium'
 * });
 * ```
 */
export class BusinessIntelligenceEngine {
  /**
   * Calculates comprehensive project cost estimation
   * 
   * @param params - Project parameters for cost calculation
   * @returns Detailed cost breakdown with confidence level
   */
  calculateProjectCost(params: ProjectCostParams): CostEstimate {
    // Implementation details...
  }
}
```

#### 4. Change Log Management
```markdown
# Change Log Categories

## Added
- New features and functionality
- New API endpoints
- New UI components

## Changed
- Modifications to existing features
- API changes (backward compatible)
- UI/UX improvements

## Fixed
- Bug fixes and error corrections
- Performance improvements
- Security patches

## Deprecated
- Features marked for removal
- API endpoints to be discontinued

## Removed
- Deleted features and code
- Discontinued API endpoints

## Security
- Security-related changes
- Vulnerability fixes
```

### Documentation Maintenance Schedule

#### Daily Tasks
- [ ] Update session logs with development progress
- [ ] Document any bug fixes or quick changes
- [ ] Update API documentation for new endpoints

#### Weekly Tasks
- [ ] Review and update architecture decisions
- [ ] Update user documentation and tutorials
- [ ] Review and consolidate session logs

#### Monthly Tasks
- [ ] Complete documentation audit
- [ ] Update deployment and setup guides
- [ ] Review and update security documentation
- [ ] Consolidate and archive old session logs

#### Quarterly Tasks
- [ ] Comprehensive project documentation review
- [ ] Update compliance and legal documentation
- [ ] Performance and scalability documentation update
- [ ] Knowledge transfer documentation for new team members

---

## 🎯 Project Roadmap & Next Steps

### Phase 1: Core Platform Optimization (Weeks 1-2)
1. **Performance Enhancement**
   - Database query optimization
   - Frontend bundle size reduction
   - Caching strategy implementation
   - Loading state improvements

2. **User Experience Polish**
   - Advanced search functionality
   - Keyboard shortcuts implementation
   - Accessibility improvements (WCAG 2.1)
   - Error handling enhancement

### Phase 2: Advanced Features (Weeks 3-6)
1. **Real-time Collaboration**
   - WebSocket integration
   - Live updates across users
   - Conflict resolution
   - Real-time notifications

2. **Advanced Reporting**
   - IFRS-compliant report templates
   - Custom report builder
   - Data export in multiple formats
   - Automated report scheduling

### Phase 3: Mobile & Integration (Weeks 7-10)
1. **Progressive Web App**
   - Offline functionality
   - Push notifications
   - Installation prompts
   - Background sync

2. **Third-party Integrations**
   - BIM software integration
   - CRM system connections
   - QuickBooks synchronization
   - External API development

### Phase 4: Enterprise Features (Weeks 11-16)
1. **Advanced Analytics**
   - Machine learning integration
   - Predictive analytics
   - Industry benchmarking
   - Custom dashboards

2. **Scalability & Security**
   - Multi-tenant architecture
   - Advanced security features
   - Audit logging enhancement
   - Compliance automation

This comprehensive development plan provides a roadmap for taking the construction management platform from its current state to a fully-featured, enterprise-ready solution that serves the unique needs of Yemeni construction companies while maintaining international standards for functionality, security, and compliance.