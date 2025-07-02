import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Plus, 
  Search, 
  Filter, 
  Warehouse as WarehouseIcon, 
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  User,
  BarChart3,
  Settings,
  Truck,
  Cog,
  Wrench,
  Calendar
} from "lucide-react";
import { GlassmorphicCard, GlassContent, GlassHeader } from "@/components/glassmorphic-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ArabicForm } from "@/components/arabic-form";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/currency";
import { formatArabicDate } from "@/lib/arabic-utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertWarehouseSchema, insertEquipmentSchema } from "@shared/schema";
import { z } from "zod";

const createWarehouseFields = [
  { name: "name", label: "Warehouse Name", labelAr: "اسم المخزن", type: "text" as const, required: true },
  { name: "nameAr", label: "Arabic Name", labelAr: "الاسم بالعربية", type: "text" as const, required: true },
  { name: "location", label: "Location", labelAr: "الموقع", type: "text" as const },
  { name: "locationAr", label: "Arabic Location", labelAr: "الموقع بالعربية", type: "text" as const },
  { name: "capacity", label: "Capacity", labelAr: "السعة", type: "number" as const },
  {
    name: "status",
    label: "Status",
    labelAr: "الحالة",
    type: "select" as const,
    options: [
      { value: "active", label: "Active", labelAr: "نشط" },
      { value: "inactive", label: "Inactive", labelAr: "غير نشط" },
      { value: "maintenance", label: "Maintenance", labelAr: "صيانة" },
    ]
  },
];

const createEquipmentFields = [
  { name: "name", label: "Equipment Name", labelAr: "اسم المعدة", type: "text" as const, required: true },
  { name: "nameAr", label: "Arabic Name", labelAr: "الاسم بالعربية", type: "text" as const, required: true },
  { name: "type", label: "Type", labelAr: "النوع", type: "text" as const, required: true },
  { name: "typeAr", label: "Arabic Type", labelAr: "النوع بالعربية", type: "text" as const, required: true },
  { name: "model", label: "Model", labelAr: "الطراز", type: "text" as const },
  { name: "serialNumber", label: "Serial Number", labelAr: "الرقم التسلسلي", type: "text" as const },
  {
    name: "status",
    label: "Status",
    labelAr: "الحالة",
    type: "select" as const,
    options: [
      { value: "available", label: "Available", labelAr: "متاح" },
      { value: "in_use", label: "In Use", labelAr: "قيد الاستخدام" },
      { value: "maintenance", label: "Maintenance", labelAr: "صيانة" },
      { value: "offline", label: "Offline", labelAr: "معطل" },
    ]
  },
  { name: "location", label: "Location", labelAr: "الموقع", type: "text" as const },
  { name: "locationAr", label: "Arabic Location", labelAr: "الموقع بالعربية", type: "text" as const },
  { name: "purchasePrice", label: "Purchase Price", labelAr: "سعر الشراء", type: "number" as const },
  { name: "purchaseDate", label: "Purchase Date", labelAr: "تاريخ الشراء", type: "date" as const },
  { name: "lastMaintenanceDate", label: "Last Maintenance", labelAr: "آخر صيانة", type: "date" as const },
  { name: "nextMaintenanceDate", label: "Next Maintenance", labelAr: "الصيانة القادمة", type: "date" as const },
];

const warehouseFormSchema = insertWarehouseSchema.extend({
  companyId: z.number().default(1),
});

const equipmentFormSchema = insertEquipmentSchema.extend({
  companyId: z.number().default(1),
});

