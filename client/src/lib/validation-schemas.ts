import { z } from "zod";

// Base validation utilities for construction management
export const yemenPhoneRegex = /^(\+967|00967|967)?[0-9]{8,9}$/;
export const yemenLocationRegex = /^(صنعاء|عدن|تعز|الحديدة|إب|ذمار|صعدة|حجة|المحويت|الضالع|لحج|أبين|شبوة|المهرة|حضرموت|الجوف|مأرب|البيضاء|ريمة|عمران).*$/;
export const equipmentSerialRegex = /^[A-Z0-9]{6,20}$/;
export const yemenNationalIdRegex = /^[0-9]{10}$/;

// Construction-specific validation schemas
export const constructionValidation = {
  // Project validations
  projectBudget: z
    .number()
    .min(100000, "الميزانية يجب أن تكون أكبر من 100,000 ريال")
    .max(10000000000, "الميزانية كبيرة جداً"),
    
  projectDuration: z
    .number()
    .min(1, "مدة المشروع يجب أن تكون على الأقل يوم واحد")
    .max(3650, "مدة المشروع لا يمكن أن تزيد عن 10 سنوات"),
    
  // Employee validations
  employeeSalary: z
    .number()
    .min(50000, "الراتب يجب أن يكون أكبر من 50,000 ريال")
    .max(5000000, "الراتب كبير جداً"),
    
  yemenPhone: z
    .string()
    .regex(yemenPhoneRegex, "رقم الهاتف غير صحيح"),
    
  yemenNationalId: z
    .string()
    .regex(yemenNationalIdRegex, "رقم الهوية يجب أن يحتوي على 10 أرقام"),
    
  // Equipment validations
  equipmentSerial: z
    .string()
    .regex(equipmentSerialRegex, "الرقم التسلسلي يجب أن يحتوي على أحرف وأرقام إنجليزية فقط"),
    
  equipmentPrice: z
    .number()
    .min(10000, "سعر المعدة يجب أن يكون أكبر من 10,000 ريال")
    .max(1000000000, "السعر كبير جداً"),
    
  // Location validations
  yemenLocation: z
    .string()
    .min(2, "يجب تحديد الموقع")
    .refine(
      (val) => yemenLocationRegex.test(val),
      "يجب أن يبدأ الموقع بمحافظة يمنية صحيحة"
    ),
    
  // Financial validations
  currencyAmount: z
    .number()
    .min(0, "المبلغ لا يمكن أن يكون سالباً")
    .max(999999999999, "المبلغ كبير جداً"),
    
  exchangeRate: z
    .number()
    .min(1, "سعر الصرف يجب أن يكون أكبر من 1")
    .max(10000, "سعر الصرف عالي جداً"),
};

// Comprehensive project creation schema
export const enhancedProjectSchema = z.object({
  // Basic project information
  name: z.string().min(3, "اسم المشروع يجب أن يحتوي على 3 أحرف على الأقل"),
  nameAr: z.string().min(3, "الاسم العربي يجب أن يحتوي على 3 أحرف على الأقل"),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  
  // Project classification
  type: z.enum([
    "residential", 
    "commercial", 
    "infrastructure", 
    "industrial", 
    "renovation"
  ], {
    errorMap: () => ({ message: "يجب اختيار نوع المشروع" })
  }),
  
  category: z.enum([
    "building", 
    "road", 
    "bridge", 
    "water", 
    "electrical", 
    "telecommunications"
  ], {
    errorMap: () => ({ message: "يجب اختيار فئة المشروع" })
  }),
  
  priority: z.enum(["low", "medium", "high", "critical"]),
  status: z.enum(["planning", "active", "completed", "cancelled", "on_hold"]),
  
  // Financial information
  budget: constructionValidation.projectBudget,
  currency: z.enum(["YER", "USD", "EUR"]).default("YER"),
  estimatedCost: z.number().optional(),
  actualCost: z.number().optional(),
  
  // Timeline
  startDate: z.string().refine(
    (date) => new Date(date) >= new Date(),
    "تاريخ البداية يجب أن يكون في المستقبل"
  ),
  endDate: z.string(),
  estimatedDuration: constructionValidation.projectDuration,
  
  // Location
  location: constructionValidation.yemenLocation,
  locationAr: z.string().min(2, "يجب تحديد الموقع بالعربية"),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
  }).optional(),
  
  // Project management
  managerId: z.number().positive("يجب تعيين مدير للمشروع"),
  clientName: z.string().min(2, "يجب إدخال اسم العميل"),
  clientNameAr: z.string().min(2, "يجب إدخال اسم العميل بالعربية"),
  clientContact: constructionValidation.yemenPhone,
  clientEmail: z.string().email("البريد الإلكتروني غير صحيح").optional(),
  
  // Technical specifications
  specifications: z.array(z.object({
    item: z.string(),
    itemAr: z.string(),
    quantity: z.number().positive(),
    unit: z.string(),
    unitAr: z.string(),
    unitPrice: z.number().positive(),
    totalPrice: z.number().positive(),
  })).optional(),
  
  // Risk assessment
  riskLevel: z.enum(["low", "medium", "high"]).default("medium"),
  riskFactors: z.array(z.string()).optional(),
  mitigationPlans: z.array(z.string()).optional(),
  
  // Documents and approvals
  permits: z.array(z.object({
    type: z.string(),
    typeAr: z.string(),
    issueDate: z.string(),
    expiryDate: z.string(),
    issuer: z.string(),
    issuerAr: z.string(),
  })).optional(),
  
  // Additional metadata
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  notesAr: z.string().optional(),
  
  companyId: z.number(),
}).refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  {
    message: "تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية",
    path: ["endDate"]
  }
);

