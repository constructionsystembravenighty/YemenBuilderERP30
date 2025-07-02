import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin,
  Cloud,
  Thermometer,
  Wind,
  Droplets,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Camera,
  FileText,
  Shield,
  Truck,
  Wrench,
  Calculator
} from "lucide-react";
import { GlassmorphicCard, GlassContent, GlassHeader } from "./glassmorphic-card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { formatArabicDate, toArabicNumerals, getArabicInitials } from "@/lib/arabic-utils";
import { formatCurrency } from "@/lib/currency";

interface SiteInfo {
  id: string;
  name: string;
  nameAr: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    addressAr: string;
  };
  manager: {
    name: string;
    nameAr: string;
    phone: string;
  };
  status: 'active' | 'inactive' | 'maintenance';
  startDate: Date;
  expectedCompletion: Date;
  progress: number;
}

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  conditions: string;
  conditionsAr: string;
  forecast: {
    day: string;
    temp: number;
    conditions: string;
    conditionsAr: string;
  }[];
}

interface SafetyRecord {
  id: string;
  type: 'incident' | 'inspection' | 'training';
  title: string;
  titleAr: string;
  date: Date;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'closed' | 'investigating';
  reporter: string;
  reporterAr: string;
}

interface MaterialCalculation {
  id: string;
  name: string;
  nameAr: string;
  quantity: number;
  unit: string;
  unitAr: string;
  unitCost: number;
  totalCost: number;
  supplier?: string;
  supplierAr?: string;
}

interface SiteManagementProps {
  siteId: string;
  title?: string;
  titleAr?: string;
}

