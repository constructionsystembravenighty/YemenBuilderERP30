import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  ChevronDown, 
  ChevronRight, 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Briefcase,
  Award,
  TrendingUp,
  Search,
  Filter,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { getArabicInitials } from '@/lib/arabic-utils';

interface Employee {
  id: string;
  fullName: string;
  fullNameAr: string;
  email: string;
  role: 'ceo' | 'manager' | 'supervisor' | 'employee' | 'worker';
  roleAr: string;
  department?: string;
  departmentAr?: string;
  managerId?: string;
  subordinates?: Employee[];
  avatar?: string;
  phone?: string;
  location?: string;
  locationAr?: string;
  hireDate?: Date;
  skills?: string[];
  skillsAr?: string[];
  status: 'active' | 'inactive' | 'on_leave';
  performance?: {
    rating: number;
    lastReview: Date;
    projects: number;
    completedTasks: number;
  };
}

interface OrgChartProps {
  companyId: number;
  onEmployeeClick?: (employee: Employee) => void;
  onEmployeeEdit?: (employee: Employee) => void;
  showPerformance?: boolean;
  showContactInfo?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

const roleColors = {
  ceo: 'border-purple-500 bg-purple-50',
  manager: 'border-blue-500 bg-blue-50',
  supervisor: 'border-green-500 bg-green-50',
  employee: 'border-gray-500 bg-gray-50',
  worker: 'border-orange-500 bg-orange-50',
};

const roleLabelsAr = {
  ceo: 'المدير التنفيذي',
  manager: 'مدير',
  supervisor: 'مشرف',
  employee: 'موظف',
  worker: 'عامل',
};

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-red-100 text-red-800',
  on_leave: 'bg-yellow-100 text-yellow-800',
};

const statusLabelsAr = {
  active: 'نشط',
  inactive: 'غير نشط',
  on_leave: 'في إجازة',
};

// Sample data for demonstration
const sampleEmployees: Employee[] = [
  {
    id: '1',
    fullName: 'Ahmed Al-Yamani',
    fullNameAr: 'أحمد علي اليماني',
    email: 'ahmed.yamani@company.ye',
    role: 'ceo',
    roleAr: 'المدير التنفيذي',
    department: 'Executive',
    departmentAr: 'الإدارة التنفيذية',
    phone: '+967-1-234567',
    location: 'Sana\'a',
    locationAr: 'صنعاء',
    hireDate: new Date('2020-01-15'),
    skills: ['Leadership', 'Strategic Planning', 'Business Development'],
    skillsAr: ['القيادة', 'التخطيط الاستراتيجي', 'تطوير الأعمال'],
    status: 'active',
    performance: {
      rating: 9.2,
      lastReview: new Date('2024-12-01'),
      projects: 5,
      completedTasks: 45,
    },
    subordinates: [
      {
        id: '2',
        fullName: 'Mohammed Al-Hadhrami',
        fullNameAr: 'محمد سالم الحضرمي',
        email: 'mohammed.hadhrami@company.ye',
        role: 'manager',
        roleAr: 'مدير المشاريع',
        department: 'Projects',
        departmentAr: 'إدارة المشاريع',
        managerId: '1',
        phone: '+967-1-234568',
        location: 'Sana\'a',
        locationAr: 'صنعاء',
        hireDate: new Date('2021-03-20'),
        skills: ['Project Management', 'Construction', 'Team Leadership'],
        skillsAr: ['إدارة المشاريع', 'البناء', 'قيادة الفرق'],
        status: 'active',
        performance: {
          rating: 8.7,
          lastReview: new Date('2024-11-15'),
          projects: 8,
          completedTasks: 67,
        },
        subordinates: [
          {
            id: '3',
            fullName: 'Fatima Al-Zahra',
            fullNameAr: 'فاطمة علي الزهراء',
            email: 'fatima.zahra@company.ye',
            role: 'supervisor',
            roleAr: 'مشرفة المواقع',
            department: 'Construction',
            departmentAr: 'الإنشاءات',
            managerId: '2',
            phone: '+967-1-234569',
            location: 'Sana\'a',
            locationAr: 'صنعاء',
            hireDate: new Date('2022-06-10'),
            skills: ['Site Management', 'Quality Control', 'Safety'],
            skillsAr: ['إدارة المواقع', 'مراقبة الجودة', 'السلامة'],
            status: 'active',
            performance: {
              rating: 8.3,
              lastReview: new Date('2024-10-30'),
              projects: 4,
              completedTasks: 23,
            },
            subordinates: [
              {
                id: '4',
                fullName: 'Ali Hassan',
                fullNameAr: 'علي حسن عبدالله',
                email: 'ali.hassan@company.ye',
                role: 'worker',
                roleAr: 'عامل بناء',
                department: 'Construction',
                departmentAr: 'الإنشاءات',
                managerId: '3',
                phone: '+967-1-234570',
                skills: ['Masonry', 'Concrete Work'],
                skillsAr: ['البناء', 'أعمال الخرسانة'],
                status: 'active',
                performance: {
                  rating: 7.8,
                  lastReview: new Date('2024-09-15'),
                  projects: 3,
                  completedTasks: 15,
                },
              },
              {
                id: '5',
                fullName: 'Omar Al-Sharif',
                fullNameAr: 'عمر محمد الشريف',
                email: 'omar.sharif@company.ye',
                role: 'worker',
                roleAr: 'عامل كهرباء',
                department: 'Electrical',
                departmentAr: 'الكهرباء',
                managerId: '3',
                phone: '+967-1-234571',
                skills: ['Electrical Work', 'Wiring'],
                skillsAr: ['الأعمال الكهربائية', 'التوصيلات'],
                status: 'active',
                performance: {
                  rating: 8.1,
                  lastReview: new Date('2024-08-20'),
                  projects: 2,
                  completedTasks: 12,
                },
              },
            ],
          },
        ],
      },
      {
        id: '6',
        fullName: 'Sarah Al-Yemeni',
        fullNameAr: 'سارة أحمد اليمني',
        email: 'sarah.yemeni@company.ye',
        role: 'manager',
        roleAr: 'مديرة الموارد البشرية',
        department: 'HR',
        departmentAr: 'الموارد البشرية',
        managerId: '1',
        phone: '+967-1-234572',
        location: 'Sana\'a',
        locationAr: 'صنعاء',
        hireDate: new Date('2021-08-15'),
        skills: ['HR Management', 'Recruitment', 'Training'],
        skillsAr: ['إدارة الموارد البشرية', 'التوظيف', 'التدريب'],
        status: 'active',
        performance: {
          rating: 8.5,
          lastReview: new Date('2024-12-01'),
          projects: 3,
          completedTasks: 28,
        },
        subordinates: [
          {
            id: '7',
            fullName: 'Nadia Al-Mukalla',
            fullNameAr: 'نادية سعيد المكلا',
            email: 'nadia.mukalla@company.ye',
            role: 'employee',
            roleAr: 'موظفة شؤون العاملين',
            department: 'HR',
            departmentAr: 'الموارد البشرية',
            managerId: '6',
            phone: '+967-1-234573',
            skills: ['Employee Relations', 'Administration'],
            skillsAr: ['علاقات الموظفين', 'الإدارة'],
            status: 'on_leave',
            performance: {
              rating: 7.9,
              lastReview: new Date('2024-11-01'),
              projects: 2,
              completedTasks: 18,
            },
          },
        ],
      },
    ],
  },
];

