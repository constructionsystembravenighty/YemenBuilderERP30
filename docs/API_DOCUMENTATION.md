# Yemen Construction Management Platform - API Documentation
*Complete RESTful API Reference*

## Overview

This API documentation covers all endpoints for the Yemen Construction Management Platform, designed specifically for the construction industry with Arabic-first support, offline capabilities, and IFRS compliance.

**Base URL**: `https://your-domain.replit.app/api`
**Authentication**: JWT Bearer Token
**Content-Type**: `application/json`
**Supported Languages**: Arabic (ar), English (en)

---

## Authentication Endpoints

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "ahmed.ali",
  "password": "securePassword"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "ahmed.ali",
    "name": "Ahmed Ali",
    "nameAr": "أحمد علي",
    "role": "ceo",
    "companyId": 1
  }
}
```

### Refresh Token
```http
POST /api/auth/refresh
Authorization: Bearer <refreshToken>
```

---

## Company Management

### Get Companies
```http
GET /api/companies
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Yemen Construction Corp",
    "nameAr": "شركة اليمن للمقاولات",
    "type": "main",
    "location": "Sana'a",
    "locationAr": "صنعاء",
    "phone": "+967-1-234567",
    "email": "info@yemenconst.ye"
  }
]
```

### Create Company
```http
POST /api/companies
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Construction Company",
  "nameAr": "شركة المقاولات الجديدة",
  "type": "branch",
  "parentId": 1,
  "location": "Aden",
  "locationAr": "عدن",
  "phone": "+967-2-123456",
  "email": "aden@yemenconst.ye"
}
```

---

## Project Management

### Get Projects
```http
GET /api/projects
Authorization: Bearer <token>
Query Parameters:
  - status: planning|active|completed|cancelled|on_hold
  - priority: low|medium|high|critical
  - page: 1
  - limit: 20
```

**Response:**
```json
{
  "projects": [
    {
      "id": 1,
      "name": "Modern Residential Complex",
      "nameAr": "مجمع سكني حديث",
      "description": "50-unit residential complex in Sana'a",
      "descriptionAr": "مجمع سكني يضم 50 وحدة في صنعاء",
      "status": "active",
      "priority": "high",
      "contractValue": 2500000,
      "contractCurrency": "YER",
      "progress": 45,
      "startDate": "2024-01-15T00:00:00.000Z",
      "endDate": "2024-12-31T00:00:00.000Z",
      "location": "Sana'a",
      "locationAr": "صنعاء",
      "projectType": "residential",
      "complexity": "medium",
      "managerId": 2,
      "companyId": 1
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1
  }
}
```

### Create Project
```http
POST /api/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Office Building Project",
  "nameAr": "مشروع مبنى إداري",
  "description": "Modern office building with 10 floors",
  "descriptionAr": "مبنى إداري حديث من 10 طوابق",
  "location": "Taiz",
  "locationAr": "تعز",
  "projectType": "commercial",
  "complexity": "complex",
  "contractValue": 5000000,
  "contractCurrency": "USD",
  "startDate": "2024-03-01",
  "endDate": "2025-02-28",
  "managerId": 2,
  "companyId": 1
}
```

### Update Project Progress
```http
PATCH /api/projects/:id/progress
Authorization: Bearer <token>
Content-Type: application/json

{
  "progress": 65,
  "costsIncurredToDate": 1625000,
  "notes": "Foundation work completed",
  "notesAr": "اكتمال أعمال الأساسات"
}
```

---

## Financial Management

### Dashboard Statistics
```http
GET /api/dashboard/stats
Authorization: Bearer <token>
Query Parameters:
  - period: daily|weekly|monthly|yearly
  - currency: YER|USD|EUR
