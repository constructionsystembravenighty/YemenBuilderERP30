import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, CheckCircle, Clock, AlertTriangle, Settings, Filter, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface WorkflowStep {
  id: string;
  name: string;
  nameAr: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  assignee?: string;
  dueDate?: Date;
  estimatedDuration: number; // minutes
  actualDuration?: number;
  dependencies: string[];
  description?: string;
  requirements: string[];
}

interface Workflow {
  id: string;
  name: string;
  nameAr: string;
  category: 'project' | 'financial' | 'hr' | 'procurement' | 'compliance';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  createdAt: Date;
  startDate?: Date;
  dueDate?: Date;
  steps: WorkflowStep[];
  projectId?: string;
  assignedTeam: string[];
  automationRules: {
    autoStart: boolean;
    autoAssign: boolean;
    notifications: boolean;
    escalation: boolean;
  };
}

export function WorkflowManagement() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Sample workflow data
  useEffect(() => {
    const sampleWorkflows: Workflow[] = [
      {
        id: '1',
        name: 'Project Initiation',
        nameAr: 'بدء المشروع',
        category: 'project',
        status: 'active',
        priority: 'high',
        progress: 65,
        createdAt: new Date('2025-01-05'),
        startDate: new Date('2025-01-07'),
        dueDate: new Date('2025-01-15'),
        assignedTeam: ['أحمد علي', 'فاطمة محمد', 'عبدالله حسن'],
        automationRules: {
          autoStart: true,
          autoAssign: true,
          notifications: true,
          escalation: true
        },
        steps: [
          {
            id: '1-1',
            name: 'Project Documentation Review',
            nameAr: 'مراجعة وثائق المشروع',
            status: 'completed',
            assignee: 'أحمد علي',
            estimatedDuration: 120,
            actualDuration: 95,
            dependencies: [],
            requirements: ['مخططات البناء', 'تقرير الجدوى', 'موافقات البلدية']
          },
          {
            id: '1-2',
            name: 'Budget Approval',
            nameAr: 'الموافقة على الميزانية',
            status: 'in_progress',
            assignee: 'فاطمة محمد',
            estimatedDuration: 60,
            dependencies: ['1-1'],
            requirements: ['تقدير التكلفة', 'موافقة المدير المالي']
          },
          {
            id: '1-3',
            name: 'Team Assignment',
            nameAr: 'تعيين الفريق',
            status: 'pending',
            estimatedDuration: 30,
            dependencies: ['1-2'],
            requirements: ['قائمة المهارات المطلوبة', 'جداول الموظفين']
          }
        ]
      },
      {
        id: '2',
        name: 'Procurement Process',
        nameAr: 'عملية الشراء',
        category: 'procurement',
        status: 'active',
        priority: 'medium',
        progress: 40,
        createdAt: new Date('2025-01-06'),
        startDate: new Date('2025-01-08'),
        dueDate: new Date('2025-01-20'),
        assignedTeam: ['خالد منصور', 'سارة الزهراء'],
        automationRules: {
          autoStart: false,
          autoAssign: true,
          notifications: true,
          escalation: false
        },
        steps: [
          {
            id: '2-1',
            name: 'Vendor Research',
            nameAr: 'البحث عن الموردين',
            status: 'completed',
            assignee: 'خالد منصور',
            estimatedDuration: 180,
            actualDuration: 165,
            dependencies: [],
            requirements: ['قائمة المواد المطلوبة', 'معايير الجودة']
          },
          {
            id: '2-2',
            name: 'Quote Comparison',
            nameAr: 'مقارنة العروض',
            status: 'in_progress',
            assignee: 'سارة الزهراء',
            estimatedDuration: 90,
            dependencies: ['2-1'],
            requirements: ['عروض أسعار', 'تقييم الموردين']
          }
        ]
      }
    ];
    setWorkflows(sampleWorkflows);
  }, []);

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.nameAr.includes(searchTerm) || workflow.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || workflow.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      case 'skipped': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'pending': 'في الانتظار',
      'in_progress': 'قيد التنفيذ',
      'completed': 'مكتمل',
      'failed': 'فشل',
      'skipped': 'تم التخطي',
      'draft': 'مسودة',
      'active': 'نشط',
      'paused': 'متوقف',
      'cancelled': 'ملغي'
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const calculateWorkflowProgress = (workflow: Workflow) => {
    const totalSteps = workflow.steps.length;
    const completedSteps = workflow.steps.filter(step => step.status === 'completed').length;
    return totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  };

  const getWorkflowStats = () => {
    const total = workflows.length;
    const active = workflows.filter(w => w.status === 'active').length;
    const completed = workflows.filter(w => w.status === 'completed').length;
    const overdue = workflows.filter(w => w.dueDate && new Date(w.dueDate) < new Date() && w.status !== 'completed').length;
    
    return { total, active, completed, overdue };
  };

  const stats = getWorkflowStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إدارة سير العمل</h2>
          <p className="text-muted-foreground">تتبع وإدارة عمليات العمل والمهام</p>
        </div>
        <Button className="flex items-center gap-2">
          <Play className="h-4 w-4" />
          سير عمل جديد
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي العمليات</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Settings className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">العمليات النشطة</p>
                <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Play className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">العمليات المكتملة</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">العمليات المتأخرة</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="البحث في سير العمل..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                  dir="rtl"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الحالات</SelectItem>
                <SelectItem value="draft">مسودة</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="paused">متوقف</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
                <SelectItem value="cancelled">ملغي</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="الفئة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الفئات</SelectItem>
                <SelectItem value="project">مشاريع</SelectItem>
                <SelectItem value="financial">مالية</SelectItem>
                <SelectItem value="hr">موارد بشرية</SelectItem>
                <SelectItem value="procurement">مشتريات</SelectItem>
                <SelectItem value="compliance">امتثال</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflows List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>سير العمل</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="space-y-2 p-4">
                  {filteredWorkflows.map((workflow) => (
                    <div
                      key={workflow.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedWorkflow?.id === workflow.id
                          ? 'bg-primary/10 border-primary'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedWorkflow(workflow)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{workflow.nameAr}</h4>
                        <Badge 
                          variant="secondary" 
                          className={getPriorityColor(workflow.priority)}
                        >
                          {workflow.priority}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">التقدم</span>
                          <span className="font-medium">{calculateWorkflowProgress(workflow)}%</span>
                        </div>
                        <Progress value={calculateWorkflowProgress(workflow)} className="h-1" />
                        <div className="flex items-center justify-between">
                          <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>
                            {getStatusLabel(workflow.status)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {workflow.steps.length} خطوة
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Workflow Details */}
        <div className="lg:col-span-2">
          {selectedWorkflow ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedWorkflow.nameAr}</CardTitle>
                    <p className="text-sm text-muted-foreground">{selectedWorkflow.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Pause className="h-4 w-4" />
                      إيقاف
                    </Button>
                    <Button size="sm" variant="outline">
                      <RotateCcw className="h-4 w-4" />
                      إعادة تشغيل
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
                    <TabsTrigger value="steps">الخطوات</TabsTrigger>
                    <TabsTrigger value="settings">الإعدادات</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">الحالة</label>
                        <p className="text-sm text-muted-foreground">
                          {getStatusLabel(selectedWorkflow.status)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">الأولوية</label>
                        <p className="text-sm text-muted-foreground">
                          {selectedWorkflow.priority}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">تاريخ البداية</label>
                        <p className="text-sm text-muted-foreground">
                          {selectedWorkflow.startDate?.toLocaleDateString('ar-YE') || 'غير محدد'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">تاريخ الانتهاء</label>
                        <p className="text-sm text-muted-foreground">
                          {selectedWorkflow.dueDate?.toLocaleDateString('ar-YE') || 'غير محدد'}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-2">الفريق المعين</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedWorkflow.assignedTeam.map((member, index) => (
                          <Badge key={index} variant="outline">
                            {member}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">التقدم العام</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>مكتمل</span>
                          <span>{calculateWorkflowProgress(selectedWorkflow)}%</span>
                        </div>
                        <Progress value={calculateWorkflowProgress(selectedWorkflow)} />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="steps" className="space-y-4">
                    <div className="space-y-3">
                      {selectedWorkflow.steps.map((step, index) => (
                        <div key={step.id} className="border rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(step.status)}`} />
                            <h5 className="font-medium">{step.nameAr}</h5>
                            <Badge variant="outline" className="mr-auto">
                              {getStatusLabel(step.status)}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div>
                              <span className="font-medium">المكلف: </span>
                              {step.assignee || 'غير محدد'}
                            </div>
                            <div>
                              <span className="font-medium">المدة المقدرة: </span>
                              {step.estimatedDuration} دقيقة
                            </div>
                          </div>

                          {step.requirements.length > 0 && (
                            <div className="mt-3">
                              <h6 className="text-sm font-medium mb-1">المتطلبات:</h6>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {step.requirements.map((req, reqIndex) => (
                                  <li key={reqIndex} className="flex items-center gap-2">
                                    <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                                    {req}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-3">قواعد الأتمتة</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">بداية تلقائية</span>
                            <Badge variant={selectedWorkflow.automationRules.autoStart ? 'default' : 'secondary'}>
                              {selectedWorkflow.automationRules.autoStart ? 'مفعل' : 'معطل'}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">تعيين تلقائي</span>
                            <Badge variant={selectedWorkflow.automationRules.autoAssign ? 'default' : 'secondary'}>
                              {selectedWorkflow.automationRules.autoAssign ? 'مفعل' : 'معطل'}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">الإشعارات</span>
                            <Badge variant={selectedWorkflow.automationRules.notifications ? 'default' : 'secondary'}>
                              {selectedWorkflow.automationRules.notifications ? 'مفعل' : 'معطل'}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">التصعيد التلقائي</span>
                            <Badge variant={selectedWorkflow.automationRules.escalation ? 'default' : 'secondary'}>
                              {selectedWorkflow.automationRules.escalation ? 'مفعل' : 'معطل'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-[400px]">
                <div className="text-center">
                  <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">اختر سير عمل</h3>
                  <p className="text-muted-foreground">
                    اختر سير عمل من القائمة لعرض التفاصيل
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}