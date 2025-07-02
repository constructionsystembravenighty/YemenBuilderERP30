import { useState, useMemo, useRef, useEffect } from "react";
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut,
  Play,
  Pause,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Settings
} from "lucide-react";
import { GlassmorphicCard, GlassContent, GlassHeader } from "./glassmorphic-card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { formatArabicDate, toArabicNumerals } from "@/lib/arabic-utils";

interface GanttTask {
  id: string;
  name: string;
  nameAr: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  assignee?: string;
  assigneeAr?: string;
  dependencies?: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  milestone?: boolean;
  category?: string;
}

interface GanttChartProps {
  tasks: GanttTask[];
  title?: string;
  titleAr?: string;
  onTaskClick?: (task: GanttTask) => void;
  onTaskUpdate?: (task: GanttTask) => void;
  showAssignees?: boolean;
  showDependencies?: boolean;
}

type ViewMode = 'day' | 'week' | 'month';

export function AdvancedGanttChart({
  tasks,
  title,
  titleAr,
  onTaskClick,
  onTaskUpdate,
  showAssignees = true,
  showDependencies = true
}: GanttChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Calculate date range based on tasks
  const dateRange = useMemo(() => {
    if (tasks.length === 0) {
      const today = new Date();
      return {
        start: new Date(today.getFullYear(), today.getMonth(), 1),
        end: new Date(today.getFullYear(), today.getMonth() + 3, 0)
      };
    }

    const allDates = tasks.flatMap(task => [task.startDate, task.endDate]);
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
    
    // Add padding
    const startPadding = viewMode === 'day' ? 7 : viewMode === 'week' ? 14 : 30;
    const endPadding = viewMode === 'day' ? 7 : viewMode === 'week' ? 14 : 30;
    
    return {
      start: new Date(minDate.getTime() - startPadding * 24 * 60 * 60 * 1000),
      end: new Date(maxDate.getTime() + endPadding * 24 * 60 * 60 * 1000)
    };
  }, [tasks, viewMode]);

  // Generate time columns based on view mode
  const timeColumns = useMemo(() => {
    const columns = [];
    const current = new Date(dateRange.start);
    
    while (current <= dateRange.end) {
      columns.push(new Date(current));
      
      if (viewMode === 'day') {
        current.setDate(current.getDate() + 1);
      } else if (viewMode === 'week') {
        current.setDate(current.getDate() + 7);
      } else {
        current.setMonth(current.getMonth() + 1);
      }
    }
    
    return columns;
  }, [dateRange, viewMode]);

  // Filter tasks based on current filter
  const filteredTasks = useMemo(() => {
    if (filter === 'all') return tasks;
    return tasks.filter(task => {
      switch (filter) {
        case 'in_progress': return task.status === 'in_progress';
        case 'overdue': return task.endDate < new Date() && task.status !== 'completed';
        case 'critical': return task.priority === 'critical';
        case 'milestones': return task.milestone;
        default: return true;
      }
    });
  }, [tasks, filter]);

  // Calculate task position and width
  const getTaskStyle = (task: GanttTask) => {
    const totalDays = (dateRange.end.getTime() - dateRange.start.getTime()) / (24 * 60 * 60 * 1000);
    const taskStartDays = (task.startDate.getTime() - dateRange.start.getTime()) / (24 * 60 * 60 * 1000);
    const taskDuration = (task.endDate.getTime() - task.startDate.getTime()) / (24 * 60 * 60 * 1000);
    
    const left = (taskStartDays / totalDays) * 100;
    const width = Math.max((taskDuration / totalDays) * 100, 0.5); // Minimum width for visibility
    
    return { left: `${left}%`, width: `${width}%` };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'blocked': return 'bg-red-500';
      case 'not_started': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-r-4 border-red-500';
      case 'high': return 'border-r-4 border-orange-500';
      case 'medium': return 'border-r-4 border-yellow-500';
      case 'low': return 'border-r-4 border-green-500';
      default: return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-3 w-3 text-green-600" />;
      case 'in_progress': return <Play className="h-3 w-3 text-blue-600" />;
      case 'blocked': return <AlertTriangle className="h-3 w-3 text-red-600" />;
      case 'not_started': return <Pause className="h-3 w-3 text-gray-500" />;
      default: return <Clock className="h-3 w-3 text-gray-500" />;
    }
  };

  const formatColumnHeader = (date: Date) => {
    if (viewMode === 'day') {
      return formatArabicDate(date, 'short');
    } else if (viewMode === 'week') {
      const weekEnd = new Date(date);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return `${formatArabicDate(date, 'short')} - ${formatArabicDate(weekEnd, 'short')}`;
    } else {
      return formatArabicDate(date, 'long').split('،')[0]; // Month year only
    }
  };

  const scrollToToday = () => {
    const today = new Date();
    const totalDays = (dateRange.end.getTime() - dateRange.start.getTime()) / (24 * 60 * 60 * 1000);
    const todayDays = (today.getTime() - dateRange.start.getTime()) / (24 * 60 * 60 * 1000);
    const scrollPosition = (todayDays / totalDays) * 100;
    
    if (scrollContainerRef.current) {
      const scrollLeft = (scrollPosition / 100) * scrollContainerRef.current.scrollWidth;
      scrollContainerRef.current.scrollLeft = scrollLeft - scrollContainerRef.current.clientWidth / 2;
    }
  };

  return (
    <TooltipProvider>
      <GlassmorphicCard>
        <GlassHeader
          title={title || "Project Timeline"}
          titleAr={titleAr || "الجدول الزمني للمشروع"}
          description={`${filteredTasks.length} مهمة`}
          action={
            <div className="flex items-center gap-2">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المهام</SelectItem>
                  <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                  <SelectItem value="overdue">متأخرة</SelectItem>
                  <SelectItem value="critical">حرجة</SelectItem>
                  <SelectItem value="milestones">معالم</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">يوم</SelectItem>
                  <SelectItem value="week">أسبوع</SelectItem>
                  <SelectItem value="month">شهر</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm" onClick={scrollToToday}>
                <Calendar className="h-4 w-4 ml-2" />
                اليوم
              </Button>
            </div>
          }
        />
        
        <GlassContent>
          <div className="flex h-[600px]">
            {/* Task List Sidebar */}
            <div className="w-80 border-l border-gray-200 bg-white/50">
              <div className="p-4 border-b border-gray-200 bg-gray-50/50 font-semibold">
                قائمة المهام
              </div>
              <div className="overflow-y-auto h-full">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-blue-50/50 transition-colors ${
                      selectedTask === task.id ? 'bg-blue-100/50' : ''
                    } ${getPriorityColor(task.priority)}`}
                    onClick={() => {
                      setSelectedTask(task.id);
                      onTaskClick?.(task);
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(task.status)}
                        <span className="font-medium text-sm">
                          {task.nameAr || task.name}
                        </span>
                        {task.milestone && (
                          <Badge variant="outline" className="text-xs">
                            معلم
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {toArabicNumerals(task.progress.toString())}%
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-600 mb-2">
                      {formatArabicDate(task.startDate, 'short')} - {formatArabicDate(task.endDate, 'short')}
                    </div>
                    
                    {showAssignees && task.assigneeAr && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Users className="h-3 w-3" />
                        {task.assigneeAr}
                      </div>
                    )}
                    
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div 
                          className={`h-1 rounded-full ${getStatusColor(task.status)}`}
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline Chart */}
            <div className="flex-1 overflow-hidden">
              {/* Timeline Header */}
              <div 
                ref={scrollContainerRef}
                className="overflow-x-auto border-b border-gray-200 bg-gray-50/50"
              >
                <div className="flex min-w-max">
                  {timeColumns.map((date, index) => (
                    <div
                      key={index}
                      className="min-w-[120px] p-2 text-center text-xs font-medium border-l border-gray-200"
                    >
                      {formatColumnHeader(date)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline Bars */}
              <div className="overflow-x-auto overflow-y-auto h-full">
                <div className="relative min-w-max">
                  {/* Today Line */}
                  {(() => {
                    const today = new Date();
                    if (today >= dateRange.start && today <= dateRange.end) {
                      const totalDays = (dateRange.end.getTime() - dateRange.start.getTime()) / (24 * 60 * 60 * 1000);
                      const todayDays = (today.getTime() - dateRange.start.getTime()) / (24 * 60 * 60 * 1000);
                      const left = (todayDays / totalDays) * 100;
                      
                      return (
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                          style={{ left: `${left}%` }}
                        />
                      );
                    }
                    return null;
                  })()}

                  {filteredTasks.map((task, taskIndex) => {
                    const style = getTaskStyle(task);
                    
                    return (
                      <div
                        key={task.id}
                        className="relative h-12 border-b border-gray-100"
                        style={{ width: '100%' }}
                      >
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`absolute top-2 h-8 rounded-md cursor-pointer transition-all duration-200 hover:opacity-80 ${
                                getStatusColor(task.status)
                              } ${
                                selectedTask === task.id ? 'ring-2 ring-blue-400' : ''
                              }`}
                              style={style}
                              onClick={() => {
                                setSelectedTask(task.id);
                                onTaskClick?.(task);
                              }}
                            >
                              <div className="flex items-center h-full px-2 text-white text-xs font-medium">
                                <span className="truncate">
                                  {task.nameAr || task.name}
                                </span>
                                <span className="ml-auto">
                                  {toArabicNumerals(task.progress.toString())}%
                                </span>
                              </div>
                              
                              {/* Progress overlay */}
                              <div
                                className="absolute top-0 left-0 h-full bg-white/20 rounded-md"
                                style={{ width: `${task.progress}%` }}
                              />
                              
                              {task.milestone && (
                                <div className="absolute -top-1 -left-1 w-3 h-3 bg-yellow-500 transform rotate-45" />
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-sm">
                              <div className="font-medium">{task.nameAr || task.name}</div>
                              <div className="text-xs text-gray-600">
                                {formatArabicDate(task.startDate, 'short')} - {formatArabicDate(task.endDate, 'short')}
                              </div>
                              <div className="text-xs">
                                التقدم: {toArabicNumerals(task.progress.toString())}%
                              </div>
                              {task.assigneeAr && (
                                <div className="text-xs">
                                  المكلف: {task.assigneeAr}
                                </div>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>

                        {/* Dependencies lines */}
                        {showDependencies && task.dependencies && task.dependencies.length > 0 && (
                          <>
                            {task.dependencies.map((depId) => {
                              const depTask = tasks.find(t => t.id === depId);
                              if (!depTask) return null;

                              const depTaskIndex = tasks.findIndex(t => t.id === depId);
                              const depStyle = getTaskStyle(depTask);
                              
                              return (
                                <svg
                                  key={depId}
                                  className="absolute top-0 left-0 w-full h-full pointer-events-none"
                                  style={{ zIndex: 5 }}
                                >
                                  <line
                                    x1={`${parseFloat(depStyle.left) + parseFloat(depStyle.width)}%`}
                                    y1={depTaskIndex * 48 + 24}
                                    x2={style.left}
                                    y2={taskIndex * 48 + 24}
                                    stroke="#94a3b8"
                                    strokeWidth="1"
                                    strokeDasharray="3,3"
                                    markerEnd="url(#arrowhead)"
                                  />
                                </svg>
                              );
                            })}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </GlassContent>
      </GlassmorphicCard>
    </TooltipProvider>
  );
}