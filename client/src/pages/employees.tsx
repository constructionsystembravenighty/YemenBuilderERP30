import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Plus, 
  Search, 
  Filter, 
  Users, 
  Crown,
  Building,
  Phone,
  Mail,
  Calendar,
  MapPin,
  UserCheck,
  UserX,
  Edit,
  Trash2,
  MoreVertical
} from "lucide-react";
import { GlassmorphicCard, GlassContent, GlassHeader } from "@/components/glassmorphic-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArabicForm } from "@/components/arabic-form";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/currency";
import { formatArabicDate, getArabicInitials, getArabicBusinessTitle } from "@/lib/arabic-utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";

const createEmployeeFields = [
  { name: "username", label: "Username", labelAr: "اسم المستخدم", type: "text" as const, required: true },
  { name: "password", label: "Password", labelAr: "كلمة المرور", type: "text" as const, required: true },
  { name: "name", label: "Full Name", labelAr: "الاسم الكامل", type: "text" as const, required: true },
  { name: "nameAr", label: "Arabic Name", labelAr: "الاسم بالعربية", type: "text" as const, required: true },
  { name: "email", label: "Email", labelAr: "البريد الإلكتروني", type: "email" as const },
  { name: "phone", label: "Phone", labelAr: "رقم الهاتف", type: "tel" as const },
  {
    name: "role",
    label: "Role",
    labelAr: "المنصب",
    type: "select" as const,
    required: true,
    options: [
      { value: "ceo", label: "CEO", labelAr: "الرئيس التنفيذي" },
      { value: "manager", label: "Manager", labelAr: "مدير" },
      { value: "supervisor", label: "Supervisor", labelAr: "مشرف" },
      { value: "employee", label: "Employee", labelAr: "موظف" },
      { value: "worker", label: "Worker", labelAr: "عامل" },
    ]
  },
  { name: "department", label: "Department", labelAr: "القسم", type: "text" as const },
  { name: "departmentAr", label: "Arabic Department", labelAr: "القسم بالعربية", type: "text" as const },
  { name: "salary", label: "Salary", labelAr: "الراتب", type: "number" as const },
  { name: "hireDate", label: "Hire Date", labelAr: "تاريخ التوظيف", type: "date" as const },
];

const formSchema = insertUserSchema.extend({
  companyId: z.number().default(1),
});

