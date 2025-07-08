# Yemen Construction Management Platform - Testing Guidelines
*Comprehensive Testing Strategy for Production-Ready Deployment*

## Overview

This document outlines the complete testing strategy for the Yemen Construction Management Platform, covering unit tests, integration tests, end-to-end testing, performance testing, and Yemen-specific compliance testing.

**Testing Philosophy**: Quality-first approach with 90%+ code coverage, automated CI/CD testing, and Arabic language validation.

---

## Testing Architecture

### Test Structure
```
tests/
├── unit/                       # Component and function unit tests
│   ├── components/            # React component tests
│   ├── utils/                # Utility function tests
│   ├── business-logic/       # Business rule tests
│   ├── arabic-utils/         # Arabic-specific function tests
│   └── currency/             # Currency conversion tests
├── integration/               # API and database integration tests
│   ├── api-endpoints/        # RESTful API testing
│   ├── database/             # Database operation tests
│   ├── authentication/       # Auth workflow tests
│   ├── file-management/      # Document handling tests
│   └── real-time-sync/       # Sync engine tests
├── e2e/                      # End-to-end workflow tests
│   ├── project-lifecycle/    # Complete project management flow
│   ├── financial-workflow/   # IFRS compliance workflows
│   ├── user-scenarios/       # User persona-based scenarios
│   ├── mobile-testing/       # Mobile PWA testing
│   └── arabic-interface/     # RTL and Arabic text validation
├── performance/              # Load and performance tests
│   ├── api-load/            # API endpoint performance
│   ├── database-queries/    # Database optimization tests
│   ├── ui-responsiveness/   # Frontend performance tests
│   └── offline-sync/        # Offline capability testing
├── compliance/               # Yemen-specific compliance tests
│   ├── ifrs-calculations/   # Financial compliance tests
│   ├── labor-law/           # HR compliance tests
│   ├── safety-standards/    # Safety regulation tests
│   └── market-rates/        # Yemen market validation
└── fixtures/                # Test data and mock objects
    ├── yemen-companies/     # Sample company data
    ├── projects/           # Test project datasets
    ├── financial/          # Financial transaction samples
    └── arabic-content/     # Arabic text and UI samples
```

---

## Unit Testing Strategy

### Frontend Component Testing
**Framework**: Vitest + React Testing Library + jsdom

#### Component Test Example
```typescript
// tests/unit/components/ProjectCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockProject = {
  id: 1,
  name: 'Modern Residential Complex',
  nameAr: 'مجمع سكني حديث',
  status: 'active',
  progress: 45,
  contractValue: 2500000,
  contractCurrency: 'YER'
};

describe('ProjectCard Component', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  it('should display project information in Arabic correctly', () => {
    renderWithProvider(<ProjectCard project={mockProject} language="ar" />);
    
    expect(screen.getByText('مجمع سكني حديث')).toBeInTheDocument();
    expect(screen.getByText(/45%/)).toBeInTheDocument();
    expect(screen.getByText(/2,500,000/)).toBeInTheDocument();
    expect(screen.getByText(/ر.ي/)).toBeInTheDocument(); // YER currency symbol
  });

  it('should have proper RTL text direction for Arabic content', () => {
    renderWithProvider(<ProjectCard project={mockProject} language="ar" />);
    
    const arabicTitle = screen.getByText('مجمع سكني حديث');
    expect(arabicTitle.closest('[dir="rtl"]')).toBeInTheDocument();
  });

  it('should handle progress updates correctly', async () => {
    const mockOnProgressUpdate = vi.fn();
    renderWithProvider(
      <ProjectCard 
        project={mockProject} 
        onProgressUpdate={mockOnProgressUpdate}
        editable={true}
      />
    );
    
    const progressButton = screen.getByRole('button', { name: /update progress/i });
    fireEvent.click(progressButton);
    
    expect(mockOnProgressUpdate).toHaveBeenCalledWith(mockProject.id);
  });
});
```

