# Yemen Construction Management Platform - Database Schema
*Complete PostgreSQL Database Design with Drizzle ORM*

## Overview

This document describes the complete database schema for the Yemen Construction Management Platform, designed with PostgreSQL and implemented using Drizzle ORM with TypeScript safety.

**Database**: PostgreSQL 14+
**ORM**: Drizzle ORM with TypeScript
**Migrations**: Drizzle Kit automated migrations
**Connection**: Neon Database (serverless PostgreSQL)

---

## Core Schema Structure

### Companies Table
```sql
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    type VARCHAR(20) DEFAULT 'main', -- 'main', 'branch', 'subsidiary'
    parent_id INTEGER REFERENCES companies(id),
    location VARCHAR(255),
    location_ar VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    tax_id VARCHAR(100),
    license_number VARCHAR(100),
    established_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_companies_parent ON companies(parent_id);
CREATE INDEX idx_companies_type ON companies(type);
CREATE UNIQUE INDEX idx_companies_tax_id ON companies(tax_id) WHERE tax_id IS NOT NULL;
```

**TypeScript Interface:**
```typescript
export interface Company {
  id: number;
  name: string;
  nameAr: string;
  type: 'main' | 'branch' | 'subsidiary';
  parentId?: number;
  location?: string;
  locationAr?: string;
  phone?: string;
  email?: string;
  taxId?: string;
  licenseNumber?: string;
  establishedDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Users (Employees) Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL, -- 'ceo', 'manager', 'supervisor', 'employee', 'worker'
    department VARCHAR(100),
    department_ar VARCHAR(100),
    salary DECIMAL(12,2),
    hire_date DATE,
    termination_date DATE,
    manager_id INTEGER REFERENCES users(id),
    company_id INTEGER REFERENCES companies(id) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_users_manager ON users(manager_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_department ON users(department);
```

**TypeScript Interface:**
```typescript
export interface User {
  id: number;
  username: string;
  password: string;
  name: string;
  nameAr: string;
  email?: string;
  phone?: string;
  role: 'ceo' | 'manager' | 'supervisor' | 'employee' | 'worker';
  department?: string;
  departmentAr?: string;
  salary?: number;
  hireDate?: Date;
  terminationDate?: Date;
  managerId?: number;
  companyId: number;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Projects Table
```sql
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    description TEXT,
    description_ar TEXT,
    status VARCHAR(20) DEFAULT 'planning', -- 'planning', 'active', 'completed', 'cancelled', 'on_hold'
    priority VARCHAR(10) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    project_type VARCHAR(50), -- 'residential', 'commercial', 'infrastructure', 'industrial'
    complexity VARCHAR(20), -- 'simple', 'medium', 'complex', 'very_complex'
    location VARCHAR(255),
    location_ar VARCHAR(255),
    contract_value DECIMAL(15,2),
    contract_currency VARCHAR(3) DEFAULT 'YER',
    progress DECIMAL(5,2) DEFAULT 0.00, -- Percentage completion
    start_date DATE,
    end_date DATE,
    actual_end_date DATE,
    estimated_total_costs DECIMAL(15,2),
    costs_incurred_to_date DECIMAL(15,2) DEFAULT 0.00,
    manager_id INTEGER REFERENCES users(id),
    company_id INTEGER REFERENCES companies(id) NOT NULL,
    client_name VARCHAR(255),
    client_name_ar VARCHAR(255),
    client_contact VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_projects_company ON projects(company_id);