// Enhanced employee creation schema
export const enhancedEmployeeSchema = z.object({
  // Personal information
  username: z.string().min(3, "اسم المستخدم يجب أن يحتوي على 3 أحرف على الأقل"),
  password: z.string().min(8, "كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "كلمة المرور يجب أن تحتوي على أحرف كبيرة وصغيرة وأرقام"),
  
  name: z.string().min(2, "الاسم يجب أن يحتوي على حرفين على الأقل"),
  nameAr: z.string().min(2, "الاسم العربي يجب أن يحتوي على حرفين على الأقل"),
  
  nationalId: constructionValidation.yemenNationalId,
  birthDate: z.string().refine(
    (date) => {
      const birthYear = new Date(date).getFullYear();
      const currentYear = new Date().getFullYear();
      return currentYear - birthYear >= 18 && currentYear - birthYear <= 65;
    },
    "العمر يجب أن يكون بين 18 و 65 سنة"
  ),
  
  gender: z.enum(["male", "female"], {
    errorMap: () => ({ message: "يجب تحديد الجنس" })
  }),
  
  maritalStatus: z.enum(["single", "married", "divorced", "widowed"]).optional(),
  
  // Contact information
  phone: constructionValidation.yemenPhone,
  email: z.string().email("البريد الإلكتروني غير صحيح").optional(),
  address: z.string().min(5, "العنوان قصير جداً"),
  addressAr: z.string().min(5, "العنوان العربي قصير جداً"),
  city: constructionValidation.yemenLocation,
  
  // Emergency contact
  emergencyContact: z.object({
    name: z.string().min(2, "اسم جهة الاتصال للطوارئ مطلوب"),
    nameAr: z.string().min(2, "الاسم العربي لجهة الاتصال مطلوب"),
    relationship: z.string(),
    relationshipAr: z.string(),
    phone: constructionValidation.yemenPhone,
  }),
  
  // Employment information
  role: z.enum(["ceo", "manager", "supervisor", "employee", "worker"]),
  department: z.string().min(2, "يجب تحديد القسم"),
  departmentAr: z.string().min(2, "يجب تحديد القسم بالعربية"),
  
  position: z.string().min(2, "يجب تحديد المنصب"),
  positionAr: z.string().min(2, "يجب تحديد المنصب بالعربية"),
  
  employmentType: z.enum(["fulltime", "parttime", "contract", "temporary"]),
  
  salary: constructionValidation.employeeSalary,
  allowances: z.number().min(0).optional(),
  
  hireDate: z.string(),
  probationPeriod: z.number().min(1).max(12).default(3), // months
  
  // Skills and qualifications
  education: z.enum([
    "elementary", 
    "middle", 
    "high_school", 
    "diploma", 
    "bachelor", 
    "master", 
    "phd"
  ]).optional(),
  
  specializations: z.array(z.string()).optional(),
  certifications: z.array(z.object({
    name: z.string(),
    nameAr: z.string(),
    issuer: z.string(),
    issueDate: z.string(),
    expiryDate: z.string().optional(),
  })).optional(),
  
  languages: z.array(z.object({
    language: z.string(),
    level: z.enum(["basic", "intermediate", "advanced", "native"]),
  })).optional(),
  
  // Work preferences
  workLocation: z.enum(["office", "site", "hybrid", "remote"]).default("site"),
  shiftPreference: z.enum(["morning", "evening", "night", "flexible"]).default("morning"),
  availableForTravel: z.boolean().default(true),
  
  // Performance and status
  status: z.enum(["active", "inactive", "suspended", "terminated"]).default("active"),
  performanceRating: z.number().min(1).max(5).optional(),
  
  companyId: z.number(),
  managerId: z.number().optional(),
});

// Enhanced equipment schema
export const enhancedEquipmentSchema = z.object({
  // Basic information
  name: z.string().min(2, "اسم المعدة مطلوب"),
  nameAr: z.string().min(2, "الاسم العربي للمعدة مطلوب"),
  
  type: z.enum([
    "excavator", 
    "crane", 
    "bulldozer", 
    "mixer", 
    "truck", 
    "generator", 
    "compressor", 
    "drill",
    "pump",
    "welding",
    "cutting",
    "measuring",
    "safety",
    "other"
  ]),
  
  category: z.enum([
    "heavy_machinery",
    "construction_tools", 
    "safety_equipment",
    "measuring_instruments",
    "electrical_equipment",
    "transportation"
  ]),
  
  // Technical specifications
  model: z.string().min(1, "الطراز مطلوب"),
  manufacturer: z.string().min(1, "الشركة المصنعة مطلوبة"),
  manufacturerAr: z.string().optional(),
  
  serialNumber: constructionValidation.equipmentSerial,
  manufactureYear: z.number()
    .min(1980, "سنة الصنع قديمة جداً")
    .max(new Date().getFullYear(), "سنة الصنع لا يمكن أن تكون في المستقبل"),
  
  // Technical details
  specifications: z.object({
    power: z.number().optional(), // in HP or KW
    weight: z.number().optional(), // in KG
    capacity: z.number().optional(), // varies by equipment type
    fuelType: z.enum(["diesel", "gasoline", "electric", "hybrid", "manual"]).optional(),
    fuelConsumption: z.number().optional(), // liters per hour
  }).optional(),
  
  // Financial information
  purchasePrice: constructionValidation.equipmentPrice,
  currentValue: z.number().optional(),
  currency: z.enum(["YER", "USD", "EUR"]).default("YER"),
  
  purchaseDate: z.string(),
  warrantyExpiry: z.string().optional(),
  
  // Operational information
  status: z.enum(["available", "in_use", "maintenance", "offline", "disposed"]),
  condition: z.enum(["excellent", "good", "fair", "poor"]).default("good"),
  
  location: z.string().min(2, "موقع المعدة مطلوب"),
  locationAr: z.string().min(2, "الموقع العربي مطلوب"),
  
  assignedTo: z.object({
    projectId: z.number().optional(),
    employeeId: z.number().optional(),
    assignmentDate: z.string().optional(),
  }).optional(),
  
  // Maintenance information
  maintenanceSchedule: z.object({
    frequency: z.enum(["daily", "weekly", "monthly", "quarterly", "yearly"]),
    lastMaintenance: z.string().optional(),
    nextMaintenance: z.string().optional(),
    maintenanceCost: z.number().optional(),
  }).optional(),
  
  maintenanceHistory: z.array(z.object({
    date: z.string(),
    type: z.enum(["routine", "repair", "emergency", "upgrade"]),
    description: z.string(),
    descriptionAr: z.string(),
    cost: z.number(),
    technician: z.string(),
    technicianAr: z.string(),
  })).optional(),
  
  // Safety and compliance
  safetyRating: z.enum(["safe", "caution", "danger"]).default("safe"),
  inspectionDate: z.string().optional(),
  nextInspectionDate: z.string().optional(),
  certifications: z.array(z.string()).optional(),
  
  // Usage tracking
  totalOperatingHours: z.number().min(0).default(0),
  averageUsagePerDay: z.number().min(0).optional(),
  
  companyId: z.number(),
});

// Enhanced transaction schema
export const enhancedTransactionSchema = z.object({
  // Basic transaction information
  type: z.enum(["income", "expense", "transfer"]),
  category: z.string().min(2, "فئة المعاملة مطلوبة"),
  categoryAr: z.string().min(2, "الفئة العربية مطلوبة"),
  
  subcategory: z.string().optional(),
  subcategoryAr: z.string().optional(),
  
  // Financial details
  amount: constructionValidation.currencyAmount,
  currency: z.enum(["YER", "USD", "EUR"]).default("YER"),
  exchangeRate: constructionValidation.exchangeRate.optional(),
  amountInBaseCurrency: z.number().optional(),
  
  // Description and references
  description: z.string().min(5, "وصف المعاملة مطلوب"),
  descriptionAr: z.string().min(5, "الوصف العربي مطلوب"),
  
  referenceNumber: z.string().optional(),
  invoiceNumber: z.string().optional(),
  receiptNumber: z.string().optional(),
  
  // Date and timing
  transactionDate: z.string(),
  dueDate: z.string().optional(),
  paymentDate: z.string().optional(),
  
  // Related entities
  projectId: z.number().optional(),
  vendorId: z.number().optional(),
  clientId: z.number().optional(),
  
  // Payment information
  paymentMethod: z.enum([
    "cash", 
    "bank_transfer", 
    "check", 
    "card", 
    "mobile_payment",
    "cryptocurrency"
  ]).default("cash"),
  
  paymentStatus: z.enum([
    "pending", 
    "completed", 
    "failed", 
    "cancelled", 
    "refunded"
  ]).default("pending"),
  
  bankDetails: z.object({
    bankName: z.string(),
    bankNameAr: z.string(),
    accountNumber: z.string(),
    routingNumber: z.string().optional(),
  }).optional(),
  
  // Tax and compliance
  taxIncluded: z.boolean().default(false),
  taxAmount: z.number().min(0).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  
  // Approvals
  approvalRequired: z.boolean().default(false),
  approvedBy: z.number().optional(),
  approvalDate: z.string().optional(),
  approvalNotes: z.string().optional(),
  
  // Additional metadata
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  notesAr: z.string().optional(),
  
  attachments: z.array(z.object({
    filename: z.string(),
    fileType: z.string(),
    fileSize: z.number(),
    uploadDate: z.string(),
  })).optional(),
  
  companyId: z.number(),
  createdBy: z.number(),
});

// Multi-step form schemas - Define the base schema first without refinement
const baseProjectSchema = z.object({
  // Basic project information
  name: z.string().min(3, "اسم المشروع يجب أن يحتوي على 3 أحرف على الأقل"),
  nameAr: z.string().min(3, "الاسم العربي يجب أن يحتوي على 3 أحرف على الأقل"),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  
  // Project classification
  type: z.enum([
    "residential", 
    "commercial", 
    "infrastructure", 
    "industrial", 
    "renovation"
  ], {
    errorMap: () => ({ message: "يجب اختيار نوع المشروع" })
  }),
  
  category: z.enum([
    "building", 
    "road", 
    "bridge", 
    "water", 
    "electrical", 
    "telecommunications"
  ], {
    errorMap: () => ({ message: "يجب اختيار فئة المشروع" })
  }),
  
  priority: z.enum(["low", "medium", "high", "critical"]),
  status: z.enum(["planning", "active", "completed", "cancelled", "on_hold"]),
  
  // Financial information
  budget: constructionValidation.projectBudget,
  currency: z.enum(["YER", "USD", "EUR"]).default("YER"),
  estimatedCost: z.number().optional(),
  actualCost: z.number().optional(),
  
  // Timeline
  startDate: z.string(),
  endDate: z.string(),
  estimatedDuration: constructionValidation.projectDuration,
  
  // Location
  location: constructionValidation.yemenLocation,
  locationAr: z.string().min(2, "يجب تحديد الموقع بالعربية"),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
  }).optional(),
  
  // Project management
  managerId: z.number().positive("يجب تعيين مدير للمشروع"),
  clientName: z.string().min(2, "يجب إدخال اسم العميل"),
  clientNameAr: z.string().min(2, "يجب إدخال اسم العميل بالعربية"),
  clientContact: constructionValidation.yemenPhone,
  clientEmail: z.string().email("البريد الإلكتروني غير صحيح").optional(),
  
  // Technical specifications
  specifications: z.array(z.object({
    item: z.string(),
    itemAr: z.string(),
    quantity: z.number().positive(),
    unit: z.string(),
    unitAr: z.string(),
    unitPrice: z.number().positive(),
    totalPrice: z.number().positive(),
  })).optional(),
  
  // Risk assessment
  riskLevel: z.enum(["low", "medium", "high"]).default("medium"),
  riskFactors: z.array(z.string()).optional(),
  mitigationPlans: z.array(z.string()).optional(),
  
  // Documents and approvals
  permits: z.array(z.object({
    type: z.string(),
    typeAr: z.string(),
    issueDate: z.string(),
    expiryDate: z.string(),
    issuer: z.string(),
    issuerAr: z.string(),
  })).optional(),
  
  // Additional metadata
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  notesAr: z.string().optional(),
  
  companyId: z.number(),
});

