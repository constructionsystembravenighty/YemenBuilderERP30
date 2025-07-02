import React, { useState } from "react";
import { GlassmorphicCard, GlassHeader, GlassContent } from "@/components/glassmorphic-card";
import { EnhancedFormBuilder } from "@/components/forms/enhanced-form-builder";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CurrencyInput, LocationSelector, PhoneInput, SerialNumberInput, ProgressTracker, FileUpload, RatingInput, TagInput } from "@/components/forms/specialized-inputs";
import { validationSchemas } from "@/lib/validation-schemas-clean";
import { z } from "zod";
import { Info, CheckCircle, Wrench, Building, Users, DollarSign, Star } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useToast } from "@/hooks/use-toast";

export default function FormsDemo() {
  const [activeTab, setActiveTab] = useState("enhanced");
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Demo data states for specialized inputs
  const [currency, setCurrency] = useState(0);
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [serial, setSerial] = useState("");
  const [progress, setProgress] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);

  // Enhanced project form fields
  const projectFields = [
    {
      name: "name",
      label: "Project Name",
      labelAr: "اسم المشروع",
      type: "text" as const,
      required: true,
      description: "Enter the official project name",
      descriptionAr: "أدخل الاسم الرسمي للمشروع",
      icon: <Building className="h-4 w-4" />,
    },
    {
      name: "nameAr",
      label: "Arabic Name",
      labelAr: "الاسم بالعربية",
      type: "text" as const,
      required: true,
    },
    {
      name: "type",
      label: "Project Type",
      labelAr: "نوع المشروع",
      type: "select" as const,
      required: true,
      options: [
        { value: "residential", label: "Residential", labelAr: "سكني", icon: <Building className="h-4 w-4" /> },
        { value: "commercial", label: "Commercial", labelAr: "تجاري", icon: <Building className="h-4 w-4" /> },
        { value: "infrastructure", label: "Infrastructure", labelAr: "بنية تحتية", icon: <Wrench className="h-4 w-4" /> },
        { value: "industrial", label: "Industrial", labelAr: "صناعي", icon: <Wrench className="h-4 w-4" /> },
        { value: "renovation", label: "Renovation", labelAr: "تجديد", icon: <Building className="h-4 w-4" /> },
      ]
    },
    {
      name: "priority",
      label: "Priority Level",
      labelAr: "مستوى الأولوية",
      type: "radio" as const,
      required: true,
      options: [
        { value: "low", label: "Low Priority", labelAr: "أولوية منخفضة" },
        { value: "medium", label: "Medium Priority", labelAr: "أولوية متوسطة" },
        { value: "high", label: "High Priority", labelAr: "أولوية عالية" },
        { value: "critical", label: "Critical Priority", labelAr: "أولوية حرجة" },
      ]
    },
    {
      name: "budget",
      label: "Project Budget",
      labelAr: "ميزانية المشروع",
      type: "currency" as const,
      required: true,
      currencyConfig: { currency: "YER" as const, showExchange: true },
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      name: "startDate",
      label: "Start Date",
      labelAr: "تاريخ البداية",
      type: "date" as const,
      required: true,
    },
    {
      name: "endDate",
      label: "End Date",
      labelAr: "تاريخ الانتهاء",
      type: "date" as const,
      required: true,
    },
    {
      name: "location",
      label: "Project Location",
      labelAr: "موقع المشروع",
      type: "text" as const,
      required: true,
      description: "Select from Yemen governorates",
      descriptionAr: "اختر من محافظات اليمن",
    },
    {
      name: "description",
      label: "Project Description",
      labelAr: "وصف المشروع",
      type: "textarea" as const,
      placeholder: "Describe the project scope and objectives...",
      placeholderAr: "اوصف نطاق المشروع وأهدافه...",
    },
    {
      name: "features",
      label: "Project Features",
      labelAr: "مميزات المشروع",
      type: "multiselect" as const,
      options: [
        { value: "earthquake_resistant", label: "Earthquake Resistant", labelAr: "مقاوم للزلازل" },
        { value: "solar_power", label: "Solar Power", labelAr: "طاقة شمسية" },
        { value: "water_recycling", label: "Water Recycling", labelAr: "إعادة تدوير المياه" },
        { value: "smart_systems", label: "Smart Systems", labelAr: "أنظمة ذكية" },
        { value: "green_building", label: "Green Building", labelAr: "مبنى أخضر" },
      ]
    },
    {
      name: "riskLevel",
      label: "Risk Assessment",
      labelAr: "تقييم المخاطر",
      type: "slider" as const,
      min: 0,
      max: 100,
      description: "Rate the overall project risk (0 = No Risk, 100 = High Risk)",
      descriptionAr: "قيم المخاطر الإجمالية للمشروع (0 = بلا مخاطر، 100 = مخاطر عالية)",
    },
    {
      name: "clientRating",
      label: "Client Rating",
      labelAr: "تقييم العميل",
      type: "rating" as const,
      description: "Rate the client relationship",
      descriptionAr: "قيم علاقة العميل",
    },
    {
      name: "documents",
      label: "Project Documents",
      labelAr: "وثائق المشروع",
      type: "file" as const,
      fileConfig: {
        accept: ".pdf,.doc,.docx,.jpg,.png",
        maxSize: 5 * 1024 * 1024, // 5MB
        multiple: true,
        preview: true,
      },
      description: "Upload project plans, permits, and documentation",
      descriptionAr: "حمل خطط المشروع والتصاريح والوثائق",
    },
    {
      name: "tags",
      label: "Project Tags",
      labelAr: "علامات المشروع",
      type: "text" as const,
      description: "Add relevant tags for categorization",
      descriptionAr: "أضف علامات ذات صلة للتصنيف",
    },
    {
      name: "companyId",
      label: "Company ID",
      labelAr: "معرف الشركة",
      type: "number" as const,
      hidden: true,
    },
  ];

  // Multi-step wizard configuration
  const wizardSteps = {
    steps: [
      {
        title: "Basic Information",
        titleAr: "المعلومات الأساسية",
        description: "Project name and type",
        fields: ["name", "nameAr", "type", "priority"]
      },
      {
        title: "Financial Details",
        titleAr: "التفاصيل المالية", 
        description: "Budget and financial planning",
        fields: ["budget"]
      },
      {
        title: "Timeline & Location",
        titleAr: "الجدول الزمني والموقع",
        description: "Project schedule and location",
        fields: ["startDate", "endDate", "location"]
      },
      {
        title: "Details & Documentation",
        titleAr: "التفاصيل والوثائق",
        description: "Additional details and files",
        fields: ["description", "features", "riskLevel", "clientRating", "documents", "tags"]
      }
    ],
    showStepProgress: true,
    allowStepJumping: false,
  };

  // Form schema for validation
  const demoSchema = z.object({
    name: z.string().min(3, "اسم المشروع قصير جداً"),
    nameAr: z.string().min(3, "الاسم العربي قصير جداً"),
    type: z.enum(["residential", "commercial", "infrastructure", "industrial", "renovation"]),
    priority: z.enum(["low", "medium", "high", "critical"]),
    budget: z.number().min(100000, "الميزانية قليلة جداً"),
    startDate: z.string(),
    endDate: z.string(),
    location: z.string().min(2, "يجب تحديد الموقع"),
    description: z.string().optional(),
    features: z.array(z.string()).optional(),
    riskLevel: z.number().min(0).max(100).optional(),
    clientRating: z.number().min(1).max(5).optional(),
    documents: z.any().optional(),
    tags: z.string().optional(),
    companyId: z.number().default(1),
  });

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setFormData(data);
    setIsSubmitting(false);
    
    toast({
      title: "تم إرسال النموذج بنجاح",
      description: "تم حفظ بيانات المشروع بنجاح",
    });
  };

  const handleDraftSave = (data: any) => {
    console.log("Auto-saving draft:", data);
    toast({
      title: "تم حفظ المسودة",
      description: "تم حفظ التقدم تلقائياً",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-primary">نظام النماذج المتقدم</h1>
        <p className="text-gray-600">عرض توضيحي لمكونات الإدخال والتحقق المتقدمة</p>
      </div>

      {/* Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-700">
          هذا عرض توضيحي شامل لنظام النماذج المتقدم مع التحقق الذكي والمكونات المخصصة لإدارة المشاريع الإنشائية
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="enhanced">النموذج المتقدم</TabsTrigger>
          <TabsTrigger value="wizard">معالج متعدد الخطوات</TabsTrigger>
          <TabsTrigger value="components">المكونات المخصصة</TabsTrigger>
        </TabsList>

        {/* Enhanced Form Tab */}
        <TabsContent value="enhanced" className="space-y-6">
          <GlassmorphicCard>
            <GlassHeader
              title="Enhanced Project Form"
              titleAr="نموذج المشروع المتقدم"
              action={
                <Badge variant="secondary" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  التحقق الذكي مفعل
                </Badge>
              }
            />
            <GlassContent>
              <EnhancedFormBuilder
                fields={projectFields}
                schema={demoSchema}
                onSubmit={handleFormSubmit}
                title="Create New Project"
                titleAr="إنشاء مشروع جديد"
                description="Fill in the project details below"
                descriptionAr="املأ تفاصيل المشروع أدناه"
                submitTextAr="إنشاء المشروع"
                isLoading={isSubmitting}
                showProgress={true}
                autoSave={true}
                enableDrafts={true}
                enableValidationOnChange={true}
                onDraftSave={handleDraftSave}
                className="space-y-6"
              />
            </GlassContent>
          </GlassmorphicCard>
        </TabsContent>

        {/* Multi-Step Wizard Tab */}
        <TabsContent value="wizard" className="space-y-6">
          <GlassmorphicCard>
            <GlassHeader
              title="Multi-Step Project Wizard"
              titleAr="معالج المشروع متعدد الخطوات"
              action={
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  معالج ذكي
                </Badge>
              }
            />
            <GlassContent>
              <EnhancedFormBuilder
                fields={projectFields}
                schema={demoSchema}
                onSubmit={handleFormSubmit}
                title="Project Creation Wizard"
                titleAr="معالج إنشاء المشروع"
                description="Step-by-step project setup"
                descriptionAr="إعداد المشروع خطوة بخطوة"
                submitTextAr="إكمال إنشاء المشروع"
                isLoading={isSubmitting}
                isMultiStep={true}
                stepConfig={wizardSteps}
                showProgress={true}
                autoSave={true}
                onDraftSave={handleDraftSave}
                onStepChange={(step) => console.log("Current step:", step)}
                className="space-y-6"
              />
            </GlassContent>
          </GlassmorphicCard>
        </TabsContent>

        {/* Specialized Components Tab */}
        <TabsContent value="components" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Currency Input */}
            <GlassmorphicCard>
              <GlassHeader
                title="Currency Input"
                titleAr="إدخال العملة"
              />
              <GlassContent className="space-y-4">
                <CurrencyInput
                  value={currency}
                  onChange={setCurrency}
                  currency="YER"
                  showExchangeRate={true}
                  placeholder="أدخل المبلغ"
                />
                <div className="text-sm text-gray-600">
                  المبلغ: {formatCurrency(currency)}
                </div>
              </GlassContent>
            </GlassmorphicCard>

            {/* Location Selector */}
            <GlassmorphicCard>
              <GlassHeader
                title="Yemen Location Selector"
                titleAr="محدد الموقع اليمني"
              />
              <GlassContent className="space-y-4">
                <LocationSelector
                  value={location}
                  onChange={setLocation}
                  enableGPS={true}
                  placeholder="اختر المحافظة"
                />
                <div className="text-sm text-gray-600">
                  الموقع المحدد: {location || "لم يتم التحديد"}
                </div>
              </GlassContent>
            </GlassmorphicCard>

            {/* Phone Input */}
            <GlassmorphicCard>
              <GlassHeader
                title="Yemen Phone Input"
                titleAr="إدخال الهاتف اليمني"
              />
              <GlassContent className="space-y-4">
                <PhoneInput
                  value={phone}
                  onChange={setPhone}
                  placeholder="أدخل رقم الهاتف"
                  showFormatting={true}
                />
                <div className="text-sm text-gray-600">
                  الرقم: {phone || "لم يتم الإدخال"}
                </div>
              </GlassContent>
            </GlassmorphicCard>

            {/* Serial Number Input */}
            <GlassmorphicCard>
              <GlassHeader
                title="Equipment Serial Number"
                titleAr="الرقم التسلسلي للمعدة"
              />
              <GlassContent className="space-y-4">
                <SerialNumberInput
                  value={serial}
                  onChange={setSerial}
                  equipmentType="excavator"
                  autoGenerate={true}
                  placeholder="الرقم التسلسلي"
                />
                <div className="text-sm text-gray-600">
                  الرقم: {serial || "لم يتم الإدخال"}
                </div>
              </GlassContent>
            </GlassmorphicCard>

            {/* Progress Tracker */}
            <GlassmorphicCard>
              <GlassHeader
                title="Progress Tracker"
                titleAr="متتبع التقدم"
              />
              <GlassContent className="space-y-4">
                <ProgressTracker
                  value={progress}
                  onChange={setProgress}
                  showMilestones={true}
                />
              </GlassContent>
            </GlassmorphicCard>

            {/* Rating Input */}
            <GlassmorphicCard>
              <GlassHeader
                title="Rating System"
                titleAr="نظام التقييم"
              />
              <GlassContent className="space-y-4">
                <RatingInput
                  value={rating}
                  onChange={setRating}
                  max={5}
                  size="lg"
                  labels={["ضعيف جداً", "ضعيف", "متوسط", "جيد", "ممتاز"]}
                />
                <div className="text-sm text-gray-600">
                  التقييم: {rating}/5
                </div>
              </GlassContent>
            </GlassmorphicCard>

            {/* File Upload */}
            <GlassmorphicCard className="lg:col-span-2">
              <GlassHeader
                title="File Upload System"
                titleAr="نظام تحميل الملفات"
              />
              <GlassContent className="space-y-4">
                <FileUpload
                  value={files}
                  onChange={setFiles}
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  maxSize={10 * 1024 * 1024} // 10MB
                  maxFiles={5}
                  showPreview={true}
                  uploadText="اسحب الملفات هنا أو انقر للتحميل"
                />
              </GlassContent>
            </GlassmorphicCard>

            {/* Tag Input */}
            <GlassmorphicCard className="lg:col-span-2">
              <GlassHeader
                title="Tag Management"
                titleAr="إدارة العلامات"
              />
              <GlassContent className="space-y-4">
                <TagInput
                  value={tags}
                  onChange={setTags}
                  placeholder="اكتب علامة واضغط Enter"
                  suggestions={[
                    "بناء", "تجديد", "بنية تحتية", "صيانة", "تصميم",
                    "هندسة", "مشروع حكومي", "قطاع خاص", "عاجل", "مخطط"
                  ]}
                  maxTags={10}
                />
              </GlassContent>
            </GlassmorphicCard>
          </div>
        </TabsContent>
      </Tabs>

      {/* Form Data Display */}
      {Object.keys(formData).length > 0 && (
        <GlassmorphicCard>
          <GlassHeader
            title="Submitted Form Data"
            titleAr="بيانات النموذج المرسل"
            action={
              <Badge variant="outline" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 ml-1" />
                تم الإرسال بنجاح
              </Badge>
            }
          />
          <GlassContent>
            <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </GlassContent>
        </GlassmorphicCard>
      )}
    </div>
  );
}