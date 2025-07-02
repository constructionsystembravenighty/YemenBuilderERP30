import { useQuery } from "@tanstack/react-query";
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  PieChart as PieChartIcon,
  BarChart3,
  Activity
} from "lucide-react";
import { GlassmorphicCard, GlassContent, GlassHeader } from "./glassmorphic-card";
import { formatCurrency, formatPercentage } from "@/lib/currency";
import { formatArabicDate, toArabicNumerals } from "@/lib/arabic-utils";

interface DashboardChartsProps {
  companyId: number;
}

export function EnhancedDashboardCharts({ companyId }: DashboardChartsProps) {
  // Fetch financial trends for charts
  const { data: financialTrends } = useQuery({
    queryKey: ['/api/ai/financial-trends', companyId],
    queryFn: () => fetch(`/api/ai/financial-trends?companyId=${companyId}`).then(res => res.json()),
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Fetch dashboard stats
  const { data: stats } = useQuery({
    queryKey: ['/api/dashboard/stats', companyId],
    queryFn: () => fetch(`/api/dashboard/stats?companyId=${companyId}`).then(res => res.json()),
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch projects for project status chart
  const { data: projects } = useQuery({
    queryKey: ['/api/projects', companyId],
    queryFn: () => fetch(`/api/projects?companyId=${companyId}`).then(res => res.json()),
  });

  // Prepare chart data
  const revenueExpenseData = financialTrends?.monthlyTrends?.map((trend: any) => ({
    month: trend.month,
    monthAr: formatArabicDate(new Date(trend.month + '-01'), 'short'),
    revenue: trend.income,
    expenses: trend.expenses,
    profit: trend.income - trend.expenses
  })) || [];

  const projectStatusData = projects?.reduce((acc: any, project: any) => {
    const status = project.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const statusChartData = Object.entries(projectStatusData || {}).map(([status, count]) => ({
    name: status,
    nameAr: status === 'planning' ? 'التخطيط' :
           status === 'active' ? 'نشط' :
           status === 'completed' ? 'مكتمل' :
           status === 'cancelled' ? 'ملغي' : 'متوقف',
    value: count,
    fill: status === 'planning' ? '#3B82F6' :
          status === 'active' ? '#10B981' :
          status === 'completed' ? '#8B5CF6' :
          status === 'cancelled' ? '#EF4444' : '#F59E0B'
  }));

  const kpiData = [
    {
      title: "إجمالي الإيرادات",
      titleEn: "Total Revenue",
      value: stats?.totalRevenue || 0,
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "إجمالي المصروفات", 
      titleEn: "Total Expenses",
      value: stats?.totalExpenses || 0,
      change: "-3.2%",
      trend: "down",
      icon: TrendingDown,
      color: "text-red-600"
    },
    {
      title: "المشاريع النشطة",
      titleEn: "Active Projects", 
      value: stats?.activeProjects || 0,
      change: "+2",
      trend: "up",
      icon: Activity,
      color: "text-blue-600"
    },
    {
      title: "إجمالي الموظفين",
      titleEn: "Total Employees",
      value: stats?.totalEmployees || 0,
      change: "+5",
      trend: "up", 
      icon: Calendar,
      color: "text-purple-600"
    }
  ];

  // Custom tooltip for Arabic support
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-white/20">
          <p className="font-medium mb-2">{`الشهر: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => (
          <GlassmorphicCard key={index} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{kpi.title}</p>
                <p className="text-2xl font-bold">
                  {typeof kpi.value === 'number' && kpi.title.includes('إيرادات') || kpi.title.includes('مصروفات')
                    ? formatCurrency(kpi.value)
                    : toArabicNumerals(kpi.value.toString())
                  }
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {kpi.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span className={`text-xs ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {kpi.change}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-full bg-gray-100 ${kpi.color}`}>
                <kpi.icon className="h-6 w-6" />
              </div>
            </div>
          </GlassmorphicCard>
        ))}
      </div>

      {/* Revenue vs Expenses Chart */}
      <GlassmorphicCard>
        <GlassHeader 
          title="Revenue vs Expenses Trend"
          titleAr="اتجاه الإيرادات مقابل المصروفات"
        />
        <GlassContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueExpenseData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="monthAr" 
                  stroke="#6B7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6B7280"
                  fontSize={12}
                  tickFormatter={(value) => formatCurrency(value, { compact: true })}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10B981"
                  fill="url(#revenueGradient)"
                  name="الإيرادات"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#EF4444"
                  fill="url(#expenseGradient)"
                  name="المصروفات"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassContent>
      </GlassmorphicCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status Distribution */}
        <GlassmorphicCard>
          <GlassHeader 
            title="Project Status Distribution"
            titleAr="توزيع حالة المشاريع"
          />
          <GlassContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ nameAr, percent }) => `${nameAr} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      toArabicNumerals(value.toString()), 
                      statusChartData.find(item => item.name === name)?.nameAr || name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </GlassContent>
        </GlassmorphicCard>

        {/* Profit Trend */}
        <GlassmorphicCard>
          <GlassHeader 
            title="Profit Trend"
            titleAr="اتجاه الربح"
          />
          <GlassContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueExpenseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="monthAr" 
                    stroke="#6B7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6B7280"
                    fontSize={12}
                    tickFormatter={(value) => formatCurrency(value, { compact: true })}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), "الربح"]}
                    labelFormatter={(label) => `الشهر: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    stroke="#8B5CF6"
                    strokeWidth={3}
                    dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#8B5CF6", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassContent>
        </GlassmorphicCard>
      </div>
    </div>
  );
}