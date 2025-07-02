import { useState, useMemo } from "react";
import { format, addDays, differenceInDays, startOfWeek, addWeeks, isSameDay } from "date-fns";
import { ar } from "date-fns/locale";
import { Calendar, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassmorphicCard } from "@/components/glassmorphic-card";

// Task interface for Gantt chart
export interface GanttTask {
  id: string;
  name: string;
  nameAr: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  status: "not_started" | "in_progress" | "completed" | "delayed";
  priority: "low" | "medium" | "high" | "critical";
  dependencies?: string[];
  assignee?: string;
  assigneeAr?: string;
  color?: string;
}

interface GanttChartProps {
  tasks: GanttTask[];
  title?: string;
  titleAr?: string;
  onTaskClick?: (task: GanttTask) => void;
  onDateChange?: (taskId: string, startDate: Date, endDate: Date) => void;
}

type ViewMode = "day" | "week" | "month";

export function GanttChart({
  tasks,
  title = "Project Timeline",
  titleAr = "الجدول الزمني للمشروع",
  onTaskClick,
  onDateChange,
}: GanttChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [currentDate, setCurrentDate] = useState(new Date());

  // Calculate chart dimensions and timeline
  const { timeline, chartWidth, dayWidth } = useMemo(() => {
    if (tasks.length === 0) {
      return { timeline: [], chartWidth: 800, dayWidth: 30 };
    }

    const allDates = tasks.flatMap(task => [task.startDate, task.endDate]);
    const minDate = startOfWeek(new Date(Math.min(...allDates.map(d => d.getTime()))));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
    
    const totalDays = differenceInDays(maxDate, minDate) + 7; // Add buffer
    const dayWidth = viewMode === "day" ? 40 : viewMode === "week" ? 20 : 8;
    const chartWidth = totalDays * dayWidth;

    // Generate timeline based on view mode
    const timeline = [];
    let currentDateIterator = new Date(minDate);
    
    while (currentDateIterator <= maxDate) {
      timeline.push({
        date: new Date(currentDateIterator),
        label: format(currentDateIterator, viewMode === "month" ? "MMM" : "dd", { locale: ar }),
        isWeekend: currentDateIterator.getDay() === 5 || currentDateIterator.getDay() === 6, // Friday & Saturday in Yemen
      });
      
      if (viewMode === "day") {
        currentDateIterator = addDays(currentDateIterator, 1);
      } else if (viewMode === "week") {
        currentDateIterator = addWeeks(currentDateIterator, 1);
      } else {
        currentDateIterator = addDays(currentDateIterator, 30);
      }
    }

    return { timeline, chartWidth, dayWidth };
  }, [tasks, viewMode]);

  // Get task bar position and width
  const getTaskBarStyle = (task: GanttTask) => {
    if (timeline.length === 0) return { left: 0, width: 0 };
    
    const startDate = task.startDate;
    const endDate = task.endDate;
    const chartStartDate = timeline[0].date;
    
    const startDays = differenceInDays(startDate, chartStartDate);
    const duration = differenceInDays(endDate, startDate) + 1;
    
    const left = startDays * dayWidth;
    const width = duration * dayWidth;
    
    return { left: Math.max(0, left), width: Math.max(dayWidth, width) };
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "in_progress": return "bg-blue-500";
      case "delayed": return "bg-red-500";
      default: return "bg-gray-400";
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "border-red-500";
      case "high": return "border-orange-500";
      case "medium": return "border-yellow-500";
      default: return "border-green-500";
    }
  };

  return (
    <GlassmorphicCard floating className="w-full">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-charcoal-text">{titleAr}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {tasks.length} مهمة في الجدول الزمني
            </p>
          </div>
          
          <div className="flex items-center space-x-reverse space-x-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-white/10 rounded-lg p-1">
              {(["day", "week", "month"] as ViewMode[]).map((mode) => (
                <Button
                  key={mode}
                  size="sm"
                  variant={viewMode === mode ? "default" : "ghost"}
                  className={`text-xs ${viewMode === mode ? "bg-primary text-white" : "text-gray-600"}`}
                  onClick={() => setViewMode(mode)}
                >
                  {mode === "day" ? "يوم" : mode === "week" ? "أسبوع" : "شهر"}
                </Button>
              ))}
            </div>
            
            {/* Navigation */}
            <div className="flex items-center space-x-reverse space-x-1">
              <Button size="sm" variant="outline" className="glass-input">
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" className="glass-input">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
            
            <Button size="sm" variant="outline" className="glass-input">
              <Calendar className="h-4 w-4 ml-2" />
              اليوم
            </Button>
          </div>
        </div>

        {/* Gantt Chart */}
        <div className="border border-white/20 rounded-lg overflow-hidden backdrop-blur-sm">
          <div className="flex">
            {/* Task Names Column */}
            <div className="w-80 bg-white/5 border-l border-white/20">
              {/* Header */}
              <div className="h-12 px-4 flex items-center border-b border-white/20 bg-white/10">
                <span className="text-sm font-semibold text-charcoal-text">المهام</span>
              </div>
              
              {/* Task Rows */}
              <div className="max-h-96 overflow-y-auto">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="h-12 px-4 flex items-center border-b border-white/20 hover:bg-white/5 cursor-pointer"
                    onClick={() => onTaskClick?.(task)}
                  >
                    <div className="flex items-center space-x-reverse space-x-3 w-full">
                      <div className={`w-1 h-8 rounded ${getPriorityColor(task.priority)}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-charcoal-text truncate">
                          {task.nameAr}
                        </p>
                        <div className="flex items-center space-x-reverse space-x-2 mt-1">
                          <Badge
                            className={`text-xs ${getStatusColor(task.status).replace('bg-', 'bg-opacity-20 border-')} border`}
                          >
                            {task.status === "completed" ? "مكتمل" :
                             task.status === "in_progress" ? "جاري" :
                             task.status === "delayed" ? "متأخر" : "لم يبدأ"}
                          </Badge>
                          {task.progress > 0 && (
                            <span className="text-xs text-gray-500">
                              {task.progress}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline and Bars */}
            <div className="flex-1 overflow-x-auto">
              {/* Timeline Header */}
              <div className="h-12 border-b border-white/20 bg-white/10 flex items-center px-2 relative min-w-max">
                {timeline.map((timePoint, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-center text-xs font-medium ${
                      timePoint.isWeekend ? "text-red-400" : "text-charcoal-text"
                    }`}
                    style={{ width: dayWidth }}
                  >
                    {timePoint.label}
                  </div>
                ))}
              </div>
              
              {/* Task Bars */}
              <div className="relative max-h-96 overflow-y-auto" style={{ minWidth: chartWidth }}>
                {/* Grid Lines */}
                <div className="absolute inset-0 pointer-events-none">
                  {timeline.map((_, index) => (
                    <div
                      key={index}
                      className="absolute top-0 bottom-0 border-l border-white/10"
                      style={{ left: index * dayWidth }}
                    />
                  ))}
                </div>
                
                {/* Today Indicator */}
                {timeline.some(t => isSameDay(t.date, new Date())) && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                    style={{
                      left: timeline.findIndex(t => isSameDay(t.date, new Date())) * dayWidth
                    }}
                  />
                )}
                
                {/* Task Bars */}
                {tasks.map((task, index) => {
                  const style = getTaskBarStyle(task);
                  return (
                    <div
                      key={task.id}
                      className="h-12 border-b border-white/20 relative flex items-center"
                    >
                      <div
                        className={`absolute h-6 rounded-md ${getStatusColor(task.status)} bg-opacity-80 hover:bg-opacity-100 cursor-pointer transition-all group border-l-4 ${getPriorityColor(task.priority)}`}
                        style={{
                          left: style.left,
                          width: style.width,
                          minWidth: 20,
                        }}
                        onClick={() => onTaskClick?.(task)}
                      >
                        {/* Progress Bar */}
                        {task.progress > 0 && (
                          <div
                            className="h-full bg-white bg-opacity-30 rounded-md"
                            style={{ width: `${task.progress}%` }}
                          />
                        )}
                        
                        {/* Task Name Overlay */}
                        <div className="absolute inset-0 flex items-center px-2">
                          <span className="text-xs text-white font-medium truncate">
                            {style.width > 100 ? task.nameAr : ""}
                          </span>
                        </div>
                        
                        {/* Hover Details */}
                        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-20">
                          <div className="glass-card p-3 text-xs whitespace-nowrap border border-white/20 rounded shadow-lg">
                            <p className="font-semibold text-charcoal-text">{task.nameAr}</p>
                            <p className="text-gray-500 mt-1">
                              {format(task.startDate, "dd/MM/yyyy", { locale: ar })} - {format(task.endDate, "dd/MM/yyyy", { locale: ar })}
                            </p>
                            <p className="text-gray-500">
                              التقدم: {task.progress}%
                            </p>
                            {task.assigneeAr && (
                              <p className="text-gray-500">
                                المكلف: {task.assigneeAr}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-reverse space-x-6">
            <div className="flex items-center space-x-reverse space-x-2">
              <span className="text-xs text-gray-500">الحالة:</span>
              <div className="flex items-center space-x-reverse space-x-3">
                <div className="flex items-center space-x-reverse space-x-1">
                  <div className="w-3 h-3 bg-gray-400 rounded"></div>
                  <span className="text-xs text-gray-500">لم يبدأ</span>
                </div>
                <div className="flex items-center space-x-reverse space-x-1">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="text-xs text-gray-500">جاري</span>
                </div>
                <div className="flex items-center space-x-reverse space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-xs text-gray-500">مكتمل</span>
                </div>
                <div className="flex items-center space-x-reverse space-x-1">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className="text-xs text-gray-500">متأخر</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-reverse space-x-2">
              <span className="text-xs text-gray-500">الأولوية:</span>
              <div className="flex items-center space-x-reverse space-x-3">
                <div className="flex items-center space-x-reverse space-x-1">
                  <div className="w-3 h-3 border-2 border-green-500 rounded"></div>
                  <span className="text-xs text-gray-500">منخفضة</span>
                </div>
                <div className="flex items-center space-x-reverse space-x-1">
                  <div className="w-3 h-3 border-2 border-yellow-500 rounded"></div>
                  <span className="text-xs text-gray-500">متوسطة</span>
                </div>
                <div className="flex items-center space-x-reverse space-x-1">
                  <div className="w-3 h-3 border-2 border-orange-500 rounded"></div>
                  <span className="text-xs text-gray-500">عالية</span>
                </div>
                <div className="flex items-center space-x-reverse space-x-1">
                  <div className="w-3 h-3 border-2 border-red-500 rounded"></div>
                  <span className="text-xs text-gray-500">حرجة</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-0.5 h-4 bg-red-500 flex items-center">
            <span className="text-xs text-red-500 mr-2">اليوم</span>
          </div>
        </div>
      </div>
    </GlassmorphicCard>
  );
}

// Sample data for testing
export const sampleGanttTasks: GanttTask[] = [
  {
    id: "1",
    name: "Site Preparation",
    nameAr: "تحضير الموقع",
    startDate: new Date(2024, 0, 1),
    endDate: new Date(2024, 0, 15),
    progress: 100,
    status: "completed",
    priority: "high",
    assigneeAr: "أحمد محمد",
  },
  {
    id: "2",
    name: "Foundation Work",
    nameAr: "أعمال الأساسات",
    startDate: new Date(2024, 0, 10),
    endDate: new Date(2024, 1, 5),
    progress: 75,
    status: "in_progress",
    priority: "critical",
    assigneeAr: "محمد علي",
    dependencies: ["1"],
  },
  {
    id: "3",
    name: "Structural Framework",
    nameAr: "الهيكل الإنشائي",
    startDate: new Date(2024, 1, 1),
    endDate: new Date(2024, 2, 15),
    progress: 30,
    status: "in_progress",
    priority: "high",
    assigneeAr: "سالم أحمد",
    dependencies: ["2"],
  },
  {
    id: "4",
    name: "Electrical Installation",
    nameAr: "التمديدات الكهربائية",
    startDate: new Date(2024, 2, 1),
    endDate: new Date(2024, 3, 10),
    progress: 0,
    status: "not_started",
    priority: "medium",
    assigneeAr: "خالد سالم",
    dependencies: ["3"],
  },
  {
    id: "5",
    name: "Plumbing Installation",
    nameAr: "التمديدات الصحية",
    startDate: new Date(2024, 2, 5),
    endDate: new Date(2024, 3, 15),
    progress: 0,
    status: "not_started",
    priority: "medium",
    assigneeAr: "عبدالله محمد",
    dependencies: ["3"],
  },
  {
    id: "6",
    name: "Finishing Work",
    nameAr: "أعمال التشطيبات",
    startDate: new Date(2024, 3, 20),
    endDate: new Date(2024, 4, 30),
    progress: 0,
    status: "not_started",
    priority: "medium",
    assigneeAr: "ياسر علي",
    dependencies: ["4", "5"],
  },
];