#### Arabic Utility Testing
```typescript
// tests/unit/arabic-utils/formatters.test.ts
import { describe, it, expect } from 'vitest';
import { 
  formatArabicCurrency, 
  formatArabicDate, 
  convertToArabicNumerals,
  formatYemenRial 
} from '@/lib/arabic-utils';

describe('Arabic Formatting Utilities', () => {
  it('should format Yemeni Rial correctly', () => {
    expect(formatYemenRial(2500000)).toBe('٢,٥٠٠,٠٠٠ ر.ي');
    expect(formatYemenRial(1500.50)).toBe('١,٥٠٠.٥٠ ر.ي');
  });

  it('should convert English numerals to Arabic', () => {
    expect(convertToArabicNumerals('123456')).toBe('١٢٣٤٥٦');
    expect(convertToArabicNumerals('45%')).toBe('٤٥%');
  });

  it('should format dates in Arabic correctly', () => {
    const date = new Date('2024-01-15');
    expect(formatArabicDate(date)).toBe('١٥ يناير ٢٠٢٤');
    expect(formatArabicDate(date, 'short')).toBe('١٥/١/٢٤');
  });

  it('should handle Yemen-specific formatting', () => {
    expect(formatArabicCurrency(1000, 'YER')).toBe('١,٠٠٠ ريال يمني');
    expect(formatArabicCurrency(500, 'USD')).toBe('٥٠٠ دولار أمريكي');
  });
});
```

### Backend Business Logic Testing
```typescript
// tests/unit/business-logic/ifrs-calculations.test.ts
import { describe, it, expect } from 'vitest';
import { 
  calculatePercentageCompletion, 
  calculateRevenueRecognition,
  validateYemenLaborLaw
} from '@/server/business-intelligence';

describe('IFRS Revenue Recognition', () => {
  it('should calculate percentage completion correctly for Yemen projects', () => {
    const project = {
      contractValue: 2500000,
      estimatedTotalCosts: 2000000,
      costsIncurredToDate: 900000,
      currency: 'YER'
    };
    
    const result = calculatePercentageCompletion(project);
    
    expect(result.percentageComplete).toBe(45); // 900000 / 2000000 * 100
    expect(result.method).toBe('cost_to_cost');
    expect(result.revenueRecognition).toBe(1125000); // 2500000 * 0.45
  });

  it('should handle currency conversion for mixed currency projects', () => {
    const project = {
      contractValue: 5000, // USD
      estimatedTotalCosts: 2000000, // YER
      costsIncurredToDate: 900000, // YER
      currency: 'USD',
      exchangeRate: 500 // 1 USD = 500 YER
    };
    
    const result = calculatePercentageCompletion(project);
    
    expect(result.percentageComplete).toBe(45);
    expect(result.revenueRecognitionUSD).toBe(2250); // 5000 * 0.45
    expect(result.revenueRecognitionYER).toBe(1125000);
  });
});

describe('Yemen Labor Law Compliance', () => {
  it('should calculate overtime correctly according to Yemen standards', () => {
    const employee = {
      regularHours: 8,
      overtimeHours: 4,
      hourlyRate: 500, // YER
      workingDays: 22
    };
    
    const payroll = validateYemenLaborLaw(employee);
    
    expect(payroll.regularPay).toBe(88000); // 8 * 500 * 22
    expect(payroll.overtimeAmount).toBe(12000); // 4 * 500 * 1.5 * 4 (assuming 4 days)
    expect(payroll.socialInsurance).toBe(7000); // 7% of total
    expect(payroll.compliance.withinLegalLimits).toBe(true);
  });

  it('should flag violations of Yemen working hour limits', () => {
    const employee = {
      regularHours: 10, // Exceeds 8-hour limit
      overtimeHours: 6,
      hourlyRate: 500,
      workingDays: 22
    };
    
    const payroll = validateYemenLaborLaw(employee);
    
    expect(payroll.compliance.withinLegalLimits).toBe(false);
    expect(payroll.compliance.violations).toContain('EXCESS_REGULAR_HOURS');
  });
});
```