function EmployeeNode({ 
  employee, 
  isExpanded, 
  onToggle, 
  onEmployeeClick,
  showPerformance,
  showContactInfo,
  level = 0 
}: {
  employee: Employee;
  isExpanded: boolean;
  onToggle: () => void;
  onEmployeeClick?: (employee: Employee) => void;
  showPerformance: boolean;
  showContactInfo: boolean;
  level?: number;
}) {
  const hasSubordinates = employee.subordinates && employee.subordinates.length > 0;

  return (
    <div className="relative">
      <div 
        className={cn(
          "relative bg-white border-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer p-4 min-w-[280px]",
          roleColors[employee.role]
        )}
        onClick={() => onEmployeeClick?.(employee)}
      >
        {/* Employee Card Content */}
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
            <AvatarImage src={employee.avatar} />
            <AvatarFallback className="bg-white text-primary font-semibold">
              {getArabicInitials(employee.fullNameAr)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate text-base">
                  {employee.fullNameAr}
                </h3>
                <p className="text-sm text-gray-600 truncate">
                  {employee.roleAr}
                </p>
                {employee.departmentAr && (
                  <p className="text-xs text-gray-500 truncate">
                    {employee.departmentAr}
                  </p>
                )}
              </div>
              
              <Badge 
                variant="secondary" 
                className={cn("text-xs", statusColors[employee.status])}
              >
                {statusLabelsAr[employee.status]}
              </Badge>
            </div>

            {/* Contact Information */}
            {showContactInfo && (
              <div className="mt-2 space-y-1">
                {employee.email && (
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{employee.email}</span>
                  </div>
                )}
                {employee.phone && (
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Phone className="h-3 w-3" />
                    <span>{employee.phone}</span>
                  </div>
                )}
                {employee.locationAr && (
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <MapPin className="h-3 w-3" />
                    <span>{employee.locationAr}</span>
                  </div>
                )}
              </div>
            )}

            {/* Performance Metrics */}
            {showPerformance && employee.performance && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-gray-600">التقييم:</span>
                    <span className="font-semibold text-green-600">
                      {employee.performance.rating}/10
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-3 w-3 text-blue-600" />
                    <span className="text-blue-600">{employee.performance.projects}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Skills */}
            {employee.skillsAr && employee.skillsAr.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="flex flex-wrap gap-1">
                  {employee.skillsAr.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                      {skill}
                    </Badge>
                  ))}
                  {employee.skillsAr.length > 3 && (
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      +{employee.skillsAr.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Expand/Collapse Button */}
        {hasSubordinates && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-6 w-6 rounded-full border bg-white shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        )}
      </div>

      {/* Subordinates */}
      {hasSubordinates && isExpanded && (
        <div className="mt-6 mr-8">
          {/* Connection Lines */}
          <div className="relative">
            <div className="absolute top-0 right-4 w-px h-4 bg-gray-300" />
            <div className="absolute top-4 right-4 w-8 h-px bg-gray-300" />
          </div>
          
          <div className="space-y-4">
            {employee.subordinates!.map((subordinate, index) => (
              <div key={subordinate.id} className="relative">
                {/* Connection line */}
                <div className="absolute top-6 -right-8 w-8 h-px bg-gray-300" />
                {index < employee.subordinates!.length - 1 && (
                  <div className="absolute top-6 -right-8 w-px h-full bg-gray-300" />
                )}
                
                <EmployeeNode
                  employee={subordinate}
                  isExpanded={false}
                  onToggle={() => {}}
                  onEmployeeClick={onEmployeeClick}
                  showPerformance={showPerformance}
                  showContactInfo={showContactInfo}
                  level={level + 1}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function OrganizationalChart({ 
  companyId, 
  onEmployeeClick,
  onEmployeeEdit,
  showPerformance = true,
  showContactInfo = true,
  orientation = 'vertical'
}: OrgChartProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['1']));
  const [showInactive, setShowInactive] = useState(false);

  // In a real application, this would fetch from the API
  const { data: employees = sampleEmployees, isLoading } = useQuery({
    queryKey: [`/api/employees?companyId=${companyId}`],
    queryFn: () => Promise.resolve(sampleEmployees),
  });

  const filteredEmployees = useMemo(() => {
    if (!employees) return [];
    
    const filterEmployee = (employee: Employee): Employee | null => {
      const matchesSearch = employee.fullNameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           employee.roleAr.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = selectedDepartment === 'all' || employee.departmentAr === selectedDepartment;
      const matchesRole = selectedRole === 'all' || employee.role === selectedRole;
      const matchesStatus = showInactive || employee.status === 'active';

      if (!matchesSearch || !matchesDepartment || !matchesRole || !matchesStatus) {
        return null;
      }

      const filteredSubordinates = employee.subordinates
        ?.map(sub => filterEmployee(sub))
        .filter(Boolean) as Employee[];

      return {
        ...employee,
        subordinates: filteredSubordinates || [],
      };
    };

    return employees.map(emp => filterEmployee(emp)).filter(Boolean) as Employee[];
  }, [employees, searchTerm, selectedDepartment, selectedRole, showInactive]);

  const departments = useMemo(() => {
    if (!employees) return [];
    const depts = new Set<string>();
    const collectDepts = (emp: Employee) => {
      if (emp.departmentAr) depts.add(emp.departmentAr);
      emp.subordinates?.forEach(collectDepts);
    };
    employees.forEach(collectDepts);
    return Array.from(depts);
  }, [employees]);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="w-full bg-white/95 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                <Users className="h-6 w-6" />
                الهيكل التنظيمي
              </CardTitle>
              <p className="text-gray-600 mt-1">عرض تفاعلي للهيكل التنظيمي للشركة</p>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="البحث عن موظف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-8 w-48"
                />
              </div>
              
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="القسم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأقسام</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="المنصب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  {Object.entries(roleLabelsAr).map(([role, label]) => (
                    <SelectItem key={role} value={role}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInactive(!showInactive)}
                className="flex items-center gap-1"
              >
                {showInactive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                غير النشطين
              </Button>
              
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="overflow-auto">
            <div className="min-w-fit p-4">
              {filteredEmployees.map(employee => (
                <EmployeeNode
                  key={employee.id}
                  employee={employee}
                  isExpanded={expandedNodes.has(employee.id)}
                  onToggle={() => toggleNode(employee.id)}
                  onEmployeeClick={onEmployeeClick}
                  showPerformance={showPerformance}
                  showContactInfo={showContactInfo}
                />
              ))}
            </div>
          </div>
          
          {/* Summary Stats */}
          <div className="border-t mt-6 pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-primary">
                  {employees.reduce((acc, emp) => acc + 1 + (emp.subordinates?.length || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">إجمالي الموظفين</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-600">
                  {employees.filter(emp => emp.status === 'active').length}
                </div>
                <div className="text-sm text-gray-600">نشط</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-blue-600">
                  {departments.length}
                </div>
                <div className="text-sm text-gray-600">الأقسام</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-orange-600">
                  {employees.filter(emp => emp.role === 'manager').length}
                </div>
                <div className="text-sm text-gray-600">المدراء</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}