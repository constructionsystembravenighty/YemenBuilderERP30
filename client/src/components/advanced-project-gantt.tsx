import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Users, DollarSign, AlertTriangle, CheckCircle2, PlayCircle, Pause } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { format, differenceInDays, addDays, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Project {
  id: number;
  name: string;
  nameAr: string;
  description: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  budget: number;
  spent: number;
  progress: number;
  startDate: string;
  endDate: string;
  location: string;
  locationAr: string;
}

interface GanttTask {
  id: string;
  name: string;
  nameAr: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  dependencies: string[];
  assignee: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  project: Project;
}

const statusColors = {
  planning: 'bg-yellow-500',
  active: 'bg-green-500',
  on_hold: 'bg-orange-500',
  completed: 'bg-blue-500',
  cancelled: 'bg-red-500'
};

const priorityColors = {
  low: 'border-green-200 bg-green-50',
  medium: 'border-yellow-200 bg-yellow-50',
  high: 'border-orange-200 bg-orange-50',
  critical: 'border-red-200 bg-red-50'
};

const taskStatusColors = {
  not_started: 'bg-gray-200',
  in_progress: 'bg-blue-500',
  completed: 'bg-green-500',
  blocked: 'bg-red-500'
};

export function AdvancedProjectGantt() {
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['/api/projects'],
  });

  // Generate comprehensive Gantt chart data
  const generateGanttData = (): GanttTask[] => {
    if (!projects.length) return [];

    const tasks: GanttTask[] = [];
    
    projects.forEach((project: Project) => {
      const projectStart = parseISO(project.startDate);
      const projectEnd = parseISO(project.endDate);
      const projectDuration = differenceInDays(projectEnd, projectStart);
      
      // Generate realistic construction phases
      const phases = [
        { name: 'Site Preparation', nameAr: 'تحضير الموقع', duration: 0.1, dependencies: [] },
        { name: 'Foundation Work', nameAr: 'أعمال الأساسات', duration: 0.2, dependencies: ['site-prep'] },
        { name: 'Structural Work', nameAr: 'الأعمال الإنشائية', duration: 0.3, dependencies: ['foundation'] },
        { name: 'MEP Installation', nameAr: 'أعمال الكهرباء والسباكة', duration: 0.2, dependencies: ['structural'] },
        { name: 'Finishing Work', nameAr: 'أعمال التشطيب', duration: 0.15, dependencies: ['mep'] },
        { name: 'Final Inspection', nameAr: 'الفحص النهائي', duration: 0.05, dependencies: ['finishing'] }
      ];

      let currentStart = projectStart;
      
      phases.forEach((phase, index) => {
        const phaseDuration = Math.round(projectDuration * phase.duration);
        const phaseEnd = addDays(currentStart, phaseDuration);
        
        // Calculate phase progress based on project progress
        let phaseProgress = 0;
        const phaseStartPercent = phases.slice(0, index).reduce((sum, p) => sum + p.duration, 0) * 100;
        const phaseEndPercent = phaseStartPercent + (phase.duration * 100);
        
        if (project.progress >= phaseEndPercent) {
          phaseProgress = 100;
        } else if (project.progress > phaseStartPercent) {
          phaseProgress = ((project.progress - phaseStartPercent) / (phase.duration * 100)) * 100;
        }

        // Determine phase status
        let status: 'not_started' | 'in_progress' | 'completed' | 'blocked' = 'not_started';
        if (phaseProgress === 100) {
          status = 'completed';
        } else if (phaseProgress > 0) {
          status = 'in_progress';
        } else if (project.status === 'on_hold') {
          status = 'blocked';
        }

        tasks.push({
          id: `${project.id}-phase-${index}`,
          name: phase.name,
          nameAr: phase.nameAr,
          startDate: currentStart,
          endDate: phaseEnd,
          progress: Math.round(phaseProgress),
          dependencies: phase.dependencies.map(dep => `${project.id}-${dep}`),
          assignee: 'فريق المشروع',
          status,
          project
        });

        currentStart = addDays(phaseEnd, 1);
      });
    });

    return tasks;
  };

  const ganttTasks = generateGanttData();

  // Calculate timeline bounds
  const timelineBounds = ganttTasks.reduce(
    (bounds, task) => ({
      start: task.startDate < bounds.start ? task.startDate : bounds.start,
      end: task.endDate > bounds.end ? task.endDate : bounds.end
    }),
    { start: new Date(), end: new Date() }
  );

  const totalDays = differenceInDays(timelineBounds.end, timelineBounds.start);

  // Calculate task position and width
  const getTaskStyle = (task: GanttTask) => {
    const startOffset = differenceInDays(task.startDate, timelineBounds.start);
    const taskDuration = differenceInDays(task.endDate, task.startDate);
    
    return {
      left: `${(startOffset / totalDays) * 100}%`,
      width: `${(taskDuration / totalDays) * 100}%`
    };
  };

  const updateTaskProgress = useMutation({
    mutationFn: async ({ taskId, progress }: { taskId: string; progress: number }) => {
      // Simulate task progress update
      await new Promise(resolve => setTimeout(resolve, 500));
      return { taskId, progress };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
    }
  });

  if (isLoading) {
    return (
      <Card className="h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">جاري تحميل مخطط جانت...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Calendar className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المشاريع</p>
                <p className="text-2xl font-bold">{projects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <PlayCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">المشاريع النشطة</p>
                <p className="text-2xl font-bold">
                  {projects.filter((p: Project) => p.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <CheckCircle2 className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">المشاريع المكتملة</p>
                <p className="text-2xl font-bold">
                  {projects.filter((p: Project) => p.status === 'completed').length}
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
                <p className="text-sm text-muted-foreground">إجمالي الميزانية</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(projects.reduce((sum: number, p: Project) => sum + p.budget, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gantt Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
            <Calendar className="h-5 w-5" />
            <span>مخطط جانت التفاعلي للمشاريع</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="timeline" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="timeline">الجدول الزمني</TabsTrigger>
              <TabsTrigger value="resources">الموارد</TabsTrigger>
              <TabsTrigger value="critical-path">المسار الحرج</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="space-y-4">
              {/* Timeline Header */}
              <div className="border rounded-lg p-4 bg-background">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">الجدول الزمني</h3>
                  <div className="flex space-x-2 rtl:space-x-reverse text-sm">
                    <span>من: {format(timelineBounds.start, 'dd MMM yyyy', { locale: ar })}</span>
                    <span>إلى: {format(timelineBounds.end, 'dd MMM yyyy', { locale: ar })}</span>
                  </div>
                </div>

                {/* Timeline Scale */}
                <div className="relative h-8 border-b mb-4">
                  {Array.from({ length: Math.ceil(totalDays / 30) }, (_, i) => {
                    const monthStart = addDays(timelineBounds.start, i * 30);
                    return (
                      <div
                        key={i}
                        className="absolute top-0 text-xs text-muted-foreground"
                        style={{ left: `${(i * 30 / totalDays) * 100}%` }}
                      >
                        {format(monthStart, 'MMM yyyy', { locale: ar })}
                      </div>
                    );
                  })}
                </div>

                {/* Gantt Tasks */}
                <div className="space-y-3">
                  {ganttTasks.map((task) => (
                    <div key={task.id} className="flex items-center space-x-4 rtl:space-x-reverse">
                      {/* Task Info */}
                      <div className="w-64 flex-shrink-0">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Badge
                            variant="secondary"
                            className={`w-3 h-3 rounded-full p-0 ${taskStatusColors[task.status]}`}
                          />
                          <span className="text-sm font-medium">{task.nameAr}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {task.project.nameAr} • {task.assignee}
                        </div>
                      </div>

                      {/* Task Timeline Bar */}
                      <div className="flex-1 relative h-8">
                        <div className="absolute inset-0 bg-gray-100 rounded-lg"></div>
                        <div
                          className={`absolute top-1 bottom-1 rounded-lg ${taskStatusColors[task.status]} opacity-80`}
                          style={getTaskStyle(task)}
                        >
                          <div className="h-full flex items-center justify-center text-white text-xs font-medium">
                            {task.progress}%
                          </div>
                          {/* Progress Overlay */}
                          <div
                            className="absolute top-0 left-0 h-full bg-green-500 rounded-lg opacity-60"
                            style={{ width: `${task.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Task Actions */}
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <span className="text-sm text-muted-foreground">
                          {differenceInDays(task.endDate, task.startDate)} يوم
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const newProgress = Math.min(task.progress + 10, 100);
                            updateTaskProgress.mutate({ taskId: task.id, progress: newProgress });
                          }}
                          disabled={task.progress >= 100}
                        >
                          تحديث
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="resources" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((project: Project) => (
                  <Card key={project.id} className={`border-2 ${priorityColors[project.priority]}`}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{project.nameAr}</CardTitle>
                          <p className="text-sm text-muted-foreground">{project.locationAr}</p>
                        </div>
                        <Badge className={statusColors[project.status]}>
                          {project.status === 'active' ? 'نشط' :
                           project.status === 'planning' ? 'تخطيط' :
                           project.status === 'completed' ? 'مكتمل' :
                           project.status === 'on_hold' ? 'متوقف' : 'ملغي'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>التقدم</span>
                          <span>{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">الميزانية</p>
                            <p className="font-semibold">{formatCurrency(project.budget)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">المصروف</p>
                            <p className="font-semibold">{formatCurrency(project.spent)}</p>
                          </div>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span>البداية: {format(parseISO(project.startDate), 'dd/MM/yyyy')}</span>
                          <span>النهاية: {format(parseISO(project.endDate), 'dd/MM/yyyy')}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="critical-path" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <span>تحليل المسار الحرج</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Critical Path Analysis */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="border-orange-200 bg-orange-50">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <Clock className="h-5 w-5 text-orange-500" />
                            <div>
                              <p className="text-sm text-muted-foreground">المهام الحرجة</p>
                              <p className="text-2xl font-bold text-orange-600">
                                {ganttTasks.filter(t => t.status === 'blocked').length}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-yellow-200 bg-yellow-50">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                            <div>
                              <p className="text-sm text-muted-foreground">مخاطر التأخير</p>
                              <p className="text-2xl font-bold text-yellow-600">متوسط</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-green-200 bg-green-50">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            <div>
                              <p className="text-sm text-muted-foreground">في الموعد</p>
                              <p className="text-2xl font-bold text-green-600">
                                {projects.filter((p: Project) => p.status === 'active').length}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Critical Tasks List */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-orange-600">المهام المتأخرة والحرجة</h4>
                      {ganttTasks
                        .filter(task => task.status === 'blocked' || task.endDate < new Date())
                        .map(task => (
                        <div key={task.id} className="flex items-center justify-between p-3 border border-orange-200 rounded-lg bg-orange-50">
                          <div>
                            <p className="font-medium">{task.nameAr}</p>
                            <p className="text-sm text-muted-foreground">{task.project.nameAr}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="destructive" className="mb-1">حرج</Badge>
                            <p className="text-xs text-muted-foreground">
                              التأخير: {differenceInDays(new Date(), task.endDate)} يوم
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      {ganttTasks.filter(task => task.status === 'blocked' || task.endDate < new Date()).length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                          <p>جميع المشاريع تسير وفق الجدول الزمني المحدد</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}