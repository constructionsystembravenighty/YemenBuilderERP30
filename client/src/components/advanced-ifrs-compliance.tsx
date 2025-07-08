import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calculator, TrendingUp, FileText, AlertCircle, CheckCircle2, DollarSign, Calendar, BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Project {
  id: number;
  name: string;
  nameAr: string;
  budget: number;
  spent: number;
  progress: number;
  startDate: string;
  endDate: string;
  status: string;
  contractValue?: number;
  contractCurrency?: string;
  costsIncurredToDate?: number;
  estimatedTotalCosts?: number;
  revenueRecognizedToDate?: number;
}

interface IFRSRevenueRecognition {
  contractValue: number;
  costsIncurredToDate: number;
  estimatedTotalCosts: number;
  percentageComplete: number;
  revenueToRecognize: number;
  revenueRecognizedToDate: number;
  billingToDate: number;
  unbilledRevenue: number;
  overBilling: number;
}

interface IFRSComplianceReport {
  totalContracts: number;
  totalRevenue: number;
  totalBilling: number;
  complianceScore: number;
  outstandingIssues: string[];
  recommendations: string[];
}

const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

export function AdvancedIFRSCompliance() {
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['/api/projects'],
  });

  // Simulate IFRS calculations
  const calculateIFRSData = () => {
    const ifrsData = projects.map((project: Project) => {
      const contractValue = project.budget || 0;
      const costsIncurredToDate = project.spent || 0;
      const estimatedTotalCosts = project.budget * 0.85; // Assume 85% of budget as estimated costs
      const percentageComplete = costsIncurredToDate / estimatedTotalCosts;
      const revenueToRecognize = contractValue * Math.min(percentageComplete, 1);
      const revenueRecognizedToDate = project.progress * contractValue / 100;
      const billingToDate = revenueRecognizedToDate * 1.1; // Assume 10% over billing
      const unbilledRevenue = Math.max(0, revenueToRecognize - billingToDate);
      const overBilling = Math.max(0, billingToDate - revenueToRecognize);

      return {
        project,
        ifrs: {
          contractValue,
          costsIncurredToDate,
          estimatedTotalCosts,
          percentageComplete: Math.min(percentageComplete * 100, 100),
          revenueToRecognize,
          revenueRecognizedToDate,
          billingToDate,
          unbilledRevenue,
          overBilling
        } as IFRSRevenueRecognition
      };
    });

    return ifrsData;
  };

  const ifrsProjectData = calculateIFRSData();

  // Generate compliance report
  const generateComplianceReport = (): IFRSComplianceReport => {
    const totalContracts = projects.length;
    const totalRevenue = ifrsProjectData.reduce((sum, item) => sum + item.ifrs.revenueToRecognize, 0);
    const totalBilling = ifrsProjectData.reduce((sum, item) => sum + item.ifrs.billingToDate, 0);
    
    // Calculate compliance score based on various factors
    const factorsChecked = [
      ifrsProjectData.every(item => item.ifrs.percentageComplete >= 0), // Valid percentage
      ifrsProjectData.every(item => item.ifrs.contractValue > 0), // Valid contract value
      ifrsProjectData.every(item => item.ifrs.estimatedTotalCosts > 0), // Valid cost estimate
      Math.abs(totalRevenue - totalBilling) / totalRevenue < 0.1, // Billing variance < 10%
    ];
    
    const complianceScore = (factorsChecked.filter(Boolean).length / factorsChecked.length) * 100;

    const outstandingIssues = [];
    const recommendations = [];

    if (Math.abs(totalRevenue - totalBilling) / totalRevenue > 0.1) {
      outstandingIssues.push('فروق كبيرة بين الإيرادات المحققة والفواتير المصدرة');
      recommendations.push('مراجعة عملية إصدار الفواتير لضمان التوافق مع الإيرادات المحققة');
    }

    if (ifrsProjectData.some(item => item.ifrs.overBilling > item.ifrs.contractValue * 0.1)) {
      outstandingIssues.push('فوترة زائدة في بعض المشاريع تتجاوز 10% من قيمة العقد');
      recommendations.push('تطبيق ضوابط أكثر صرامة على عملية الفوترة المرحلية');
    }

    if (ifrsProjectData.some(item => item.ifrs.percentageComplete > 100)) {
      outstandingIssues.push('نسب إنجاز غير واقعية في بعض المشاريع');
      recommendations.push('مراجعة طريقة حساب نسب الإنجاز والتكاليف المقدرة');
    }

    return {
      totalContracts,
      totalRevenue,
      totalBilling,
      complianceScore,
      outstandingIssues,
      recommendations
    };
  };

  const complianceReport = generateComplianceReport();

  // Generate monthly revenue recognition data
  const monthlyRevenueData = [
    { month: 'يناير', planned: 2500000, recognized: 2300000, billed: 2400000 },
    { month: 'فبراير', planned: 3000000, recognized: 2800000, billed: 2900000 },
    { month: 'مارس', planned: 3500000, recognized: 3200000, billed: 3300000 },
    { month: 'أبريل', planned: 4000000, recognized: 3800000, billed: 3900000 },
    { month: 'مايو', planned: 4200000, recognized: 4000000, billed: 4100000 },
    { month: 'يونيو', planned: 4500000, recognized: 4300000, billed: 4400000 },
  ];

  // Generate project distribution data
  const projectDistribution = projects.map((project: Project, index: number) => ({
    name: project.nameAr,
    value: project.budget,
    color: COLORS[index % COLORS.length]
  }));

  const generateIFRSReport = useMutation({
    mutationFn: async (reportType: 'monthly' | 'quarterly' | 'annual') => {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { reportType, generated: true };
    },
    onSuccess: (data) => {
      console.log(`IFRS ${data.reportType} report generated successfully`);
    }
  });

  if (isLoading) {
    return (
      <Card className="h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">جاري تحميل بيانات الامتثال للمعايير الدولية...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* IFRS Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">نقاط الامتثال</p>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round(complianceReport.complianceScore)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">إجمالي العقود</p>
                <p className="text-2xl font-bold">{complianceReport.totalContracts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">الإيرادات المحققة</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(complianceReport.totalRevenue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <DollarSign className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الفواتير</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(complianceReport.totalBilling)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* IFRS Detailed Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
            <Calculator className="h-5 w-5" />
            <span>تحليل الامتثال للمعايير الدولية للتقارير المالية (IFRS)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="revenue-recognition" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="revenue-recognition">الاعتراف بالإيرادات</TabsTrigger>
              <TabsTrigger value="project-analysis">تحليل المشاريع</TabsTrigger>
              <TabsTrigger value="compliance-report">تقرير الامتثال</TabsTrigger>
              <TabsTrigger value="reports">التقارير</TabsTrigger>
            </TabsList>

            <TabsContent value="revenue-recognition" className="space-y-6">
              {/* Revenue Recognition Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>منحنى الاعتراف بالإيرادات الشهري</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} />
                      <Tooltip
                        formatter={(value: number) => [formatCurrency(value), '']}
                        labelFormatter={(label) => `الشهر: ${label}`}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="planned"
                        stackId="1"
                        stroke="#8B5CF6"
                        fill="#8B5CF6"
                        fillOpacity={0.6}
                        name="الإيرادات المخططة"
                      />
                      <Area
                        type="monotone"
                        dataKey="recognized"
                        stackId="2"
                        stroke="#06B6D4"
                        fill="#06B6D4"
                        fillOpacity={0.6}
                        name="الإيرادات المحققة"
                      />
                      <Area
                        type="monotone"
                        dataKey="billed"
                        stackId="3"
                        stroke="#10B981"
                        fill="#10B981"
                        fillOpacity={0.6}
                        name="الفواتير المصدرة"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Project Revenue Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>توزيع الإيرادات حسب المشروع</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={projectDistribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                        >
                          {projectDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>مؤشرات الامتثال الرئيسية</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">دقة حساب نسبة الإنجاز</span>
                        <span className="text-sm font-medium">95%</span>
                      </div>
                      <Progress value={95} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">توافق الإيرادات مع الفواتير</span>
                        <span className="text-sm font-medium">88%</span>
                      </div>
                      <Progress value={88} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">اكتمال البيانات المطلوبة</span>
                        <span className="text-sm font-medium">92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">الامتثال العام للمعايير</span>
                        <span className="text-sm font-medium">{Math.round(complianceReport.complianceScore)}%</span>
                      </div>
                      <Progress value={complianceReport.complianceScore} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="project-analysis" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>تحليل IFRS 15 للمشاريع</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">المشروع</TableHead>
                        <TableHead className="text-right">قيمة العقد</TableHead>
                        <TableHead className="text-right">نسبة الإنجاز</TableHead>
                        <TableHead className="text-right">الإيرادات المحققة</TableHead>
                        <TableHead className="text-right">الفواتير المصدرة</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ifrsProjectData.map(({ project, ifrs }) => (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">
                            <div>
                              <p className="font-semibold">{project.nameAr}</p>
                              <p className="text-sm text-muted-foreground">{project.status}</p>
                            </div>
                          </TableCell>
                          <TableCell>{formatCurrency(ifrs.contractValue)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                              <span>{Math.round(ifrs.percentageComplete)}%</span>
                              <Progress value={ifrs.percentageComplete} className="w-16 h-2" />
                            </div>
                          </TableCell>
                          <TableCell>{formatCurrency(ifrs.revenueToRecognize)}</TableCell>
                          <TableCell>{formatCurrency(ifrs.billingToDate)}</TableCell>
                          <TableCell>
                            {ifrs.overBilling > ifrs.contractValue * 0.05 ? (
                              <Badge variant="destructive">فوترة زائدة</Badge>
                            ) : ifrs.unbilledRevenue > ifrs.contractValue * 0.05 ? (
                              <Badge variant="secondary">إيرادات غير مفوترة</Badge>
                            ) : (
                              <Badge variant="default" className="bg-green-500">متوازن</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compliance-report" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                      <span>القضايا المعلقة</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {complianceReport.outstandingIssues.length > 0 ? (
                      <div className="space-y-3">
                        {complianceReport.outstandingIssues.map((issue, index) => (
                          <div key={index} className="flex items-start space-x-3 rtl:space-x-reverse p-3 border border-orange-200 rounded-lg bg-orange-50">
                            <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm">{issue}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                        <p className="text-muted-foreground">لا توجد قضايا معلقة</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                      <span>التوصيات</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {complianceReport.recommendations.length > 0 ? (
                      <div className="space-y-3">
                        {complianceReport.recommendations.map((recommendation, index) => (
                          <div key={index} className="flex items-start space-x-3 rtl:space-x-reverse p-3 border border-blue-200 rounded-lg bg-blue-50">
                            <TrendingUp className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm">{recommendation}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                        <p className="text-muted-foreground">جميع المعايير مطبقة بشكل صحيح</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Compliance Score Card */}
              <Card className="border-2 border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    <span>نقاط الامتثال الإجمالية</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-6xl font-bold text-green-600 mb-2">
                      {Math.round(complianceReport.complianceScore)}%
                    </div>
                    <p className="text-muted-foreground mb-4">
                      مستوى الامتثال للمعايير الدولية للتقارير المالية
                    </p>
                    <Progress value={complianceReport.complianceScore} className="h-4 mb-4" />
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="font-semibold text-green-600">ممتاز</p>
                        <p className="text-muted-foreground">90% وأكثر</p>
                      </div>
                      <div>
                        <p className="font-semibold text-yellow-600">جيد</p>
                        <p className="text-muted-foreground">70% - 89%</p>
                      </div>
                      <div>
                        <p className="font-semibold text-red-600">يحتاج تحسين</p>
                        <p className="text-muted-foreground">أقل من 70%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">التقرير الشهري</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      تقرير شامل للامتثال الشهري مع تحليل الإيرادات والفواتير
                    </p>
                    <Button
                      onClick={() => generateIFRSReport.mutate('monthly')}
                      disabled={generateIFRSReport.isPending}
                      className="w-full"
                    >
                      {generateIFRSReport.isPending ? 'جاري الإنشاء...' : 'إنشاء التقرير'}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">التقرير الربعي</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      تقرير ربعي مفصل مع تحليل الاتجاهات والتوقعات
                    </p>
                    <Button
                      onClick={() => generateIFRSReport.mutate('quarterly')}
                      disabled={generateIFRSReport.isPending}
                      className="w-full"
                      variant="outline"
                    >
                      {generateIFRSReport.isPending ? 'جاري الإنشاء...' : 'إنشاء التقرير'}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">التقرير السنوي</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      تقرير سنوي شامل للامتثال والأداء المالي
                    </p>
                    <Button
                      onClick={() => generateIFRSReport.mutate('annual')}
                      disabled={generateIFRSReport.isPending}
                      className="w-full"
                      variant="secondary"
                    >
                      {generateIFRSReport.isPending ? 'جاري الإنشاء...' : 'إنشاء التقرير'}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Report History */}
              <Card>
                <CardHeader>
                  <CardTitle>سجل التقارير</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">نوع التقرير</TableHead>
                        <TableHead className="text-right">تاريخ الإنشاء</TableHead>
                        <TableHead className="text-right">الفترة</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                        <TableHead className="text-right">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">تقرير شهري</TableCell>
                        <TableCell>{format(new Date(), 'dd/MM/yyyy', { locale: ar })}</TableCell>
                        <TableCell>يناير 2025</TableCell>
                        <TableCell>
                          <Badge variant="default" className="bg-green-500">مكتمل</Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">تحميل</Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">تقرير ربعي</TableCell>
                        <TableCell>{format(new Date(), 'dd/MM/yyyy', { locale: ar })}</TableCell>
                        <TableCell>Q4 2024</TableCell>
                        <TableCell>
                          <Badge variant="default" className="bg-green-500">مكتمل</Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">تحميل</Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">تقرير سنوي</TableCell>
                        <TableCell>{format(new Date(), 'dd/MM/yyyy', { locale: ar })}</TableCell>
                        <TableCell>2024</TableCell>
                        <TableCell>
                          <Badge variant="secondary">قيد الإعداد</Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" disabled>جاري الإعداد</Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}