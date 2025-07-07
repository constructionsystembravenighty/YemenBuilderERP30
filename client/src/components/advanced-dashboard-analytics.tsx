import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, DollarSign, Users, Building, Wrench } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

interface AdvancedDashboardAnalyticsProps {
  companyId: number;
}

interface DashboardMetrics {
  totalRevenue: number;
  totalExpenses: number;
  activeProjects: number;
  totalEmployees: number;
  equipmentCount: number;
  recentTransactions: any[];
}

interface FinancialTrend {
  monthlyTrends: Array<{
    month: string;
    income: number;
    expenses: number;
    profit: number;
    profitMargin: number;
  }>;
  insights: string[];
  alerts: Array<{
    type: 'warning' | 'info' | 'success';
    message: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  projections: {
    nextMonthRevenue: number;
    nextMonthExpenses: number;
    yearEndProjection: number;
  };
}

export function AdvancedDashboardAnalytics({ companyId }: AdvancedDashboardAnalyticsProps) {
  // Fetch dashboard metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ['/api/dashboard/stats', companyId],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/stats?companyId=${companyId}`);
      if (!response.ok) throw new Error('Failed to fetch metrics');
      return response.json();
    },
    enabled: !!companyId,
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch financial trends
  const { data: financialTrends, isLoading: trendsLoading } = useQuery<FinancialTrend>({
    queryKey: ['/api/intelligence/financial-trends', companyId],
    queryFn: async () => {
      const response = await fetch(`/api/intelligence/financial-trends?companyId=${companyId}`);
      if (!response.ok) {
        // Return empty data structure for development
        return {
          monthlyTrends: [],
          insights: ['يحتاج المزيد من البيانات لتحليل الاتجاهات'],
          alerts: [],
          projections: {
            nextMonthRevenue: 0,
            nextMonthExpenses: 0,
            yearEndProjection: 0,
          },
        };
      }
      return response.json();
    },
    enabled: !!companyId,
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Fetch projects for status distribution
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['/api/projects', companyId],
    queryFn: async () => {
      const response = await fetch(`/api/projects?companyId=${companyId}`);
      if (!response.ok) throw new Error('Failed to fetch projects');
      return response.json();
    },
    enabled: !!companyId,
  });

  // Prepare chart data
  const revenueExpenseData = financialTrends?.monthlyTrends?.map((trend) => ({
    month: trend.month,
    monthAr: formatArabicMonth(trend.month),
    revenue: trend.income,
    expenses: trend.expenses,
    profit: trend.profit,
    profitMargin: trend.profitMargin,
  })) || [];

