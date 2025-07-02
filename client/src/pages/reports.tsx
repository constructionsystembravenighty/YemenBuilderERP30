import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GlassmorphicCard, GlassHeader, GlassContent } from "@/components/glassmorphic-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area } from 'recharts';
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Building, 
  Wrench,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { formatArabicDate, formatArabicCount } from "@/lib/arabic-utils";

// Sample data for charts - In production, this would come from API
const monthlyRevenueData = [
  { name: 'يناير', revenue: 450000, expenses: 320000, profit: 130000 },
  { name: 'فبراير', revenue: 520000, expenses: 380000, profit: 140000 },
  { name: 'مارس', revenue: 480000, expenses: 340000, profit: 140000 },
  { name: 'أبريل', revenue: 600000, expenses: 420000, profit: 180000 },
  { name: 'مايو', revenue: 750000, expenses: 520000, profit: 230000 },
  { name: 'يونيو', revenue: 680000, expenses: 480000, profit: 200000 },
];

const projectStatusData = [
  { name: 'مكتمل', value: 35, color: '#10B981' },
  { name: 'قيد التنفيذ', value: 45, color: '#3B82F6' },
  { name: 'متأخر', value: 15, color: '#EF4444' },
  { name: 'معلق', value: 5, color: '#F59E0B' },
];

const equipmentStatusData = [
  { name: 'يناير', active: 25, maintenance: 5, repair: 2 },
  { name: 'فبراير', active: 28, maintenance: 4, repair: 1 },
  { name: 'مارس', active: 30, maintenance: 3, repair: 2 },
  { name: 'أبريل', active: 32, maintenance: 6, repair: 1 },
  { name: 'مايو', active: 35, maintenance: 4, repair: 3 },
  { name: 'يونيو', active: 38, maintenance: 2, repair: 1 },
];

const departmentPerformanceData = [
  { department: 'الهندسة', projects: 12, completed: 10, revenue: 2500000 },
  { department: 'البناء', projects: 8, completed: 6, revenue: 1800000 },
  { department: 'الكهرباء', projects: 15, completed: 13, revenue: 950000 },
  { department: 'السباكة', projects: 10, completed: 9, revenue: 720000 },
  { department: 'التشطيبات', projects: 6, completed: 5, revenue: 650000 },
];

