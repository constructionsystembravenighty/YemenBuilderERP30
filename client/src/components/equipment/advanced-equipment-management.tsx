import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Wrench, 
  Calendar, 
  MapPin, 
  Truck, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Battery,
  Gauge,
  Settings,
  Filter,
  Search,
  Download,
  Plus,
  Edit,
  Eye,
  BarChart3,
  PieChart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatCurrency } from '@/lib/currency';
import { format, addDays, differenceInDays } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Equipment {
  id: string;
  name: string;
  nameAr: string;
  type: string;
  typeAr: string;
  model: string;
  serialNumber: string;
  status: 'active' | 'maintenance' | 'repair' | 'idle' | 'retired';
  location: string;
  locationAr: string;
  assignedProject?: {
    id: string;
    name: string;
    nameAr: string;
  };
  assignedOperator?: {
    id: string;
    name: string;
    nameAr: string;
    licenseExpiry?: Date;
  };
  purchaseDate: Date;
  purchasePrice: number;
  currentValue: number;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  operatingHours: number;
  fuelLevel?: number;
  efficiency: number;
  utilization: number;
  maintenance: {
    totalCost: number;
    frequency: number;
    lastService: Date;
    nextService: Date;
    serviceHistory: MaintenanceRecord[];
    predictedFailures: string[];
  };
  specifications: {
    capacity?: string;
    power?: string;
    weight?: string;
    dimensions?: string;
    fuelType?: string;
  };
  documents: {
    manual?: string;
    warranty?: string;
    insurance?: string;
    registration?: string;
  };
}

interface MaintenanceRecord {
  id: string;
  date: Date;
  type: 'routine' | 'repair' | 'inspection' | 'upgrade';
  description: string;
  descriptionAr: string;
  cost: number;
  technician: string;
  technicianAr: string;
  partsReplaced: string[];
  hoursSpent: number;
  status: 'completed' | 'ongoing' | 'scheduled';
}

interface EquipmentAlert {
  id: string;
  equipmentId: string;
  type: 'maintenance_due' | 'fuel_low' | 'repair_needed' | 'efficiency_drop' | 'license_expiry';
  priority: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  messageAr: string;
  createdAt: Date;
  acknowledged: boolean;
  dueDate?: Date;
}

