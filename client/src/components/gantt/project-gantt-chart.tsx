import React, { useState, useMemo } from 'react';
import { format, addDays, differenceInDays, parseISO, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { ar } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar, ZoomIn, ZoomOut, Users, Clock, DollarSign, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/currency';

interface Task {
  id: string;
  name: string;
  nameAr: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee?: {
    id: string;
    name: string;
    nameAr: string;
    avatar?: string;
  };
  dependencies?: string[];
  budget?: number;
  actualCost?: number;
  description?: string;
  descriptionAr?: string;
}

interface Project {
  id: string;
  name: string;
  nameAr: string;
  startDate: Date;
  endDate: Date;
  budget: number;
  actualCost: number;
  status: 'planning' | 'active' | 'completed' | 'on_hold' | 'cancelled';
  progress: number;
  tasks: Task[];
}

interface ProjectGanttChartProps {
  projects: Project[];
  viewMode?: 'day' | 'week' | 'month';
  onTaskClick?: (task: Task) => void;
  onProjectClick?: (project: Project) => void;
}

const statusColors = {
  not_started: 'bg-gray-400',
  in_progress: 'bg-blue-500',
  completed: 'bg-green-500',
  delayed: 'bg-red-500',
  on_hold: 'bg-yellow-500',
};

const statusLabelsAr = {
  not_started: 'لم تبدأ',
  in_progress: 'قيد التنفيذ',
  completed: 'مكتملة',
  delayed: 'متأخرة',
  on_hold: 'معلقة',
};

const priorityColors = {
  low: 'border-l-gray-400',
  medium: 'border-l-blue-500',
  high: 'border-l-orange-500',
  critical: 'border-l-red-500',
};

const priorityLabelsAr = {
  low: 'منخفضة',
  medium: 'متوسطة',
  high: 'عالية',
  critical: 'حرجة',
};

export function ProjectGanttChart({ 
  projects, 
  viewMode = 'week',
  onTaskClick,
  onProjectClick 
}: ProjectGanttChartProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedViewMode, setSelectedViewMode] = useState(viewMode);
  const [zoom, setZoom] = useState(1);

  // Generate timeline based on view mode
  const timeline = useMemo(() => {
    const start = startOfWeek(currentDate, { locale: ar });
    const end = endOfWeek(addDays(start, selectedViewMode === 'day' ? 7 : selectedViewMode === 'week' ? 21 : 90), { locale: ar });
    
    return eachDayOfInterval({ start, end });
  }, [currentDate, selectedViewMode]);

  // Calculate task position and width
  const getTaskDimensions = (task: Task) => {
    const timelineStart = timeline[0];
    const timelineEnd = timeline[timeline.length - 1];
    const totalDays = differenceInDays(timelineEnd, timelineStart);
    
    const taskStart = Math.max(0, differenceInDays(task.startDate, timelineStart));
    const taskEnd = Math.min(totalDays, differenceInDays(task.endDate, timelineStart));
    const taskDuration = Math.max(1, taskEnd - taskStart);
    
    return {
      left: `${(taskStart / totalDays) * 100}%`,
      width: `${(taskDuration / totalDays) * 100}%`,
    };
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const daysToMove = selectedViewMode === 'day' ? 7 : selectedViewMode === 'week' ? 21 : 90;
    setCurrentDate(prev => addDays(prev, direction === 'next' ? daysToMove : -daysToMove));
  };

  return (
    <TooltipProvider>
      <Card className="w-full bg-white/95 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                <Calendar className="h-6 w-6" />
                مخطط جانت للمشاريع
              </CardTitle>
              <p className="text-gray-600 mt-1">تتبع تقدم المشاريع والمهام بصرياً</p>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={selectedViewMode} onValueChange={(value: any) => setSelectedViewMode(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">يومي</SelectItem>
                  <SelectItem value="week">أسبوعي</SelectItem>
                  <SelectItem value="month">شهري</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(Math.min(2, zoom + 0.25))}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDate('prev')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                >
                  اليوم
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDate('next')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
            {/* Timeline Header */}
            <div className="flex border-b bg-gray-50/80">
              <div className="w-80 px-4 py-3 border-l bg-white font-semibold text-primary">
                المشروع / المهمة
              </div>
              <div className="flex-1 relative">
                <div className="flex">
                  {timeline.map((date, index) => (
                    <div
                      key={index}
                      className="flex-1 px-2 py-3 text-center text-sm border-l border-gray-200 min-w-[80px]"
                    >
                      <div className="font-medium text-gray-700">
                        {format(date, 'EEE', { locale: ar })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(date, 'dd/MM', { locale: ar })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Projects and Tasks */}
            <div className="divide-y divide-gray-100">
              {projects.map((project) => (
                <div key={project.id} className="group">
                  {/* Project Row */}
                  <div 
                    className="flex hover:bg-blue-50/50 cursor-pointer transition-colors"
                    onClick={() => onProjectClick?.(project)}
                  >
                    <div className="w-80 px-4 py-4 border-l bg-gradient-to-l from-blue-50/30 to-transparent">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-primary text-base mb-1">
                            {project.nameAr}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              <span>{formatCurrency(project.actualCost, 'YER')} / {formatCurrency(project.budget, 'YER')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{format(project.startDate, 'dd/MM/yyyy', { locale: ar })}</span>
                            </div>
                          </div>
                          <Progress value={project.progress} className="mt-2 h-2" />
                        </div>
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "ml-2",
                            project.status === 'active' && "bg-green-100 text-green-800",
                            project.status === 'planning' && "bg-blue-100 text-blue-800",
                            project.status === 'on_hold' && "bg-yellow-100 text-yellow-800",
                            project.status === 'completed' && "bg-gray-100 text-gray-800"
                          )}
                        >
                          {project.status === 'active' && 'نشط'}
                          {project.status === 'planning' && 'تخطيط'}
                          {project.status === 'on_hold' && 'معلق'}
                          {project.status === 'completed' && 'مكتمل'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex-1 relative py-4">
                      <div 
                        className="absolute top-1/2 transform -translate-y-1/2 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded shadow-md opacity-90"
                        style={getTaskDimensions({
                          id: project.id,
                          name: project.name,
                          nameAr: project.nameAr,
                          startDate: project.startDate,
                          endDate: project.endDate,
                          progress: project.progress,
                          status: 'in_progress' as const,
                          priority: 'medium' as const,
                        })}
                      >
                        <div 
                          className="h-full bg-blue-700 rounded-r"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tasks */}
                  {project.tasks.map((task) => (
                    <div 
                      key={task.id}
                      className={cn(
                        "flex hover:bg-gray-50/50 cursor-pointer transition-colors border-l-4",
                        priorityColors[task.priority]
                      )}
                      onClick={() => onTaskClick?.(task)}
                    >
                      <div className="w-80 px-6 py-3 border-l bg-gray-50/30">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800 mb-1">
                              {task.nameAr}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-gray-600">
                              {task.assignee && (
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  <span>{task.assignee.nameAr}</span>
                                </div>
                              )}
                              {task.budget && (
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  <span>{formatCurrency(task.actualCost || 0, 'YER')}/{formatCurrency(task.budget, 'YER')}</span>
                                </div>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {priorityLabelsAr[task.priority]}
                              </Badge>
                            </div>
                            {task.status === 'delayed' && (
                              <div className="flex items-center gap-1 text-red-600 text-xs mt-1">
                                <AlertTriangle className="h-3 w-3" />
                                <span>متأخرة عن الموعد</span>
                              </div>
                            )}
                          </div>
                          <Badge 
                            variant="secondary"
                            className={cn(
                              "text-xs",
                              task.status === 'completed' && "bg-green-100 text-green-800",
                              task.status === 'in_progress' && "bg-blue-100 text-blue-800",
                              task.status === 'delayed' && "bg-red-100 text-red-800",
                              task.status === 'on_hold' && "bg-yellow-100 text-yellow-800",
                              task.status === 'not_started' && "bg-gray-100 text-gray-800"
                            )}
                          >
                            {statusLabelsAr[task.status]}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex-1 relative py-3">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div 
                              className={cn(
                                "absolute top-1/2 transform -translate-y-1/2 h-6 rounded shadow-sm",
                                statusColors[task.status]
                              )}
                              style={getTaskDimensions(task)}
                            >
                              <div 
                                className="h-full bg-black/20 rounded-r transition-all duration-300"
                                style={{ width: `${task.progress}%` }}
                              />
                              {/* Progress indicator */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-white text-xs font-medium">
                                  {task.progress}%
                                </span>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="bg-white border shadow-lg">
                            <div className="p-2 space-y-1 text-sm">
                              <div className="font-semibold">{task.nameAr}</div>
                              <div className="text-gray-600">
                                {format(task.startDate, 'dd/MM/yyyy', { locale: ar })} - {format(task.endDate, 'dd/MM/yyyy', { locale: ar })}
                              </div>
                              <div className="text-gray-600">التقدم: {task.progress}%</div>
                              {task.description && (
                                <div className="text-gray-600 max-w-xs">
                                  {task.descriptionAr || task.description}
                                </div>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          
          {/* Legend */}
          <div className="border-t bg-gray-50/50 px-4 py-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">الحالة:</span>
                  {Object.entries(statusColors).map(([status, color]) => (
                    <div key={status} className="flex items-center gap-1">
                      <div className={cn("w-3 h-3 rounded", color)} />
                      <span className="text-xs text-gray-600">
                        {statusLabelsAr[status as keyof typeof statusLabelsAr]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-gray-500 text-xs">
                اسحب للتكبير • انقر على المهام للتفاصيل
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

// Sample data for demonstration
export const sampleProjects: Project[] = [
  {
    id: '1',
    name: 'Modern Housing Complex',
    nameAr: 'مجمع الإسكان الحديث',
    startDate: new Date('2025-01-15'),
    endDate: new Date('2025-12-31'),
    budget: 250000,
    actualCost: 75000,
    status: 'active',
    progress: 30,
    tasks: [
      {
        id: '1-1',
        name: 'Site Preparation',
        nameAr: 'تحضير الموقع',
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-02-15'),
        progress: 100,
        status: 'completed',
        priority: 'high',
        assignee: {
          id: '1',
          name: 'Ahmed Al-Yamani',
          nameAr: 'أحمد اليماني',
        },
        budget: 15000,
        actualCost: 14500,
      },
      {
        id: '1-2',
        name: 'Foundation Work',
        nameAr: 'أعمال الأساسات',
        startDate: new Date('2025-02-16'),
        endDate: new Date('2025-04-30'),
        progress: 65,
        status: 'in_progress',
        priority: 'critical',
        assignee: {
          id: '2',
          name: 'Mohammed Al-Hadhrami',
          nameAr: 'محمد الحضرمي',
        },
        budget: 50000,
        actualCost: 32000,
      },
      {
        id: '1-3',
        name: 'Structure Construction',
        nameAr: 'بناء الهيكل',
        startDate: new Date('2025-05-01'),
        endDate: new Date('2025-09-30'),
        progress: 0,
        status: 'not_started',
        priority: 'high',
        budget: 80000,
        actualCost: 0,
      },
    ],
  },
  {
    id: '2',
    name: 'Commercial Administrative Building',
    nameAr: 'مبنى إداري تجاري',
    startDate: new Date('2025-03-01'),
    endDate: new Date('2026-02-28'),
    budget: 180000,
    actualCost: 25000,
    status: 'planning',
    progress: 15,
    tasks: [
      {
        id: '2-1',
        name: 'Design and Planning',
        nameAr: 'التصميم والتخطيط',
        startDate: new Date('2025-03-01'),
        endDate: new Date('2025-04-15'),
        progress: 80,
        status: 'in_progress',
        priority: 'medium',
        assignee: {
          id: '3',
          name: 'Fatima Al-Zahra',
          nameAr: 'فاطمة الزهراء',
        },
        budget: 25000,
        actualCost: 20000,
      },
      {
        id: '2-2',
        name: 'Permits and Approvals',
        nameAr: 'التصاريح والموافقات',
        startDate: new Date('2025-04-16'),
        endDate: new Date('2025-05-31'),
        progress: 0,
        status: 'not_started',
        priority: 'high',
        budget: 5000,
        actualCost: 0,
      },
    ],
  },
];