```

**Response:**
```json
{
  "totalRevenue": 4000000,
  "totalExpenses": 2500000,
  "netProfit": 1500000,
  "currency": "YER",
  "activeProjects": 8,
  "completedProjects": 12,
  "totalEmployees": 45,
  "equipmentInUse": 15,
  "monthlyTrends": [
    {
      "month": "2024-01",
      "revenue": 800000,
      "expenses": 500000,
      "profit": 300000
    }
  ]
}
```

### Get Transactions
```http
GET /api/transactions
Authorization: Bearer <token>
Query Parameters:
  - type: income|expense|transfer
  - projectId: number
  - startDate: YYYY-MM-DD
  - endDate: YYYY-MM-DD
  - category: string
  - page: 1
  - limit: 50
```

### Create Transaction
```http
POST /api/transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "expense",
  "category": "materials",
  "categoryAr": "مواد البناء",
  "description": "Cement and steel purchase",
  "descriptionAr": "شراء إسمنت وحديد",
  "amount": 150000,
  "currency": "YER",
  "projectId": 1,
  "transactionDate": "2024-01-20T10:30:00.000Z"
}
```

### Financial Trends Analysis
```http
GET /api/intelligence/financial-trends
Authorization: Bearer <token>
Query Parameters:
  - months: 6|12|24
  - projectId: number (optional)
```

**Response:**
```json
{
  "monthlyTrends": [
    {
      "month": "2024-01",
      "monthAr": "يناير 2024",
      "income": 800000,
      "expenses": 500000,
      "profit": 300000,
      "profitMargin": 37.5
    }
  ],
  "insights": [
    "الربحية تتحسن بمعدل 15% شهرياً",
    "تكاليف المواد ارتفعت بنسبة 8% هذا الشهر"
  ],
  "projections": {
    "nextMonthRevenue": 850000,
    "nextMonthExpenses": 520000,
    "yearEndProjection": 9600000
  }
}
```

---

## Progress Billing (المستخلصات)

### Create Progress Billing
```http
POST /api/progress-billings
Authorization: Bearer <token>
Content-Type: application/json

{
  "projectId": 1,
  "billingPeriod": "monthly",
  "physicalCompletion": 45.5,
  "workCompletedValue": 1137500,
  "materialsAdvance": 200000,
  "retentionPercentage": 5.0,
  "notes": "Foundation and first floor completed",
  "notesAr": "اكتمال الأساسات والطابق الأول"
}
```

### Get Progress Billings
```http
GET /api/progress-billings/project/:projectId
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "projectId": 1,
    "billingDate": "2024-01-31T00:00:00.000Z",
    "physicalCompletion": 45.5,
    "workCompletedValue": 1137500,
    "materialsAdvance": 200000,
    "retentionAmount": 56875,
    "netPayable": 1280625,
    "approvalStatus": "approved",
    "approvedBy": 1,
    "approvalDate": "2024-02-02T09:15:00.000Z"
  }
]
```

### Approve Progress Billing
```http
PUT /api/progress-billings/:id/approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "approvalStatus": "approved",
  "notes": "Approved after site inspection",
  "notesAr": "موافق عليه بعد معاينة الموقع"
}
```

---

## Employee Management

### Get Employees
```http
GET /api/users
Authorization: Bearer <token>
Query Parameters:
  - role: ceo|manager|supervisor|employee|worker
  - department: string
  - isActive: true|false
  - page: 1
  - limit: 50
```

**Response:**
```json
[
  {
    "id": 1,
    "username": "ahmed.ali",
    "name": "Ahmed Ali",
    "nameAr": "أحمد علي",
    "email": "ahmed@yemenconst.ye",
    "phone": "+967-777-123456",
    "role": "ceo",
    "department": "Management",
    "departmentAr": "الإدارة",
    "salary": 500000,
    "hireDate": "2020-01-01T00:00:00.000Z",
    "isActive": true,
    "managerId": null
  }
]
```

### Create Employee
```http
POST /api/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "fatima.ahmed",
  "password": "securePassword123",
  "name": "Fatima Ahmed",
  "nameAr": "فاطمة أحمد",
  "email": "fatima@yemenconst.ye",
  "phone": "+967-777-234567",
  "role": "manager",
  "department": "Projects",
  "departmentAr": "المشاريع",
  "salary": 300000,
  "hireDate": "2023-03-15",
  "managerId": 1,
  "companyId": 1
}
```

### Payroll Calculation (Yemen Labor Law)
```http
GET /api/payroll/calculate/:userId
Authorization: Bearer <token>
Query Parameters:
  - month: YYYY-MM
  - overtime: number (hours)
  - deductions: number
