import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Filter, Calendar, MapPin, DollarSign, Users, GanttChartSquare, Table, FolderOpen } from "lucide-react";
import { GlassmorphicCard, GlassContent, GlassHeader } from "@/components/glassmorphic-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArabicForm } from "@/components/arabic-form";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/currency";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertProjectSchema } from "@shared/schema";
import { GanttChart, sampleGanttTasks } from "@/components/gantt/gantt-chart";
import { AdvancedDataTable, StatusBadge, PriorityBadge } from "@/components/tables/advanced-data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { z } from "zod";

const createProjectFields = [
  { name: "name", label: "Project Name", labelAr: "اسم المشروع", type: "text" as const, required: true },
  { name: "nameAr", label: "Arabic Name", labelAr: "الاسم بالعربية", type: "text" as const, required: true },
  { name: "description", label: "Description", labelAr: "الوصف", type: "textarea" as const },
  { name: "descriptionAr", label: "Arabic Description", labelAr: "الوصف بالعربية", type: "textarea" as const },
  { name: "location", label: "Location", labelAr: "الموقع", type: "text" as const },
  { name: "locationAr", label: "Arabic Location", labelAr: "الموقع بالعربية", type: "text" as const },
  { 
    name: "status", 
    label: "Status", 
    labelAr: "الحالة", 
    type: "select" as const,
    options: [
      { value: "planning", label: "Planning", labelAr: "التخطيط" },
      { value: "active", label: "Active", labelAr: "نشط" },
      { value: "completed", label: "Completed", labelAr: "مكتمل" },
      { value: "cancelled", label: "Cancelled", labelAr: "ملغى" },
      { value: "on_hold", label: "On Hold", labelAr: "متوقف" },
    ]
  },
  { 
    name: "priority", 
    label: "Priority", 
    labelAr: "الأولوية", 
    type: "select" as const,
    options: [
      { value: "low", label: "Low", labelAr: "منخفضة" },
      { value: "medium", label: "Medium", labelAr: "متوسطة" },
      { value: "high", label: "High", labelAr: "عالية" },
      { value: "critical", label: "Critical", labelAr: "حرجة" },
    ]
  },
  { name: "budget", label: "Budget", labelAr: "الميزانية", type: "number" as const },
  { name: "startDate", label: "Start Date", labelAr: "تاريخ البدء", type: "date" as const },
  { name: "endDate", label: "End Date", labelAr: "تاريخ الانتهاء", type: "date" as const },
];

const formSchema = insertProjectSchema.extend({
  companyId: z.number().default(1),
  managerId: z.number().default(1),
});