// Sample data for demonstration
const sampleEquipment: Equipment[] = [
  {
    id: '1',
    name: 'Excavator CAT 320D',
    nameAr: 'حفارة كاتربيلر 320D',
    type: 'Heavy Machinery',
    typeAr: 'آلات ثقيلة',
    model: 'CAT 320D',
    serialNumber: 'CAT320D2024001',
    status: 'active',
    location: 'Site A - Modern Housing Complex',
    locationAr: 'الموقع أ - مجمع الإسكان الحديث',
    assignedProject: {
      id: '1',
      name: 'Modern Housing Complex',
      nameAr: 'مجمع الإسكان الحديث',
    },
    assignedOperator: {
      id: '1',
      name: 'Ali Hassan',
      nameAr: 'علي حسن عبدالله',
      licenseExpiry: new Date('2025-08-15'),
    },
    purchaseDate: new Date('2024-06-15'),
    purchasePrice: 180000,
    currentValue: 165000,
    lastMaintenanceDate: new Date('2024-12-15'),
    nextMaintenanceDate: new Date('2025-01-15'),
    operatingHours: 1250,
    fuelLevel: 75,
    efficiency: 88,
    utilization: 92,
    maintenance: {
      totalCost: 15000,
      frequency: 250, // hours between maintenance
      lastService: new Date('2024-12-15'),
      nextService: new Date('2025-01-15'),
      serviceHistory: [],
      predictedFailures: ['Hydraulic pump seal', 'Track chain wear'],
    },
    specifications: {
      capacity: '1.2 m³',
      power: '122 kW',
      weight: '20,500 kg',
      dimensions: '9.5m x 2.8m x 3.1m',
      fuelType: 'Diesel',
    },
    documents: {
      manual: 'cat_320d_manual.pdf',
      warranty: 'warranty_cat_320d.pdf',
      insurance: 'insurance_policy.pdf',
      registration: 'equipment_registration.pdf',
    },
  },
  {
    id: '2',
    name: 'Concrete Mixer ZOOMLION',
    nameAr: 'خلاطة أسمنت زوم ليون',
    type: 'Construction Equipment',
    typeAr: 'معدات البناء',
    model: 'ZOOMLION QY50V',
    serialNumber: 'ZL2024002',
    status: 'maintenance',
    location: 'Workshop - Main Yard',
    locationAr: 'الورشة - الساحة الرئيسية',
    purchaseDate: new Date('2024-07-20'),
    purchasePrice: 95000,
    currentValue: 88000,
    lastMaintenanceDate: new Date('2024-12-20'),
    nextMaintenanceDate: new Date('2025-01-20'),
    operatingHours: 890,
    efficiency: 78,
    utilization: 65,
    maintenance: {
      totalCost: 8500,
      frequency: 200,
      lastService: new Date('2024-12-20'),
      nextService: new Date('2025-01-20'),
      serviceHistory: [],
      predictedFailures: ['Mixing blade wear', 'Engine oil change due'],
    },
    specifications: {
      capacity: '8 m³',
      power: '180 kW',
      weight: '12,000 kg',
      fuelType: 'Diesel',
    },
    documents: {
      manual: 'zoomlion_manual.pdf',
      warranty: 'warranty_zoomlion.pdf',
    },
  },
  {
    id: '3',
    name: 'Tower Crane POTAIN',
    nameAr: 'رافعة برجية بوتين',
    type: 'Lifting Equipment',
    typeAr: 'معدات الرفع',
    model: 'POTAIN MCT85',
    serialNumber: 'PT2024003',
    status: 'active',
    location: 'Site B - Commercial Building',
    locationAr: 'الموقع ب - المبنى التجاري',
    assignedProject: {
      id: '2',
      name: 'Commercial Administrative Building',
      nameAr: 'مبنى إداري تجاري',
    },
    assignedOperator: {
      id: '2',
      name: 'Omar Al-Sharif',
      nameAr: 'عمر محمد الشريف',
      licenseExpiry: new Date('2025-11-30'),
    },
    purchaseDate: new Date('2024-05-10'),
    purchasePrice: 320000,
    currentValue: 295000,
    lastMaintenanceDate: new Date('2024-11-10'),
    nextMaintenanceDate: new Date('2025-02-10'),
    operatingHours: 1580,
    efficiency: 95,
    utilization: 87,
    maintenance: {
      totalCost: 25000,
      frequency: 300,
      lastService: new Date('2024-11-10'),
      nextService: new Date('2025-02-10'),
      serviceHistory: [],
      predictedFailures: ['Cable wear inspection due'],
    },
    specifications: {
      capacity: '5 tons',
      reach: '60m',
      height: '150m',
      power: '45 kW',
    },
    documents: {
      manual: 'potain_manual.pdf',
      warranty: 'warranty_potain.pdf',
      insurance: 'crane_insurance.pdf',
    },
  },
  {
    id: '4',
    name: 'Transport Truck HOWO',
    nameAr: 'شاحنة نقل هووو',
    type: 'Transport',
    typeAr: 'وسائل النقل',
    model: 'HOWO 6x4',
    serialNumber: 'HW2024004',
    status: 'idle',
    location: 'Main Yard - Parking',
    locationAr: 'الساحة الرئيسية - المواقف',
    purchaseDate: new Date('2024-08-01'),
    purchasePrice: 65000,
    currentValue: 60000,
    lastMaintenanceDate: new Date('2024-12-01'),
    nextMaintenanceDate: new Date('2025-03-01'),
    operatingHours: 750,
    fuelLevel: 45,
    efficiency: 82,
    utilization: 70,
    maintenance: {
      totalCost: 5500,
      frequency: 150,
      lastService: new Date('2024-12-01'),
      nextService: new Date('2025-03-01'),
      serviceHistory: [],
      predictedFailures: ['Tire replacement due', 'Brake pad check'],
    },
    specifications: {
      capacity: '25 tons',
      power: '371 kW',
      fuelType: 'Diesel',
    },
    documents: {
      manual: 'howo_manual.pdf',
      registration: 'truck_registration.pdf',
    },
  },
];

