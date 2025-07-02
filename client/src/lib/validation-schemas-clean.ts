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

// Enhanced project creation schema
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
  
  // Contact information
  phone: constructionValidation.yemenPhone,
  email: z.string().email("البريد الإلكتروني غير صحيح").optional(),
  address: z.string().min(5, "العنوان قصير جداً"),
  addressAr: z.string().min(5, "العنوان العربي قصير جداً"),
  city: constructionValidation.yemenLocation,
  
  // Employment information
  role: z.enum(["ceo", "manager", "supervisor", "employee", "worker"]),
  department: z.string().min(2, "يجب تحديد القسم"),
  departmentAr: z.string().min(2, "يجب تحديد القسم بالعربية"),
  
  salary: constructionValidation.employeeSalary,
  hireDate: z.string(),
  
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
  
  // Technical specifications
  model: z.string().min(1, "الطراز مطلوب"),
  manufacturer: z.string().min(1, "الشركة المصنعة مطلوبة"),
  
  serialNumber: constructionValidation.equipmentSerial,
  manufactureYear: z.number()
    .min(1980, "سنة الصنع قديمة جداً")
    .max(new Date().getFullYear(), "سنة الصنع لا يمكن أن تكون في المستقبل"),
  
  // Financial information
  purchasePrice: constructionValidation.equipmentPrice,
  currentValue: z.number().optional(),
  currency: z.enum(["YER", "USD", "EUR"]).default("YER"),
  
  purchaseDate: z.string(),
  
  // Operational information
  status: z.enum(["available", "in_use", "maintenance", "offline", "disposed"]),
  location: z.string().min(2, "موقع المعدة مطلوب"),
  locationAr: z.string().min(2, "الموقع العربي مطلوب"),
  
  companyId: z.number(),
});

// Enhanced transaction schema
export const enhancedTransactionSchema = z.object({
  // Basic transaction information
  type: z.enum(["income", "expense", "transfer"]),
  category: z.string().min(2, "فئة المعاملة مطلوبة"),
  categoryAr: z.string().min(2, "الفئة العربية مطلوبة"),
  
  // Financial details
  amount: constructionValidation.currencyAmount,
  currency: z.enum(["YER", "USD", "EUR"]).default("YER"),
  
  // Description and references
  description: z.string().min(5, "وصف المعاملة مطلوب"),
  descriptionAr: z.string().min(5, "الوصف العربي مطلوب"),
  
  // Date and timing
  transactionDate: z.string(),
  
  // Related entities
  projectId: z.number().optional(),
  
  companyId: z.number(),
  createdBy: z.number(),
});

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

// Export all schemas for easy access
export const validationSchemas = {
  enhancedProject: enhancedProjectSchema,
  enhancedEmployee: enhancedEmployeeSchema,
  enhancedEquipment: enhancedEquipmentSchema,
  enhancedTransaction: enhancedTransactionSchema,
};