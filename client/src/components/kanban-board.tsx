import { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { 
  Calendar, 
  User, 
  DollarSign, 
  MoreVertical,
  Plus,
  Filter,
  Search
} from "lucide-react";
import { GlassmorphicCard, GlassContent, GlassHeader } from "./glassmorphic-card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Input } from "./ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "./ui/dropdown-menu";
import { formatCurrency } from "@/lib/currency";
import { formatArabicDate, getArabicInitials } from "@/lib/arabic-utils";

interface Task {
  id: string;
  title: string;
  titleAr: string;
  description?: string;
  assignee?: {
    name: string;
    nameAr: string;
    avatar?: string;
  };
  priority: 'low' | 'medium' | 'high' | 'critical';
  budget?: number;
  deadline?: string;
  tags?: string[];
  progress?: number;
}

interface Column {
  id: string;
  title: string;
  titleAr: string;
  color: string;
  tasks: Task[];
}

interface KanbanBoardProps {
  columns: Column[];
  onTaskMove: (taskId: string, fromColumn: string, toColumn: string) => void;
  onTaskClick?: (task: Task) => void;
  onAddTask?: (columnId: string) => void;
  onEditTask?: (task: Task) => void;
  title?: string;
  titleAr?: string;
}

const DraggableTask = ({ 
  task, 
  onTaskClick, 
  onEditTask 
}: { 
  task: Task; 
  onTaskClick?: (task: Task) => void;
  onEditTask?: (task: Task) => void;
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'task',
    item: { id: task.id, type: 'task' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'critical': return 'حرجة';
      case 'high': return 'عالية';
      case 'medium': return 'متوسطة';
      case 'low': return 'منخفضة';
      default: return priority;
    }
  };

  return (
    <div
      ref={drag}
      className={`bg-white/80 backdrop-blur-sm rounded-lg p-4 mb-3 border border-gray-200/50 cursor-pointer transition-all duration-200 hover:shadow-md ${
        isDragging ? 'opacity-50 rotate-2' : ''
      }`}
      onClick={() => onTaskClick?.(task)}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900 text-sm leading-tight">
          {task.titleAr || task.title}
        </h4>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEditTask?.(task)}>
              تعديل
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              حذف
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {task.description && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between mb-3">
        <Badge 
          className={`${getPriorityColor(task.priority)} text-white text-xs px-2 py-1`}
        >
          {getPriorityLabel(task.priority)}
        </Badge>
        {task.budget && (
          <span className="text-xs font-medium text-gray-700">
            {formatCurrency(task.budget)}
          </span>
        )}
      </div>

      {task.progress !== undefined && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600">التقدم</span>
            <span className="text-xs font-medium">{task.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        {task.assignee ? (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {getArabicInitials(task.assignee.nameAr || task.assignee.name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-gray-600">
              {task.assignee.nameAr || task.assignee.name}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-gray-400">
            <User className="h-3 w-3" />
            <span className="text-xs">غير محدد</span>
          </div>
        )}

        {task.deadline && (
          <div className="flex items-center gap-1 text-gray-500">
            <Calendar className="h-3 w-3" />
            <span className="text-xs">
              {formatArabicDate(new Date(task.deadline), 'short')}
            </span>
          </div>
        )}
      </div>

      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {task.tags.slice(0, 3).map((tag, index) => (
            <span 
              key={index}
              className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="text-xs text-gray-500">+{task.tags.length - 3}</span>
          )}
        </div>
      )}
    </div>
  );
};

const DroppableColumn = ({ 
  column, 
  onTaskMove, 
  onTaskClick, 
  onEditTask,
  onAddTask 
}: { 
  column: Column; 
  onTaskMove: (taskId: string, fromColumn: string, toColumn: string) => void;
  onTaskClick?: (task: Task) => void;
  onEditTask?: (task: Task) => void;
  onAddTask?: (columnId: string) => void;
}) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'task',
    drop: (item: { id: string; type: string }) => {
      // Find which column the task is currently in
      const fromColumn = ''; // This would need to be tracked
      onTaskMove(item.id, fromColumn, column.id);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      className={`flex-1 min-w-[280px] ${isOver ? 'bg-blue-50/50' : ''} transition-colors duration-200`}
    >
      <div className="bg-white/30 backdrop-blur-sm rounded-lg p-4 h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div 
              className={`w-3 h-3 rounded-full ${column.color}`}
            />
            <h3 className="font-semibold text-gray-900">
              {column.titleAr || column.title}
            </h3>
            <Badge variant="secondary" className="text-xs">
              {column.tasks.length}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddTask?.(column.id)}
            className="h-6 w-6 p-0"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {column.tasks.map((task) => (
            <DraggableTask
              key={task.id}
              task={task}
              onTaskClick={onTaskClick}
              onEditTask={onEditTask}
            />
          ))}
          
          {column.tasks.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <div className="mb-2">لا توجد مهام</div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddTask?.(column.id)}
                className="text-xs"
              >
                <Plus className="h-3 w-3 ml-1" />
                إضافة مهمة
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export function KanbanBoard({
  columns,
  onTaskMove,
  onTaskClick,
  onAddTask,
  onEditTask,
  title,
  titleAr
}: KanbanBoardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("");

  const filteredColumns = columns.map(column => ({
    ...column,
    tasks: column.tasks.filter(task => {
      const matchesSearch = !searchTerm || 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.titleAr.includes(searchTerm) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPriority = !filterPriority || task.priority === filterPriority;
      
      return matchesSearch && matchesPriority;
    })
  }));

  const totalTasks = columns.reduce((sum, col) => sum + col.tasks.length, 0);

  return (
    <DndProvider backend={HTML5Backend}>
      <GlassmorphicCard>
        <GlassHeader
          title={title || "Project Board"}
          titleAr={titleAr || "لوحة المشروع"}
          description={`إجمالي المهام: ${totalTasks}`}
          action={
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="البحث في المهام..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pr-10"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 ml-2" />
                    فلترة
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilterPriority("")}>
                    جميع الأولويات
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterPriority("critical")}>
                    حرجة
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterPriority("high")}>
                    عالية
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterPriority("medium")}>
                    متوسطة
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterPriority("low")}>
                    منخفضة
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          }
        />
        
        <GlassContent>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {filteredColumns.map((column) => (
              <DroppableColumn
                key={column.id}
                column={column}
                onTaskMove={onTaskMove}
                onTaskClick={onTaskClick}
                onEditTask={onEditTask}
                onAddTask={onAddTask}
              />
            ))}
          </div>
        </GlassContent>
      </GlassmorphicCard>
    </DndProvider>
  );
}