```

**Response:**
```json
{
  "employeeId": 1,
  "month": "2024-01",
  "baseSalary": 300000,
  "overtime": {
    "hours": 20,
    "rate": 1.5,
    "amount": 45000
  },
  "allowances": {
    "transportation": 25000,
    "meals": 15000
  },
  "deductions": {
    "socialInsurance": 25550,
    "incomeTax": 12000,
    "advances": 50000
  },
  "netSalary": 297450,
  "currency": "YER"
}
```

---

## Equipment Management

### Get Equipment
```http
GET /api/equipment
Authorization: Bearer <token>
Query Parameters:
  - status: available|in_use|maintenance|offline
  - type: string
  - assignedProjectId: number
  - page: 1
  - limit: 50
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Concrete Mixer CM-200",
    "nameAr": "خلاطة خرسانة CM-200",
    "type": "Construction Equipment",
    "typeAr": "معدات إنشائية",
    "model": "CM-200",
    "serialNumber": "CM200-2023-001",
    "status": "in_use",
    "location": "Site A",
    "locationAr": "موقع أ",
    "assignedProjectId": 1,
    "purchaseDate": "2023-01-15T00:00:00.000Z",
    "purchasePrice": 75000,
    "lastMaintenanceDate": "2024-01-10T00:00:00.000Z",
    "nextMaintenanceDate": "2024-04-10T00:00:00.000Z"
  }
]
```

### Schedule Maintenance
```http
POST /api/equipment/:id/maintenance
Authorization: Bearer <token>
Content-Type: application/json

{
  "maintenanceType": "preventive",
  "scheduledDate": "2024-02-15T09:00:00.000Z",
  "description": "Regular service and oil change",
  "descriptionAr": "صيانة دورية وتغيير زيت",
  "estimatedCost": 5000,
  "assignedTechnician": "Mohammad Hassan"
}
```

---

## Document Management

### Upload Document
```http
POST /api/documents/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <binary_data>
name: "Project Plans"
nameAr: "مخططات المشروع"
projectId: 1
tags: ["plans", "architecture", "approved"]
isPublic: false
```

**Response:**
```json
{
  "id": 1,
  "name": "Project Plans",
  "nameAr": "مخططات المشروع",
  "type": "pdf",
  "size": 2048576,
  "path": "/uploads/documents/project-plans-1234567890.pdf",
  "projectId": 1,
  "tags": ["plans", "architecture", "approved"],
  "isPublic": false,
  "uploadedBy": 1,
  "createdAt": "2024-01-20T10:30:00.000Z"
}
```

### Get Documents
```http
GET /api/documents
Authorization: Bearer <token>
Query Parameters:
  - projectId: number
  - type: pdf|doc|xls|img|other
  - tags: string (comma-separated)
  - isPublic: true|false
  - page: 1
  - limit: 20
```

---

## Warehouse Management

### Get Warehouses
```http
GET /api/warehouses
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Main Warehouse",
    "nameAr": "المخزن الرئيسي",
    "location": "Sana'a Industrial Area",
    "locationAr": "المنطقة الصناعية صنعاء",
    "capacity": 1000,
    "currentStock": 750,
    "status": "active",
    "managerId": 3
  }
]
```

### Inventory Management
```http
GET /api/inventory/warehouse/:warehouseId
Authorization: Bearer <token>
```

```http
POST /api/inventory/movement
Authorization: Bearer <token>
Content-Type: application/json