---

## Integration Testing

### API Endpoint Testing
**Framework**: Supertest + Jest/Vitest

```typescript
// tests/integration/api-endpoints/projects.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '@/server/index';
import { setupTestDatabase, cleanupTestDatabase } from '../helpers/database';

describe('Projects API Endpoints', () => {
  let authToken: string;
  let testCompanyId: number;

  beforeAll(async () => {
    await setupTestDatabase();
    
    // Login and get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'test.admin',
        password: 'testPassword123'
      });
    
    authToken = loginResponse.body.token;
    testCompanyId = loginResponse.body.user.companyId;
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  describe('POST /api/projects', () => {
    it('should create a new project with Arabic fields', async () => {
      const projectData = {
        name: 'Test Construction Project',
        nameAr: 'مشروع إنشائي تجريبي',
        projectType: 'residential',
        location: 'Sana\'a',
        locationAr: 'صنعاء',
        contractValue: 1000000,
        contractCurrency: 'YER'
      };

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(projectData)
        .expect(201);

      expect(response.body).toMatchObject({
        name: projectData.name,
        nameAr: projectData.nameAr,
        projectType: projectData.projectType,
        status: 'planning',
        progress: 0
      });

      expect(response.body.id).toBeDefined();
      expect(response.body.companyId).toBe(testCompanyId);
    });

    it('should validate required fields', async () => {
      const invalidProject = {
        nameAr: 'مشروع بدون اسم إنجليزي'
        // Missing required 'name' field
      };

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidProject)
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details.field).toBe('name');
    });

    it('should handle Arabic text encoding correctly', async () => {
      const arabicProject = {
        name: 'Arabic Text Project',
        nameAr: 'مشروع النص العربي مع أحرف خاصة: ؟ ، ؛ ء آ أ إ ة',
        description: 'Project with special Arabic characters',
        descriptionAr: 'مشروع يحتوي على أحرف عربية خاصة وعلامات ترقيم'
      };

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(arabicProject)
        .expect(201);

      expect(response.body.nameAr).toBe(arabicProject.nameAr);
      expect(response.body.descriptionAr).toBe(arabicProject.descriptionAr);
    });
  });

  describe('GET /api/projects', () => {
    it('should return projects with proper Arabic support', async () => {
      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.projects).toBeInstanceOf(Array);
      
      if (response.body.projects.length > 0) {
        const project = response.body.projects[0];
        expect(project).toHaveProperty('name');
        expect(project).toHaveProperty('nameAr');
        expect(project).toHaveProperty('status');
        expect(project).toHaveProperty('progress');
      }
    });

    it('should filter projects by status', async () => {
      const response = await request(app)
        .get('/api/projects?status=active')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      response.body.projects.forEach((project: any) => {
        expect(project.status).toBe('active');
      });
    });
  });
});
```