export const projectWizardSteps = {
  basic: baseProjectSchema.pick({
    name: true,
    nameAr: true,
    type: true,
    category: true,
    description: true,
    descriptionAr: true,
  }),
  
  financial: baseProjectSchema.pick({
    budget: true,
    currency: true,
    estimatedCost: true,
    clientName: true,
    clientNameAr: true,
    clientContact: true,
    clientEmail: true,
  }),
  
  timeline: baseProjectSchema.pick({
    startDate: true,
    endDate: true,
    estimatedDuration: true,
    priority: true,
    status: true,
  }),
  
  location: baseProjectSchema.pick({
    location: true,
    locationAr: true,
    coordinates: true,
    managerId: true,
  }),
  
  specifications: baseProjectSchema.pick({
    specifications: true,
    riskLevel: true,
    riskFactors: true,
    permits: true,
    tags: true,
    notes: true,
    notesAr: true,
  }),
};

// Form field generators
export const generateProjectFields = (): any[] => [
  {
    name: "name",
    label: "Project Name",
    labelAr: "اسم المشروع",
    type: "text",
    required: true,
    icon: <Building className="h-4 w-4" />,
    constructionType: "project",
  },
  {
    name: "nameAr", 
    label: "Arabic Name",
    labelAr: "الاسم بالعربية",
    type: "text",
    required: true,
  },
  {
    name: "type",
    label: "Project Type",
    labelAr: "نوع المشروع",
    type: "select",
    required: true,
    options: [
      { value: "residential", label: "Residential", labelAr: "سكني" },
      { value: "commercial", label: "Commercial", labelAr: "تجاري" },
      { value: "infrastructure", label: "Infrastructure", labelAr: "بنية تحتية" },
      { value: "industrial", label: "Industrial", labelAr: "صناعي" },
      { value: "renovation", label: "Renovation", labelAr: "تجديد" },
    ]
  },
  {
    name: "budget",
    label: "Budget (YER)",
    labelAr: "الميزانية (ريال يمني)",
    type: "currency",
    required: true,
    currencyConfig: { currency: "YER", showExchange: true },
    icon: <DollarSign className="h-4 w-4" />,
  },
  {
    name: "location",
    label: "Location",
    labelAr: "الموقع", 
    type: "text",
    required: true,
    icon: <MapPin className="h-4 w-4" />,
    industryValidation: {
      yemenLocations: [
        "صنعاء", "عدن", "تعز", "الحديدة", "إب", "ذمار", 
        "صعدة", "حجة", "المحويت", "الضالع", "لحج", "أبين"
      ]
    }
  },
  {
    name: "startDate",
    label: "Start Date",
    labelAr: "تاريخ البداية",
    type: "date",
    required: true,
    icon: <Calendar className="h-4 w-4" />,
  },
  {
    name: "priority",
    label: "Priority",
    labelAr: "الأولوية",
    type: "radio",
    required: true,
    options: [
      { value: "low", label: "Low", labelAr: "منخفضة" },
      { value: "medium", label: "Medium", labelAr: "متوسطة" },
      { value: "high", label: "High", labelAr: "عالية" },
      { value: "critical", label: "Critical", labelAr: "حرجة" },
    ]
  }
];