{
  "warehouseId": 1,
  "itemName": "Portland Cement",
  "itemNameAr": "إسمنت بورتلاند",
  "movementType": "in|out|transfer",
  "quantity": 100,
  "unit": "bag",
  "unitAr": "كيس",
  "projectId": 1,
  "notes": "Delivery from supplier",
  "notesAr": "توريد من المورد"
}
```

---

## Business Intelligence

### Cost Estimation
```http
POST /api/intelligence/cost-estimation
Authorization: Bearer <token>
Content-Type: application/json

{
  "projectType": "residential",
  "area": 500,
  "location": "Sana'a",
  "complexity": "medium",
  "specifications": ["concrete_structure", "tile_finishing", "electrical_full"]
}
```

**Response:**
```json
{
  "estimatedCost": 1250000,
  "breakdown": {
    "materials": 750000,
    "labor": 375000,
    "equipment": 75000,
    "overhead": 50000
  },
  "confidence": 85,
  "timeline": 180,
  "factors": [
    "Location: Sana'a (urban area)",
    "Medium complexity project",
    "Current Yemen market rates applied"
  ],
  "currency": "YER"
}
```

### Project Insights
```http
GET /api/intelligence/project-insights/:projectId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "riskLevel": "medium",
  "recommendations": [
    "Consider weather delays during rainy season",
    "Monitor cement prices - 8% increase expected",
    "Schedule equipment maintenance before peak usage"
  ],
  "costOptimization": [
    "Bulk purchase cement to save 5%",
    "Optimize transportation routes",
    "Consider local suppliers for aggregates"
  ],
  "timelineOptimization": [
    "Parallelize electrical and plumbing work",
    "Pre-order long-lead items",
    "Add buffer for permit approvals"
  ],
  "budgetStatus": "on_track",
  "scheduleStatus": "delayed"
}
```

---

## Reporting

### Generate IFRS Report
```http
GET /api/reports/ifrs/:projectId
Authorization: Bearer <token>
Query Parameters:
  - period: YYYY-MM
  - format: pdf|excel|json
```

### Export Data
```http
GET /api/export/:entityType
Authorization: Bearer <token>
Query Parameters:
  - format: csv|excel|pdf
  - startDate: YYYY-MM-DD
  - endDate: YYYY-MM-DD
  - filters: JSON string
```

---

## Real-time Sync

### Get Changes
```http
GET /api/sync/changes
Authorization: Bearer <token>
Query Parameters:
  - since: timestamp
  - entityTypes: projects,transactions,equipment
```

### Version Information
```http
GET /api/version
```

**Response:**
```json
{
  "major": 1,
  "minor": 2,
  "patch": 0,
  "build": "1751942656132",
  "timestamp": "2025-07-08T02:44:16.132Z",
  "features": [
    "PWA_OFFLINE_SUPPORT",
    "ARABIC_RTL_INTERFACE",
    "BUSINESS_INTELLIGENCE",
    "REAL_TIME_SYNC",
    "VERSION_TRACKING",
    "DATA_MIGRATION"
  ]
}
```

---

## Error Handling

All API endpoints return standardized error responses:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "messageAr": "بيانات إدخال غير صحيحة",
    "details": {
      "field": "amount",
      "issue": "Must be a positive number"
    }
  }
}
```

**Common Error Codes:**
- `UNAUTHORIZED` (401) - Invalid or missing authentication
- `FORBIDDEN` (403) - Insufficient permissions
- `NOT_FOUND` (404) - Resource not found
- `VALIDATION_ERROR` (400) - Invalid input data
- `CONFLICT` (409) - Resource conflict
- `INTERNAL_ERROR` (500) - Server error

---

## Rate Limiting

- **Authentication**: 5 requests per minute
- **General API**: 100 requests per minute per user
- **File Upload**: 10 requests per minute
- **Reports**: 20 requests per hour

---

## Webhooks (Future Implementation)

```http
POST /api/webhooks/register
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://your-system.com/webhook",
  "events": ["project.updated", "transaction.created"],
  "secret": "webhook_secret_key"
}
```

---

This API documentation provides comprehensive coverage of all endpoints with Arabic support, Yemen construction industry specifics, and IFRS compliance features.