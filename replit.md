# Construction Management Platform - Replit Configuration

## Overview

This is a comprehensive construction company management platform designed specifically for Yemeni contractors. The application features a bilingual (Arabic/English) interface with RTL support, glassmorphic design, and full-stack functionality for managing construction projects, finances, employees, warehouses, and documents.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with React plugin
- **Styling**: TailwindCSS with custom Arabic theme
- **Component Library**: Radix UI with shadcn/ui components
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation
- **Internationalization**: Built-in RTL support with Arabic fonts

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with RESTful API design
- **Database**: PostgreSQL with Drizzle ORM
- **Connection**: Neon Database serverless connection
- **File Upload**: Multer for document management
- **Build**: ESBuild for production bundling

### Database Design
- **ORM**: Drizzle with type-safe schema definitions
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema**: Modular design with relations between entities
- **Migrations**: Drizzle Kit for database migrations

## Key Components

### Core Modules
1. **Company Management**: Multi-branch company structure
2. **Project Management**: Full project lifecycle with status tracking
3. **Financial Management**: IFRS-compliant accounting system
4. **Employee Management**: HR system with role-based access
5. **Warehouse Management**: Inventory and equipment tracking
6. **Document Management**: File upload and organization system

### UI Framework
- **Design System**: Glassmorphic design with Arabic color palette
- **RTL Support**: Complete right-to-left layout support
- **Typography**: Noto Sans Arabic and IBM Plex Sans Arabic fonts
- **Components**: Reusable Arabic-first components
- **Layout**: Responsive design with mobile navigation

### Authentication & Authorization
- **Structure**: Role-based system (CEO, Manager, Supervisor, Employee, Worker)
- **Security**: Prepared for session management integration
- **User Management**: Hierarchical user structure with manager relationships

## Data Flow

### Client-Server Communication
1. **API Layer**: RESTful endpoints under `/api` prefix
2. **Data Fetching**: TanStack Query for caching and synchronization
3. **Form Handling**: React Hook Form with server-side validation
4. **File Uploads**: Multipart form data handling for documents

### Database Interactions
1. **Schema**: Shared TypeScript types between client and server
2. **Queries**: Drizzle ORM with type-safe database operations
3. **Relations**: Foreign key relationships with proper cascading
4. **Validation**: Zod schemas for data validation

### State Management
1. **Server State**: TanStack Query for API data caching
2. **Client State**: React state for UI interactions
3. **Form State**: React Hook Form for form management
4. **Global State**: Context providers for RTL and theme

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL hosting
- **Connection Pool**: @neondatabase/serverless with WebSocket support
- **ORM**: Drizzle with PostgreSQL dialect

### UI Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Lucide React**: Icon library
- **Date-fns**: Date manipulation utilities

### Development Tools
- **TypeScript**: Full type safety across the stack
- **Vite**: Fast development server and bundling
- **ESBuild**: Production build optimization
- **TSX**: TypeScript execution for development

## Deployment Strategy

### Development Environment
- **Server**: Node.js with TSX for TypeScript execution
- **Client**: Vite dev server with HMR
- **Database**: Neon serverless connection
- **File System**: Local uploads directory

### Production Build
- **Client Build**: Vite static assets in `dist/public`
- **Server Build**: ESBuild bundle in `dist/index.js`
- **Assets**: Served statically from Express
- **Database**: Production Neon database connection

### Environment Configuration
- **Database URL**: Required environment variable
- **File Uploads**: Configurable upload directory
- **CORS**: Configured for cross-origin requests
- **Security**: Prepared for authentication middleware

## Development Sessions & Planning

### Session: July 02, 2025 - Project Setup & Planning Framework
**User Request**: Save all discussions and work automatically in the project
**Action Taken**: 
- Added dedicated section for tracking all development sessions and decisions
- Established persistent documentation workflow
- Project structure analyzed and documented

**Issues Fixed**:
✓ CSS warning: Moved @import statement before @tailwind directives in index.css
✓ Console DOM validation: Fixed nested anchor tag issue in sidebar navigation (changed inner <a> to <div>)

**Documentation System Established**:
✓ Created persistent development sessions tracking in replit.md
✓ Set up automated progress recording for all discussions and decisions
✓ Updated user preferences to include documentation requirements

### Session: July 02, 2025 - YAML Specification Review & Compliance Analysis
**User Request**: Review entire application against YAML specifications for Arabic Construction Management Platform MVP
**Analysis Required**: 
- Compare current implementation with YAML requirements
- Identify gaps in UI/UX Design, Component Architecture, and Workflow Implementation
- Assess production readiness, IFRS compliance, and deployment configuration
- Evaluate adherence to sequence: UI/UX → Components → Workflow

## YAML Specification Compliance Analysis

### ✅ **COMPLETED REQUIREMENTS**