  const projectStatusData = Array.isArray(projects) 
    ? projects.reduce((acc: any, project: any) => {
        const status = project.status || 'planning';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {})
    : {};

  const statusChartData = Object.entries(projectStatusData || {}).map(([status, count]) => ({
    name: status,
    nameAr: getStatusNameAr(status),
    value: count,
    fill: getStatusColor(status),
  }));

  const kpiCards = [
    {
      title: "إجمالي الإيرادات",
      titleEn: "Total Revenue",
      value: metrics?.totalRevenue || 0,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: "up",
    },
    {
      title: "إجمالي المصروفات",
      titleEn: "Total Expenses",
      value: metrics?.totalExpenses || 0,
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-50",
      trend: "down",
    },
    {
      title: "المشاريع النشطة",
      titleEn: "Active Projects",
      value: metrics?.activeProjects || 0,
      icon: Building,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: "stable",
    },
    {
      title: "عدد الموظفين",
      titleEn: "Total Employees",
      value: metrics?.totalEmployees || 0,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      trend: "up",
    },
  ];

  if (metricsLoading || trendsLoading || projectsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-[100px] mb-2" />
                <Skeleton className="h-8 w-[60px] mb-2" />
                <Skeleton className="h-4 w-[80px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                  <p className="text-2xl font-bold">
                    {kpi.title.includes('إيرادات') || kpi.title.includes('مصروفات')
                      ? formatCurrency(kpi.value)
                      : kpi.value.toLocaleString()}
                  </p>
                  <div className="flex items-center mt-1">
                    {kpi.trend === 'up' && (
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    )}
                    {kpi.trend === 'down' && (
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {kpi.trend === 'up' ? 'زيادة' : kpi.trend === 'down' ? 'انخفاض' : 'مستقر'}
                    </span>
                  </div>
                </div>
                <div className={`${kpi.bgColor} p-3 rounded-full`}>
                  <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Financial Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            الاتجاهات المالية الشهرية
          </CardTitle>
          <CardDescription>
            تحليل الإيرادات والمصروفات والأرباح على مدار الأشهر
          </CardDescription>
        </CardHeader>
        <CardContent>
          {revenueExpenseData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={revenueExpenseData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="monthAr"
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  tickFormatter={(value) => formatCurrency(value, true)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    direction: 'rtl',
                  }}
                  labelStyle={{ color: '#64748b' }}
                  formatter={(value: any, name: string) => [
                    formatCurrency(value),
                    name === 'revenue' ? 'الإيرادات' : 
                    name === 'expenses' ? 'المصروفات' : 
                    name === 'profit' ? 'الأرباح' : name
                  ]}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stackId="1"
                  stroke="#22c55e"
                  fill="#22c55e"
                  fillOpacity={0.6}
                  name="الإيرادات"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stackId="2"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.6}
                  name="المصروفات"
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  name="الأرباح"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[400px] text-muted-foreground">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">لا توجد بيانات مالية</p>
                <p className="text-sm">أضف معاملات مالية لعرض الاتجاهات</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Project Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              توزيع حالة المشاريع
            </CardTitle>
            <CardDescription>
              نظرة عامة على حالة جميع المشاريع
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ nameAr, percent }) => `${nameAr} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      direction: 'rtl',
                    }}
                    formatter={(value: any, name: string) => [value, 'المشاريع']}
                    labelFormatter={(label) => statusChartData.find(d => d.name === label)?.nameAr || label}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <div className="text-center">
                  <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">لا توجد مشاريع</p>
                  <p className="text-sm">أضف مشاريع لعرض التوزيع</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              الرؤى المالية الذكية
            </CardTitle>
            <CardDescription>
              تحليل ذكي للأداء المالي والتوصيات
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {financialTrends?.insights?.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <TrendingUp className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                  <span className="text-sm text-blue-900">{insight}</span>
                </div>
              ))}
              
              {financialTrends?.alerts?.map((alert, index) => (
                <div key={index} className={`flex items-start gap-3 p-3 rounded-lg ${
                  alert.type === 'warning' ? 'bg-yellow-50' :
                  alert.type === 'success' ? 'bg-green-50' : 'bg-gray-50'
                }`}>
                  <div className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                    alert.type === 'warning' ? 'text-yellow-600' :
                    alert.type === 'success' ? 'text-green-600' : 'text-gray-600'
                  }`}>⚠</div>
                  <span className={`text-sm ${
                    alert.type === 'warning' ? 'text-yellow-900' :
                    alert.type === 'success' ? 'text-green-900' : 'text-gray-900'
                  }`}>{alert.message}</span>
                  <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'} className="mr-auto">
                    {alert.severity === 'high' ? 'عالي' : alert.severity === 'medium' ? 'متوسط' : 'منخفض'}
                  </Badge>
                </div>
              ))}

              {financialTrends?.projections && (
                <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                  <h4 className="text-sm font-semibold mb-2">التوقعات المالية</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>إيرادات متوقعة (الشهر القادم):</span>
                      <span className="font-medium">{formatCurrency(financialTrends.projections.nextMonthRevenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>مصروفات متوقعة (الشهر القادم):</span>
                      <span className="font-medium">{formatCurrency(financialTrends.projections.nextMonthExpenses)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span>توقعات نهاية العام:</span>
                      <span className="font-bold text-green-600">{formatCurrency(financialTrends.projections.yearEndProjection)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper functions
function formatArabicMonth(monthStr: string): string {
  const date = new Date(monthStr + '-01');
  const arabicMonths = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  return arabicMonths[date.getMonth()] + ' ' + date.getFullYear();
}

function getStatusNameAr(status: string): string {
  const statusMap: { [key: string]: string } = {
    planning: 'التخطيط',
    active: 'نشط',
    completed: 'مكتمل',
    cancelled: 'ملغي',
    on_hold: 'متوقف',
  };
  return statusMap[status] || status;
}

function getStatusColor(status: string): string {
  const colorMap: { [key: string]: string } = {
    planning: '#3B82F6',
    active: '#10B981',
    completed: '#8B5CF6',
    cancelled: '#EF4444',
    on_hold: '#F59E0B',
  };
  return colorMap[status] || '#6B7280';
}