const sampleAlerts: EquipmentAlert[] = [
  {
    id: '1',
    equipmentId: '1',
    type: 'maintenance_due',
    priority: 'high',
    message: 'Scheduled maintenance due in 3 days',
    messageAr: 'صيانة دورية مستحقة خلال 3 أيام',
    createdAt: new Date('2025-01-12'),
    acknowledged: false,
    dueDate: new Date('2025-01-15'),
  },
  {
    id: '2',
    equipmentId: '4',
    type: 'fuel_low',
    priority: 'medium',
    message: 'Fuel level below 50%',
    messageAr: 'مستوى الوقود أقل من 50%',
    createdAt: new Date('2025-01-10'),
    acknowledged: false,
  },
  {
    id: '3',
    equipmentId: '2',
    type: 'efficiency_drop',
    priority: 'medium',
    message: 'Equipment efficiency dropped below 80%',
    messageAr: 'كفاءة المعدة انخفضت تحت 80%',
    createdAt: new Date('2025-01-08'),
    acknowledged: true,
  },
];

const statusColors = {
  active: 'bg-green-100 text-green-800 border-green-200',
  maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  repair: 'bg-red-100 text-red-800 border-red-200',
  idle: 'bg-gray-100 text-gray-800 border-gray-200',
  retired: 'bg-purple-100 text-purple-800 border-purple-200',
};

const statusLabelsAr = {
  active: 'نشط',
  maintenance: 'صيانة',
  repair: 'إصلاح',
  idle: 'خامل',
  retired: 'متقاعد',
};

const priorityColors = {
  low: 'border-l-green-400',
  medium: 'border-l-yellow-400',
  high: 'border-l-orange-400',
  critical: 'border-l-red-400',
};