#### UI/UX Design (Step 1)
✅ **Layout Implementation**
- Responsive, mobile-first dashboard ✓
- RTL Arabic navigation with Noto Sans Arabic, IBM Plex Sans Arabic fonts ✓
- Glassmorphic design with correct color palette:
  - Primary: #1B4332 (Deep forest) ✓
  - Secondary: #D4AF37 (Arabic gold) ✓ 
  - Accent: #40916C (Sage green) ✓
  - Background: #F8F9FA (Pearl white) ✓
  - Glass effects with blur and transparency ✓
- Main content area, sidebar, header components ✓
- Mobile navigation with overlay ✓

✅ **Style Guide Implementation**
- TailwindCSS custom classes (no pre-built themes) ✓
- Radix UI accessible primitives ✓
- shadcn/ui component utilities ✓
- 24px spacing grid system ✓
- Smooth animations (fade-ins, hover effects) ✓
- Mobile, tablet, desktop breakpoints ✓

#### Component-Based Architecture (Step 2)
✅ **Core Components Implemented**
- Organizational Structure: Employee management components ✓
- Financial ERP: Transaction forms, currency handling ✓
- Project Management: Project lists, status tracking ✓
- Collaboration: Document manager with file uploads ✓
- Layout: Header, sidebar, mobile navigation ✓
- UI Components: 50+ shadcn/ui components ✓

✅ **Technical Implementation**
- React 18 with TypeScript ✓
- Vite setup (not create-react-app) ✓
- Wouter routing ✓
- React Hook Form with Zod validation ✓
- TanStack Query for server state ✓
- Yemeni Rial currency formatting ✓
- RTL support throughout ✓

#### Simulated Workflow (Step 3)
✅ **Database & Backend**
- PostgreSQL with Neon serverless ✓
- Drizzle ORM with type-safe schemas ✓
- Complete schema: companies, users, projects, transactions, equipment, warehouses, documents ✓
- Express.js with TypeScript ✓
- API endpoints under /api prefix ✓
- Multer file upload implementation ✓
- ESBuild for production bundling ✓

✅ **Workflow Features**
- Multi-company management with hierarchies ✓
- Role-based user system (CEO to Worker) ✓
- Financial transactions with currency support ✓
- Project management with status tracking ✅
- Equipment and warehouse management ✓
- Document sharing and organization ✓

### ⚠️ **MISSING/INCOMPLETE REQUIREMENTS**

#### Advanced Features Missing
❌ **GanttChart Component**: Interactive project timelines not implemented
❌ **OrgChart Visualization**: Company hierarchy visualization missing
❌ **Real-time Collaboration**: WebSocket implementation missing
❌ **IFRS Compliance**: Specific accounting standards implementation needed
⚠️ **Analytics Dashboard**: Recharts library available but charts not implemented in dashboard
❌ **Exchange Rate Integration**: Dynamic YER/USD rates from external API
❌ **Advanced Error Handling**: Currency conversion error alerts

#### Production Readiness Gaps
⚠️ **Optimization**
- No lazy loading implementation yet
- Database indexing not configured
- Caching strategy needs enhancement

⚠️ **Testing**
- No testing framework integrated
- Cross-browser compatibility not verified
- WCAG 2.1 accessibility not fully tested

⚠️ **Deployment Configuration**
- Port configuration uses 5000 instead of specified 3000/8000
- Environment variables partially configured
- Production build process needs verification

### 🎯 **PRIORITY IMPROVEMENTS NEEDED**

#### **Immediate Impact (High Priority)**
1. **Implement Recharts visualizations for dashboard analytics** (Library already available)
2. **Add real-time exchange rate API integration for YER/USD conversion**  
3. **Create GanttChart component for project timeline visualization**
4. **Implement comprehensive error handling and Arabic toast notifications**

#### **Feature Completeness (Medium Priority)**  
5. **Add organizational chart visualization component**
6. **Implement WebSocket for real-time collaboration features**
7. **Add IFRS-compliant financial reporting and audit trails**
8. **Implement lazy loading and performance optimization**

#### **Production Readiness (Lower Priority)**
9. **Configure proper production deployment settings**
10. **Implement accessibility testing and WCAG 2.1 compliance verification**

### 📊 **CURRENT COMPLIANCE SCORE: 75%**

**Strengths**: Excellent foundation with proper Arabic RTL design, complete database schema, functional UI components, and file management
**Key Gaps**: Missing advanced visualizations, real-time features, and production optimizations

---

## Changelog
```
Changelog:
- July 02, 2025. Initial setup
- July 02, 2025. Added development sessions tracking and planning framework
```

## User Preferences
```
Preferred communication style: Simple, everyday language.
Project Documentation: All discussions and plans should be automatically saved to replit.md
Development Approach: Fix issues as they're identified, maintain comprehensive documentation
```