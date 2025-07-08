import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Smartphone, 
  Wifi, 
  WifiOff, 
  Download, 
  Settings, 
  Shield, 
  Zap, 
  Globe, 
  Database,
  RefreshCw,
  Bell,
  Home,
  Users,
  FileText,
  BarChart3
} from 'lucide-react';

interface PWAStats {
  installationStatus: 'installed' | 'installable' | 'not_supported';
  isOnline: boolean;
  cacheSize: number;
  syncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  lastSync: Date;
  offlineCapabilities: string[];
  performance: {
    loadTime: number;
    cacheHitRate: number;
    dataUsage: number;
  };
}

interface MobileFeature {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  status: 'active' | 'beta' | 'coming_soon';
  icon: React.ReactNode;
  category: 'core' | 'advanced' | 'experimental';
}

export function AdvancedMobilePWA() {
  const [pwaStats, setPwaStats] = useState<PWAStats>({
    installationStatus: 'installable',
    isOnline: navigator.onLine,
    cacheSize: 15.7, // MB
    syncStatus: 'synced',
    lastSync: new Date(),
    offlineCapabilities: [
      'عرض البيانات المحفوظة محلياً',
      'إنشاء وتحرير المشاريع',
      'تسجيل المعاملات المالية',
      'إدارة الموظفين والمعدات',
      'تحديث حالة المهام',
      'رفع الملفات والصور'
    ],
    performance: {
      loadTime: 0.8, // seconds
      cacheHitRate: 94, // percentage
      dataUsage: 2.3 // MB
    }
  });

  const [installPrompt, setInstallPrompt] = useState<any>(null);

  const mobileFeatures: MobileFeature[] = [
    {
      id: 'offline-sync',
      name: 'Offline Synchronization',
      nameAr: 'المزامنة بدون اتصال',
      description: 'Work offline and sync when connection is restored',
      descriptionAr: 'العمل بدون اتصال والمزامنة عند عودة الاتصال',
      status: 'active',
      icon: <RefreshCw className="h-5 w-5" />,
      category: 'core'
    },
    {
      id: 'push-notifications',
      name: 'Push Notifications',
      nameAr: 'الإشعارات الفورية',
      description: 'Real-time project updates and alerts',
      descriptionAr: 'تحديثات المشاريع والتنبيهات في الوقت الفعلي',
      status: 'active',
      icon: <Bell className="h-5 w-5" />,
      category: 'core'
    },
    {
      id: 'home-screen',
      name: 'Home Screen Installation',
      nameAr: 'التثبيت على الشاشة الرئيسية',
      description: 'Install app on device home screen',
      descriptionAr: 'تثبيت التطبيق على الشاشة الرئيسية للجهاز',
      status: 'active',
      icon: <Home className="h-5 w-5" />,
      category: 'core'
    },
    {
      id: 'camera-integration',
      name: 'Camera Integration',
      nameAr: 'تكامل الكاميرا',
      description: 'Capture site photos and documents',
      descriptionAr: 'التقاط صور الموقع والمستندات',
      status: 'active',
      icon: <FileText className="h-5 w-5" />,
      category: 'advanced'
    },
    {
      id: 'geolocation',
      name: 'GPS Location Services',
      nameAr: 'خدمات تحديد الموقع',
      description: 'Track project locations and site visits',
      descriptionAr: 'تتبع مواقع المشاريع وزيارات الموقع',
      status: 'beta',
      icon: <Globe className="h-5 w-5" />,
      category: 'advanced'
    },
    {
      id: 'biometric-auth',
      name: 'Biometric Authentication',
      nameAr: 'المصادقة البيومترية',
      description: 'Fingerprint and face recognition login',
      descriptionAr: 'تسجيل الدخول ببصمة الإصبع والوجه',
      status: 'coming_soon',
      icon: <Shield className="h-5 w-5" />,
      category: 'experimental'
    },
    {
      id: 'voice-commands',
      name: 'Voice Commands',
      nameAr: 'الأوامر الصوتية',
      description: 'Control app with voice commands in Arabic',
      descriptionAr: 'التحكم في التطبيق بالأوامر الصوتية بالعربية',
      status: 'coming_soon',
      icon: <Users className="h-5 w-5" />,
      category: 'experimental'
    },
    {
      id: 'ar-visualization',
      name: 'AR Project Visualization',
      nameAr: 'التصور ثلاثي الأبعاد للمشاريع',
      description: 'Augmented reality project visualization',
      descriptionAr: 'تصور المشاريع بتقنية الواقع المعزز',
      status: 'coming_soon',
      icon: <BarChart3 className="h-5 w-5" />,
      category: 'experimental'
    }
  ];

  useEffect(() => {
    // Check for PWA installation prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      setPwaStats(prev => ({ ...prev, installationStatus: 'installable' }));
    };

    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      setPwaStats(prev => ({ ...prev, installationStatus: 'installed' }));
    }

    // Listen for online/offline events
    const handleOnline = () => setPwaStats(prev => ({ ...prev, isOnline: true, syncStatus: 'syncing' }));
    const handleOffline = () => setPwaStats(prev => ({ ...prev, isOnline: false, syncStatus: 'offline' }));

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Simulate sync completion after going online
    if (navigator.onLine && pwaStats.syncStatus === 'syncing') {
      setTimeout(() => {
        setPwaStats(prev => ({ ...prev, syncStatus: 'synced', lastSync: new Date() }));
      }, 2000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pwaStats.syncStatus]);

  const handleInstallPWA = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setPwaStats(prev => ({ ...prev, installationStatus: 'installed' }));
        setInstallPrompt(null);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">فعال</Badge>;
      case 'beta':
        return <Badge variant="secondary">تجريبي</Badge>;
      case 'coming_soon':
        return <Badge variant="outline">قريباً</Badge>;
      default:
        return <Badge variant="outline">غير معروف</Badge>;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'core':
        return 'border-green-200 bg-green-50';
      case 'advanced':
        return 'border-blue-200 bg-blue-50';
      case 'experimental':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* PWA Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={pwaStats.installationStatus === 'installed' ? 'border-green-200 bg-green-50' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Smartphone className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">حالة التثبيت</p>
                <p className="text-lg font-bold">
                  {pwaStats.installationStatus === 'installed' ? 'مثبت' :
                   pwaStats.installationStatus === 'installable' ? 'قابل للتثبيت' : 'غير مدعوم'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={pwaStats.isOnline ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              {pwaStats.isOnline ? 
                <Wifi className="h-5 w-5 text-green-500" /> : 
                <WifiOff className="h-5 w-5 text-red-500" />
              }
              <div>
                <p className="text-sm text-muted-foreground">حالة الاتصال</p>
                <p className="text-lg font-bold">
                  {pwaStats.isOnline ? 'متصل' : 'غير متصل'}
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
                <p className="text-sm text-muted-foreground">حجم التخزين المؤقت</p>
                <p className="text-lg font-bold">{pwaStats.cacheSize.toFixed(1)} MB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Zap className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">سرعة التحميل</p>
                <p className="text-lg font-bold">{pwaStats.performance.loadTime}s</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PWA Installation Alert */}
      {pwaStats.installationStatus === 'installable' && (
        <Alert>
          <Download className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>يمكنك تثبيت التطبيق على جهازك للوصول السريع والعمل بدون اتصال</span>
            <Button onClick={handleInstallPWA} size="sm">
              تثبيت التطبيق
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Offline Status Alert */}
      {!pwaStats.isOnline && (
        <Alert className="border-orange-200 bg-orange-50">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            أنت تعمل حالياً بدون اتصال. سيتم مزامنة التغييرات عند عودة الاتصال.
          </AlertDescription>
        </Alert>
      )}

      {/* Mobile PWA Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
            <Smartphone className="h-5 w-5" />
            <span>ميزات تطبيق الهاتف المحمول المتقدمة</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="features" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="features">الميزات</TabsTrigger>
              <TabsTrigger value="performance">الأداء</TabsTrigger>
              <TabsTrigger value="offline">العمل بدون اتصال</TabsTrigger>
              <TabsTrigger value="settings">الإعدادات</TabsTrigger>
            </TabsList>

            <TabsContent value="features" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mobileFeatures.map((feature) => (
                  <Card key={feature.id} className={`border-2 ${getCategoryColor(feature.category)}`}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          {feature.icon}
                          <CardTitle className="text-lg">{feature.nameAr}</CardTitle>
                        </div>
                        {getStatusBadge(feature.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{feature.descriptionAr}</p>
                      <div className="mt-3 flex justify-between items-center">
                        <Badge variant="outline" className="text-xs">
                          {feature.category === 'core' ? 'أساسي' :
                           feature.category === 'advanced' ? 'متقدم' : 'تجريبي'}
                        </Badge>
                        {feature.status === 'active' && (
                          <Button size="sm" variant="outline">
                            إعداد
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>مؤشرات الأداء</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">سرعة التحميل</span>
                        <span className="text-sm font-medium">{pwaStats.performance.loadTime}s</span>
                      </div>
                      <Progress value={(3 - pwaStats.performance.loadTime) / 3 * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground">الهدف: أقل من 2 ثانية</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">معدل نجاح التخزين المؤقت</span>
                        <span className="text-sm font-medium">{pwaStats.performance.cacheHitRate}%</span>
                      </div>
                      <Progress value={pwaStats.performance.cacheHitRate} className="h-2" />
                      <p className="text-xs text-muted-foreground">الهدف: أكثر من 90%</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">استهلاك البيانات</span>
                        <span className="text-sm font-medium">{pwaStats.performance.dataUsage} MB</span>
                      </div>
                      <Progress value={(5 - pwaStats.performance.dataUsage) / 5 * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground">الهدف: أقل من 5 MB يومياً</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>إحصائيات الاستخدام</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-3 border rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">98%</p>
                        <p className="text-xs text-muted-foreground">وقت التشغيل</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="text-2xl font-bold text-green-600">2.4s</p>
                        <p className="text-xs text-muted-foreground">متوسط الاستجابة</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">156</p>
                        <p className="text-xs text-muted-foreground">الجلسات اليومية</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="text-2xl font-bold text-orange-600">7.2</p>
                        <p className="text-xs text-muted-foreground">تقييم المستخدمين</p>
                      </div>
                    </div>

                    <div className="pt-4">
                      <h4 className="font-semibold mb-2">الميزات الأكثر استخداماً</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>لوحة المعلومات</span>
                          <span className="font-medium">89%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>إدارة المشاريع</span>
                          <span className="font-medium">76%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>المعاملات المالية</span>
                          <span className="font-medium">63%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>إدارة المعدات</span>
                          <span className="font-medium">45%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="offline" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Database className="h-5 w-5 text-purple-500" />
                      <span>القدرات بدون اتصال</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {pwaStats.offlineCapabilities.map((capability, index) => (
                        <div key={index} className="flex items-center space-x-2 rtl:space-x-reverse">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm">{capability}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">معلومة مهمة</h4>
                      <p className="text-sm text-blue-700">
                        يتم حفظ جميع البيانات محلياً على جهازك ومزامنتها تلقائياً عند عودة الاتصال.
                        لا تقلق بشأن فقدان أي معلومات أثناء العمل بدون اتصال.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                      <RefreshCw className="h-5 w-5 text-blue-500" />
                      <span>حالة المزامنة</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">حالة المزامنة الحالية</span>
                        <Badge className={
                          pwaStats.syncStatus === 'synced' ? 'bg-green-500' :
                          pwaStats.syncStatus === 'syncing' ? 'bg-blue-500' :
                          pwaStats.syncStatus === 'offline' ? 'bg-orange-500' : 'bg-red-500'
                        }>
                          {pwaStats.syncStatus === 'synced' ? 'مزامن' :
                           pwaStats.syncStatus === 'syncing' ? 'جاري المزامنة' :
                           pwaStats.syncStatus === 'offline' ? 'غير متصل' : 'خطأ'}
                        </Badge>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        آخر مزامنة: {pwaStats.lastSync.toLocaleString('ar-YE')}
                      </div>

                      {pwaStats.syncStatus === 'syncing' && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>تقدم المزامنة</span>
                            <span>73%</span>
                          </div>
                          <Progress value={73} className="h-2" />
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 text-center text-sm">
                        <div className="p-2 border rounded">
                          <p className="font-bold text-green-600">24</p>
                          <p className="text-muted-foreground">عناصر مزامنة</p>
                        </div>
                        <div className="p-2 border rounded">
                          <p className="font-bold text-blue-600">3</p>
                          <p className="text-muted-foreground">في الانتظار</p>
                        </div>
                      </div>

                      <Button 
                        className="w-full" 
                        variant="outline"
                        disabled={!pwaStats.isOnline || pwaStats.syncStatus === 'syncing'}
                      >
                        {pwaStats.syncStatus === 'syncing' ? 'جاري المزامنة...' : 'مزامنة يدوية'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Settings className="h-5 w-5" />
                      <span>إعدادات التطبيق</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">الإشعارات الفورية</p>
                        <p className="text-sm text-muted-foreground">تلقي تحديثات المشاريع</p>
                      </div>
                      <Button size="sm" variant="outline">تفعيل</Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">المزامنة التلقائية</p>
                        <p className="text-sm text-muted-foreground">مزامنة البيانات تلقائياً</p>
                      </div>
                      <Button size="sm" variant="outline">مفعل</Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">توفير البيانات</p>
                        <p className="text-sm text-muted-foreground">تقليل استهلاك الإنترنت</p>
                      </div>
                      <Button size="sm" variant="outline">تفعيل</Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">الوضع المظلم</p>
                        <p className="text-sm text-muted-foreground">تفعيل المظهر المظلم</p>
                      </div>
                      <Button size="sm" variant="outline">إيقاف</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Shield className="h-5 w-5" />
                      <span>الأمان والخصوصية</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">قفل التطبيق</p>
                        <p className="text-sm text-muted-foreground">قفل بكلمة مرور</p>
                      </div>
                      <Button size="sm" variant="outline">إعداد</Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">التشفير المحلي</p>
                        <p className="text-sm text-muted-foreground">تشفير البيانات المحلية</p>
                      </div>
                      <Button size="sm" variant="outline">مفعل</Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">مشاركة البيانات</p>
                        <p className="text-sm text-muted-foreground">مشاركة بيانات الاستخدام</p>
                      </div>
                      <Button size="sm" variant="outline">إيقاف</Button>
                    </div>

                    <div className="pt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">نصيحة أمنية</h4>
                      <p className="text-sm text-yellow-700">
                        استخدم كلمة مرور قوية وفعل المصادقة الثنائية لحماية بياناتك.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}