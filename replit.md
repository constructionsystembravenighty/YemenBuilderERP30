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

## Changelog
```
Changelog:
- July 02, 2025. Initial setup
```

## User Preferences
```
Preferred communication style: Simple, everyday language.
```