export default function Reports() {
  const [dateRange, setDateRange] = useState("30days");
  const [reportType, setReportType] = useState("overview");
  const [isExporting, setIsExporting] = useState(false);

  const { data: dashboardStats } = useQuery({
    queryKey: ["/api/dashboard/stats?companyId=1"],
  });

  const { data: transactions } = useQuery({
    queryKey: ["/api/transactions?companyId=1"],
  });

  const { data: projects } = useQuery({
    queryKey: ["/api/projects?companyId=1"],
  });

  const { data: equipment } = useQuery({
    queryKey: ["/api/equipment?companyId=1"],
  });

  const handleExport = async (format: 'pdf' | 'excel') => {
    setIsExporting(true);
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      // In production, this would trigger actual file download
      console.log(`Exporting ${reportType} report as ${format}`);
    }, 2000);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {typeof entry.value === 'number' && entry.dataKey?.includes('revenue') || entry.dataKey?.includes('expenses') || entry.dataKey?.includes('profit') ? 
                formatCurrency(entry.value) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <GlassmorphicCard>
        <GlassHeader
          title="Reports & Analytics"
          titleAr="التقارير والتحليلات"
          description="Comprehensive business intelligence and reporting"
          descriptionAr="تحليلات وتقارير الأعمال الشاملة"
          action={
            <div className="flex gap-2">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value="7days">آخر 7 أيام</option>
                <option value="30days">آخر 30 يوم</option>
                <option value="90days">آخر 3 شهور</option>
                <option value="1year">السنة الحالية</option>
              </select>
              <Button 
                onClick={() => handleExport('pdf')} 
                disabled={isExporting}
                className="gap-2"
                variant="outline"
              >
                <Download className="h-4 w-4" />
                {isExporting ? "جاري التصدير..." : "تصدير PDF"}
              </Button>
            </div>
          }
        />
        
        <GlassContent>
          <Tabs value={reportType} onValueChange={setReportType} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
              <TabsTrigger value="financial">مالي</TabsTrigger>
              <TabsTrigger value="projects">المشاريع</TabsTrigger>
              <TabsTrigger value="operations">العمليات</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <GlassmorphicCard className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">الإيرادات الشهرية</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency((dashboardStats as any)?.totalRevenue || 0)}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600">+12.5%</span>
                      </div>
                    </div>
                    <DollarSign className="h-8 w-8 text-primary" />
                  </div>
                </GlassmorphicCard>
                
                <GlassmorphicCard className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">المشاريع النشطة</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {(dashboardStats as any)?.activeProjects || 0}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600">+8.2%</span>
                      </div>
                    </div>
                    <Building className="h-8 w-8 text-primary" />
                  </div>
                </GlassmorphicCard>
                
                <GlassmorphicCard className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">إجمالي الموظفين</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {(dashboardStats as any)?.totalEmployees || 0}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600">+5.1%</span>
                      </div>
                    </div>
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                </GlassmorphicCard>
                
                <GlassmorphicCard className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">المعدات النشطة</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {(dashboardStats as any)?.equipmentCount || 0}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        <span className="text-sm text-red-600">-2.3%</span>
                      </div>
                    </div>
                    <Wrench className="h-8 w-8 text-primary" />
                  </div>
                </GlassmorphicCard>
              </div>

              {/* Revenue vs Expenses Chart */}
              <GlassmorphicCard className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-right">
                  الإيرادات مقابل المصروفات (6 أشهر)
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stackId="1"
                        stroke="#10B981" 
                        fill="#10B981" 
                        fillOpacity={0.6}
                        name="الإيرادات"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="expenses" 
                        stackId="2"
                        stroke="#EF4444" 
                        fill="#EF4444" 
                        fillOpacity={0.6}
                        name="المصروفات"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </GlassmorphicCard>

              {/* Project Status Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassmorphicCard className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 text-right">
                    توزيع حالة المشاريع
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={projectStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {projectStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {projectStatusData.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm text-gray-600">
                          {item.name} ({item.value}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </GlassmorphicCard>

                <GlassmorphicCard className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 text-right">
                    حالة المعدات
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={equipmentStatusData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="active" fill="#10B981" name="نشط" />
                        <Bar dataKey="maintenance" fill="#F59E0B" name="صيانة" />
                        <Bar dataKey="repair" fill="#EF4444" name="إصلاح" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </GlassmorphicCard>
              </div>
            </TabsContent>
            
            <TabsContent value="financial" className="space-y-6">
              <GlassmorphicCard className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-right">
                  التحليل المالي المفصل
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        name="الإيرادات"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="expenses" 
                        stroke="#EF4444" 
                        strokeWidth={2}
                        name="المصروفات"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="profit" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        name="الربح"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </GlassmorphicCard>

              {/* Financial Summary Table */}
              <GlassmorphicCard className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-right">
                  ملخص مالي تفصيلي
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-3 text-right font-medium text-gray-600">الشهر</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-600">الإيرادات</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-600">المصروفات</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-600">الربح الصافي</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-600">هامش الربح</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyRevenueData.map((row, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="px-4 py-3 font-medium">{row.name}</td>
                          <td className="px-4 py-3 text-green-600">{formatCurrency(row.revenue)}</td>
                          <td className="px-4 py-3 text-red-600">{formatCurrency(row.expenses)}</td>
                          <td className="px-4 py-3 text-blue-600">{formatCurrency(row.profit)}</td>
                          <td className="px-4 py-3">
                            <Badge className="bg-green-100 text-green-800">
                              {((row.profit / row.revenue) * 100).toFixed(1)}%
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassmorphicCard>
            </TabsContent>
            
            <TabsContent value="projects" className="space-y-6">
              <GlassmorphicCard className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-right">أداء المشاريع</h3>
                <div className="space-y-4">
                  {Array.isArray(projects) && projects.slice(0, 5).map((project: any, index: number) => (
                    <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {project.status === 'completed' && <CheckCircle className="h-5 w-5 text-green-600" />}
                          {project.status === 'in_progress' && <Clock className="h-5 w-5 text-blue-600" />}
                          {project.status === 'delayed' && <AlertCircle className="h-5 w-5 text-red-600" />}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{project.nameAr || project.name}</h4>
                          <p className="text-sm text-gray-600">
                            {formatArabicDate(project.startDate)} - {formatArabicDate(project.endDate)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatCurrency(project.budget)}</p>
                        <Badge className={
                          project.status === 'completed' ? 'bg-green-100 text-green-800' :
                          project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {project.status === 'completed' ? 'مكتمل' :
                           project.status === 'in_progress' ? 'قيد التنفيذ' : 'متأخر'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassmorphicCard>
            </TabsContent>
            
            <TabsContent value="operations" className="space-y-6">
              <GlassmorphicCard className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-right">
                  أداء الأقسام
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-3 text-right font-medium text-gray-600">القسم</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-600">المشاريع</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-600">المكتملة</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-600">الإيرادات</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-600">معدل الإنجاز</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departmentPerformanceData.map((dept, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="px-4 py-3 font-medium">{dept.department}</td>
                          <td className="px-4 py-3">{dept.projects}</td>
                          <td className="px-4 py-3 text-green-600">{dept.completed}</td>
                          <td className="px-4 py-3">{formatCurrency(dept.revenue)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full"
                                  style={{ width: `${(dept.completed / dept.projects) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">
                                {Math.round((dept.completed / dept.projects) * 100)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassmorphicCard>
            </TabsContent>
          </Tabs>
        </GlassContent>
      </GlassmorphicCard>
    </div>
  );
}