### Database Integration Testing
```typescript
// tests/integration/database/transactions.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '@/server/db';
import { transactions, projects, companies } from '@/shared/schema';
import { eq } from 'drizzle-orm';

describe('Transaction Database Operations', () => {
  let testCompanyId: number;
  let testProjectId: number;

  beforeEach(async () => {
    // Create test company
    const [company] = await db.insert(companies).values({
      name: 'Test Company',
      nameAr: 'شركة تجريبية',
      type: 'main'
    }).returning();
    testCompanyId = company.id;

    // Create test project
    const [project] = await db.insert(projects).values({
      name: 'Test Project',
      nameAr: 'مشروع تجريبي',
      companyId: testCompanyId,
      contractValue: 1000000,
      contractCurrency: 'YER'
    }).returning();
    testProjectId = project.id;
  });

  afterEach(async () => {
    // Cleanup test data
    await db.delete(transactions).where(eq(transactions.companyId, testCompanyId));
    await db.delete(projects).where(eq(projects.id, testProjectId));
    await db.delete(companies).where(eq(companies.id, testCompanyId));
  });

  it('should insert transaction with proper currency conversion', async () => {
    const transactionData = {
      type: 'expense' as const,
      category: 'materials',
      categoryAr: 'مواد البناء',
      description: 'Cement purchase',
      descriptionAr: 'شراء إسمنت',
      amount: 100,
      currency: 'USD',
      exchangeRate: 500, // 1 USD = 500 YER
      projectId: testProjectId,
      companyId: testCompanyId
    };

    const [transaction] = await db.insert(transactions).values({
      ...transactionData,
      amountYer: transactionData.amount * transactionData.exchangeRate
    }).returning();

    expect(transaction.amount).toBe(100);
    expect(transaction.currency).toBe('USD');
    expect(transaction.amountYer).toBe(50000);
    expect(transaction.categoryAr).toBe('مواد البناء');
  });

  it('should maintain referential integrity', async () => {
    // Try to insert transaction with invalid project ID
    await expect(
      db.insert(transactions).values({
        type: 'expense',
        amount: 1000,
        projectId: 99999, // Non-existent project
        companyId: testCompanyId
      })
    ).rejects.toThrow();
  });
});
```

---

## End-to-End Testing

### User Workflow Testing
**Framework**: Playwright with Arabic language support

```typescript
// tests/e2e/project-lifecycle/complete-workflow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Complete Project Lifecycle - Arabic Interface', () => {
  test.beforeEach(async ({ page }) => {
    // Set Arabic locale and RTL direction
    await page.goto('/');
    await page.locator('[data-testid="language-selector"]').click();
    await page.locator('[data-value="ar"]').click();
  });

  test('should complete full project workflow in Arabic', async ({ page }) => {
    // Login
    await page.locator('[data-testid="username"]').fill('ahmed.ali');
    await page.locator('[data-testid="password"]').fill('password123');
    await page.locator('[data-testid="login-button"]').click();

    // Wait for dashboard to load
    await expect(page.locator('h1:has-text("لوحة التحكم")')).toBeVisible();

    // Create new project
    await page.locator('[data-testid="new-project-button"]').click();
    await page.locator('[data-testid="project-name"]').fill('مشروع سكني جديد');
    await page.locator('[data-testid="project-location"]').fill('صنعاء');
    await page.locator('[data-testid="contract-value"]').fill('2500000');
    await page.locator('[data-testid="save-project"]').click();

    // Verify project creation
    await expect(page.locator('text=مشروع سكني جديد')).toBeVisible();

    // Add team members
    await page.locator('[data-testid="add-team-member"]').click();
    await page.locator('[data-testid="employee-search"]').fill('فاطمة أحمد');
    await page.locator('[data-testid="assign-employee"]').click();

    // Create first transaction
    await page.locator('[data-testid="add-transaction"]').click();
    await page.locator('[data-testid="transaction-type"]').selectOption('expense');
    await page.locator('[data-testid="transaction-category"]').selectOption('materials');
    await page.locator('[data-testid="transaction-amount"]').fill('150000');
    await page.locator('[data-testid="transaction-description"]').fill('شراء مواد البناء');
    await page.locator('[data-testid="save-transaction"]').click();

    // Update project progress
    await page.locator('[data-testid="update-progress"]').click();
    await page.locator('[data-testid="progress-percentage"]').fill('25');
    await page.locator('[data-testid="progress-notes"]').fill('اكتمال أعمال الحفر');
    await page.locator('[data-testid="save-progress"]').click();

    // Create progress billing
    await page.locator('[data-testid="create-billing"]').click();
    await page.locator('[data-testid="billing-completion"]').fill('25');
    await page.locator('[data-testid="work-value"]').fill('625000');
    await page.locator('[data-testid="submit-billing"]').click();

    // Verify Arabic text display and RTL layout
    await expect(page.locator('[dir="rtl"]')).toBeVisible();
    await expect(page.locator('text=ر.ي')).toBeVisible(); // YER currency symbol
    await expect(page.locator('text=٢٥%')).toBeVisible(); // Arabic numerals
  });

  test('should handle offline scenario gracefully', async ({ page, context }) => {
    // Set network to offline
    await context.setOffline(true);
    
    await page.goto('/');
    
    // Should show offline indicator
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
    await expect(page.locator('text=وضع عدم الاتصال')).toBeVisible();
    
    // Should still allow data entry
    await page.locator('[data-testid="add-transaction"]').click();
    await page.locator('[data-testid="transaction-amount"]').fill('50000');
    await page.locator('[data-testid="save-offline"]').click();
    
    // Should show pending sync indicator
    await expect(page.locator('[data-testid="pending-sync"]')).toBeVisible();
    
    // Restore network and verify sync
    await context.setOffline(false);
    await page.reload();
    
    // Should show sync success
    await expect(page.locator('[data-testid="sync-success"]')).toBeVisible();
  });
});
```