export function SiteManagement({ siteId, title, titleAr }: SiteManagementProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [materialCalculator, setMaterialCalculator] = useState<Partial<MaterialCalculation>>({});

  // Mock site data - replace with actual API calls
  const siteInfo: SiteInfo = {
    id: siteId,
    name: "Downtown Commercial Complex",
    nameAr: "مجمع تجاري وسط المدينة",
    location: {
      lat: 15.3694,
      lng: 44.1910,
      address: "Al-Zubairi Street, Sanaa",
      addressAr: "شارع الزبيري، صنعاء"
    },
    manager: {
      name: "Ahmed Al-Yamani",
      nameAr: "أحمد اليماني",
      phone: "+967 77 123 4567"
    },
    status: 'active',
    startDate: new Date('2024-01-15'),
    expectedCompletion: new Date('2024-12-30'),
    progress: 65
  };

  // Mock weather data
  const weatherData: WeatherData = {
    temperature: 28,
    humidity: 45,
    windSpeed: 12,
    conditions: "Partly Cloudy",
    conditionsAr: "غائم جزئياً",
    forecast: [
      { day: "غداً", temp: 30, conditions: "Sunny", conditionsAr: "مشمس" },
      { day: "بعد غد", temp: 27, conditions: "Cloudy", conditionsAr: "غائم" },
      { day: "الجمعة", temp: 25, conditions: "Rainy", conditionsAr: "ممطر" }
    ]
  };

  // Mock safety records
  const safetyRecords: SafetyRecord[] = [
    {
      id: "1",
      type: 'inspection',
      title: "Weekly Safety Inspection",
      titleAr: "تفتيش السلامة الأسبوعي",
      date: new Date(),
      severity: 'low',
      status: 'closed',
      reporter: "Safety Officer",
      reporterAr: "ضابط السلامة"
    },
    {
      id: "2",
      type: 'incident',
      title: "Minor Equipment Malfunction",
      titleAr: "عطل بسيط في المعدات",
      date: new Date('2024-01-10'),
      severity: 'medium',
      status: 'investigating',
      reporter: "Site Supervisor",
      reporterAr: "مشرف الموقع"
    }
  ];

  const handleMaterialCalculation = () => {
    if (materialCalculator.quantity && materialCalculator.unitCost) {
      const totalCost = materialCalculator.quantity * materialCalculator.unitCost;
      setMaterialCalculator(prev => ({ ...prev, totalCost }));
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'maintenance': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <GlassmorphicCard>
      <GlassHeader
        title={title || "Site Management"}
        titleAr={titleAr || "إدارة الموقع"}
        description={siteInfo.nameAr}
      />
      
      <GlassContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="weather">الطقس</TabsTrigger>
            <TabsTrigger value="safety">السلامة</TabsTrigger>
            <TabsTrigger value="materials">المواد</TabsTrigger>
            <TabsTrigger value="reports">التقارير</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Site Status */}
              <GlassmorphicCard className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">حالة الموقع</h3>
                  <Badge className={`${getStatusColor(siteInfo.status)} text-white`}>
                    {siteInfo.status === 'active' ? 'نشط' : 
                     siteInfo.status === 'maintenance' ? 'صيانة' : 'غير نشط'}
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{siteInfo.location.addressAr}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{siteInfo.manager.nameAr}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {formatArabicDate(siteInfo.startDate, 'short')} - {formatArabicDate(siteInfo.expectedCompletion, 'short')}
                    </span>
                  </div>
                </div>
              </GlassmorphicCard>

              {/* Progress */}
              <GlassmorphicCard className="p-4">
                <h3 className="font-semibold mb-4">تقدم المشروع</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">النسبة المكتملة</span>
                    <span className="font-bold">{toArabicNumerals(siteInfo.progress.toString())}%</span>
                  </div>
                  <Progress value={siteInfo.progress} className="w-full" />
                  <div className="text-xs text-gray-600">
                    متوقع الانتهاء: {formatArabicDate(siteInfo.expectedCompletion, 'long')}
                  </div>
                </div>
              </GlassmorphicCard>

              {/* Quick Stats */}
              <GlassmorphicCard className="p-4">
                <h3 className="font-semibold mb-4">إحصائيات سريعة</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="text-lg font-bold text-blue-600">١٥</div>
                    <div className="text-xs text-gray-600">عامل</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="text-lg font-bold text-green-600">٨</div>
                    <div className="text-xs text-gray-600">معدات</div>
                  </div>
                  <div className="text-center p-2 bg-yellow-50 rounded">
                    <div className="text-lg font-bold text-yellow-600">٣</div>
                    <div className="text-xs text-gray-600">تحذيرات</div>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded">
                    <div className="text-lg font-bold text-purple-600">٩٢%</div>
                    <div className="text-xs text-gray-600">السلامة</div>
                  </div>
                </div>
              </GlassmorphicCard>
            </div>

            {/* Location Map Placeholder */}
            <GlassmorphicCard className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                موقع المشروع
              </h3>
              <div className="h-64 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600">خريطة الموقع</p>
                  <p className="text-sm text-gray-500">{siteInfo.location.addressAr}</p>
                </div>
              </div>
            </GlassmorphicCard>
          </TabsContent>

          <TabsContent value="weather" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Weather */}
              <GlassmorphicCard className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Cloud className="h-5 w-5" />
                  الطقس الحالي
                </h3>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {toArabicNumerals(weatherData.temperature.toString())}°
                    </div>
                    <div className="text-lg text-gray-700">{weatherData.conditionsAr}</div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center">
                      <Droplets className="h-6 w-6 mx-auto text-blue-500 mb-1" />
                      <div className="text-sm font-medium">{toArabicNumerals(weatherData.humidity.toString())}%</div>
                      <div className="text-xs text-gray-600">الرطوبة</div>
                    </div>
                    <div className="text-center">
                      <Wind className="h-6 w-6 mx-auto text-gray-500 mb-1" />
                      <div className="text-sm font-medium">{toArabicNumerals(weatherData.windSpeed.toString())} كم/س</div>
                      <div className="text-xs text-gray-600">الرياح</div>
                    </div>
                    <div className="text-center">
                      <Thermometer className="h-6 w-6 mx-auto text-red-500 mb-1" />
                      <div className="text-sm font-medium">مناسب</div>
                      <div className="text-xs text-gray-600">للعمل</div>
                    </div>
                  </div>
                </div>
              </GlassmorphicCard>

              {/* Weather Forecast */}
              <GlassmorphicCard className="p-6">
                <h3 className="font-semibold mb-4">توقعات الطقس</h3>
                <div className="space-y-3">
                  {weatherData.forecast.map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                      <span className="font-medium">{day.day}</span>
                      <span className="text-sm text-gray-600">{day.conditionsAr}</span>
                      <span className="font-bold text-blue-600">
                        {toArabicNumerals(day.temp.toString())}°
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium text-yellow-800">تحذير طقس</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    توقعات أمطار غداً - يُنصح بتأجيل أعمال الخرسانة
                  </p>
                </div>
              </GlassmorphicCard>
            </div>
          </TabsContent>

          <TabsContent value="safety" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <GlassmorphicCard className="p-4 text-center">
                <Shield className="h-8 w-8 mx-auto text-green-600 mb-2" />
                <div className="text-2xl font-bold text-green-600">٩٢%</div>
                <div className="text-sm text-gray-600">نسبة السلامة</div>
              </GlassmorphicCard>
              
              <GlassmorphicCard className="p-4 text-center">
                <AlertTriangle className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
                <div className="text-2xl font-bold text-yellow-600">٣</div>
                <div className="text-sm text-gray-600">تحذيرات نشطة</div>
              </GlassmorphicCard>
              
              <GlassmorphicCard className="p-4 text-center">
                <CheckCircle className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                <div className="text-2xl font-bold text-blue-600">١٥</div>
                <div className="text-sm text-gray-600">تفتيش هذا الشهر</div>
              </GlassmorphicCard>
            </div>

            <GlassmorphicCard className="p-6">
              <h3 className="font-semibold mb-4">سجلات السلامة</h3>
              <div className="space-y-3">
                {safetyRecords.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 bg-white/50 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getSeverityColor(record.severity)}`} />
                      <div>
                        <div className="font-medium">{record.titleAr}</div>
                        <div className="text-sm text-gray-600">
                          {record.reporterAr} • {formatArabicDate(record.date, 'short')}
                        </div>
                      </div>
                    </div>
                    <Badge variant={record.status === 'closed' ? 'default' : 'destructive'}>
                      {record.status === 'closed' ? 'مغلق' : 
                       record.status === 'investigating' ? 'قيد التحقيق' : 'مفتوح'}
                    </Badge>
                  </div>
                ))}
              </div>
            </GlassmorphicCard>
          </TabsContent>

          <TabsContent value="materials" className="space-y-6">
            <GlassmorphicCard className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                حاسبة المواد
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="material-name">اسم المادة</Label>
                    <Input
                      id="material-name"
                      placeholder="مثل: أسمنت، حديد، رمل..."
                      value={materialCalculator.nameAr || ''}
                      onChange={(e) => setMaterialCalculator(prev => ({ ...prev, nameAr: e.target.value }))}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quantity">الكمية</Label>
                      <Input
                        id="quantity"
                        type="number"
                        placeholder="100"
                        value={materialCalculator.quantity || ''}
                        onChange={(e) => setMaterialCalculator(prev => ({ ...prev, quantity: parseFloat(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="unit">الوحدة</Label>
                      <Input
                        id="unit"
                        placeholder="كيس، طن، متر مكعب"
                        value={materialCalculator.unitAr || ''}
                        onChange={(e) => setMaterialCalculator(prev => ({ ...prev, unitAr: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="unit-cost">سعر الوحدة (ريال يمني)</Label>
                    <Input
                      id="unit-cost"
                      type="number"
                      placeholder="5000"
                      value={materialCalculator.unitCost || ''}
                      onChange={(e) => setMaterialCalculator(prev => ({ ...prev, unitCost: parseFloat(e.target.value) }))}
                    />
                  </div>
                  
                  <Button onClick={handleMaterialCalculation} className="w-full">
                    احسب التكلفة الإجمالية
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">النتيجة</h4>
                    {materialCalculator.totalCost ? (
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="text-gray-600">المادة: </span>
                          <span className="font-medium">{materialCalculator.nameAr}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600">الكمية: </span>
                          <span className="font-medium">
                            {toArabicNumerals(materialCalculator.quantity?.toString() || '0')} {materialCalculator.unitAr}
                          </span>
                        </div>
                        <div className="text-lg font-bold text-blue-600">
                          التكلفة الإجمالية: {formatCurrency(materialCalculator.totalCost)}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">املأ البيانات أعلاه لحساب التكلفة</p>
                    )}
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium mb-2">نصائح توفير</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• قارن الأسعار من موردين متعددين</li>
                      <li>• اشتري بكميات كبيرة للحصول على خصم</li>
                      <li>• تحقق من جودة المواد قبل الشراء</li>
                      <li>• احسب 5-10% إضافية للهدر</li>
                    </ul>
                  </div>
                </div>
              </div>
            </GlassmorphicCard>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassmorphicCard className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  التقارير اليومية
                </h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Camera className="h-4 w-4 ml-2" />
                    تقرير صور التقدم
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 ml-2" />
                    تقرير الحضور
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Wrench className="h-4 w-4 ml-2" />
                    تقرير المعدات
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="h-4 w-4 ml-2" />
                    تقرير السلامة
                  </Button>
                </div>
              </GlassmorphicCard>

              <GlassmorphicCard className="p-6">
                <h3 className="font-semibold mb-4">تقرير سريع</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="report-notes">ملاحظات اليوم</Label>
                    <Textarea
                      id="report-notes"
                      placeholder="اكتب ملاحظاتك حول تقدم العمل اليوم..."
                      rows={4}
                    />
                  </div>
                  <Button className="w-full">
                    إرسال التقرير
                  </Button>
                </div>
              </GlassmorphicCard>
            </div>
          </TabsContent>
        </Tabs>
      </GlassContent>
    </GlassmorphicCard>
  );
}