export function AdvancedEquipmentManagement({ companyId }: { companyId: number }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  // In a real application, these would fetch from the API
  const { data: equipment = sampleEquipment, isLoading } = useQuery({
    queryKey: [`/api/equipment?companyId=${companyId}`],
    queryFn: () => Promise.resolve(sampleEquipment),
  });

  const { data: alerts = sampleAlerts } = useQuery({
    queryKey: [`/api/equipment/alerts?companyId=${companyId}`],
    queryFn: () => Promise.resolve(sampleAlerts),
  });

  const filteredEquipment = equipment.filter((eq) => {
    const matchesSearch = eq.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         eq.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || eq.status === selectedStatus;
    const matchesType = selectedType === 'all' || eq.type === selectedType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const equipmentTypes = [...new Set(equipment.map(eq => eq.type))];
  
  // Calculate summary statistics
  const totalEquipment = equipment.length;
  const activeEquipment = equipment.filter(eq => eq.status === 'active').length;
  const maintenanceEquipment = equipment.filter(eq => eq.status === 'maintenance' || eq.status === 'repair').length;
  const avgUtilization = equipment.reduce((sum, eq) => sum + eq.utilization, 0) / equipment.length;
  const totalValue = equipment.reduce((sum, eq) => sum + eq.currentValue, 0);
  const monthlyMaintenanceCost = equipment.reduce((sum, eq) => sum + eq.maintenance.totalCost, 0) / 12;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
              <Settings className="h-8 w-8" />
              إدارة المعدات المتقدمة
            </h1>
            <p className="text-gray-600 mt-1">نظام شامل لإدارة ومراقبة المعدات والآلات</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              إضافة معدة
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">إجمالي المعدات</p>
                  <p className="text-2xl font-bold text-blue-900">{totalEquipment}</p>
                </div>
                <Settings className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">المعدات النشطة</p>
                  <p className="text-2xl font-bold text-green-900">{activeEquipment}</p>
                  <p className="text-xs text-green-600">
                    {((activeEquipment / totalEquipment) * 100).toFixed(0)}% من الإجمالي
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">تحت الصيانة</p>
                  <p className="text-2xl font-bold text-yellow-900">{maintenanceEquipment}</p>
                  <p className="text-xs text-yellow-600">
                    {((maintenanceEquipment / totalEquipment) * 100).toFixed(0)}% من الإجمالي
                  </p>
                </div>
                <Wrench className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">متوسط الاستخدام</p>
                  <p className="text-2xl font-bold text-purple-900">{avgUtilization.toFixed(0)}%</p>
                  <div className="mt-1">
                    <Progress value={avgUtilization} className="h-2" />
                  </div>
                </div>
                <Activity className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">القيمة الإجمالية</p>
                  <p className="text-xl font-bold text-orange-900">
                    {formatCurrency(totalValue, 'YER')}
                  </p>
                  <p className="text-xs text-orange-600">
                    صيانة شهرية: {formatCurrency(monthlyMaintenanceCost, 'YER')}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts Section */}
        {alerts.filter(alert => !alert.acknowledged).length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="h-5 w-5" />
                تنبيهات المعدات ({alerts.filter(alert => !alert.acknowledged).length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {alerts.filter(alert => !alert.acknowledged).slice(0, 3).map((alert) => (
                  <div 
                    key={alert.id} 
                    className={cn(
                      "flex items-center justify-between p-3 bg-white rounded-lg border-l-4",
                      priorityColors[alert.priority]
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        alert.priority === 'critical' && "bg-red-500",
                        alert.priority === 'high' && "bg-orange-500",
                        alert.priority === 'medium' && "bg-yellow-500",
                        alert.priority === 'low' && "bg-green-500"
                      )} />
                      <div>
                        <p className="font-medium text-sm">{alert.messageAr}</p>
                        <p className="text-xs text-gray-600">
                          {equipment.find(eq => eq.id === alert.equipmentId)?.nameAr}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {alert.dueDate && (
                        <span className="text-xs text-gray-500">
                          {format(alert.dueDate, 'dd/MM/yyyy', { locale: ar })}
                        </span>
                      )}
                      <Button size="sm" variant="outline">
                        إجراء
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="list" className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <TabsList>
              <TabsTrigger value="list">قائمة المعدات</TabsTrigger>
              <TabsTrigger value="maintenance">جدولة الصيانة</TabsTrigger>
              <TabsTrigger value="analytics">التحليلات</TabsTrigger>
              <TabsTrigger value="tracking">التتبع المباشر</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="البحث عن معدة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-8 w-48"
                />
              </div>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  {Object.entries(statusLabelsAr).map(([status, label]) => (
                    <SelectItem key={status} value={status}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  {equipmentTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {equipment.find(eq => eq.type === type)?.typeAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="list" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredEquipment.map((eq) => (
                <Card key={eq.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{eq.nameAr}</CardTitle>
                        <p className="text-sm text-gray-600 truncate">{eq.model}</p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs", statusColors[eq.status])}
                      >
                        {statusLabelsAr[eq.status]}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Location and Assignment */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="truncate">{eq.locationAr}</span>
                      </div>
                      {eq.assignedProject && (
                        <div className="flex items-center gap-2 text-sm">
                          <Truck className="h-4 w-4 text-gray-500" />
                          <span className="truncate">{eq.assignedProject.nameAr}</span>
                        </div>
                      )}
                      {eq.assignedOperator && (
                        <div className="flex items-center gap-2 text-sm">
                          <Avatar className="h-4 w-4">
                            <AvatarFallback className="text-xs">
                              {eq.assignedOperator.nameAr.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate">{eq.assignedOperator.nameAr}</span>
                        </div>
                      )}
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">الكفاءة</span>
                          <span className="font-medium">{eq.efficiency}%</span>
                        </div>
                        <Progress value={eq.efficiency} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">الاستخدام</span>
                          <span className="font-medium">{eq.utilization}%</span>
                        </div>
                        <Progress value={eq.utilization} className="h-2" />
                      </div>
                    </div>

                    {/* Fuel Level (if applicable) */}
                    {eq.fuelLevel && (
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600 flex items-center gap-1">
                            <Battery className="h-3 w-3" />
                            مستوى الوقود
                          </span>
                          <span className="font-medium">{eq.fuelLevel}%</span>
                        </div>
                        <Progress 
                          value={eq.fuelLevel} 
                          className={cn(
                            "h-2",
                            eq.fuelLevel < 25 && "[&>div]:bg-red-500",
                            eq.fuelLevel < 50 && eq.fuelLevel >= 25 && "[&>div]:bg-yellow-500"
                          )}
                        />
                      </div>
                    )}

                    {/* Maintenance Info */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">الصيانة القادمة</span>
                      <span className="font-medium">
                        {eq.nextMaintenanceDate && 
                          format(eq.nextMaintenanceDate, 'dd/MM/yyyy', { locale: ar })
                        }
                      </span>
                    </div>

                    {/* Operating Hours */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">ساعات التشغيل</span>
                      <span className="font-medium">{eq.operatingHours.toLocaleString()}</span>
                    </div>

                    {/* Value and Cost */}
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">القيمة الحالية</span>
                        <span className="font-medium">{formatCurrency(eq.currentValue, 'YER')}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-gray-600">تكلفة الصيانة</span>
                        <span className="font-medium">{formatCurrency(eq.maintenance.totalCost, 'YER')}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="h-3 w-3 ml-1" />
                        عرض
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="h-3 w-3 ml-1" />
                        تعديل
                      </Button>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Wrench className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>جدولة صيانة</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  جدولة الصيانة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {equipment.filter(eq => eq.nextMaintenanceDate).map((eq) => (
                    <div key={eq.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-medium">{eq.nameAr}</h3>
                          <p className="text-sm text-gray-600">{eq.model}</p>
                        </div>
                        <Badge variant="outline" className={cn(statusColors[eq.status])}>
                          {statusLabelsAr[eq.status]}
                        </Badge>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium">
                          {eq.nextMaintenanceDate && 
                            format(eq.nextMaintenanceDate, 'dd/MM/yyyy', { locale: ar })
                          }
                        </p>
                        <p className="text-xs text-gray-600">
                          {eq.nextMaintenanceDate && 
                            `بعد ${differenceInDays(eq.nextMaintenanceDate, new Date())} يوم`
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    توزيع المعدات حسب الحالة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(statusLabelsAr).map(([status, label]) => {
                      const count = equipment.filter(eq => eq.status === status).length;
                      const percentage = (count / equipment.length) * 100;
                      return (
                        <div key={status} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-3 h-3 rounded-full", 
                              status === 'active' && "bg-green-500",
                              status === 'maintenance' && "bg-yellow-500",
                              status === 'repair' && "bg-red-500",
                              status === 'idle' && "bg-gray-500",
                              status === 'retired' && "bg-purple-500"
                            )} />
                            <span className="text-sm">{label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={percentage} className="w-20 h-2" />
                            <span className="text-sm font-medium">{count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    كفاءة المعدات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {equipment.slice(0, 5).map((eq) => (
                      <div key={eq.id} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="truncate">{eq.nameAr}</span>
                          <span className="font-medium">{eq.efficiency}%</span>
                        </div>
                        <Progress value={eq.efficiency} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tracking" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  التتبع المباشر للمعدات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">التتبع المباشر</h3>
                  <p className="text-gray-600 mb-4">
                    عرض مواقع المعدات في الوقت الفعلي على الخريطة
                  </p>
                  <Button>
                    تفعيل التتبع المباشر
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}