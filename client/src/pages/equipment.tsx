import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { GlassmorphicCard, GlassHeader, GlassContent } from "@/components/glassmorphic-card";
import { ArabicForm } from "@/components/arabic-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Wrench, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { formatArabicDate } from "@/lib/arabic-utils";
import { insertEquipmentSchema } from "@shared/schema";
import { z } from "zod";

const equipmentFormFields = [
  {
    name: "name",
    label: "Equipment Name",
    labelAr: "اسم المعدة",
    type: "text" as const,
    placeholder: "Enter equipment name",
    placeholderAr: "أدخل اسم المعدة",
    required: true,
  },
  {
    name: "nameAr",
    label: "Arabic Name",
    labelAr: "الاسم بالعربية",
    type: "text" as const,
    placeholder: "أدخل الاسم بالعربية",
    placeholderAr: "أدخل الاسم بالعربية",
  },
  {
    name: "type",
    label: "Equipment Type",
    labelAr: "نوع المعدة",
    type: "select" as const,
    options: [
      { value: "excavator", label: "Excavator", labelAr: "حفارة" },
      { value: "crane", label: "Crane", labelAr: "رافعة" },
      { value: "bulldozer", label: "Bulldozer", labelAr: "جرافة" },
      { value: "mixer", label: "Concrete Mixer", labelAr: "خلاطة خرسانة" },
      { value: "truck", label: "Truck", labelAr: "شاحنة" },
      { value: "generator", label: "Generator", labelAr: "مولد كهرباء" },
      { value: "compressor", label: "Air Compressor", labelAr: "ضاغط هواء" },
      { value: "drill", label: "Drill", labelAr: "مثقاب" },
      { value: "other", label: "Other", labelAr: "أخرى" },
    ],
    required: true,
  },
  {
    name: "serialNumber",
    label: "Serial Number",
    labelAr: "الرقم التسلسلي",
    type: "text" as const,
    placeholder: "Enter serial number",
    placeholderAr: "أدخل الرقم التسلسلي",
  },
  {
    name: "purchasePrice",
    label: "Purchase Price (YER)",
    labelAr: "سعر الشراء (ريال يمني)",
    type: "number" as const,
    placeholder: "0.00",
    placeholderAr: "0.00",
  },
  {
    name: "currentValue",
    label: "Current Value (YER)",
    labelAr: "القيمة الحالية (ريال يمني)",
    type: "number" as const,
    placeholder: "0.00",
    placeholderAr: "0.00",
  },
  {
    name: "status",
    label: "Status",
    labelAr: "الحالة",
    type: "select" as const,
    options: [
      { value: "active", label: "Active", labelAr: "نشط" },
      { value: "maintenance", label: "Under Maintenance", labelAr: "تحت الصيانة" },
      { value: "inactive", label: "Inactive", labelAr: "غير نشط" },
      { value: "repair", label: "Needs Repair", labelAr: "يحتاج إصلاح" },
    ],
    required: true,
  },
  {
    name: "location",
    label: "Current Location",
    labelAr: "الموقع الحالي",
    type: "text" as const,
    placeholder: "Enter current location",
    placeholderAr: "أدخل الموقع الحالي",
  },
  {
    name: "notes",
    label: "Notes",
    labelAr: "ملاحظات",
    type: "textarea" as const,
    placeholder: "Additional notes about equipment",
    placeholderAr: "ملاحظات إضافية حول المعدة",
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "active":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "maintenance":
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case "repair":
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    default:
      return <Wrench className="h-4 w-4 text-gray-600" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 border-green-200";
    case "maintenance":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "repair":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "active":
      return "نشط";
    case "maintenance":
      return "تحت الصيانة";
    case "repair":
      return "يحتاج إصلاح";
    case "inactive":
      return "غير نشط";
    default:
      return status;
  }
};

