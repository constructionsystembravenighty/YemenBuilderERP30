import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Search, 
  MoreVertical,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Flag,
  MessageSquare,
  Paperclip,
  Eye
} from 'lucide-react';
import { formatArabicDate } from '@/lib/arabic-utils';

export interface TaskItem {
  id: string;
  title: string;
  titleAr: string;
  description?: string;
  descriptionAr?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: {
    id: string;
    name: string;
    nameAr?: string;
    avatar?: string;
  };
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  attachments?: number;
  comments?: number;
  subtasks?: number;
  completedSubtasks?: number;
  estimatedHours?: number;
  actualHours?: number;
  projectId?: string;
  projectName?: string;
  projectNameAr?: string;
}

export interface TaskColumn {
  id: string;
  title: string;
  titleAr: string;
  status: TaskItem['status'];
  color: string;
  limit?: number;
}

export interface TaskBoardProps {
  tasks: TaskItem[];
  columns: TaskColumn[];
  onTaskMove: (taskId: string, newStatus: TaskItem['status']) => void;
  onTaskCreate: (columnId: string) => void;
  onTaskEdit: (task: TaskItem) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskAssign: (taskId: string, assigneeId: string) => void;
  showFilters?: boolean;
  showSearch?: boolean;
  className?: string;
}

const getPriorityColor = (priority: TaskItem['priority']) => {
  switch (priority) {
    case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
    case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getPriorityIcon = (priority: TaskItem['priority']) => {
  switch (priority) {
    case 'urgent': return <Flag className="h-3 w-3 text-red-500" />;
    case 'high': return <Flag className="h-3 w-3 text-orange-500" />;
    case 'medium': return <Flag className="h-3 w-3 text-yellow-500" />;
    case 'low': return <Flag className="h-3 w-3 text-green-500" />;
    default: return null;
  }
};

const getPriorityText = (priority: TaskItem['priority']) => {
  switch (priority) {
    case 'urgent': return 'عاجل';
    case 'high': return 'عالي';
    case 'medium': return 'متوسط';
    case 'low': return 'منخفض';
    default: return priority;
  }
};

const getStatusIcon = (status: TaskItem['status']) => {
  switch (status) {
    case 'done': return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'in_progress': return <Clock className="h-4 w-4 text-blue-600" />;
    case 'review': return <Eye className="h-4 w-4 text-yellow-600" />;
    case 'blocked': return <AlertTriangle className="h-4 w-4 text-red-600" />;
    default: return null;
  }
};

function TaskCard({ task, onEdit, onDelete, onAssign, onMove }: {
  task: TaskItem;
  onEdit: (task: TaskItem) => void;
  onDelete: (taskId: string) => void;
  onAssign: (taskId: string, assigneeId: string) => void;
  onMove: (taskId: string, newStatus: TaskItem['status']) => void;
}) {
  const subtaskProgress = task.subtasks && task.completedSubtasks 
    ? (task.completedSubtasks / task.subtasks) * 100 
    : 0;

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <Card className="mb-3 hover:shadow-md transition-shadow cursor-pointer group">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {getPriorityIcon(task.priority)}
            <Badge className={getPriorityColor(task.priority)}>
              {getPriorityText(task.priority)}
            </Badge>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                تعديل
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onMove(task.id, 'in_progress')}>
                نقل إلى قيد التنفيذ
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onMove(task.id, 'done')}>
                إكمال المهمة
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-red-600">
                حذف
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Title and Description */}
        <div className="mb-3">
          <h3 className="font-medium text-sm text-right mb-1 line-clamp-2">
            {task.titleAr || task.title}
          </h3>
          {task.descriptionAr && (
            <p className="text-xs text-gray-600 text-right line-clamp-2">
              {task.descriptionAr}
            </p>
          )}
        </div>

        {/* Project */}
        {task.projectNameAr && (
          <div className="mb-3">
            <Badge variant="outline" className="text-xs">
              {task.projectNameAr}
            </Badge>
          </div>
        )}

        {/* Subtasks Progress */}
        {task.subtasks && task.subtasks > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600">
                المهام الفرعية: {task.completedSubtasks || 0}/{task.subtasks}
              </span>
              <span className="text-xs text-gray-600">
                {Math.round(subtaskProgress)}%
              </span>
            </div>
            <Progress value={subtaskProgress} className="h-1" />
          </div>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {task.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{task.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Assignee */}
            {task.assignee && (
              <div className="flex items-center gap-1">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={task.assignee.avatar} />
                  <AvatarFallback className="text-xs">
                    {(task.assignee.nameAr || task.assignee.name).charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-gray-600 hidden sm:inline">
                  {task.assignee.nameAr || task.assignee.name}
                </span>
              </div>
            )}

            {/* Attachments */}
            {task.attachments && task.attachments > 0 && (
              <div className="flex items-center gap-1 text-gray-500">
                <Paperclip className="h-3 w-3" />
                <span className="text-xs">{task.attachments}</span>
              </div>
            )}

            {/* Comments */}
            {task.comments && task.comments > 0 && (
              <div className="flex items-center gap-1 text-gray-500">
                <MessageSquare className="h-3 w-3" />
                <span className="text-xs">{task.comments}</span>
              </div>
            )}
          </div>

          {/* Due Date */}
          {task.dueDate && (
            <div className={`flex items-center gap-1 text-xs ${
              isOverdue ? 'text-red-600' : 'text-gray-500'
            }`}>
              <Calendar className="h-3 w-3" />
              <span>{formatArabicDate(task.dueDate, 'short')}</span>
            </div>
          )}
        </div>

        {/* Time Tracking */}
        {(task.estimatedHours || task.actualHours) && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center justify-between text-xs text-gray-600">
              {task.estimatedHours && (
                <span>مقدر: {task.estimatedHours}س</span>
              )}
              {task.actualHours && (
                <span>فعلي: {task.actualHours}س</span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TaskColumn({ 
  column, 
  tasks, 
  onTaskCreate, 
  onTaskEdit, 
  onTaskDelete, 
  onTaskAssign,
  onTaskMove
}: {
  column: TaskColumn;
  tasks: TaskItem[];
  onTaskCreate: (columnId: string) => void;
  onTaskEdit: (task: TaskItem) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskAssign: (taskId: string, assigneeId: string) => void;
  onTaskMove: (taskId: string, newStatus: TaskItem['status']) => void;
}) {
  const isOverLimit = column.limit && tasks.length > column.limit;

  return (
    <div className="bg-gray-50 rounded-lg p-4 min-h-[600px] w-80 flex-shrink-0">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: column.color }}
          />
          <h3 className="font-semibold text-gray-900">
            {column.titleAr || column.title}
          </h3>
          <Badge 
            variant={isOverLimit ? "destructive" : "secondary"}
            className="text-xs"
          >
            {tasks.length}
            {column.limit && ` / ${column.limit}`}
          </Badge>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onTaskCreate(column.id)}
          className="h-6 w-6 p-0"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Tasks */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onTaskEdit}
            onDelete={onTaskDelete}
            onAssign={onTaskAssign}
            onMove={onTaskMove}
          />
        ))}
      </div>
    </div>
  );
}