export default function Warehouse() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isWarehouseCreateOpen, setIsWarehouseCreateOpen] = useState(false);
  const [isEquipmentCreateOpen, setIsEquipmentCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("warehouses");
  const { toast } = useToast();

  const { data: warehouses, isLoading: warehousesLoading } = useQuery({
    queryKey: ["/api/warehouses?companyId=1"],
  });

  const { data: equipment, isLoading: equipmentLoading } = useQuery({
    queryKey: ["/api/equipment?companyId=1"],
  });

  const createWarehouseMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/warehouses", {
        ...data,
        companyId: 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/warehouses"] });
      setIsWarehouseCreateOpen(false);
      toast({
        title: "تم إنشاء المخزن بنجاح",
        description: "تم إضافة المخزن الجديد إلى النظام",
      });
    },
    onError: () => {
      toast({
        title: "خطأ في إنشاء المخزن",
        description: "حدث خطأ أثناء إنشاء المخزن",
        variant: "destructive",
      });
    },
  });

  const createEquipmentMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/equipment", {
        ...data,
        companyId: 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/equipment"] });
      setIsEquipmentCreateOpen(false);
      toast({
        title: "تم إضافة المعدة بنجاح",
        description: "تم إضافة المعدة الجديدة إلى النظام",
      });
    },
    onError: () => {
      toast({
        title: "خطأ في إضافة المعدة",
        description: "حدث خطأ أثناء إضافة المعدة",
        variant: "destructive",
      });
    },
  });

  const filteredWarehouses = warehouses?.filter((warehouse: any) => {
    const matchesSearch = warehouse.nameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         warehouse.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || warehouse.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredEquipment = equipment?.filter((item: any) => {
    const matchesSearch = item.nameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.typeAr?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string, type: "warehouse" | "equipment" = "warehouse") => {
    const statusMaps = {
      warehouse: {
        active: { label: "نشط", className: "equipment-available" },
        inactive: { label: "غير نشط", className: "equipment-offline" },
        maintenance: { label: "صيانة", className: "equipment-maintenance" },
      },
      equipment: {
        available: { label: "متاح", className: "equipment-available" },
        in_use: { label: "قيد الاستخدام", className: "bg-blue-100 text-blue-800" },
        maintenance: { label: "صيانة", className: "equipment-maintenance" },
        offline: { label: "معطل", className: "equipment-offline" },
      }
    };
    
    const statusMap = statusMaps[type];
    const config = statusMap[status as keyof typeof statusMap] || statusMap.active || statusMap.available;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getEquipmentIcon = (type: string) => {
    const iconMap: Record<string, any> = {
      "شاحنات": Truck,
      "معدات حفر": Cog,
      "أدوات": Wrench,
      "vehicles": Truck,
      "machinery": Cog,
      "tools": Wrench,
    };
    
    const Icon = iconMap[type] || Package;
    return <Icon className="h-5 w-5" />;
  };

  if (warehousesLoading || equipmentLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalEquipment = equipment?.length || 0;
  const availableEquipment = equipment?.filter((item: any) => item.status === 'available').length || 0;
  const maintenanceEquipment = equipment?.filter((item: any) => item.status === 'maintenance').length || 0;
  const offlineEquipment = equipment?.filter((item: any) => item.status === 'offline').length || 0;

  const totalWarehouses = warehouses?.length || 0;
  const activeWarehouses = warehouses?.filter((w: any) => w.status === 'active').length || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">إدارة المخازن والمعدات</h1>
          <p className="text-gray-600">إدارة المخازن والمعدات وتتبع حالتها</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassmorphicCard floating className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">إجمالي المخازن</p>
              <p className="text-2xl font-bold text-primary">{totalWarehouses}</p>
              <p className="text-sm text-green-600">{activeWarehouses} نشط</p>
            </div>
            <div className="w-12 h-12 bg-primary bg-opacity-20 rounded-lg flex items-center justify-center">
              <WarehouseIcon className="h-6 w-6 text-primary" />
            </div>
          </div>
        </GlassmorphicCard>

        <GlassmorphicCard floating className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">إجمالي المعدات</p>
              <p className="text-2xl font-bold text-accent">{totalEquipment}</p>
              <p className="text-sm text-green-600">{availableEquipment} متاح</p>
            </div>
            <div className="w-12 h-12 bg-accent bg-opacity-20 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-accent" />
            </div>
          </div>
        </GlassmorphicCard>

        <GlassmorphicCard floating className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">تحت الصيانة</p>
              <p className="text-2xl font-bold text-yellow-600">{maintenanceEquipment}</p>
              <p className="text-sm text-gray-500">من {totalEquipment}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Settings className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </GlassmorphicCard>

        <GlassmorphicCard floating className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">معطل</p>
              <p className="text-2xl font-bold text-red-600">{offlineEquipment}</p>
              <p className="text-sm text-gray-500">يحتاج إصلاح</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </GlassmorphicCard>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="glass-card">
          <TabsTrigger value="warehouses">المخازن</TabsTrigger>
          <TabsTrigger value="equipment">المعدات</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
        </TabsList>

        <TabsContent value="warehouses" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-semibold text-charcoal-text">إدارة المخازن</h2>
            
            <Dialog open={isWarehouseCreateOpen} onOpenChange={setIsWarehouseCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-accent hover:bg-accent/90 text-white">
                  <Plus className="h-4 w-4 ml-2" />
                  مخزن جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card max-w-2xl">
                <DialogHeader>
                  <DialogTitle>إنشاء مخزن جديد</DialogTitle>
                </DialogHeader>
                <ArabicForm
                  fields={createWarehouseFields}
                  schema={warehouseFormSchema}
                  onSubmit={(data) => createWarehouseMutation.mutate(data)}
                  submitTextAr="إنشاء المخزن"
                  isLoading={createWarehouseMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Warehouses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredWarehouses?.map((warehouse: any) => (
              <GlassmorphicCard key={warehouse.id} floating hover className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-reverse space-x-3">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                      <WarehouseIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-charcoal-text">
                        {warehouse.nameAr || warehouse.name}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="h-3 w-3" />
                        <span>{warehouse.locationAr || warehouse.location}</span>
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(warehouse.status, "warehouse")}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">السعة الإجمالية</span>
                    <span className="font-medium">{warehouse.capacity || 'غير محدد'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">المخزون الحالي</span>
                    <span className="font-medium">{warehouse.currentStock || 0}</span>
                  </div>
                  
                  {warehouse.capacity && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">معدل الاستخدام</span>
                        <span className="font-medium">
                          {((warehouse.currentStock / warehouse.capacity) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress 
                        value={(warehouse.currentStock / warehouse.capacity) * 100} 
                        className="h-2"
                      />
                    </div>
                  )}
                </div>
              </GlassmorphicCard>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="equipment" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-semibold text-charcoal-text">إدارة المعدات</h2>
            
            <Dialog open={isEquipmentCreateOpen} onOpenChange={setIsEquipmentCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  <Plus className="h-4 w-4 ml-2" />
                  معدة جديدة
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>إضافة معدة جديدة</DialogTitle>
                </DialogHeader>
                <ArabicForm
                  fields={createEquipmentFields}
                  schema={equipmentFormSchema}
                  onSubmit={(data) => createEquipmentMutation.mutate(data)}
                  submitTextAr="إضافة المعدة"
                  isLoading={createEquipmentMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <GlassmorphicCard className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="البحث في المعدات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="glass-input pr-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="glass-input w-40">
                    <SelectValue placeholder="تصفية الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="available">متاح</SelectItem>
                    <SelectItem value="in_use">قيد الاستخدام</SelectItem>
                    <SelectItem value="maintenance">صيانة</SelectItem>
                    <SelectItem value="offline">معطل</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" className="glass-input">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </GlassmorphicCard>

          {/* Equipment List */}
          <div className="space-y-4">
            {filteredEquipment?.map((item: any) => (
              <GlassmorphicCard key={item.id} floating hover className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-reverse space-x-4">
                    <div className="w-12 h-12 glass-card rounded-lg flex items-center justify-center">
                      {getEquipmentIcon(item.typeAr || item.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-charcoal-text">
                          {item.nameAr || item.name}
                        </h4>
                        {getStatusBadge(item.status, "equipment")}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          <span>{item.typeAr || item.type}</span>
                        </div>
                        {item.model && (
                          <div className="flex items-center gap-1">
                            <span>طراز: {item.model}</span>
                          </div>
                        )}
                        {item.locationAr && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{item.locationAr || item.location}</span>
                          </div>
                        )}
                        {item.nextMaintenanceDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>صيانة: {formatArabicDate(item.nextMaintenanceDate, "short")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {item.purchasePrice && (
                      <p className="font-semibold text-primary mb-1">
                        {formatCurrency(item.purchasePrice)}
                      </p>
                    )}
                    {item.purchaseDate && (
                      <p className="text-sm text-gray-500">
                        {formatArabicDate(item.purchaseDate, "short")}
                      </p>
                    )}
                  </div>
                </div>
              </GlassmorphicCard>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Equipment Status Distribution */}
            <GlassmorphicCard floating className="p-6">
              <GlassHeader
                title="Equipment Status"
                titleAr="حالة المعدات"
                description="توزيع حالة المعدات"
              />
              
              <GlassContent>
                <div className="space-y-4">
                  {[
                    { status: "available", label: "متاح", count: availableEquipment, color: "bg-green-500" },
                    { status: "in_use", label: "قيد الاستخدام", count: equipment?.filter((item: any) => item.status === 'in_use').length || 0, color: "bg-blue-500" },
                    { status: "maintenance", label: "صيانة", count: maintenanceEquipment, color: "bg-yellow-500" },
                    { status: "offline", label: "معطل", count: offlineEquipment, color: "bg-red-500" },
                  ].map((item) => {
                    const percentage = totalEquipment > 0 ? (item.count / totalEquipment) * 100 : 0;
                    
                    return (
                      <div key={item.status} className="glass-card p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${item.color}`} />
                            <span className="font-medium text-charcoal-text">{item.label}</span>
                          </div>
                          <span className="text-lg font-bold text-primary">{item.count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${item.color}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-gray-500">{percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassContent>
            </GlassmorphicCard>

            {/* Maintenance Schedule */}
            <GlassmorphicCard floating className="p-6">
              <GlassHeader
                title="Maintenance Schedule"
                titleAr="جدول الصيانة"
                description="المعدات المقررة للصيانة"
              />
              
              <GlassContent>
                <div className="space-y-3">
                  {equipment?.filter((item: any) => item.nextMaintenanceDate)
                    .sort((a: any, b: any) => new Date(a.nextMaintenanceDate).getTime() - new Date(b.nextMaintenanceDate).getTime())
                    .slice(0, 5)
                    .map((item: any) => {
                      const maintenanceDate = new Date(item.nextMaintenanceDate);
                      const isOverdue = maintenanceDate < new Date();
                      const isUpcoming = maintenanceDate <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                      
                      return (
                        <div key={item.id} className="glass-card p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-reverse space-x-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                isOverdue ? 'bg-red-100' : isUpcoming ? 'bg-yellow-100' : 'bg-green-100'
                              }`}>
                                <Calendar className={`h-4 w-4 ${
                                  isOverdue ? 'text-red-600' : isUpcoming ? 'text-yellow-600' : 'text-green-600'
                                }`} />
                              </div>
                              <div>
                                <p className="font-medium text-charcoal-text text-sm">
                                  {item.nameAr || item.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {item.typeAr || item.type}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`text-sm font-medium ${
                                isOverdue ? 'text-red-600' : isUpcoming ? 'text-yellow-600' : 'text-green-600'
                              }`}>
                                {formatArabicDate(item.nextMaintenanceDate, "short")}
                              </p>
                              <p className="text-xs text-gray-500">
                                {isOverdue ? 'متأخر' : isUpcoming ? 'قريب' : 'مجدول'}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </GlassContent>
            </GlassmorphicCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