export default function Projects() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  const { data: projects, isLoading } = useQuery({
    queryKey: ["/api/projects?companyId=1"],
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/projects", {
        ...data,
        companyId: 1,
        managerId: 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsCreateOpen(false);
      toast({
        title: "تم إنشاء المشروع بنجاح",
        description: "تم إضافة المشروع الجديد إلى النظام",
      });
    },
    onError: () => {
      toast({
        title: "خطأ في إنشاء المشروع",
        description: "حدث خطأ أثناء إنشاء المشروع",
        variant: "destructive",
      });
    },
  });

  const filteredProjects = projects?.filter((project: any) => {
    const matchesSearch = project.nameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      planning: { label: "التخطيط", className: "bg-blue-100 text-blue-800" },
      active: { label: "نشط", className: "bg-green-100 text-green-800" },
      completed: { label: "مكتمل", className: "bg-gray-100 text-gray-800" },
      cancelled: { label: "ملغى", className: "bg-red-100 text-red-800" },
      on_hold: { label: "متوقف", className: "bg-yellow-100 text-yellow-800" },
    };
    
    const config = statusMap[status] || statusMap.planning;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityClasses: Record<string, string> = {
      low: "priority-low",
      medium: "priority-medium",
      high: "priority-high",
      critical: "priority-high",
    };
    
    const priorityLabels: Record<string, string> = {
      low: "منخفضة",
      medium: "متوسطة",
      high: "عالية",
      critical: "حرجة",
    };
    
    return (
      <Badge className={priorityClasses[priority] || "priority-medium"}>
        {priorityLabels[priority] || priority}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">إدارة المشاريع</h1>
          <p className="text-gray-600">إدارة وتتبع جميع مشاريع الشركة</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90 text-white">
              <Plus className="h-4 w-4 ml-2" />
              مشروع جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card max-w-2xl">
            <DialogHeader>
              <DialogTitle>إنشاء مشروع جديد</DialogTitle>
            </DialogHeader>
            <ArabicForm
              fields={createProjectFields}
              schema={formSchema}
              onSubmit={(data) => createProjectMutation.mutate(data)}
              submitTextAr="إنشاء المشروع"
              isLoading={createProjectMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <GlassmorphicCard className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="البحث في المشاريع..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-input pr-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="glass-input w-40">
                <SelectValue placeholder="تصفية الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="planning">التخطيط</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
                <SelectItem value="cancelled">ملغى</SelectItem>
                <SelectItem value="on_hold">متوقف</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="glass-input">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </GlassmorphicCard>

      {/* Projects Grid */}
      <div className="grid gap-6">
        {filteredProjects?.length === 0 ? (
          <GlassmorphicCard className="p-12 text-center">
            <div className="text-gray-500">
              <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">لا توجد مشاريع</p>
              <p className="text-sm">لم يتم العثور على مشاريع تطابق معايير البحث</p>
            </div>
          </GlassmorphicCard>
        ) : (
          filteredProjects?.map((project: any) => (
            <GlassmorphicCard key={project.id} floating hover className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Project Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-semibold text-charcoal-text mb-1">
                        {project.nameAr || project.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{project.locationAr || project.location}</span>
                        </div>
                        {project.startDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(project.startDate).toLocaleDateString('ar')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {getStatusBadge(project.status)}
                      {getPriorityBadge(project.priority)}
                    </div>
                  </div>
                  
                  {project.descriptionAr || project.description ? (
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {project.descriptionAr || project.description}
                    </p>
                  ) : null}
                  
                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-500">التقدم</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="progress-gradient" />
                  </div>
                </div>
                
                {/* Project Stats */}
                <div className="lg:w-80">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span className="text-xs text-gray-500">الميزانية</span>
                      </div>
                      <p className="font-semibold text-primary">
                        {formatCurrency(project.budget || 0)}
                      </p>
                    </div>
                    
                    <div className="glass-card p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="h-4 w-4 text-red-500" />
                        <span className="text-xs text-gray-500">المنفق</span>
                      </div>
                      <p className="font-semibold text-red-500">
                        {formatCurrency(project.spent || 0)}
                      </p>
                    </div>
                    
                    <div className="glass-card p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="h-4 w-4 text-accent" />
                        <span className="text-xs text-gray-500">الفريق</span>
                      </div>
                      <p className="font-semibold text-accent">12 عضو</p>
                    </div>
                    
                    <div className="glass-card p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-secondary" />
                        <span className="text-xs text-gray-500">المتبقي</span>
                      </div>
                      <p className="font-semibold text-secondary">
                        {project.endDate ? 
                          Math.max(0, Math.ceil((new Date(project.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                          : '--'
                        } يوم
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </GlassmorphicCard>
          ))
        )}
      </div>

      {/* Stats Summary */}
      {filteredProjects?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <GlassmorphicCard className="p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {filteredProjects?.length || 0}
            </div>
            <div className="text-sm text-gray-500">إجمالي المشاريع</div>
          </GlassmorphicCard>
          
          <GlassmorphicCard className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {filteredProjects?.filter((p: any) => p.status === 'active').length || 0}
            </div>
            <div className="text-sm text-gray-500">المشاريع النشطة</div>
          </GlassmorphicCard>
          
          <GlassmorphicCard className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {filteredProjects?.filter((p: any) => p.status === 'completed').length || 0}
            </div>
            <div className="text-sm text-gray-500">المشاريع المكتملة</div>
          </GlassmorphicCard>
          
          <GlassmorphicCard className="p-4 text-center">
            <div className="text-2xl font-bold text-secondary mb-1">
              {formatCurrency(
                filteredProjects?.reduce((sum: number, p: any) => sum + (p.budget || 0), 0) || 0
              )}
            </div>
            <div className="text-sm text-gray-500">إجمالي الميزانيات</div>
          </GlassmorphicCard>
        </div>
      )}
      
      {/* Advanced Project Management Views */}
      <div className="mt-8 space-y-6">
        {/* Gantt Chart Section */}
        <GlassmorphicCard floating>
          <GlassHeader
            titleAr="مخطط جانت - الجدول الزمني للمشاريع"
            title="Gantt Chart - Project Timeline"
            action={
              <Button variant="outline" size="sm" className="glass-input">
                <GanttChartSquare className="h-4 w-4 ml-2" />
                عرض متقدم
              </Button>
            }
          />
          <GlassContent className="p-0">
            <GanttChart 
              tasks={sampleGanttTasks}
              titleAr="الجدول الزمني التفصيلي للمشاريع"
              onTaskClick={(task) => {
                toast({
                  title: `تم تحديد المهمة: ${task.nameAr}`,
                  description: `التقدم: ${task.progress}% - المسؤول: ${task.assigneeAr}`,
                });
              }}
            />
          </GlassContent>
        </GlassmorphicCard>

        {/* Advanced Data Table */}
        <AdvancedDataTable
          columns={[
            {
              accessorKey: "nameAr",
              header: "اسم المشروع",
              cell: ({ row }) => (
                <div className="font-medium text-charcoal-text">
                  {row.getValue("nameAr") || row.original.name}
                </div>
              ),
            },
            {
              accessorKey: "status",
              header: "الحالة",
              cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
            },
            {
              accessorKey: "progress",
              header: "التقدم",
              cell: ({ row }) => {
                const progress = row.getValue("progress") as number;
                return (
                  <div className="w-full">
                    <div className="flex items-center space-x-reverse space-x-2">
                      <Progress value={progress} className="w-16" />
                      <span className="text-sm text-gray-500 min-w-[3rem]">
                        {progress}%
                      </span>
                    </div>
                  </div>
                );
              },
            },
            {
              accessorKey: "budget",
              header: "الميزانية",
              cell: ({ row }) => (
                <span className="font-medium text-primary">
                  {formatCurrency(row.getValue("budget"))}
                </span>
              ),
            },
            {
              accessorKey: "startDate",
              header: "تاريخ البدء",
              cell: ({ row }) => {
                const date = row.getValue("startDate") as string;
                return date ? new Date(date).toLocaleDateString('ar-YE') : '-';
              },
            },
          ]}
          data={filteredProjects || []}
          titleAr="جدول المشاريع التفصيلي"
          searchPlaceholderAr="ابحث في المشاريع..."
          enableExport={true}
          enableColumnVisibility={true}
          onRowClick={(project) => {
            toast({
              title: `المشروع: ${project.nameAr || project.name}`,
              description: `الحالة: ${project.status} - التقدم: ${project.progress}%`,
            });
          }}
        />
      </div>
    </div>
  );
}