### Mobile PWA Testing
```typescript
// tests/e2e/mobile-testing/pwa-functionality.spec.ts
import { test, expect, devices } from '@playwright/test';

test.use({ ...devices['iPhone 13'] });

test.describe('Mobile PWA - Construction Site Usage', () => {
  test('should work offline for site supervisor workflow', async ({ page, context }) => {
    await page.goto('/');
    
    // Install PWA
    await page.locator('[data-testid="install-pwa"]').click();
    
    // Login as site supervisor
    await page.locator('[data-testid="username"]').fill('khalid.supervisor');
    await page.locator('[data-testid="password"]').fill('site123');
    await page.locator('[data-testid="login-button"]').click();
    
    // Switch to Arabic interface
    await page.locator('[data-testid="language-toggle"]').click();
    
    // Go offline (simulating remote site)
    await context.setOffline(true);
    
    // Should still function
    await expect(page.locator('text=مشرف الموقع')).toBeVisible();
    
    // Add equipment usage log
    await page.locator('[data-testid="equipment-log"]').click();
    await page.locator('[data-testid="equipment-select"]').selectOption('concrete-mixer');
    await page.locator('[data-testid="hours-used"]').fill('8');
    await page.locator('[data-testid="save-offline"]').click();
    
    // Add safety inspection
    await page.locator('[data-testid="safety-inspection"]').click();
    await page.locator('[data-testid="inspection-notes"]').fill('تم فحص معدات السلامة');
    await page.locator('[data-testid="save-inspection"]').click();
    
    // Verify offline storage
    const offlineData = await page.evaluate(() => {
      return localStorage.getItem('offline-construction-data');
    });
    expect(offlineData).toBeTruthy();
    
    // Come back online
    await context.setOffline(false);
    await page.locator('[data-testid="sync-button"]').click();
    
    // Verify sync completion
    await expect(page.locator('[data-testid="sync-complete"]')).toBeVisible();
  });
});
```

---

## Performance Testing

### Load Testing
**Framework**: Artillery.js for API load testing

```yaml
# tests/performance/api-load/project-api-load.yml
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Normal load"
    - duration: 60
      arrivalRate: 100
      name: "High load"
  payload:
    path: './test-data/auth-tokens.csv'
    fields:
      - token

scenarios:
  - name: "Project management workflow"
    weight: 100
    flow:
      - get:
          url: "/api/projects"
          headers:
            Authorization: "Bearer {{ token }}"
          expect:
            - statusCode: 200
            - contentType: json
            - hasProperty: projects
      
      - post:
          url: "/api/projects"
          headers:
            Authorization: "Bearer {{ token }}"
            Content-Type: "application/json"
          json:
            name: "Load Test Project {{ $timestamp }}"
            nameAr: "مشروع اختبار الحمولة {{ $timestamp }}"
            projectType: "residential"
            contractValue: 1000000
          expect:
            - statusCode: 201
      
      - get:
          url: "/api/dashboard/stats"
          headers:
            Authorization: "Bearer {{ token }}"
          expect:
            - statusCode: 200
            - property: totalRevenue
            - property: totalExpenses
```

