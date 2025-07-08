/**
 * Database Seed Script for Construction Management Platform
 * Creates comprehensive sample data for Yemen construction companies
 */
import { db } from './db';
import { companies, users, projects, transactions, equipment, warehouses } from '@shared/schema';
import bcrypt from 'bcrypt';

export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Check if data already exists
    const existingCompanies = await db.select().from(companies).limit(1);
    if (existingCompanies.length > 0) {
      console.log('✅ Database already seeded, skipping...');
      return;
    }

    // Seed Companies
    const [company] = await db.insert(companies).values({
      name: 'Yemen Construction Corp',
      nameAr: 'شركة اليمن للإنشاءات',
      type: 'main',
      location: 'Sanaa, Yemen',
      locationAr: 'صنعاء، اليمن',
      phone: '+967-1-234567',
      email: 'info@yemenconstruction.com'
    }).returning();

    console.log('✅ Company created:', company.name);

    // Seed Users
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const userData = [
      {
        username: 'ahmed.ali',
        password: hashedPassword,
        name: 'Ahmed Ali Al-Yemen',
        nameAr: 'أحمد علي اليمني',
        email: 'ahmed@yemenconstruction.com',
        phone: '+967-77-1234567',
        role: 'ceo',
        department: 'Management',
        departmentAr: 'الإدارة',
        companyId: company.id,
        salary: 1000000,
        hireDate: new Date('2020-01-01')
      },
      {
        username: 'fatima.hassan',
        password: hashedPassword,
        name: 'Fatima Hassan',
        nameAr: 'فاطمة حسن',
        email: 'fatima@yemenconstruction.com',
        phone: '+967-77-2345678',
        role: 'manager',
        department: 'Project Management',
        departmentAr: 'إدارة المشاريع',
        companyId: company.id,
        managerId: 1,
        salary: 600000,
        hireDate: new Date('2021-03-15')
      },
      {
        username: 'mohammed.omar',
        password: hashedPassword,
        name: 'Mohammed Omar',
        nameAr: 'محمد عمر',
        email: 'mohammed@yemenconstruction.com',
        phone: '+967-77-3456789',
        role: 'supervisor',
        department: 'Engineering',
        departmentAr: 'الهندسة',
        companyId: company.id,
        managerId: 2,
        salary: 400000,
        hireDate: new Date('2022-01-10')
      }
    ];

    const createdUsers = await db.insert(users).values(userData).returning();
    console.log('✅ Users created:', createdUsers.length);

    // Seed Projects
    const projectData = [
      {
        name: 'Modern Residential Complex',
        nameAr: 'مجمع الإسكان الحديث',
        description: 'A modern residential complex with 50 apartments in Sanaa',
        descriptionAr: 'مجمع سكني حديث يحتوي على 50 شقة في صنعاء',
        status: 'active',
        priority: 'high',
        budget: 5000000,
        spent: 1250000,
        progress: 25,
        companyId: company.id,
        managerId: createdUsers[1].id,
        location: 'Sanaa, Yemen',
        locationAr: 'صنعاء، اليمن',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31')
      },
      {
        name: 'Commercial Shopping Center',
        nameAr: 'مركز التسوق التجاري',
        description: 'Large commercial shopping center with retail spaces',
        descriptionAr: 'مركز تسوق تجاري كبير مع مساحات تجارية',
        status: 'planning',
        priority: 'medium',
        budget: 8000000,
        spent: 800000,
        progress: 10,
        companyId: company.id,
        managerId: createdUsers[1].id,
        location: 'Aden, Yemen',
        locationAr: 'عدن، اليمن',
        startDate: new Date('2025-03-01'),
        endDate: new Date('2026-02-28')
      },
      {
        name: 'Infrastructure Road Project',
        nameAr: 'مشروع الطرق التحتية',
        description: 'Highway construction connecting major cities',
        descriptionAr: 'إنشاء طريق سريع يربط بين المدن الرئيسية',
        status: 'completed',
        priority: 'high',
        budget: 12000000,
        spent: 11500000,
        progress: 100,
        companyId: company.id,
        managerId: createdUsers[1].id,
        location: 'Taiz-Sanaa Highway',
        locationAr: 'طريق تعز-صنعاء السريع',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-15')
      }
    ];

    const createdProjects = await db.insert(projects).values(projectData).returning();
    console.log('✅ Projects created:', createdProjects.length);

    // Seed Transactions
    const transactionData = [
      {
        type: 'income',
        category: 'project_payment',
        categoryAr: 'دفعة مشروع',
        description: 'Initial payment for residential complex',
        descriptionAr: 'دفعة أولى للمجمع السكني',
        amount: 2500000,
        currency: 'YER',
        exchangeRate: 1.0,
        companyId: company.id,
        projectId: createdProjects[0].id,
        createdBy: createdUsers[0].id,
        transactionDate: new Date('2025-01-05')
      },
      {
        type: 'expense',
        category: 'materials',
        categoryAr: 'مواد البناء',
        description: 'Cement and steel purchase',
        descriptionAr: 'شراء أسمنت وحديد',
        amount: 500000,
        currency: 'YER',
        exchangeRate: 1.0,
        companyId: company.id,
        projectId: createdProjects[0].id,
        createdBy: createdUsers[1].id,
        transactionDate: new Date('2025-01-03')
      },
      {
        type: 'expense',
        category: 'equipment',
        categoryAr: 'معدات',
        description: 'Equipment rental for construction',
        descriptionAr: 'استئجار معدات البناء',
        amount: 300000,
        currency: 'YER',
        exchangeRate: 1.0,
        companyId: company.id,
        projectId: createdProjects[0].id,
        createdBy: createdUsers[1].id,
        transactionDate: new Date('2025-01-10')
      },
      {
        type: 'income',
        category: 'project_payment',
        categoryAr: 'دفعة مشروع',
        description: 'Second payment for residential complex',
        descriptionAr: 'الدفعة الثانية للمجمع السكني',
        amount: 1500000,
        currency: 'YER',
        exchangeRate: 1.0,
        companyId: company.id,
        projectId: createdProjects[0].id,
        createdBy: createdUsers[0].id,
        transactionDate: new Date('2025-01-15')
      },
      {
        type: 'expense',
        category: 'labor',
        categoryAr: 'عمالة',
        description: 'Workers salaries for January',
        descriptionAr: 'رواتب العمال لشهر يناير',
        amount: 450000,
        currency: 'YER',
        exchangeRate: 1.0,
        companyId: company.id,
        projectId: createdProjects[0].id,
        createdBy: createdUsers[1].id,
        transactionDate: new Date('2025-01-31')
      }
    ];

    const createdTransactions = await db.insert(transactions).values(transactionData).returning();
    console.log('✅ Transactions created:', createdTransactions.length);

    // Seed Equipment
    const equipmentData = [
      {
        name: 'Concrete Mixer CM-200',
        nameAr: 'خلاطة خرسانة CM-200',
        type: 'Concrete Mixer',
        typeAr: 'خلاطة خرسانة',
        model: 'CM-200-Pro',
        serialNumber: 'CM200-2024-001',
        status: 'in_use',
        location: 'Sanaa Site',
        locationAr: 'موقع صنعاء',
        companyId: company.id,
        assignedProjectId: createdProjects[0].id,
        purchaseDate: new Date('2024-06-15'),
        purchasePrice: 1200000,
        lastMaintenanceDate: new Date('2024-12-01'),
        nextMaintenanceDate: new Date('2025-03-01')
      },
      {
        name: 'Excavator EX-500',
        nameAr: 'حفارة EX-500',
        type: 'Excavator',
        typeAr: 'حفارة',
        model: 'EX-500-HD',
        serialNumber: 'EX500-2023-007',
        status: 'available',
        location: 'Main Warehouse',
        locationAr: 'المستودع الرئيسي',
        companyId: company.id,
        purchaseDate: new Date('2023-09-20'),
        purchasePrice: 8500000,
        lastMaintenanceDate: new Date('2024-11-15'),
        nextMaintenanceDate: new Date('2025-02-15')
      },
      {
        name: 'Tower Crane TC-150',
        nameAr: 'رافعة برجية TC-150',
        type: 'Tower Crane',
        typeAr: 'رافعة برجية',
        model: 'TC-150-Max',
        serialNumber: 'TC150-2024-003',
        status: 'in_use',
        location: 'Aden Site',
        locationAr: 'موقع عدن',
        companyId: company.id,
        assignedProjectId: createdProjects[1].id,
        purchaseDate: new Date('2024-02-10'),
        purchasePrice: 15000000,
        lastMaintenanceDate: new Date('2024-10-20'),
        nextMaintenanceDate: new Date('2025-01-20')
      }
    ];

    const createdEquipment = await db.insert(equipment).values(equipmentData).returning();
    console.log('✅ Equipment created:', createdEquipment.length);

    // Seed Warehouses
    const warehouseData = [
      {
        name: 'Main Materials Warehouse',
        nameAr: 'مستودع المواد الرئيسي',
        location: 'Sanaa Industrial Zone',
        locationAr: 'المنطقة الصناعية صنعاء',
        companyId: company.id,
        managerId: createdUsers[2].id,
        capacity: 5000,
        currentStock: 3200,
        status: 'active'
      },
      {
        name: 'Equipment Storage Facility',
        nameAr: 'مرفق تخزين المعدات',
        location: 'Aden Port Area',
        locationAr: 'منطقة ميناء عدن',
        companyId: company.id,
        managerId: createdUsers[2].id,
        capacity: 2000,
        currentStock: 1500,
        status: 'active'
      }
    ];

    const createdWarehouses = await db.insert(warehouses).values(warehouseData).returning();
    console.log('✅ Warehouses created:', createdWarehouses.length);

    console.log('🎉 Database seeding completed successfully!');
    console.log(`✅ Created:
    - ${1} Company
    - ${createdUsers.length} Users
    - ${createdProjects.length} Projects
    - ${createdTransactions.length} Transactions
    - ${createdEquipment.length} Equipment
    - ${createdWarehouses.length} Warehouses`);

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

// Run seeding if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().catch(console.error);
}