export const generateEmployeeFields = (): any[] => [
  {
    name: "name",
    label: "Full Name", 
    labelAr: "الاسم الكامل",
    type: "text",
    required: true,
    icon: <Users className="h-4 w-4" />,
  },
  {
    name: "nationalId",
    label: "National ID",
    labelAr: "رقم الهوية",
    type: "text",
    required: true,
    pattern: yemenNationalIdRegex,
  },
  {
    name: "phone",
    label: "Phone Number",
    labelAr: "رقم الهاتف",
    type: "tel",
    required: true,
    pattern: yemenPhoneRegex,
  },
  {
    name: "role",
    label: "Role",
    labelAr: "المنصب",
    type: "select",
    required: true,
    options: [
      { value: "ceo", label: "CEO", labelAr: "الرئيس التنفيذي" },
      { value: "manager", label: "Manager", labelAr: "مدير" },
      { value: "supervisor", label: "Supervisor", labelAr: "مشرف" },
      { value: "employee", label: "Employee", labelAr: "موظف" },
      { value: "worker", label: "Worker", labelAr: "عامل" },
    ]
  },
  {
    name: "salary",
    label: "Salary (YER)",
    labelAr: "الراتب (ريال يمني)",
    type: "currency",
    required: true,
    currencyConfig: { currency: "YER" },
  }
];

