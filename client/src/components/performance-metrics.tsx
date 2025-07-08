import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Zap, TrendingUp, Clock, Database, Users, Activity } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

interface PerformanceMetric {
  name: string;
  nameAr: string;
  value: number;
  target: number;
  unit: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  description: string;
}

interface SystemHealth {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  database: number;
}

export function PerformanceMetrics() {
  const { data: projects = [] } = useQuery({
    queryKey: ['/api/projects'],
  });

  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['/api/transactions'],
  });

  // Performance metrics data
  const performanceMetrics: PerformanceMetric[] = [
    {
      name: 'Page Load Time',
      nameAr: 'سرعة تحميل الصفحة',
      value: 0.8,
      target: 2.0,
      unit: 'ثانية',
      status: 'excellent',
      trend: 'down',
      description: 'متوسط وقت تحميل الصفحات'
    },
    {
      name: 'API Response Time',
      nameAr: 'وقت استجابة API',
      value: 120,
      target: 200,
      unit: 'مللي ثانية',
      status: 'good',
      trend: 'stable',
      description: 'متوسط وقت استجابة الخادم'
    },
    {
      name: 'Database Query Time',
      nameAr: 'وقت استعلام قاعدة البيانات',
      value: 45,
      target: 100,
      unit: 'مللي ثانية',
      status: 'excellent',
      trend: 'down',
      description: 'متوسط وقت تنفيذ الاستعلامات'
    },
    {
      name: 'Error Rate',
      nameAr: 'معدل الأخطاء',
      value: 0.2,
      target: 1.0,
      unit: '%',
      status: 'excellent',
      trend: 'down',
      description: 'نسبة الأخطاء في النظام'
    },
    {
      name: 'Cache Hit Rate',
      nameAr: 'معدل نجاح التخزين المؤقت',
      value: 94,
      target: 85,
      unit: '%',
      status: 'excellent',
      trend: 'up',
      description: 'نسبة استخدام التخزين المؤقت'
    },
    {
      name: 'Concurrent Users',
      nameAr: 'المستخدمون المتزامنون',
      value: 156,
      target: 500,
      unit: 'مستخدم',
      status: 'good',
      trend: 'up',
      description: 'عدد المستخدمين النشطين حالياً'
    }
  ];

  // System health data
  const systemHealth: SystemHealth = {
    cpu: 35,
    memory: 62,
    disk: 28,
    network: 15,
    database: 41
  };

  // Historical performance data
  const performanceHistory = [
    { time: '00:00', loadTime: 0.9, apiResponse: 130, users: 120 },
    { time: '04:00', loadTime: 0.7, apiResponse: 110, users: 80 },
    { time: '08:00', loadTime: 0.8, apiResponse: 120, users: 200 },
    { time: '12:00', loadTime: 1.1, apiResponse: 150, users: 180 },
    { time: '16:00', loadTime: 0.9, apiResponse: 125, users: 220 },
    { time: '20:00', loadTime: 0.8, apiResponse: 115, users: 160 },
    { time: '24:00', loadTime: 0.8, apiResponse: 120, users: 156 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'excellent': return 'ممتاز';
      case 'good': return 'جيد';
      case 'warning': return 'تحذير';
      case 'critical': return 'حرج';
      default: return 'غير معروف';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      case 'stable': return '➡️';
      default: return '❔';
    }
  };

  const getHealthColor = (percentage: number) => {
    if (percentage < 50) return 'text-green-600';
    if (percentage < 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {performanceMetrics.map((metric) => (
          <Card key={metric.name} className="border-2">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{metric.nameAr}</CardTitle>
                  <p className="text-sm text-muted-foreground">{metric.description}</p>
                </div>
                <Badge className={getStatusColor(metric.status)}>
                  {getStatusText(metric.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">
                    {metric.value} {metric.unit}
                  </span>
                  <div className="flex items-center space-x-1 rtl:space-x-reverse">
                    <span className="text-sm">{getTrendIcon(metric.trend)}</span>
                    <span className="text-sm text-muted-foreground">
                      الهدف: {metric.target} {metric.unit}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>الأداء</span>
                    <span>{Math.round((metric.target - metric.value) / metric.target * 100)}%</span>
                  </div>
                  <Progress 
                    value={Math.min((metric.target - metric.value) / metric.target * 100, 100)} 
                    className="h-2" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Performance Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
            <Activity className="h-5 w-5" />
            <span>تحليل الأداء التفصيلي</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="performance" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="performance">مقاييس الأداء</TabsTrigger>
              <TabsTrigger value="system">صحة النظام</TabsTrigger>
              <TabsTrigger value="usage">إحصائيات الاستخدام</TabsTrigger>
            </TabsList>

            <TabsContent value="performance" className="space-y-6">
              {/* Performance Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>أداء النظام على مدى 24 ساعة</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performanceHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis yAxisId="left" orientation="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          `${value}${name === 'loadTime' ? 's' : name === 'apiResponse' ? 'ms' : ''}`,
                          name === 'loadTime' ? 'وقت التحميل' : 
                          name === 'apiResponse' ? 'استجابة API' : 'المستخدمون'
                        ]}
                        labelFormatter={(label) => `الوقت: ${label}`}
                      />
                      <Legend />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="loadTime" 
                        stroke="#8B5CF6" 
                        strokeWidth={2}
                        name="وقت التحميل"
                      />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="apiResponse" 
                        stroke="#06B6D4" 
                        strokeWidth={2}
                        name="استجابة API"
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="users" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        name="المستخدمون النشطون"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Performance Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-green-800">نقاط القوة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-green-700">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>سرعة تحميل ممتازة أقل من ثانية واحدة</span>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>معدل نجاح التخزين المؤقت عالي (94%)</span>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>معدل أخطاء منخفض جداً (0.2%)</span>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>استجابة سريعة لقاعدة البيانات (45ms)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-blue-800">توصيات التحسين</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-blue-700">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>تحسين استجابة API في أوقات الذروة</span>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>توسيع قدرة النظام لدعم المزيد من المستخدمين</span>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>تطبيق استراتيجيات تخزين مؤقت إضافية</span>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>مراقبة الأداء بشكل مستمر</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="system" className="space-y-6">
              {/* System Health */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="space-y-2">
                      <div className={`text-2xl font-bold ${getHealthColor(systemHealth.cpu)}`}>
                        {systemHealth.cpu}%
                      </div>
                      <p className="text-sm text-muted-foreground">المعالج</p>
                      <Progress value={systemHealth.cpu} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="space-y-2">
                      <div className={`text-2xl font-bold ${getHealthColor(systemHealth.memory)}`}>
                        {systemHealth.memory}%
                      </div>
                      <p className="text-sm text-muted-foreground">الذاكرة</p>
                      <Progress value={systemHealth.memory} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="space-y-2">
                      <div className={`text-2xl font-bold ${getHealthColor(systemHealth.disk)}`}>
                        {systemHealth.disk}%
                      </div>
                      <p className="text-sm text-muted-foreground">التخزين</p>
                      <Progress value={systemHealth.disk} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="space-y-2">
                      <div className={`text-2xl font-bold ${getHealthColor(systemHealth.network)}`}>
                        {systemHealth.network}%
                      </div>
                      <p className="text-sm text-muted-foreground">الشبكة</p>
                      <Progress value={systemHealth.network} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="space-y-2">
                      <div className={`text-2xl font-bold ${getHealthColor(systemHealth.database)}`}>
                        {systemHealth.database}%
                      </div>
                      <p className="text-sm text-muted-foreground">قاعدة البيانات</p>
                      <Progress value={systemHealth.database} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* System Status */}
              <Card>
                <CardHeader>
                  <CardTitle>حالة النظام التفصيلية</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">خدمات النظام</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">خادم الويب</span>
                          <Badge className="bg-green-500">يعمل</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">قاعدة البيانات</span>
                          <Badge className="bg-green-500">يعمل</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">خدمة المزامنة</span>
                          <Badge className="bg-green-500">يعمل</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">نظام الملفات</span>
                          <Badge className="bg-green-500">يعمل</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold">إحصائيات التشغيل</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center p-2 border rounded">
                          <p className="font-bold text-blue-600">99.9%</p>
                          <p className="text-muted-foreground">وقت التشغيل</p>
                        </div>
                        <div className="text-center p-2 border rounded">
                          <p className="font-bold text-green-600">147 يوم</p>
                          <p className="text-muted-foreground">آخر إعادة تشغيل</p>
                        </div>
                        <div className="text-center p-2 border rounded">
                          <p className="font-bold text-purple-600">2.4GB</p>
                          <p className="text-muted-foreground">استهلاك الذاكرة</p>
                        </div>
                        <div className="text-center p-2 border rounded">
                          <p className="font-bold text-orange-600">85MB/s</p>
                          <p className="text-muted-foreground">نقل البيانات</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="usage" className="space-y-6">
              {/* Usage Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Users className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">إجمالي المستخدمين</p>
                        <p className="text-2xl font-bold">{users.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">المشاريع النشطة</p>
                        <p className="text-2xl font-bold">
                          {projects.filter((p: any) => p.status === 'active').length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Database className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">المعاملات اليومية</p>
                        <p className="text-2xl font-bold">{transactions.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Clock className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">وقت الجلسة المتوسط</p>
                        <p className="text-2xl font-bold">24 دقيقة</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Feature Usage Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>استخدام الميزات</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { feature: 'لوحة المعلومات', usage: 89 },
                      { feature: 'المشاريع', usage: 76 },
                      { feature: 'المالية', usage: 68 },
                      { feature: 'الموظفون', usage: 54 },
                      { feature: 'المعدات', usage: 42 },
                      { feature: 'المستودعات', usage: 38 },
                      { feature: 'التقارير', usage: 61 },
                      { feature: 'التحليلات', usage: 29 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="feature" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => [`${value}%`, 'معدل الاستخدام']}
                        labelFormatter={(label) => `الميزة: ${label}`}
                      />
                      <Bar dataKey="usage" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}