import React, { useState, useMemo } from 'react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, differenceInDays } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronLeft, ChevronRight, Calendar, Users, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { formatArabicDate } from '@/lib/arabic-utils';

export interface GanttTask {
  id: string;
  name: string;
  nameAr?: string;
  startDate: Date;
  endDate: Date;
  progress: number; // 0-100
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed' | 'on_hold';
  assignee?: string;
  assigneeAr?: string;
  dependencies?: string[]; // IDs of tasks this depends on
  color?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  description?: string;
  descriptionAr?: string;
}

export interface GanttChartProps {
  tasks: GanttTask[];
  onTaskClick?: (task: GanttTask) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<GanttTask>) => void;
  onDateRangeChange?: (start: Date, end: Date) => void;
  viewMode?: 'day' | 'week' | 'month';
  showWeekends?: boolean;
  enableDragDrop?: boolean;
  className?: string;
}

const getStatusColor = (status: GanttTask['status']) => {
  switch (status) {
    case 'completed': return 'bg-green-500';
    case 'in_progress': return 'bg-blue-500';
    case 'delayed': return 'bg-red-500';
    case 'on_hold': return 'bg-yellow-500';
    default: return 'bg-gray-400';
  }
};

const getStatusIcon = (status: GanttTask['status']) => {
  switch (status) {
    case 'completed': return <CheckCircle className="h-3 w-3" />;
    case 'in_progress': return <Clock className="h-3 w-3" />;
    case 'delayed': return <AlertTriangle className="h-3 w-3" />;
    case 'on_hold': return <Clock className="h-3 w-3" />;
    default: return null;
  }
};

const getPriorityColor = (priority: GanttTask['priority']) => {
  switch (priority) {
    case 'urgent': return 'border-r-4 border-red-500';
    case 'high': return 'border-r-4 border-orange-500';
    case 'medium': return 'border-r-4 border-yellow-500';
    case 'low': return 'border-r-4 border-green-500';
    default: return 'border-r-4 border-gray-300';
  }
};

const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

const ARABIC_DAYS = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];