### Database Performance Testing
```typescript
// tests/performance/database-queries/query-optimization.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { db } from '@/server/db';
import { performance } from 'perf_hooks';

describe('Database Query Performance', () => {
  beforeAll(async () => {
    // Seed large dataset for performance testing
    await seedLargeDataset();
  });

  it('should load project dashboard in under 200ms', async () => {
    const start = performance.now();
    
    const result = await db.query.projects.findMany({
      with: {
        transactions: true,
        progressBillings: true,
        equipment: true
      },
      where: (projects, { eq }) => eq(projects.companyId, 1),
      limit: 20
    });
    
    const end = performance.now();
    const duration = end - start;
    
    expect(duration).toBeLessThan(200);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should handle financial aggregations efficiently', async () => {
    const start = performance.now();
    
    const financialSummary = await db.execute(sql`
      SELECT 
        p.id,
        p.name,
        p.name_ar,
        SUM(CASE WHEN t.type = 'income' THEN t.amount_yer ELSE 0 END) as total_income,
        SUM(CASE WHEN t.type = 'expense' THEN t.amount_yer ELSE 0 END) as total_expenses
      FROM projects p
      LEFT JOIN transactions t ON p.id = t.project_id
      WHERE p.company_id = 1
      GROUP BY p.id, p.name, p.name_ar
      LIMIT 50
    `);
    
    const end = performance.now();
    const duration = end - start;
    
    expect(duration).toBeLessThan(100);
    expect(financialSummary.rows.length).toBeGreaterThan(0);
  });
});
```

---

## Yemen-Specific Compliance Testing

### IFRS Compliance Testing
```typescript
// tests/compliance/ifrs-calculations/revenue-recognition.test.ts
import { describe, it, expect } from 'vitest';
import { ifrsEngine } from '@/server/ifrs-engine';

describe('IFRS 15 Revenue Recognition Compliance', () => {
  it('should comply with percentage completion method requirements', () => {
    const project = {
      contractValue: 2500000,
      estimatedTotalCosts: 2000000,
      costsIncurredToDate: 900000,
      billingToDate: 800000,
      currency: 'YER'
    };
    
    const result = ifrsEngine.calculateRevenueRecognition(project);
    
    // IFRS 15 compliance checks
    expect(result.percentageComplete).toBe(45); // 900000 / 2000000
    expect(result.revenueRecognized).toBe(1125000); // 2500000 * 0.45
    expect(result.grossAmount).toBe(result.revenueRecognized);
    
    // Progress billing compliance
    expect(result.unbilledRevenue).toBe(325000); // 1125000 - 800000
    expect(result.method).toBe('cost_to_cost');
    
    // Documentation requirements
    expect(result.supportingCalculations).toBeDefined();
    expect(result.auditTrail).toBeDefined();
  });

  it('should handle loss recognition according to IFRS standards', () => {
    const lossProject = {
      contractValue: 1000000,
      estimatedTotalCosts: 1500000, // Cost overrun
      costsIncurredToDate: 600000,
      currency: 'YER'
    };
    
    const result = ifrsEngine.calculateLossRecognition(lossProject);
    
    expect(result.anticipatedLoss).toBe(500000); // 1500000 - 1000000
    expect(result.lossRecognitionRequired).toBe(true);
    expect(result.immediateRecognition).toBe(500000);
  });
});
```