export const generateEquipmentFields = (): any[] => [
  {
    name: "name",
    label: "Equipment Name",
    labelAr: "اسم المعدة",
    type: "text",
    required: true,
    icon: <Wrench className="h-4 w-4" />,
  },
  {
    name: "type",
    label: "Equipment Type",
    labelAr: "نوع المعدة",
    type: "select",
    required: true,
    options: [
      { value: "excavator", label: "Excavator", labelAr: "حفارة" },
      { value: "crane", label: "Crane", labelAr: "رافعة" },
      { value: "bulldozer", label: "Bulldozer", labelAr: "جرافة" },
      { value: "mixer", label: "Concrete Mixer", labelAr: "خلاطة خرسانة" },
      { value: "truck", label: "Truck", labelAr: "شاحنة" },
      { value: "generator", label: "Generator", labelAr: "مولد كهرباء" },
    ]
  },
  {
    name: "serialNumber",
    label: "Serial Number",
    labelAr: "الرقم التسلسلي",
    type: "text",
    required: true,
    pattern: equipmentSerialRegex,
  },
  {
    name: "purchasePrice",
    label: "Purchase Price (YER)",
    labelAr: "سعر الشراء (ريال يمني)",
    type: "currency",
    required: true,
    currencyConfig: { currency: "YER" },
  }
];