export function TaskBoard({
  tasks,
  columns,
  onTaskMove,
  onTaskCreate,
  onTaskEdit,
  onTaskDelete,
  onTaskAssign,
  showFilters = true,
  showSearch = true,
  className = ''
}: TaskBoardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = searchTerm === '' || 
        task.titleAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.descriptionAr?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      const matchesAssignee = assigneeFilter === 'all' || task.assignee?.id === assigneeFilter;
      const matchesProject = projectFilter === 'all' || task.projectId === projectFilter;
      
      return matchesSearch && matchesPriority && matchesAssignee && matchesProject;
    });
  }, [tasks, searchTerm, priorityFilter, assigneeFilter, projectFilter]);

  // Group tasks by columns
  const tasksByColumn = useMemo(() => {
    const grouped: { [key: string]: TaskItem[] } = {};
    
    columns.forEach(column => {
      grouped[column.id] = filteredTasks.filter(task => task.status === column.status);
    });
    
    return grouped;
  }, [columns, filteredTasks]);

  // Get unique values for filters
  const uniqueAssignees = useMemo(() => {
    const assignees = tasks
      .map(task => task.assignee)
      .filter((assignee, index, self) => 
        assignee && self.findIndex(a => a?.id === assignee.id) === index
      );
    return assignees.filter(Boolean);
  }, [tasks]);

  const uniqueProjects = useMemo(() => {
    const projects = tasks
      .map(task => ({ id: task.projectId, name: task.projectNameAr || task.projectName }))
      .filter((project, index, self) => 
        project.id && self.findIndex(p => p.id === project.id) === index
      );
    return projects.filter(p => p.id);
  }, [tasks]);

  // Calculate statistics
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(task => task.status === 'done').length;
  const overdueTasks = filteredTasks.filter(task => 
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'
  ).length;

  return (
    <div className={`task-board ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 text-right">لوحة المهام</h2>
            <div className="flex items-center gap-6 mt-2 text-sm text-gray-600">
              <span>إجمالي: {totalTasks}</span>
              <span>مكتمل: {completedTasks}</span>
              <span className="text-red-600">متأخر: {overdueTasks}</span>
              <span>معدل الإنجاز: {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%</span>
            </div>
          </div>
          
          <Button onClick={() => onTaskCreate('todo')} className="gap-2">
            <Plus className="h-4 w-4" />
            مهمة جديدة
          </Button>
        </div>

        {/* Search and Filters */}
        {(showSearch || showFilters) && (
          <div className="flex flex-wrap items-center gap-4">
            {showSearch && (
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="البحث في المهام..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 w-64"
                />
              </div>
            )}

            {showFilters && (
              <>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="الأولوية" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأولويات</SelectItem>
                    <SelectItem value="urgent">عاجل</SelectItem>
                    <SelectItem value="high">عالي</SelectItem>
                    <SelectItem value="medium">متوسط</SelectItem>
                    <SelectItem value="low">منخفض</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="المسؤول" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الموظفين</SelectItem>
                    {uniqueAssignees.map((assignee) => (
                      <SelectItem key={assignee!.id} value={assignee!.id}>
                        {assignee!.nameAr || assignee!.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="المشروع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المشاريع</SelectItem>
                    {uniqueProjects.map((project) => (
                      <SelectItem key={project.id!} value={project.id!}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        )}
      </div>

      {/* Board */}
      <div className="overflow-x-auto">
        <div className="flex gap-6 pb-6" style={{ minWidth: `${columns.length * 320}px` }}>
          {columns.map((column) => (
            <TaskColumn
              key={column.id}
              column={column}
              tasks={tasksByColumn[column.id] || []}
              onTaskCreate={onTaskCreate}
              onTaskEdit={onTaskEdit}
              onTaskDelete={onTaskDelete}
              onTaskAssign={onTaskAssign}
              onTaskMove={onTaskMove}
            />
          ))}
        </div>
      </div>
    </div>
  );
}