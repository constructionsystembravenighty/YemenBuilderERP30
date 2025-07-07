import { useQuery } from "@tanstack/react-query";
import { 
  TrendingUp, 
  FolderOpen, 
  Users, 
  Cog, 
  DollarSign, 
  Plus,
  Upload,
  MessageCircle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Video,
  Share,
  Target,
  Gauge,
  TriangleAlert,
  BarChart3,
  PieChart
} from "lucide-react";
import { GlassmorphicCard, GlassContent, GlassHeader } from "@/components/glassmorphic-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/currency";
import { 
  RevenueChart, 
  ProjectStatusChart, 
  EquipmentChart, 
  MonthlyProgressChart,
  sampleChartData,
  sampleProjectStatus,
  sampleEquipmentData
} from "@/components/charts/dashboard-charts";
import { AIInsights } from "@/components/ai-insights";
import { EnhancedDashboardCharts } from "@/components/enhanced-dashboard-charts";
import { AdvancedDashboardAnalytics } from "@/components/advanced-dashboard-analytics";

interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  activeProjects: number;
  totalEmployees: number;
  equipmentCount: number;
  recentTransactions: Array<{
    id: number;
    type: string;
    amount: number;
    description: string;
    date: string;
  }>;
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats?companyId=1"],
  });

  const { data: projects, isLoading: projectsLoading } = useQuery<Array<{
    id: number;
    name: string;
    nameAr: string;
    status: string;
    progress: number;
    budget: number;
    startDate: string;
    endDate: string;
  }>>({
    queryKey: ["/api/projects?companyId=1"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Dashboard Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">لوحة التحكم الرئيسية</h1>
            <p className="text-gray-600">مرحباً بك في نظام إدارة شركات المقاولات</p>
          </div>
          <div className="flex items-center space-x-reverse space-x-4 mt-4 md:mt-0">
            <GlassmorphicCard className="px-4 py-2">
              <span className="text-sm text-charcoal-text">آخر تحديث: </span>
              <span className="text-sm font-medium text-primary">منذ 5 دقائق</span>
            </GlassmorphicCard>
            <Button className="bg-accent hover:bg-accent/90 text-white">
              <Plus className="h-4 w-4 ml-2" />
              تحديث البيانات
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics Dashboard */}
      <div className="responsive-grid mb-8">
        {/* Financial Overview */}
        <GlassmorphicCard floating className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-reverse space-x-3">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <DollarSign className="text-white h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-charcoal-text">الإيرادات الشهرية</h3>
                <p className="text-sm text-gray-500">يناير 2024</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(stats?.totalRevenue || 0)}
              </p>
              <div className="flex items-center">
                <ArrowUp className="h-4 w-4 text-green-600 ml-1" />
                <p className="text-sm text-green-600">+12.5%</p>
              </div>
            </div>
          </div>
          <Progress value={75} className="progress-gradient" />
        </GlassmorphicCard>

        {/* Active Projects */}
        <GlassmorphicCard floating className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-reverse space-x-3">
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                <FolderOpen className="text-white h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-charcoal-text">المشاريع النشطة</h3>
                <p className="text-sm text-gray-500">جاري التنفيذ</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-accent">{stats?.activeProjects || 0}</p>
              <p className="text-sm text-blue-600">6 مشاريع جديدة</p>
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>مكتملة: 18</span>
            <span>متأخرة: 3</span>
          </div>
        </GlassmorphicCard>

        {/* Employee Count */}
        <GlassmorphicCard floating className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-reverse space-x-3">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                <Users className="text-white h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-charcoal-text">إجمالي الموظفين</h3>
                <p className="text-sm text-gray-500">جميع الفروع</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-secondary">{stats?.totalEmployees || 0}</p>
              <div className="flex items-center">
                <ArrowUp className="h-4 w-4 text-green-600 ml-1" />
                <p className="text-sm text-green-600">+8 هذا الشهر</p>
              </div>
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>إداري: 45</span>
            <span>عمال: 297</span>
          </div>
        </GlassmorphicCard>

        {/* Equipment Status */}
        <GlassmorphicCard floating className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-reverse space-x-3">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <Cog className="text-white h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-charcoal-text">المعدات</h3>
                <p className="text-sm text-gray-500">الحالة العامة</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-orange-500">{stats?.equipmentCount || 0}</p>
              <p className="text-sm text-yellow-600">5 تحت الصيانة</p>
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <Badge className="equipment-available">متاح: 142</Badge>
            <Badge className="equipment-maintenance">صيانة: 5</Badge>
            <Badge className="equipment-offline">معطل: 9</Badge>
          </div>
        </GlassmorphicCard>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <GlassmorphicCard floating className="p-0">
          <RevenueChart data={sampleChartData} />
        </GlassmorphicCard>

        {/* Project Status Chart */}
        <GlassmorphicCard floating className="p-0">
          <ProjectStatusChart data={sampleProjectStatus} />
        </GlassmorphicCard>
      </div>

      {/* Equipment and Progress Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* Equipment Status Chart */}
        <GlassmorphicCard floating className="p-0">
          <EquipmentChart data={sampleEquipmentData} />
        </GlassmorphicCard>

        {/* Monthly Progress Chart */}
        <GlassmorphicCard floating className="p-0">
          <MonthlyProgressChart data={sampleChartData} />
        </GlassmorphicCard>
      </div>

      {/* Project Management Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* Project Timeline */}
        <GlassmorphicCard floating className="p-6">
          <GlassHeader
            title="Current Projects"
            titleAr="المشاريع الحالية"
            action={
              <Button className="bg-accent hover:bg-accent/90 text-white">
                <Plus className="h-4 w-4 ml-2" />
                مشروع جديد
              </Button>
            }
          />
          
          <GlassContent>
            <div className="space-y-4">
              {(projects || []).slice(0, 3).map((project) => (
                <GlassmorphicCard key={project.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-charcoal-text">{project.nameAr || project.name}</h4>
                      <p className="text-sm text-gray-500">{project.locationAr || project.location}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={`priority-${project.priority}`}>
                        {project.priority === 'high' ? 'عالية' : 
                         project.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                      </Badge>
                      <p className="text-sm text-gray-500 mt-1">{project.progress}% مكتمل</p>
                    </div>
                  </div>
                  <Progress value={project.progress} className="progress-gradient mb-2" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>بدء: {project.startDate ? new Date(project.startDate).toLocaleDateString('ar') : 'غير محدد'}</span>
                    <span>انتهاء: {project.endDate ? new Date(project.endDate).toLocaleDateString('ar') : 'غير محدد'}</span>
                    <span>{formatCurrency(project.budget || 0)}</span>
                  </div>
                </GlassmorphicCard>
              ))}
            </div>
          </GlassContent>
        </GlassmorphicCard>

        {/* Real-time Collaboration Panel */}
        <GlassmorphicCard floating className="p-6">
          <GlassHeader
            title="Real-time Collaboration"
            titleAr="التعاون المباشر"
            action={
              <div className="flex items-center space-x-reverse space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600">15 مستخدم متصل</span>
              </div>
            }
          />
          
          <GlassContent className="space-y-6">
            {/* Active Users */}
            <div>
              <h4 className="text-sm font-medium text-charcoal-text mb-3">المستخدمون النشطون</h4>
              <div className="flex space-x-reverse space-x-2">
                {[...Array(4)].map((_, i) => (
                  <Avatar key={i} className="w-8 h-8 relative">
                    <AvatarFallback className="bg-accent text-white text-xs">
                      {String.fromCharCode(65 + i)}
                    </AvatarFallback>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </Avatar>
                ))}
                <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">+12</span>
                </div>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-charcoal-text">النشاط الأخير</h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-reverse space-x-3">
                  <Avatar className="w-8 h-8 bg-accent">
                    <AvatarFallback>
                      <Upload className="h-4 w-4 text-white" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm text-charcoal-text">أحمد محمد رفع ملف "مخطط المشروع النهائي"</p>
                    <p className="text-xs text-gray-500">منذ 5 دقائق</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-reverse space-x-3">
                  <Avatar className="w-8 h-8 bg-primary">
                    <AvatarFallback>
                      <MessageCircle className="h-4 w-4 text-white" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm text-charcoal-text">سارة علي علقت على مشروع "الأبراج التجارية"</p>
                    <p className="text-xs text-gray-500">منذ 12 دقيقة</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-reverse space-x-3">
                  <Avatar className="w-8 h-8 bg-secondary">
                    <AvatarFallback>
                      <CheckCircle className="h-4 w-4 text-white" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm text-charcoal-text">محمد صالح أكمل مهمة "مراجعة التصاميم"</p>
                    <p className="text-xs text-gray-500">منذ 18 دقيقة</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-3">
                <Button variant="ghost" className="glass-card hover-glass">
                  <Video className="h-4 w-4 text-accent ml-2" />
                  <span className="text-sm">اجتماع مرئي</span>
                </Button>
                <Button variant="ghost" className="glass-card hover-glass">
                  <Share className="h-4 w-4 text-accent ml-2" />
                  <span className="text-sm">مشاركة ملف</span>
                </Button>
              </div>
            </div>
          </GlassContent>
        </GlassmorphicCard>
      </div>

      {/* Financial and Analytics Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Financial Overview */}
        <div className="xl:col-span-2">
          <GlassmorphicCard floating className="financial-highlight p-6">
            <GlassHeader
              title="Financial Management"
              titleAr="الإدارة المالية"
              action={
                <div className="flex items-center space-x-reverse space-x-2">
                  <Badge className="ifrs-compliance">معايير IFRS</Badge>
                  <Button className="bg-primary hover:bg-primary/90 text-white">
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة معاملة
                  </Button>
                </div>
              }
            />
            
            <GlassContent>
              {/* Financial Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <GlassmorphicCard className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">الإيرادات</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(stats?.totalRevenue || 0)}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <ArrowUp className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </GlassmorphicCard>
                
                <GlassmorphicCard className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">المصروفات</p>
                      <p className="text-lg font-bold text-red-600">
                        {formatCurrency(stats?.totalExpenses || 0)}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <ArrowDown className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                </GlassmorphicCard>
                
                <GlassmorphicCard className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">الربح الصافي</p>
                      <p className="text-lg font-bold text-primary">
                        {formatCurrency((stats?.totalRevenue || 0) - (stats?.totalExpenses || 0))}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-primary bg-opacity-20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </GlassmorphicCard>
              </div>
              
              {/* Cash Flow Chart Placeholder */}
              <div className="chart-container p-4 rounded-lg">
                <h4 className="text-sm font-medium text-charcoal-text mb-4">التدفق النقدي الشهري</h4>
                <div className="h-32 flex items-end justify-between space-x-reverse space-x-2">
                  {[60, 80, 70, 90, 65, 85].map((height, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div 
                        className="w-6 bg-primary rounded-t" 
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-xs text-gray-500 mt-1">
                        {['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'][index]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassContent>
          </GlassmorphicCard>
        </div>
        
        {/* Analytics Widget */}
        <GlassmorphicCard floating className="p-6">
          <GlassHeader
            title="Smart Analytics"
            titleAr="التحليلات الذكية"
            action={
              <div className="flex space-x-reverse space-x-2">
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-white">
                  تقرير
                </Button>
                <Button size="sm" className="bg-accent hover:bg-accent/90 text-white">
                  تصدير
                </Button>
              </div>
            }
          />
          
          <GlassContent className="space-y-6">
            {/* Performance Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <GlassmorphicCard className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">الأداء العام</p>
                    <p className="text-2xl font-bold text-primary">87%</p>
                  </div>
                  <Gauge className="h-8 w-8 text-primary opacity-20" />
                </div>
              </GlassmorphicCard>
              
              <GlassmorphicCard className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">كفاءة المشاريع</p>
                    <p className="text-2xl font-bold text-accent">92%</p>
                  </div>
                  <Target className="h-8 w-8 text-accent opacity-20" />
                </div>
              </GlassmorphicCard>
            </div>
            
            {/* Key Insights */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-charcoal-text">الرؤى الرئيسية</h4>
              
              <GlassmorphicCard className="p-3">
                <div className="flex items-start space-x-reverse space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ArrowUp className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-charcoal-text font-medium">تحسن في الأداء</p>
                    <p className="text-xs text-gray-500">زيادة 15% في كفاءة المشاريع هذا الشهر</p>
                  </div>
                </div>
              </GlassmorphicCard>
              
              <GlassmorphicCard className="p-3">
                <div className="flex items-start space-x-reverse space-x-3">
                  <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TriangleAlert className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-charcoal-text font-medium">تنبيه الميزانية</p>
                    <p className="text-xs text-gray-500">3 مشاريع تقترب من حدود الميزانية</p>
                  </div>
                </div>
              </GlassmorphicCard>
            </div>
          </GlassContent>
        </GlassmorphicCard>
      </div>

      {/* Advanced Dashboard Analytics */}
      <div className="space-y-6">
        {/* Enhanced Analytics with Professional Charts */}
        <AdvancedDashboardAnalytics companyId={1} />
        
        {/* AI Insights Panel */}
        <AIInsights companyId={1} />
      </div>
    </div>
  );
}