### Yemen Labor Law Testing
```typescript
// tests/compliance/labor-law/payroll-calculations.test.ts
import { describe, it, expect } from 'vitest';
import { calculateYemenPayroll } from '@/server/business-intelligence';

describe('Yemen Labor Law Compliance', () => {
  it('should calculate payroll according to Yemen labor regulations', () => {
    const employee = {
      baseSalary: 200000, // YER monthly
      overtimeHours: 10,
      workingDays: 22,
      dependents: 2
    };
    
    const payroll = calculateYemenPayroll(employee);
    
    // Basic salary compliance
    expect(payroll.baseSalary).toBe(200000);
    expect(payroll.dailyRate).toBe(9090.91); // 200000 / 22
    
    // Overtime calculations (150% rate)
    expect(payroll.overtimeRate).toBe(1.5);
    expect(payroll.overtimeAmount).toBeCloseTo(6818); // (200000/22/8) * 1.5 * 10
    
    // Social insurance (7% employee + 9% employer)
    expect(payroll.socialInsuranceEmployee).toBeCloseTo(14477); // 7% of gross
    expect(payroll.socialInsuranceEmployer).toBeCloseTo(18612); // 9% of gross
    
    // Income tax (progressive rates)
    expect(payroll.incomeTax).toBeGreaterThan(0);
    
    // Legal compliance checks
    expect(payroll.compliance.withinLegalLimits).toBe(true);
    expect(payroll.compliance.overtimeWithinLimits).toBe(true);
  });

  it('should flag violations of working hour limits', () => {
    const violatingEmployee = {
      baseSalary: 300000,
      overtimeHours: 30, // Exceeds legal limits
      workingDays: 26, // Exceeds 6 days per week
      regularHours: 10 // Exceeds 8 hours per day
    };
    
    const payroll = calculateYemenPayroll(violatingEmployee);
    
    expect(payroll.compliance.withinLegalLimits).toBe(false);
    expect(payroll.compliance.violations).toContain('EXCESS_OVERTIME_HOURS');
    expect(payroll.compliance.violations).toContain('EXCESS_WORKING_DAYS');
    expect(payroll.compliance.violations).toContain('EXCESS_DAILY_HOURS');
  });
});
```

---

## Continuous Integration Setup

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Yemen Construction Platform Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: testpassword
          POSTGRES_DB: yemen_construction_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Setup test database
      run: npm run db:push:test
      env:
        DATABASE_URL: postgresql://postgres:testpassword@localhost:5432/yemen_construction_test
    
    - name: Run unit tests
      run: npm run test:unit
    
    - name: Run integration tests
      run: npm run test:integration
      env:
        DATABASE_URL: postgresql://postgres:testpassword@localhost:5432/yemen_construction_test
    
    - name: Run E2E tests
      run: npm run test:e2e
    
    - name: Run compliance tests
      run: npm run test:compliance
    
    - name: Generate coverage report
      run: npm run test:coverage
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        fail_ci_if_error: true

  performance:
    runs-on: ubuntu-latest
    needs: test
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Start application
      run: npm run dev &
      
    - name: Wait for application to be ready
      run: sleep 30
    
    - name: Run performance tests
      run: npm run test:performance
    
    - name: Run load tests
      run: npm run test:load
```

---

## Test Coverage Requirements

### Coverage Targets
- **Overall Coverage**: 90%+
- **Business Logic**: 95%+
- **API Endpoints**: 90%+
- **UI Components**: 85%+
- **Arabic Utilities**: 100%
- **IFRS Calculations**: 100%
- **Yemen Compliance**: 100%

### Coverage Configuration
```javascript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        'coverage/**'
      ],
      thresholds: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        },
        'src/lib/arabic-utils.ts': {
          branches: 100,
          functions: 100,
          lines: 100,
          statements: 100
        },
        'server/business-intelligence.ts': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95
        }
      }
    }
  }
});
```

---

This comprehensive testing strategy ensures the Yemen Construction Management Platform meets the highest quality standards while maintaining cultural authenticity, regulatory compliance, and performance excellence.