export function GanttChart({
  tasks,
  onTaskClick,
  onTaskUpdate,
  onDateRangeChange,
  viewMode = 'week',
  showWeekends = true,
  enableDragDrop = false,
  className = ''
}: GanttChartProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  // Calculate date range based on view mode
  const dateRange = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 6 }); // Saturday as first day
    let end: Date;
    
    switch (viewMode) {
      case 'day':
        end = addDays(start, 7);
        break;
      case 'week':
        end = addDays(start, 28); // 4 weeks
        break;
      case 'month':
        end = addDays(start, 84); // 12 weeks
        break;
      default:
        end = addDays(start, 28);
    }
    
    return { start, end };
  }, [currentDate, viewMode]);

  const days = useMemo(() => {
    return eachDayOfInterval(dateRange).filter(day => 
      showWeekends ? true : ![5, 6].includes(day.getDay()) // Exclude Friday and Saturday if needed
    );
  }, [dateRange, showWeekends]);

  const navigateDate = (direction: 'prev' | 'next') => {
    const multiplier = direction === 'next' ? 1 : -1;
    const daysToAdd = viewMode === 'day' ? 7 : viewMode === 'week' ? 28 : 84;
    setCurrentDate(prev => addDays(prev, daysToAdd * multiplier));
  };

  const getTaskPosition = (task: GanttTask) => {
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    
    // Constrain to visible range
    const visibleStart = Math.max(taskStart.getTime(), dateRange.start.getTime());
    const visibleEnd = Math.min(taskEnd.getTime(), dateRange.end.getTime());
    
    const startOffset = Math.max(0, differenceInDays(new Date(visibleStart), dateRange.start));
    const duration = Math.max(1, differenceInDays(new Date(visibleEnd), new Date(visibleStart)));
    
    const totalDays = days.length;
    const left = (startOffset / totalDays) * 100;
    const width = (duration / totalDays) * 100;
    
    return { left: `${left}%`, width: `${Math.min(width, 100 - left)}%` };
  };

  const handleTaskClick = (task: GanttTask) => {
    setSelectedTask(task.id);
    onTaskClick?.(task);
  };

  return (
    <TooltipProvider>
      <div className={`gantt-chart bg-white rounded-lg border ${className}`}>
        {/* Header */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold text-gray-900">مخطط جانت للمشروع</h3>
              <div className="flex items-center gap-2">
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
                  onClick={() => navigateDate('next')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={viewMode}
                onChange={(e) => onDateRangeChange?.(dateRange.start, dateRange.end)}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="day">أسبوع</option>
                <option value="week">شهر</option>
                <option value="month">3 أشهر</option>
              </select>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 ml-2" />
                اليوم
              </Button>
            </div>
          </div>

          {/* Date Headers */}
          <div className="flex">
            <div className="w-80 flex-shrink-0"></div>
            <div className="flex-1 grid gap-1" style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}>
              {days.map((day, index) => (
                <div key={index} className="text-center border-l border-gray-200 px-1">
                  <div className="text-xs text-gray-600">
                    {ARABIC_DAYS[day.getDay()]}
                  </div>
                  <div className="text-sm font-medium">
                    {day.getDate()}
                  </div>
                  {index === 0 && (
                    <div className="text-xs text-gray-500">
                      {ARABIC_MONTHS[day.getMonth()]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Task Rows */}
        <ScrollArea className="h-96">
          <div className="divide-y divide-gray-100">
            {tasks.map((task, taskIndex) => {
              const position = getTaskPosition(task);
              const isSelected = selectedTask === task.id;
              
              return (
                <div key={task.id} className={`flex hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
                  {/* Task Info */}
                  <div className="w-80 flex-shrink-0 p-3 border-l border-gray-200">
                    <div className={`${getPriorityColor(task.priority)} pl-3`}>
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(task.status)}
                        <span className="font-medium text-sm text-gray-900 text-right">
                          {task.nameAr || task.name}
                        </span>
                        <Badge 
                          className={`text-xs ${getStatusColor(task.status)} text-white`}
                        >
                          {task.progress}%
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatArabicDate(task.startDate, 'short')}</span>
                        </div>
                        {task.assigneeAr && (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{task.assigneeAr}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="flex-1 relative p-3 min-h-[60px]">
                    <div className="relative h-6">
                      {/* Grid lines */}
                      <div className="absolute inset-0 grid gap-1" style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}>
                        {days.map((day, index) => (
                          <div key={index} className="border-l border-gray-100 h-full"></div>
                        ))}
                      </div>

                      {/* Task Bar */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`absolute top-1 h-4 rounded cursor-pointer transition-all duration-200 hover:shadow-md ${getStatusColor(task.status)} ${isSelected ? 'ring-2 ring-blue-400' : ''}`}
                            style={position}
                            onClick={() => handleTaskClick(task)}
                          >
                            {/* Progress indicator */}
                            <div 
                              className="h-full bg-white bg-opacity-30 rounded-r"
                              style={{ width: `${task.progress}%` }}
                            ></div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <div className="text-right">
                            <div className="font-medium">{task.nameAr || task.name}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              البداية: {formatArabicDate(task.startDate)}
                            </div>
                            <div className="text-sm text-gray-600">
                              النهاية: {formatArabicDate(task.endDate)}
                            </div>
                            <div className="text-sm text-gray-600">
                              التقدم: {task.progress}%
                            </div>
                            {task.assigneeAr && (
                              <div className="text-sm text-gray-600">
                                المسؤول: {task.assigneeAr}
                              </div>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>

                      {/* Dependencies */}
                      {task.dependencies?.map((depId, index) => {
                        const depTask = tasks.find(t => t.id === depId);
                        if (!depTask) return null;
                        
                        return (
                          <div
                            key={index}
                            className="absolute top-0 h-full border-l-2 border-dashed border-gray-400 opacity-50"
                            style={{ left: getTaskPosition(depTask).left }}
                          ></div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Legend */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>مكتمل</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>قيد التنفيذ</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>متأخر</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>معلق</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-400 rounded"></div>
                <span>لم يبدأ</span>
              </div>
            </div>
            <div className="text-gray-600">
              إجمالي المهام: {tasks.length} | المكتملة: {tasks.filter(t => t.status === 'completed').length}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}