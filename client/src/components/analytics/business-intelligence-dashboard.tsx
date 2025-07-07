import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, Calendar, Target, BarChart3, PieChart, LineChart, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { formatCurrency } from '@/lib/currency';
import { useQuery } from '@tanstack/react-query';

interface KPIMetric {
  id: string;
  name: string;
  nameAr: string;
  value: number;
  target: number;
  change: number;
  changeType: 'increase' | 'decrease';
  unit: string;
  category: 'financial' | 'operational' | 'quality' | 'strategic';
  format: 'currency' | 'percentage' | 'number' | 'days';
}

interface BusinessInsight {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  impact: 'high' | 'medium' | 'low';
  category: 'opportunity' | 'risk' | 'trend' | 'recommendation';
  confidence: number;
  actionItems: string[];
  dataPoints: any[];
}

interface PredictiveAnalysis {
  metric: string;
  metricAr: string;
  predictions: {
    period: string;
    value: number;
    confidence: number;
    factors: string[];
  }[];
  scenarios: {
    name: string;
    nameAr: string;
    probability: number;
    impact: number;
    description: string;
  }[];
}

export function BusinessIntelligenceDashboard() {
  const [timeRange, setTimeRange] = useState('3months');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeInsight, setActiveInsight] = useState<BusinessInsight | null>(null);

  // Fetch dashboard data
  const { data: dashboardStats } = useQuery({ queryKey: ['/api/dashboard/stats'] });
  const { data: financialTrends } = useQuery({ queryKey: ['/api/intelligence/financial-trends'] });

  // Sample KPI data
  const kpiMetrics: KPIMetric[] = [
    {
      id: '1',
      name: 'Revenue Growth',
      nameAr: 'نمو الإيرادات',
      value: 23.5,
      target: 20,
      change: 5.2,
      changeType: 'increase',
      unit: '%',
      category: 'financial',
      format: 'percentage'
    },
    {
      id: '2', 
      name: 'Project Completion Rate',
      nameAr: 'معدل إنجاز المشاريع',
      value: 87,
      target: 90,
      change: -2.1,
      changeType: 'decrease',
      unit: '%',
      category: 'operational',
      format: 'percentage'
    },
    {
      id: '3',
      name: 'Cost Efficiency',
      nameAr: 'كفاءة التكلفة',
      value: 1.24,
      target: 1.15,
      change: 0.08,
      changeType: 'decrease',
      unit: '',
      category: 'financial',
      format: 'number'
    },
    {
      id: '4',
      name: 'Employee Productivity',
      nameAr: 'إنتاجية الموظفين',
      value: 94.2,
      target: 95,
      change: 2.3,
      changeType: 'increase',
      unit: '%',
      category: 'operational',
      format: 'percentage'
    },
    {
      id: '5',
      name: 'Safety Score',
      nameAr: 'مؤشر السلامة',
      value: 98.5,
      target: 100,
      change: 1.2,
      changeType: 'increase',
      unit: '%',
      category: 'quality',
      format: 'percentage'
    },
    {
      id: '6',
      name: 'Customer Satisfaction',
      nameAr: 'رضا العملاء',
      value: 92,
      target: 95,
      change: -1.5,
      changeType: 'decrease',
      unit: '%',
      category: 'strategic',
      format: 'percentage'
    }
  ];

  // Sample business insights
  const businessInsights: BusinessInsight[] = [
    {
      id: '1',
      title: 'Seasonal Revenue Pattern Detected',
      titleAr: 'تم اكتشاف نمط موسمي في الإيرادات',
      description: 'Revenue shows 40% increase during Q2-Q3, suggesting optimal project scheduling opportunities.',
      descriptionAr: 'تظهر الإيرادات زيادة بنسبة 40% خلال الربع الثاني والثالث، مما يشير إلى فرص مثلى لجدولة المشاريع.',
      impact: 'high',
      category: 'opportunity',
      confidence: 89,
      actionItems: [
        'تخطيط المشاريع الكبيرة للربع الثاني والثالث',
        'زيادة الموارد البشرية خلال فترات الذروة',
        'تطوير استراتيجية تسويق موسمية'
      ],
      dataPoints: []
    },
    {
      id: '2',
      title: 'Cost Overrun Risk in Infrastructure Projects',
      titleAr: 'خطر تجاوز التكلفة في مشاريع البنية التحتية',
      description: 'Infrastructure projects show 15% higher cost overrun probability than other project types.',
      descriptionAr: 'تظهر مشاريع البنية التحتية احتمالية تجاوز تكلفة أعلى بنسبة 15% من أنواع المشاريع الأخرى.',
      impact: 'medium',
      category: 'risk',
      confidence: 76,
      actionItems: [
        'تحسين عملية تقدير التكلفة للمشاريع الكبيرة',
        'زيادة هامش الطوارئ بنسبة 5%',
        'تطبيق مراجعة أسبوعية للتكاليف'
      ],
      dataPoints: []
    },
    {
      id: '3',
      title: 'Equipment Utilization Optimization',
      titleAr: 'تحسين استخدام المعدات',
      description: 'Heavy equipment shows 65% average utilization, indicating 35% optimization potential.',
      descriptionAr: 'تظهر المعدات الثقيلة معدل استخدام 65% في المتوسط، مما يشير إلى إمكانية تحسين بنسبة 35%.',
      impact: 'high',
      category: 'opportunity',
      confidence: 82,
      actionItems: [
        'تطوير نظام جدولة متقدم للمعدات',
        'تحليل احتياجات المشاريع المتزامنة',
        'النظر في تأجير المعدات قصيرة الأمد'
      ],
      dataPoints: []
    }
  ];

  // Sample predictive analysis
  const predictiveAnalysis: PredictiveAnalysis[] = [
    {
      metric: 'Monthly Revenue',
      metricAr: 'الإيرادات الشهرية',
      predictions: [
        {
          period: 'Feb 2025',
          value: 2800000,
          confidence: 87,
          factors: ['موسم البناء', 'مشاريع جديدة', 'تحسن الاقتصاد']
        },
        {
          period: 'Mar 2025',
          value: 3200000,
          confidence: 81,
          factors: ['ذروة النشاط', 'إنجاز المشاريع الكبيرة']
        },
        {
          period: 'Apr 2025',
          value: 3500000,
          confidence: 75,
          factors: ['مشاريع حكومية جديدة', 'توسع السوق']
        }
      ],
      scenarios: [
        {
          name: 'Optimistic Scenario',
          nameAr: 'السيناريو المتفائل',
          probability: 25,
          impact: 20,
          description: 'نمو إضافي 20% بسبب مشاريع حكومية جديدة'
        },
        {
          name: 'Base Case',
          nameAr: 'السيناريو الأساسي',
          probability: 60,
          impact: 0,
          description: 'نمو طبيعي حسب الاتجاه الحالي'
        },
        {
          name: 'Conservative Scenario',
          nameAr: 'السيناريو المحافظ',
          probability: 15,
          impact: -15,
          description: 'انخفاض بسبب عوامل اقتصادية خارجية'
        }
      ]
    }
  ];

  // Sample market analysis data
  const marketAnalysisData = [
    { month: 'يناير', ourCompany: 2400000, marketAverage: 2100000, topCompetitor: 2800000 },
    { month: 'فبراير', ourCompany: 2600000, marketAverage: 2200000, topCompetitor: 2900000 },
    { month: 'مارس', ourCompany: 2800000, marketAverage: 2300000, topCompetitor: 3100000 },
    { month: 'أبريل', ourCompany: 3200000, marketAverage: 2500000, topCompetitor: 3200000 },
    { month: 'مايو', ourCompany: 3100000, marketAverage: 2400000, topCompetitor: 3000000 },
    { month: 'يونيو', ourCompany: 3400000, marketAverage: 2600000, topCompetitor: 3300000 }
  ];

  const projectTypeData = [
    { name: 'سكني', value: 45, color: '#0088FE' },
    { name: 'تجاري', value: 30, color: '#00C49F' },
    { name: 'بنية تحتية', value: 15, color: '#FFBB28' },
    { name: 'صناعي', value: 10, color: '#FF8042' }
  ];

  const formatValue = (value: number, format: string, unit: string) => {
    switch (format) {
      case 'currency':
        return formatCurrency(value);
      case 'percentage':
        return `${value}${unit}`;
      case 'days':
        return `${value} يوم`;
      default:
        return `${value}${unit}`;
    }
  };

  const getChangeColor = (changeType: 'increase' | 'decrease', isPositive: boolean) => {
    if (changeType === 'increase') {
      return isPositive ? 'text-green-600' : 'text-red-600';
    } else {
      return isPositive ? 'text-red-600' : 'text-green-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'financial': return <DollarSign className="h-4 w-4" />;
      case 'operational': return <Activity className="h-4 w-4" />;
      case 'quality': return <Target className="h-4 w-4" />;
      case 'strategic': return <TrendingUp className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'opportunity': return 'bg-green-100 text-green-800';
      case 'risk': return 'bg-red-100 text-red-800';
      case 'trend': return 'bg-blue-100 text-blue-800';
      case 'recommendation': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">لوحة الذكاء التجاري</h2>
          <p className="text-muted-foreground">تحليلات متقدمة وتنبؤات الأعمال</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">شهر واحد</SelectItem>
              <SelectItem value="3months">3 أشهر</SelectItem>
              <SelectItem value="6months">6 أشهر</SelectItem>
              <SelectItem value="1year">سنة</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiMetrics.map((metric) => (
          <Card key={metric.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(metric.category)}
                  <span className="text-sm font-medium">{metric.nameAr}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {metric.category}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold">
                    {formatValue(metric.value, metric.format, metric.unit)}
                  </span>
                  <span className={`text-sm flex items-center gap-1 ${getChangeColor(metric.changeType, metric.change > 0)}`}>
                    {metric.change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {Math.abs(metric.change)}%
                  </span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>الهدف: {formatValue(metric.target, metric.format, metric.unit)}</span>
                    <span>{Math.round((metric.value / metric.target) * 100)}%</span>
                  </div>
                  <Progress value={(metric.value / metric.target) * 100} className="h-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">الرؤى التجارية</TabsTrigger>
          <TabsTrigger value="predictions">التنبؤات</TabsTrigger>
          <TabsTrigger value="market">تحليل السوق</TabsTrigger>
          <TabsTrigger value="performance">الأداء المقارن</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>الرؤى التجارية الذكية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {businessInsights.map((insight) => (
                  <div 
                    key={insight.id} 
                    className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setActiveInsight(insight)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{insight.titleAr}</h4>
                      <div className="flex gap-1">
                        <Badge className={getImpactColor(insight.impact)}>
                          {insight.impact}
                        </Badge>
                        <Badge className={getCategoryColor(insight.category)}>
                          {insight.category}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {insight.descriptionAr}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        الثقة: {insight.confidence}%
                      </span>
                      <span className="text-muted-foreground">
                        {insight.actionItems.length} إجراء مقترح
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>تفاصيل الرؤية</CardTitle>
              </CardHeader>
              <CardContent>
                {activeInsight ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">{activeInsight.titleAr}</h4>
                      <p className="text-sm text-muted-foreground">
                        {activeInsight.descriptionAr}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Badge className={getImpactColor(activeInsight.impact)}>
                        التأثير: {activeInsight.impact}
                      </Badge>
                      <Badge className={getCategoryColor(activeInsight.category)}>
                        الفئة: {activeInsight.category}
                      </Badge>
                      <Badge variant="outline">
                        الثقة: {activeInsight.confidence}%
                      </Badge>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">الإجراءات المقترحة:</h5>
                      <ul className="space-y-1">
                        {activeInsight.actionItems.map((action, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <div className="w-1 h-1 bg-muted-foreground rounded-full mt-2" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">اختر رؤية للعرض</h3>
                    <p className="text-muted-foreground">
                      انقر على إحدى الرؤى لعرض التفاصيل والإجراءات المقترحة
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>التنبؤات المالية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {predictiveAnalysis[0].predictions.map((prediction, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{prediction.period}</div>
                        <div className="text-sm text-muted-foreground">
                          الثقة: {prediction.confidence}%
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatCurrency(prediction.value)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          متوقع
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>تحليل السيناريوهات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {predictiveAnalysis[0].scenarios.map((scenario, index) => (
                    <div key={index} className="p-3 border rounded">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">{scenario.nameAr}</h5>
                        <div className="flex gap-2">
                          <Badge variant="outline">
                            {scenario.probability}%
                          </Badge>
                          <Badge variant={scenario.impact > 0 ? 'default' : 'destructive'}>
                            {scenario.impact > 0 ? '+' : ''}{scenario.impact}%
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {scenario.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>مقارنة الأداء مع السوق</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={marketAnalysisData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Line type="monotone" dataKey="ourCompany" stroke="#0088FE" strokeWidth={2} name="شركتنا" />
                    <Line type="monotone" dataKey="marketAverage" stroke="#00C49F" strokeWidth={2} name="متوسط السوق" />
                    <Line type="monotone" dataKey="topCompetitor" stroke="#FF8042" strokeWidth={2} name="أقوى منافس" />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>توزيع أنواع المشاريع</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={projectTypeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {projectTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>مؤشرات الأداء الرئيسية - مقارنة زمنية</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={financialTrends?.monthlyTrends || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Area type="monotone" dataKey="income" stackId="1" stroke="#0088FE" fill="#0088FE" name="الإيرادات" />
                  <Area type="monotone" dataKey="expenses" stackId="2" stroke="#FF8042" fill="#FF8042" name="المصروفات" />
                  <Area type="monotone" dataKey="profit" stackId="3" stroke="#00C49F" fill="#00C49F" name="الربح" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}