export default function Equipment() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  const { data: equipment, isLoading } = useQuery({
    queryKey: ["/api/equipment?companyId=1"],
  });

  const createEquipmentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertEquipmentSchema>) => {
      const response = await fetch("/api/equipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, companyId: 1 }),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to create equipment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/equipment"] });
      setIsCreateOpen(false);
      toast({
        title: "تم إنشاء المعدة بنجاح",
        description: "تم إضافة المعدة الجديدة إلى النظام",
      });
    },
    onError: () => {
      toast({
        title: "خطأ في إنشاء المعدة",
        description: "حدث خطأ أثناء إضافة المعدة",
        variant: "destructive",
      });
    },
  });

  const filteredEquipment = Array.isArray(equipment) ? equipment.filter((item: any) => {
    const matchesSearch = item.nameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  }) : [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <GlassmorphicCard>
        <GlassHeader
          title="Equipment Management"
          titleAr="إدارة المعدات"
          description="Manage construction equipment and assets"
          descriptionAr="إدارة معدات وأصول البناء"
          action={
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">إضافة معدة</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-right">إضافة معدة جديدة</DialogTitle>
                </DialogHeader>
                <ArabicForm
                  fields={equipmentFormFields}
                  schema={insertEquipmentSchema}
                  onSubmit={createEquipmentMutation.mutate}
                  submitText="Create Equipment"
                  submitTextAr="إنشاء معدة"
                  isLoading={createEquipmentMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          }
        />
        
        <GlassContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="البحث في المعدات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-right"
            >
              <option value="all">جميع الحالات</option>
              <option value="active">نشط</option>
              <option value="maintenance">تحت الصيانة</option>
              <option value="repair">يحتاج إصلاح</option>
              <option value="inactive">غير نشط</option>
            </select>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-right"
            >
              <option value="all">جميع الأنواع</option>
              <option value="excavator">حفارة</option>
              <option value="crane">رافعة</option>
              <option value="bulldozer">جرافة</option>
              <option value="mixer">خلاطة خرسانة</option>
              <option value="truck">شاحنة</option>
              <option value="generator">مولد كهرباء</option>
              <option value="compressor">ضاغط هواء</option>
              <option value="drill">مثقاب</option>
              <option value="other">أخرى</option>
            </select>
          </div>

          {filteredEquipment?.length === 0 ? (
            <div className="text-center py-12">
              <Wrench className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد معدات</h3>
              <p className="text-gray-600 mb-4">ابدأ بإضافة أول معدة لشركتك</p>
              <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                إضافة معدة جديدة
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEquipment?.map((item: any) => (
                <GlassmorphicCard key={item.id} className="hover:shadow-lg transition-all duration-200">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(item.status)}
                        <Badge className={getStatusColor(item.status)}>
                          {getStatusText(item.status)}
                        </Badge>
                      </div>
                      <Wrench className="h-5 w-5 text-gray-400" />
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-right">
                          {item.nameAr || item.name}
                        </h3>
                        {item.name && item.nameAr && (
                          <p className="text-sm text-gray-600">{item.name}</p>
                        )}
                      </div>
                      
                      {item.serialNumber && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">الرقم التسلسلي: </span>
                          {item.serialNumber}
                        </div>
                      )}
                      
                      {item.location && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">الموقع: </span>
                          {item.location}
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center pt-3 border-t">
                        <div className="text-sm">
                          {item.currentValue && (
                            <div className="font-medium text-primary">
                              {formatCurrency(item.currentValue)}
                            </div>
                          )}
                          {item.purchasePrice && (
                            <div className="text-xs text-gray-500">
                              شراء: {formatCurrency(item.purchasePrice)}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatArabicDate(item.createdAt)}
                        </div>
                      </div>
                    </div>
                    
                    {item.notes && (
                      <div className="mt-4 pt-3 border-t">
                        <p className="text-sm text-gray-600 text-right">{item.notes}</p>
                      </div>
                    )}
                  </div>
                </GlassmorphicCard>
              ))}
            </div>
          )}
        </GlassContent>
      </GlassmorphicCard>
    </div>
  );
}