// Export all schemas for easy access
export const validationSchemas = {
  enhancedProject: enhancedProjectSchema,
  enhancedEmployee: enhancedEmployeeSchema,
  enhancedEquipment: enhancedEquipmentSchema,
  enhancedTransaction: enhancedTransactionSchema,
  projectWizardSteps,
};

// Custom validation helpers
export const customValidators = {
  isYemenPhone: (phone: string) => yemenPhoneRegex.test(phone),
  isYemenLocation: (location: string) => yemenLocationRegex.test(location),
  isValidEquipmentSerial: (serial: string) => equipmentSerialRegex.test(serial),
  isValidNationalId: (id: string) => yemenNationalIdRegex.test(id),
  
  validateProjectBudget: (budget: number, projectType: string) => {
    const minimums = {
      residential: 500000,
      commercial: 1000000,
      infrastructure: 5000000,
      industrial: 2000000,
      renovation: 200000,
    };
    return budget >= (minimums[projectType as keyof typeof minimums] || 100000);
  },
  
  validateEmployeeSalary: (salary: number, role: string) => {
    const minimums = {
      ceo: 500000,
      manager: 300000,
      supervisor: 200000,
      employee: 100000,
      worker: 50000,
    };
    return salary >= (minimums[role as keyof typeof minimums] || 50000);
  },
};