import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, TrendingUp, BarChart3, Calculator, Zap, DollarSign, MapPin, Building2 } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Currency {
  code: string;
  name: string;
  symbol: string;
  rateToBase: number;
  volatility: number;
  region: string;
}

interface CurrencyConversion {
  currency: string;
  amount: number;
  exchangeRate: number;
  volatilityRisk: 'low' | 'medium' | 'high';
}

interface IFRSRevenueRecognition {
  method: string;
  percentageComplete: number;
  revenueThisPeriod: number;
  cumulativeRevenue: number;
  grossProfit: number;
  grossProfitPercentage: number;
  estimatedGrossProfit: number;
  forecastToComplete: number;
}

interface WIPProject {
  projectId: number;
  projectName: string;
  contractValue: number;
  costsIncurred: number;
  estimatedCosts: number;
  percentComplete: number;
  earnedRevenue: number;
  billedToDate: number;
  overbilledAmount: number;
  underbilledAmount: number;
  retainageWithheld: number;
  forecastProfit: number;
  varianceToOriginal: number;
}

interface Project {
  id: number;
  name: string;
  nameAr: string;
  region: string;
  countryCode: string;
  contractValue: number;
  contractCurrency: string;
  projectType: string;
  complexity: string;
  status: string;
}

export function GlobalExpansionDemo() {
  const [selectedProject, setSelectedProject] = useState<number>(1);
  const [conversionAmount, setConversionAmount] = useState<string>("1000000");
  const [fromCurrency, setFromCurrency] = useState<string>("YER");
  const [targetCurrencies, setTargetCurrencies] = useState<string[]>(["USD", "EUR", "GBP", "SAR", "AED"]);

  const queryClient = useQueryClient();

  // Fetch currencies
  const { data: currencies = [] } = useQuery<Currency[]>({
    queryKey: ["/api/currency/rates"],
    refetchInterval: 60000, // Update every minute
  });

  // Fetch projects
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Fetch WIP Schedule
  const { data: wipData } = useQuery({
    queryKey: ["/api/ifrs/wip-schedule"],
    refetchInterval: 30000,
  });

  // Currency conversion
  const { data: conversions = [], mutate: convertCurrency } = useMutation({
    mutationFn: (data: { amount: number; baseCurrency: string; targetCurrencies: string[] }) =>
      apiRequest("/api/currency/multi-convert", "POST", data),
  });

  // IFRS Revenue Recognition
  const { data: revenueRecognition, mutate: calculateRevenue } = useMutation({
    mutationFn: (projectId: number) =>
      apiRequest("/api/ifrs/revenue-recognition", "POST", { projectId }),
  });

  // Global cost estimation
  const { data: globalEstimate, mutate: estimateGlobalCost } = useMutation({
    mutationFn: (data: any) =>
      apiRequest("/api/intelligence/global-cost-estimation", "POST", data),
  });

  useEffect(() => {
    if (conversionAmount && fromCurrency && targetCurrencies.length > 0) {
      convertCurrency({
        amount: parseFloat(conversionAmount),
        baseCurrency: fromCurrency,
        targetCurrencies,
      });
    }
  }, [conversionAmount, fromCurrency, targetCurrencies, convertCurrency]);

  useEffect(() => {
    if (selectedProject) {
      calculateRevenue(selectedProject);
    }
  }, [selectedProject, calculateRevenue]);

  const globalProjects = projects.filter(p => p.region && p.countryCode);
  
  const regionColors = {
    'MENA': '#22c55e',
    'EMEA': '#3b82f6', 
    'APAC': '#f59e0b',
    'AMERICAS': '#ef4444'
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return '#22c55e';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const currencyInfo = currencies.find(c => c.code === currency);
    return new Intl.NumberFormat('ar-YE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Globe className="h-10 w-10 text-blue-600" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            منصة إدارة البناء العالمية
          </h1>
        </div>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          نظام إدارة المشاريع الإنشائية مع دعم IFRS 15 والعملات المتعددة
        </p>
        <div className="flex justify-center gap-2 mt-4">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <Zap className="h-3 w-3 mr-1" />
            معايير IFRS 15
          </Badge>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <Globe className="h-3 w-3 mr-1" />
            15+ عملة مدعومة
          </Badge>
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            <BarChart3 className="h-3 w-3 mr-1" />
            تحليلات متقدمة
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-gray-800 border">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="currency" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            العملات المتعددة
          </TabsTrigger>
          <TabsTrigger value="ifrs" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            IFRS 15
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
            التحليلات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4" />
                  المشاريع العالمية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{globalProjects.length}</div>
                <p className="text-blue-100 text-sm">عبر {new Set(globalProjects.map(p => p.region)).size} مناطق</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4" />
                  إجمالي القيمة التعاقدية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {globalProjects.reduce((sum, p) => sum + (p.contractValue || 0), 0).toLocaleString()}
                </div>
                <p className="text-green-100 text-sm">بعملات متعددة</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <BarChart3 className="h-4 w-4" />
                  العملات المدعومة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currencies.length}</div>
                <p className="text-purple-100 text-sm">مع تحديث فوري للأسعار</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4" />
                  متوسط التقدم
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {wipData?.wipSchedule ? 
                    Math.round(wipData.wipSchedule.reduce((sum: number, p: WIPProject) => sum + p.percentComplete, 0) / wipData.wipSchedule.length) 
                    : 0}%
                </div>
                <p className="text-orange-100 text-sm">حسب معايير IFRS 15</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                المشاريع العالمية حسب المنطقة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(
                  globalProjects.reduce((acc, project) => {
                    const region = project.region || 'أخرى';
                    if (!acc[region]) acc[region] = [];
                    acc[region].push(project);
                    return acc;
                  }, {} as Record<string, Project[]>)
                ).map(([region, projects]) => (
                  <Card key={region} className="border-l-4" style={{ borderLeftColor: regionColors[region as keyof typeof regionColors] || '#6b7280' }}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{region}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">المشاريع:</span>
                          <span className="font-semibold">{projects.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">القيمة الإجمالية:</span>
                          <span className="font-semibold">
                            {projects.reduce((sum, p) => sum + (p.contractValue || 0), 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {projects.slice(0, 2).map(project => (
                            <div key={project.id} className="text-xs text-gray-500 truncate">
                              {project.nameAr || project.name}
                            </div>
                          ))}
                          {projects.length > 2 && (
                            <div className="text-xs text-gray-400">+{projects.length - 2} أخرى</div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="currency" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  محول العملات المتقدم
                </CardTitle>
                <CardDescription>
                  تحويل فوري للعملات مع تحليل المخاطر
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">المبلغ</label>
                    <Input
                      type="number"
                      value={conversionAmount}
                      onChange={(e) => setConversionAmount(e.target.value)}
                      placeholder="أدخل المبلغ"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">العملة الأساسية</label>
                    <Select value={fromCurrency} onValueChange={setFromCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map(currency => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.symbol} {currency.code} - {currency.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">النتائج:</h4>
                  {conversions?.map((conversion: CurrencyConversion) => (
                    <div key={conversion.currency} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="font-medium">{conversion.currency}</div>
                        <Badge 
                          variant="outline" 
                          style={{ backgroundColor: getRiskColor(conversion.volatilityRisk), color: 'white' }}
                        >
                          {conversion.volatilityRisk}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          {formatCurrency(conversion.amount, conversion.currency)}
                        </div>
                        <div className="text-sm text-gray-500">
                          سعر الصرف: {conversion.exchangeRate.toFixed(4)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>العملات المدعومة حسب المنطقة</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(
                        currencies.reduce((acc, curr) => {
                          if (!acc[curr.region]) acc[curr.region] = 0;
                          acc[curr.region]++;
                          return acc;
                        }, {} as Record<string, number>)
                      ).map(([region, count]) => ({ region, count }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ region, count }) => `${region}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {Object.keys(regionColors).map((region, index) => (
                        <Cell key={`cell-${index}`} fill={regionColors[region as keyof typeof regionColors]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>تقلبات أسعار الصرف</CardTitle>
              <CardDescription>مؤشر التقلب لكل عملة (0 = مستقر، 1 = متقلب جداً)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={currencies}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="code" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'التقلب']}
                    labelFormatter={(label) => `العملة: ${label}`}
                  />
                  <Bar dataKey="volatility" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ifrs" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  تحليل إعتراف الإيرادات - IFRS 15
                </CardTitle>
                <CardDescription>
                  طريقة نسبة الإنجاز (Percentage of Completion)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">اختر المشروع</label>
                  <Select value={selectedProject.toString()} onValueChange={(value) => setSelectedProject(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id.toString()}>
                          {project.nameAr || project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {revenueRecognition && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-sm text-blue-600 dark:text-blue-400">نسبة الإنجاز</div>
                        <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                          {revenueRecognition.percentageComplete.toFixed(1)}%
                        </div>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-sm text-green-600 dark:text-green-400">إجمالي الربح</div>
                        <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                          {revenueRecognition.grossProfitPercentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">الإيرادات المعترف بها تراكمياً:</span>
                        <span className="font-medium">{revenueRecognition.cumulativeRevenue.toLocaleString()} ريال</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">إيرادات هذه الفترة:</span>
                        <span className="font-medium">{revenueRecognition.revenueThisPeriod.toLocaleString()} ريال</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">التكلفة المتوقعة للإنجاز:</span>
                        <span className="font-medium">{revenueRecognition.forecastToComplete.toLocaleString()} ريال</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">الربح الإجمالي المقدر:</span>
                        <span className="font-medium">{revenueRecognition.estimatedGrossProfit.toLocaleString()} ريال</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>جدول أعمال قيد التنفيذ (WIP Schedule)</CardTitle>
                <CardDescription>ملخص امتثال IFRS 15</CardDescription>
              </CardHeader>
              <CardContent>
                {wipData?.complianceReport && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-lg font-bold">{wipData.complianceReport.totalContracts}</div>
                        <div className="text-sm text-gray-600">إجمالي العقود</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-lg font-bold">{wipData.complianceReport.averageCompletion.toFixed(1)}%</div>
                        <div className="text-sm text-gray-600">متوسط الإنجاز</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-lg font-bold">
                          <Badge 
                            variant={wipData.complianceReport.complianceStatus === 'compliant' ? 'default' : 'destructive'}
                          >
                            {wipData.complianceReport.complianceStatus === 'compliant' ? 'متوافق' : 'يحتاج مراجعة'}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">حالة الامتثال</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">إجمالي الإيرادات:</span>
                        <span className="font-medium">{wipData.complianceReport.totalRevenue.toLocaleString()} ريال</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">إجمالي التكاليف:</span>
                        <span className="font-medium">{wipData.complianceReport.totalCosts.toLocaleString()} ريال</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">فواتير زائدة:</span>
                        <span className="font-medium text-orange-600">{wipData.complianceReport.totalOverbilling.toLocaleString()} ريال</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">فواتير ناقصة:</span>
                        <span className="font-medium text-blue-600">{wipData.complianceReport.totalUnderbilling.toLocaleString()} ريال</span>
                      </div>
                    </div>

                    {wipData.complianceReport.riskProjects?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-red-600 mb-2">
                          مشاريع تحتاج مراجعة ({wipData.complianceReport.riskProjects.length})
                        </h4>
                        <div className="space-y-2">
                          {wipData.complianceReport.riskProjects.slice(0, 3).map((project: WIPProject) => (
                            <div key={project.projectId} className="text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded border-l-2 border-red-400">
                              <div className="font-medium">{project.projectName}</div>
                              <div className="text-red-600">
                                تباين: {project.varianceToOriginal.toLocaleString()} ريال
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>تفاصيل جدول الأعمال قيد التنفيذ</CardTitle>
            </CardHeader>
            <CardContent>
              {wipData?.wipSchedule && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right p-2">المشروع</th>
                        <th className="text-right p-2">قيمة العقد</th>
                        <th className="text-right p-2">نسبة الإنجاز</th>
                        <th className="text-right p-2">الإيرادات المكتسبة</th>
                        <th className="text-right p-2">المفوتر</th>
                        <th className="text-right p-2">الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wipData.wipSchedule.map((project: WIPProject) => (
                        <tr key={project.projectId} className="border-b">
                          <td className="p-2 font-medium">{project.projectName}</td>
                          <td className="p-2">{project.contractValue.toLocaleString()}</td>
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-gray-200 rounded">
                                <div 
                                  className="h-2 bg-blue-500 rounded" 
                                  style={{ width: `${Math.min(project.percentComplete, 100)}%` }}
                                />
                              </div>
                              <span>{project.percentComplete.toFixed(1)}%</span>
                            </div>
                          </td>
                          <td className="p-2">{project.earnedRevenue.toLocaleString()}</td>
                          <td className="p-2">{project.billedToDate.toLocaleString()}</td>
                          <td className="p-2">
                            {project.overbilledAmount > 0 ? (
                              <Badge variant="outline" className="text-orange-600 border-orange-600">
                                فاتورة زائدة
                              </Badge>
                            ) : project.underbilledAmount > 0 ? (
                              <Badge variant="outline" className="text-blue-600 border-blue-600">
                                فاتورة ناقصة
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                متوازن
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                تحليلات الأداء العالمية
              </CardTitle>
              <CardDescription>
                مؤشرات الأداء الرئيسية للمشاريع العالمية
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={wipData?.wipSchedule || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="projectName" 
                      tick={{ fontSize: 12 }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        `${value.toLocaleString()} ريال`, 
                        name === 'earnedRevenue' ? 'الإيرادات المكتسبة' : 'المفوتر'
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="earnedRevenue" 
                      stroke="#22c55e" 
                      strokeWidth={2}
                      name="earnedRevenue"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="billedToDate" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="billedToDate"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>توزيع المشاريع حسب النوع</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={Object.entries(
                        globalProjects.reduce((acc, project) => {
                          const type = project.projectType || 'أخرى';
                          if (!acc[type]) acc[type] = 0;
                          acc[type]++;
                          return acc;
                        }, {} as Record<string, number>)
                      ).map(([type, count]) => ({ type, count }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, count }) => `${type}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {globalProjects.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={Object.values(regionColors)[index % Object.values(regionColors).length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>مستوى التعقيد</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={Object.entries(
                    globalProjects.reduce((acc, project) => {
                      const complexity = project.complexity || 'متوسط';
                      if (!acc[complexity]) acc[complexity] = 0;
                      acc[complexity]++;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([complexity, count]) => ({ complexity, count }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="complexity" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}