CREATE INDEX idx_projects_manager ON projects(manager_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_type ON projects(project_type);
CREATE INDEX idx_projects_dates ON projects(start_date, end_date);
```

**TypeScript Interface:**
```typescript
export interface Project {
  id: number;
  name: string;
  nameAr: string;
  description?: string;
  descriptionAr?: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'critical';
  projectType?: string;
  complexity?: 'simple' | 'medium' | 'complex' | 'very_complex';
  location?: string;
  locationAr?: string;
  contractValue?: number;
  contractCurrency: string;
  progress: number;
  startDate?: Date;
  endDate?: Date;
  actualEndDate?: Date;
  estimatedTotalCosts?: number;
  costsIncurredToDate: number;
  managerId?: number;
  companyId: number;
  clientName?: string;
  clientNameAr?: string;
  clientContact?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Transactions Table
```sql
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL, -- 'income', 'expense', 'transfer'
    category VARCHAR(100),
    category_ar VARCHAR(100),
    description TEXT,
    description_ar TEXT,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'YER',
    exchange_rate DECIMAL(10,6) DEFAULT 1.000000,
    amount_yer DECIMAL(15,2), -- Amount in YER for consistency
    project_id INTEGER REFERENCES projects(id),
    user_id INTEGER REFERENCES users(id),
    company_id INTEGER REFERENCES companies(id) NOT NULL,
    reference_number VARCHAR(100),
    transaction_date TIMESTAMP DEFAULT NOW(),
    payment_method VARCHAR(50), -- 'cash', 'bank_transfer', 'check', 'credit'
    bank_reference VARCHAR(100),
    approved_by INTEGER REFERENCES users(id),
    approval_date TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'cancelled'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_transactions_company ON transactions(company_id);
CREATE INDEX idx_transactions_project ON transactions(project_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_category ON transactions(category);
```

### Equipment Table
```sql
CREATE TABLE equipment (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    type_ar VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100) UNIQUE,
    manufacturer VARCHAR(100),
    status VARCHAR(20) DEFAULT 'available', -- 'available', 'in_use', 'maintenance', 'offline'
    location VARCHAR(255),
    location_ar VARCHAR(255),
    assigned_project_id INTEGER REFERENCES projects(id),
    assigned_user_id INTEGER REFERENCES users(id),
    purchase_date DATE,
    purchase_price DECIMAL(12,2),
    current_value DECIMAL(12,2),
    depreciation_rate DECIMAL(5,2),
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    maintenance_interval_days INTEGER DEFAULT 90,
    operating_hours DECIMAL(8,2) DEFAULT 0.00,
    fuel_consumption_rate DECIMAL(6,2), -- Liters per hour
    company_id INTEGER REFERENCES companies(id) NOT NULL,
    specifications JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_equipment_company ON equipment(company_id);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_project ON equipment(assigned_project_id);
CREATE INDEX idx_equipment_type ON equipment(type);
```

### Warehouses Table
```sql
CREATE TABLE warehouses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    location_ar VARCHAR(255),
    capacity DECIMAL(10,2),
    current_stock DECIMAL(10,2) DEFAULT 0.00,
    unit VARCHAR(50), -- 'm3', 'tons', 'items'
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'maintenance'
    manager_id INTEGER REFERENCES users(id),
    company_id INTEGER REFERENCES companies(id) NOT NULL,
    address TEXT,
    address_ar TEXT,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_warehouses_company ON warehouses(company_id);
CREATE INDEX idx_warehouses_manager ON warehouses(manager_id);
CREATE INDEX idx_warehouses_status ON warehouses(status);
```

---

## Yemen-Specific Extensions

### Progress Billings Table (المستخلصات)
```sql
CREATE TABLE progress_billings (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) NOT NULL,
    billing_number VARCHAR(50),
    billing_period VARCHAR(20), -- 'monthly', 'milestone', 'weekly'
    billing_date DATE NOT NULL,
    
    -- Physical Progress (الإنجاز الفعلي)
    physical_completion DECIMAL(5,2) NOT NULL, -- Percentage
    work_description TEXT,
    work_description_ar TEXT,
    
    -- Financial Calculations (الحسابات المالية)
    work_completed_value DECIMAL(15,2) NOT NULL, -- قيمة الأعمال المنجزة
    materials_advance DECIMAL(15,2) DEFAULT 0.00, -- سلفة المواد
    previous_billings DECIMAL(15,2) DEFAULT 0.00, -- المستخلصات السابقة
    retention_percentage DECIMAL(5,2) DEFAULT 5.00, -- نسبة الضمان
    retention_amount DECIMAL(15,2), -- مبلغ الضمان المحتجز
    gross_amount DECIMAL(15,2), -- المبلغ الإجمالي
    net_payable DECIMAL(15,2), -- صافي المستحق
    
    -- Approval Workflow
    approval_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'paid'
    submitted_by INTEGER REFERENCES users(id),
    submitted_date TIMESTAMP,
    reviewed_by INTEGER REFERENCES users(id),
    review_date TIMESTAMP,
    approved_by INTEGER REFERENCES users(id),
    approval_date TIMESTAMP,
    payment_date TIMESTAMP,
    
    -- Additional Information
    currency VARCHAR(3) DEFAULT 'YER',
    notes TEXT,
    notes_ar TEXT,
    supporting_documents JSONB, -- Array of document paths
    quality_approval BOOLEAN DEFAULT FALSE,
    engineer_certification BOOLEAN DEFAULT FALSE,
    client_acceptance BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_progress_billings_project ON progress_billings(project_id);
CREATE INDEX idx_progress_billings_status ON progress_billings(approval_status);
CREATE INDEX idx_progress_billings_date ON progress_billings(billing_date);
CREATE UNIQUE INDEX idx_progress_billings_number ON progress_billings(project_id, billing_number);
```

### Construction Materials Table (مواد البناء)
```sql
CREATE TABLE construction_materials (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    category VARCHAR(100), -- 'cement', 'steel', 'aggregates', 'blocks', 'tiles', 'electrical', 'plumbing'
    category_ar VARCHAR(100),
    subcategory VARCHAR(100),
    subcategory_ar VARCHAR(100),
    unit VARCHAR(50) NOT NULL, -- 'ton', 'm3', 'bag', 'piece', 'm2', 'm'
    unit_ar VARCHAR(50),
    
    -- Specifications
    grade VARCHAR(100), -- 'Grade 42.5', 'Grade 16mm', etc.
    specifications JSONB,
    quality_standard VARCHAR(100), -- 'ASTM', 'BS', 'Yemen Standard'
    
    -- Pricing Information
    current_price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'YER',
    price_date DATE,
    
    -- Supplier Information
    primary_supplier VARCHAR(255),
    primary_supplier_ar VARCHAR(255),
    supplier_contact VARCHAR(255),
    alternative_suppliers JSONB,
    
    -- Inventory Management
    minimum_stock DECIMAL(10,2),
    maximum_stock DECIMAL(10,2),
    reorder_point DECIMAL(10,2),
    lead_time_days INTEGER,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_hazardous BOOLEAN DEFAULT FALSE,
    storage_requirements TEXT,
    storage_requirements_ar TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_materials_category ON construction_materials(category);
CREATE INDEX idx_materials_name ON construction_materials(name);
CREATE INDEX idx_materials_active ON construction_materials(is_active);
```

### Yemen Market Rates Table (أسعار السوق اليمني)
```sql
CREATE TABLE yemen_market_rates (
    id SERIAL PRIMARY KEY,
    material_id INTEGER REFERENCES construction_materials(id) NOT NULL,
    governorate VARCHAR(100) NOT NULL, -- 'Sana'a', 'Aden', 'Taiz', 'Hodeidah', etc.
    governorate_ar VARCHAR(100) NOT NULL,
    price_per_unit DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'YER',
    price_date DATE NOT NULL,
    
    -- Price Source Information
    source VARCHAR(255), -- 'supplier_quote', 'market_survey', 'government_rate', 'contractor_report'
    source_ar VARCHAR(255),
    supplier_name VARCHAR(255),
    supplier_name_ar VARCHAR(255),
    reliability_score DECIMAL(3,2) DEFAULT 5.00, -- 1.00 to 10.00
    
    -- Market Conditions
    availability VARCHAR(20) DEFAULT 'available', -- 'available', 'limited', 'scarce', 'unavailable'
    market_trend VARCHAR(20), -- 'rising', 'stable', 'falling'
    seasonal_factor DECIMAL(4,2) DEFAULT 1.00,
    
    -- Additional Information
    notes TEXT,
    notes_ar TEXT,
    reported_by INTEGER REFERENCES users(id),
    verified_by INTEGER REFERENCES users(id),
    verification_date TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_market_rates_material ON yemen_market_rates(material_id);
CREATE INDEX idx_market_rates_governorate ON yemen_market_rates(governorate);
CREATE INDEX idx_market_rates_date ON yemen_market_rates(price_date);
CREATE INDEX idx_market_rates_currency ON yemen_market_rates(currency);
```

### Subcontractors Table (المقاولون من الباطن)
```sql
CREATE TABLE subcontractors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    trade_license VARCHAR(100) UNIQUE,
    tax_id VARCHAR(100),
    
    -- Contact Information
    contact_person VARCHAR(255),
    contact_person_ar VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    address_ar TEXT,
    governorate VARCHAR(100),
    governorate_ar VARCHAR(100),
    
    -- Specialization
    specialization TEXT[], -- ['concrete', 'electrical', 'plumbing', 'finishing']
    specialization_ar TEXT[],
    experience_years INTEGER,
    
    -- Performance Metrics
    performance_rating DECIMAL(3,2) DEFAULT 5.00, -- 1.00 to 10.00
    total_projects_completed INTEGER DEFAULT 0,
    on_time_completion_rate DECIMAL(5,2) DEFAULT 0.00, -- Percentage
    quality_rating DECIMAL(3,2) DEFAULT 5.00,
    safety_rating DECIMAL(3,2) DEFAULT 5.00,
    
    -- Financial Information
    payment_terms VARCHAR(100), -- 'Net 30', 'Net 15', 'COD'
    credit_limit DECIMAL(12,2),
    current_balance DECIMAL(12,2) DEFAULT 0.00,
    
    -- Certifications
    certifications JSONB,
    insurance_details JSONB,
    bond_capacity DECIMAL(12,2),
    
    -- Status
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'blacklisted', 'probation'
    blacklist_reason TEXT,
    blacklist_reason_ar TEXT,
    
    -- Additional Information
    bank_account VARCHAR(100),
    bank_name VARCHAR(255),
    bank_name_ar VARCHAR(255),
    notes TEXT,
    notes_ar TEXT,
    
    added_by INTEGER REFERENCES users(id),
    company_id INTEGER REFERENCES companies(id) NOT NULL,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_subcontractors_company ON subcontractors(company_id);
CREATE INDEX idx_subcontractors_status ON subcontractors(status);
CREATE INDEX idx_subcontractors_specialization ON subcontractors USING GIN(specialization);
CREATE INDEX idx_subcontractors_rating ON subcontractors(performance_rating);
```

### Safety Incidents Table (حوادث السلامة)
```sql
CREATE TABLE safety_incidents (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) NOT NULL,
    incident_number VARCHAR(50) UNIQUE,
    incident_date TIMESTAMP NOT NULL,
    
    -- Incident Classification
    incident_type VARCHAR(100) NOT NULL, -- 'minor_injury', 'major_injury', 'fatality', 'property_damage', 'near_miss'
    incident_type_ar VARCHAR(100),
    severity_level VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    
    -- Location and Description
    location_on_site VARCHAR(255),
    location_on_site_ar VARCHAR(255),
    description TEXT NOT NULL,
    description_ar TEXT,
    
    -- People Involved
    injured_person_name VARCHAR(255),
    injured_person_id INTEGER REFERENCES users(id),
    witness_names TEXT,
    witness_names_ar TEXT,
    
    -- Injury Details
    injury_type VARCHAR(100), -- 'cut', 'fracture', 'burn', 'fall', 'struck_by', 'caught_between'
    injury_type_ar VARCHAR(100),
    body_part_affected VARCHAR(100),
    body_part_affected_ar VARCHAR(100),
    medical_treatment_required BOOLEAN DEFAULT FALSE,
    hospital_name VARCHAR(255),
    hospital_name_ar VARCHAR(255),
    days_lost INTEGER DEFAULT 0,
    
    -- Investigation
    immediate_cause TEXT,
    immediate_cause_ar TEXT,
    root_cause TEXT,
    root_cause_ar TEXT,
    contributing_factors TEXT[],
    contributing_factors_ar TEXT[],
    
    -- Actions Taken
    immediate_action TEXT,
    immediate_action_ar TEXT,
    corrective_measures TEXT,
    corrective_measures_ar TEXT,
    preventive_measures TEXT,
    preventive_measures_ar TEXT,
    
    -- Workflow
    reported_by INTEGER REFERENCES users(id) NOT NULL,
    investigated_by INTEGER REFERENCES users(id),
    investigation_date TIMESTAMP,
    approved_by INTEGER REFERENCES users(id),
    approval_date TIMESTAMP,
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'investigating', 'closed', 'pending_approval'
    
    -- Compliance
    regulatory_notification_required BOOLEAN DEFAULT FALSE,
    notification_sent BOOLEAN DEFAULT FALSE,
    notification_date TIMESTAMP,
    regulatory_reference VARCHAR(100),
    
    -- Documentation
    photos JSONB, -- Array of photo paths
    documents JSONB, -- Array of document paths
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_safety_incidents_project ON safety_incidents(project_id);
CREATE INDEX idx_safety_incidents_date ON safety_incidents(incident_date);
CREATE INDEX idx_safety_incidents_type ON safety_incidents(incident_type);
CREATE INDEX idx_safety_incidents_severity ON safety_incidents(severity_level);
CREATE INDEX idx_safety_incidents_status ON safety_incidents(status);
```

---

## IFRS Compliance Tables

### IFRS Contracts Table
```sql
CREATE TABLE ifrs_contracts (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) NOT NULL,
    contract_number VARCHAR(100) UNIQUE,
    contract_date DATE NOT NULL,
    
    -- Contract Details
    contract_value DECIMAL(15,2) NOT NULL,
    contract_currency VARCHAR(3) DEFAULT 'YER',
    estimated_completion_date DATE,
    actual_completion_date DATE,
    
    -- IFRS 15 Revenue Recognition
    percentage_complete DECIMAL(5,2) DEFAULT 0.00,
    revenue_recognition_method VARCHAR(50) DEFAULT 'percentage_completion', -- 'percentage_completion', 'completed_contract'
    revenue_recognized DECIMAL(15,2) DEFAULT 0.00,
    billing_to_date DECIMAL(15,2) DEFAULT 0.00,
    costs_incurred_to_date DECIMAL(15,2) DEFAULT 0.00,
    estimated_total_costs DECIMAL(15,2),
    
    -- Performance Obligations
    performance_obligations JSONB,
    
    -- Contract Modifications
    original_contract_value DECIMAL(15,2),
    change_orders_value DECIMAL(15,2) DEFAULT 0.00,
    
    -- Status
    contract_status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'terminated', 'suspended'
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ifrs_contracts_project ON ifrs_contracts(project_id);
CREATE INDEX idx_ifrs_contracts_status ON ifrs_contracts(contract_status);
CREATE INDEX idx_ifrs_contracts_date ON ifrs_contracts(contract_date);
```

---

## System Tables

### Document Attachments Table
```sql
CREATE TABLE document_attachments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    
    -- Association
    entity_type VARCHAR(50) NOT NULL, -- 'project', 'transaction', 'equipment', 'incident', 'billing'
    entity_id INTEGER NOT NULL,
    
    -- Classification
    document_type VARCHAR(100), -- 'contract', 'invoice', 'receipt', 'report', 'photo', 'plan'
    document_type_ar VARCHAR(100),
    tags TEXT[],
    tags_ar TEXT[],
    
    -- Access Control
    is_public BOOLEAN DEFAULT FALSE,
    access_level VARCHAR(20) DEFAULT 'project', -- 'public', 'company', 'project', 'restricted'
    
    -- Metadata
    uploaded_by INTEGER REFERENCES users(id) NOT NULL,
    description TEXT,
    description_ar TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_documents_entity ON document_attachments(entity_type, entity_id);
CREATE INDEX idx_documents_type ON document_attachments(document_type);
CREATE INDEX idx_documents_uploader ON document_attachments(uploaded_by);
CREATE INDEX idx_documents_tags ON document_attachments USING GIN(tags);
```

### Audit Log Table
```sql
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER NOT NULL,
    action VARCHAR(20) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'
    user_id INTEGER REFERENCES users(id),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
```

---

## Views for Common Queries

### Project Financial Summary View
```sql
CREATE VIEW project_financial_summary AS
SELECT 
    p.id,
    p.name,
    p.name_ar,
    p.contract_value,
    p.contract_currency,
    p.progress,
    COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount_yer ELSE 0 END), 0) as total_income,
    COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount_yer ELSE 0 END), 0) as total_expenses,
    COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount_yer ELSE 0 END), 0) - 
    COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount_yer ELSE 0 END), 0) as net_profit,
    COUNT(pb.id) as total_billings,
    COALESCE(SUM(pb.net_payable), 0) as total_billed_amount
FROM projects p
LEFT JOIN transactions t ON p.id = t.project_id AND t.status = 'approved'
LEFT JOIN progress_billings pb ON p.id = pb.project_id AND pb.approval_status = 'approved'
GROUP BY p.id, p.name, p.name_ar, p.contract_value, p.contract_currency, p.progress;
```

### Equipment Utilization View
```sql
CREATE VIEW equipment_utilization AS
SELECT 
    e.id,
    e.name,
    e.name_ar,
    e.status,
    e.assigned_project_id,
    p.name as project_name,
    p.name_ar as project_name_ar,
    e.operating_hours,
    CASE 
        WHEN e.status = 'in_use' THEN 
            EXTRACT(DAYS FROM NOW() - (
                SELECT created_at FROM audit_logs 
                WHERE entity_type = 'equipment' AND entity_id = e.id 
                AND new_values->>'status' = 'in_use' 
                ORDER BY timestamp DESC LIMIT 1
            ))
        ELSE 0 
    END as days_in_current_status
FROM equipment e
LEFT JOIN projects p ON e.assigned_project_id = p.id;
```

---

## Migration Scripts

### Initial Migration (V1.0.0)
```sql
-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create schema in order (due to foreign key constraints)
-- 1. Companies
-- 2. Users
-- 3. Projects
-- 4. Transactions
-- 5. Equipment
-- 6. Warehouses
-- 7. Yemen-specific tables
-- 8. System tables

-- Add triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- ... (apply to all tables)
```

### Performance Optimization
```sql
-- Additional indexes for query optimization
CREATE INDEX CONCURRENTLY idx_transactions_project_date ON transactions(project_id, transaction_date);
CREATE INDEX CONCURRENTLY idx_progress_billings_project_status ON progress_billings(project_id, approval_status);
CREATE INDEX CONCURRENTLY idx_materials_category_active ON construction_materials(category, is_active);

-- Partial indexes for common queries
CREATE INDEX CONCURRENTLY idx_projects_active ON projects(company_id, status) WHERE status IN ('planning', 'active');
CREATE INDEX CONCURRENTLY idx_equipment_available ON equipment(company_id, type) WHERE status = 'available';
```

---

## Data Integrity Constraints

### Business Rules
```sql
-- Ensure project progress is between 0 and 100
ALTER TABLE projects ADD CONSTRAINT chk_progress_range CHECK (progress >= 0 AND progress <= 100);

-- Ensure positive monetary values
ALTER TABLE transactions ADD CONSTRAINT chk_positive_amount CHECK (amount > 0);
ALTER TABLE progress_billings ADD CONSTRAINT chk_positive_billing CHECK (work_completed_value >= 0);

-- Ensure valid email format
ALTER TABLE users ADD CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Ensure valid phone format for Yemen
ALTER TABLE users ADD CONSTRAINT chk_yemen_phone CHECK (phone ~* '^(\+967|00967|967)?[1-9][0-9]{7,8}$');
```

### Reference Data Integrity
```sql
-- Ensure equipment assignment consistency
ALTER TABLE equipment ADD CONSTRAINT chk_equipment_assignment 
CHECK (
    (status = 'in_use' AND assigned_project_id IS NOT NULL) OR
    (status != 'in_use' AND assigned_project_id IS NULL)
);

-- Ensure billing logical consistency
ALTER TABLE progress_billings ADD CONSTRAINT chk_billing_logic
CHECK (net_payable = work_completed_value - retention_amount - previous_billings + materials_advance);
```

---

This comprehensive database schema provides the foundation for a robust Yemen Construction Management Platform with full IFRS compliance, Arabic language support, and industry-specific functionality.