export default function Employees() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  const { data: employees, isLoading } = useQuery({
    queryKey: ["/api/users?companyId=1"],
  });

  const createEmployeeMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/users", {
        ...data,
        companyId: 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsCreateOpen(false);
      toast({
        title: "تم إضافة الموظف بنجاح",
        description: "تم إضافة الموظف الجديد إلى النظام",
      });
    },
    onError: () => {
      toast({
        title: "خطأ في إضافة الموظف",
        description: "حدث خطأ أثناء إضافة الموظف",
        variant: "destructive",
      });
    },
  });

  const filteredEmployees = employees?.filter((employee: any) => {
    const matchesSearch = employee.nameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || employee.role === roleFilter;
    const matchesDepartment = departmentFilter === "all" || employee.departmentAr === departmentFilter;
    return matchesSearch && matchesRole && matchesDepartment;
  });

  const getRoleBadge = (role: string) => {
    const roleMap: Record<string, { label: string; className: string; icon: any }> = {
      ceo: { label: "الرئيس التنفيذي", className: "bg-purple-100 text-purple-800", icon: Crown },
      manager: { label: "مدير", className: "bg-blue-100 text-blue-800", icon: Building },
      supervisor: { label: "مشرف", className: "bg-green-100 text-green-800", icon: UserCheck },
      employee: { label: "موظف", className: "bg-gray-100 text-gray-800", icon: Users },
      worker: { label: "عامل", className: "bg-orange-100 text-orange-800", icon: Users },
    };
    
    const config = roleMap[role] || roleMap.employee;
    const Icon = config.icon;
    
    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 ml-1" />
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800">
        <UserCheck className="h-3 w-3 ml-1" />
        نشط
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">
        <UserX className="h-3 w-3 ml-1" />
        غير نشط
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Group employees by role for organizational chart
  const groupedEmployees = employees?.reduce((acc: any, employee: any) => {
    const role = employee.role;
    if (!acc[role]) acc[role] = [];
    acc[role].push(employee);
    return acc;
  }, {});

  const departments = [...new Set(employees?.map((emp: any) => emp.departmentAr).filter(Boolean))];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">إدارة الموظفين</h1>
          <p className="text-gray-600">إدارة الهيكل التنظيمي ومعلومات الموظفين</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90 text-white">
              <Plus className="h-4 w-4 ml-2" />
              موظف جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إضافة موظف جديد</DialogTitle>
            </DialogHeader>
            <ArabicForm
              fields={createEmployeeFields}
              schema={formSchema}
              onSubmit={(data) => createEmployeeMutation.mutate(data)}
              submitTextAr="إضافة الموظف"
              isLoading={createEmployeeMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassmorphicCard floating className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">إجمالي الموظفين</p>
              <p className="text-2xl font-bold text-primary">{employees?.length || 0}</p>
            </div>
            <div className="w-12 h-12 bg-primary bg-opacity-20 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </div>
        </GlassmorphicCard>

        <GlassmorphicCard floating className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">الموظفون النشطون</p>
              <p className="text-2xl font-bold text-green-600">
                {employees?.filter((emp: any) => emp.isActive).length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </GlassmorphicCard>

        <GlassmorphicCard floating className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">الأقسام</p>
              <p className="text-2xl font-bold text-accent">{departments.length}</p>
            </div>
            <div className="w-12 h-12 bg-accent bg-opacity-20 rounded-lg flex items-center justify-center">
              <Building className="h-6 w-6 text-accent" />
            </div>
          </div>
        </GlassmorphicCard>

        <GlassmorphicCard floating className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">إجمالي الرواتب</p>
              <p className="text-2xl font-bold text-secondary">
                {formatCurrency(
                  employees?.reduce((sum: number, emp: any) => sum + (emp.salary || 0), 0) || 0,
                  "YER",
                  { showSymbol: false }
                )}
              </p>
            </div>
            <div className="w-12 h-12 bg-secondary bg-opacity-20 rounded-lg flex items-center justify-center">
              <Crown className="h-6 w-6 text-secondary" />
            </div>
          </div>
        </GlassmorphicCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Employee List */}
        <div className="xl:col-span-2">
          <GlassmorphicCard floating>
            <GlassHeader
              title="Employee Directory"
              titleAr="دليل الموظفين"
              description="قائمة جميع الموظفين في الشركة"
            />
            
            <GlassContent>
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="البحث في الموظفين..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="glass-input pr-10"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="glass-input w-32">
                      <SelectValue placeholder="المنصب" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع المناصب</SelectItem>
                      <SelectItem value="ceo">رئيس تنفيذي</SelectItem>
                      <SelectItem value="manager">مدير</SelectItem>
                      <SelectItem value="supervisor">مشرف</SelectItem>
                      <SelectItem value="employee">موظف</SelectItem>
                      <SelectItem value="worker">عامل</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger className="glass-input w-32">
                      <SelectValue placeholder="القسم" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الأقسام</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" className="glass-input">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Employee Cards */}
              <div className="space-y-3">
                {filteredEmployees?.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">لا توجد موظفين</p>
                  </div>
                ) : (
                  filteredEmployees?.map((employee: any) => (
                    <GlassmorphicCard key={employee.id} hover className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-reverse space-x-4">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-accent text-white font-semibold">
                              {getArabicInitials(employee.nameAr || employee.name)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-charcoal-text">
                                {employee.nameAr || employee.name}
                              </h4>
                              {getRoleBadge(employee.role)}
                              {getStatusBadge(employee.isActive)}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-500">
                              {employee.departmentAr && (
                                <div className="flex items-center gap-1">
                                  <Building className="h-3 w-3" />
                                  <span>{employee.departmentAr}</span>
                                </div>
                              )}
                              {employee.email && (
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  <span>{employee.email}</span>
                                </div>
                              )}
                              {employee.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  <span>{employee.phone}</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              {employee.hireDate && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>انضم: {formatArabicDate(employee.hireDate)}</span>
                                </div>
                              )}
                              {employee.salary && (
                                <div className="flex items-center gap-1">
                                  <span>الراتب: {formatCurrency(employee.salary)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 ml-2" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 ml-2" />
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </GlassmorphicCard>
                  ))
                )}
              </div>
            </GlassContent>
          </GlassmorphicCard>
        </div>

        {/* Organizational Chart */}
        <div className="space-y-6">
          <GlassmorphicCard floating className="p-6">
            <GlassHeader
              title="Organizational Chart"
              titleAr="الهيكل التنظيمي"
              description="التسلسل الإداري"
            />
            
            <GlassContent>
              <div className="space-y-4">
                {/* CEO Level */}
                {groupedEmployees?.ceo && (
                  <div className="glass-card p-4 rounded-lg">
                    <div className="flex items-center space-x-reverse space-x-3">
                      <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                        <Crown className="text-white h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-medium text-charcoal-text">
                          {groupedEmployees.ceo[0]?.nameAr || groupedEmployees.ceo[0]?.name}
                        </h4>
                        <p className="text-sm text-gray-500">الرئيس التنفيذي</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Managers Level */}
                {groupedEmployees?.manager && (
                  <div className="mr-6 space-y-3">
                    {groupedEmployees.manager.slice(0, 3).map((manager: any) => (
                      <div key={manager.id} className="glass-card p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-reverse space-x-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                              <Building className="text-white h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-medium text-charcoal-text">
                                {manager.nameAr || manager.name}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {manager.departmentAr || "مدير"}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {employees?.filter((emp: any) => emp.managerId === manager.id).length || 0} موظف
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Other Employees */}
                <div className="mr-12">
                  <div className="glass-card p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-reverse space-x-2">
                        <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                          <Users className="text-white h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-charcoal-text">الموظفون</p>
                          <p className="text-xs text-gray-500">مشرفون، موظفون، عمال</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {(groupedEmployees?.supervisor?.length || 0) + 
                         (groupedEmployees?.employee?.length || 0) + 
                         (groupedEmployees?.worker?.length || 0)} موظف
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </GlassContent>
          </GlassmorphicCard>

          {/* Department Distribution */}
          <GlassmorphicCard floating className="p-6">
            <GlassHeader
              title="Department Distribution"
              titleAr="توزيع الأقسام"
              description="عدد الموظفين في كل قسم"
            />
            
            <GlassContent>
              <div className="space-y-3">
                {departments.map((department) => {
                  const count = employees?.filter((emp: any) => emp.departmentAr === department).length || 0;
                  const percentage = employees?.length ? (count / employees.length) * 100 : 0;
                  
                  return (
                    <div key={department} className="glass-card p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-charcoal-text">
                          {department}
                        </span>
                        <span className="text-sm font-semibold text-primary">
                          {count} موظف
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">{percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassContent>
          </GlassmorphicCard>
        </div>
      </div>
    </div>
  );
}
