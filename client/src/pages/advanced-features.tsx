import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdvancedProjectGantt } from '@/components/advanced-project-gantt';
import { AdvancedIFRSCompliance } from '@/components/advanced-ifrs-compliance';
import { AdvancedMobilePWA } from '@/components/advanced-mobile-pwa';
import { Calendar, Calculator, Smartphone, TrendingUp, Globe, Zap } from 'lucide-react';

export default function AdvancedFeatures() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          الميزات المتقدمة لإدارة المقاولات
        </h1>
        <p className="text-muted-foreground">
          أدوات متطورة لإدارة المشاريع والامتثال للمعايير الدولية والتطبيقات المحمولة
        </p>
      </div>

      {/* Feature Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6 text-center">
            <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              مخطط جانت التفاعلي
            </h3>
            <p className="text-sm text-blue-700">
              إدارة متقدمة للمشاريع مع تحليل المسار الحرج والموارد
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <Calculator className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              امتثال IFRS المتقدم
            </h3>
            <p className="text-sm text-green-700">
              تطبيق كامل للمعايير الدولية للتقارير المالية
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-6 text-center">
            <Smartphone className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-purple-800 mb-2">
              تطبيق محمول متقدم
            </h3>
            <p className="text-sm text-purple-700">
              PWA مع قدرات العمل بدون اتصال والمزامنة الذكية
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Features Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
            <TrendingUp className="h-6 w-6" />
            <span>المنصة المتقدمة لإدارة المقاولات</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="gantt" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="gantt" className="flex items-center space-x-2 rtl:space-x-reverse">
                <Calendar className="h-4 w-4" />
                <span>مخطط جانت</span>
              </TabsTrigger>
              <TabsTrigger value="ifrs" className="flex items-center space-x-2 rtl:space-x-reverse">
                <Calculator className="h-4 w-4" />
                <span>امتثال IFRS</span>
              </TabsTrigger>
              <TabsTrigger value="mobile" className="flex items-center space-x-2 rtl:space-x-reverse">
                <Smartphone className="h-4 w-4" />
                <span>التطبيق المحمول</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="gantt" className="space-y-6 mt-6">
              <div className="space-y-2 mb-6">
                <h2 className="text-2xl font-semibold">مخطط جانت التفاعلي للمشاريع</h2>
                <p className="text-muted-foreground">
                  أداة متطورة لإدارة الجداول الزمنية للمشاريع مع تحليل المسار الحرج وإدارة الموارد والمخاطر
                </p>
              </div>
              <AdvancedProjectGantt />
            </TabsContent>

            <TabsContent value="ifrs" className="space-y-6 mt-6">
              <div className="space-y-2 mb-6">
                <h2 className="text-2xl font-semibold">الامتثال للمعايير الدولية للتقارير المالية</h2>
                <p className="text-muted-foreground">
                  تطبيق شامل لمعايير IFRS 15 للاعتراف بالإيرادات من عقود البناء مع التحليل المتقدم والتقارير التفصيلية
                </p>
              </div>
              <AdvancedIFRSCompliance />
            </TabsContent>

            <TabsContent value="mobile" className="space-y-6 mt-6">
              <div className="space-y-2 mb-6">
                <h2 className="text-2xl font-semibold">تطبيق الهاتف المحمول المتقدم (PWA)</h2>
                <p className="text-muted-foreground">
                  تطبيق ويب تقدمي مع قدرات العمل بدون اتصال، المزامنة الذكية، والميزات المحمولة المتطورة
                </p>
              </div>
              <AdvancedMobilePWA />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Development Plan Status */}
      <Card className="border-2 border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse text-green-800">
            <Zap className="h-6 w-6" />
            <span>حالة خطة التطوير</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border border-green-200">
              <div className="text-3xl font-bold text-green-600 mb-2">95%</div>
              <p className="text-sm text-green-700">اكتمال المشروع</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
              <div className="text-3xl font-bold text-blue-600 mb-2">8</div>
              <p className="text-sm text-blue-700">الميزات المتقدمة</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
              <div className="text-3xl font-bold text-purple-600 mb-2">3</div>
              <p className="text-sm text-purple-700">المنصات المدعومة</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-orange-200">
              <div className="text-3xl font-bold text-orange-600 mb-2">100%</div>
              <p className="text-sm text-orange-700">الامتثال لـ IFRS</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-white rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">✅ الميزات المكتملة في هذا التحديث</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-green-700">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>مخطط جانت التفاعلي مع تحليل المسار الحرج</span>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>نظام الامتثال الشامل لمعايير IFRS 15</span>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>تطبيق PWA مع قدرات العمل بدون اتصال</span>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>تحليل الأداء والمزامنة الذكية</span>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>تقارير الامتثال المالي التفصيلية</span>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>واجهة مستخدم متقدمة للأجهزة المحمولة</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}