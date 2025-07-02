import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  User, 
  Users, 
  Crown, 
  Shield, 
  UserCheck, 
  Briefcase, 
  Phone, 
  Mail, 
  MapPin,
  ChevronDown,
  ChevronUp,
  Settings
} from 'lucide-react';
import { getArabicBusinessTitle } from '@/lib/arabic-utils';

export interface OrgChartEmployee {
  id: string;
  name: string;
  nameAr?: string;
  position: string;
  positionAr?: string;
  role: 'ceo' | 'manager' | 'supervisor' | 'employee' | 'worker';
  department?: string;
  departmentAr?: string;
  email?: string;
  phone?: string;
  location?: string;
  avatar?: string;
  managerId?: string;
  subordinates?: OrgChartEmployee[];
  isActive?: boolean;
  hireDate?: Date;
  salary?: number;
  skills?: string[];
}

export interface OrgChartProps {
  employees: OrgChartEmployee[];
  onEmployeeClick?: (employee: OrgChartEmployee) => void;
  onEmployeeEdit?: (employee: OrgChartEmployee) => void;
  showSalaries?: boolean;
  showContacts?: boolean;
  compactView?: boolean;
  className?: string;
}

const getRoleIcon = (role: OrgChartEmployee['role']) => {
  switch (role) {
    case 'ceo': return <Crown className="h-4 w-4 text-yellow-600" />;
    case 'manager': return <Shield className="h-4 w-4 text-blue-600" />;
    case 'supervisor': return <UserCheck className="h-4 w-4 text-green-600" />;
    case 'employee': return <User className="h-4 w-4 text-gray-600" />;
    case 'worker': return <Briefcase className="h-4 w-4 text-orange-600" />;
    default: return <User className="h-4 w-4 text-gray-600" />;
  }
};

const getRoleBadgeColor = (role: OrgChartEmployee['role']) => {
  switch (role) {
    case 'ceo': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'manager': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'supervisor': return 'bg-green-100 text-green-800 border-green-200';
    case 'employee': return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'worker': return 'bg-orange-100 text-orange-800 border-orange-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getRoleNameAr = (role: OrgChartEmployee['role']) => {
  switch (role) {
    case 'ceo': return 'المدير التنفيذي';
    case 'manager': return 'مدير';
    case 'supervisor': return 'مشرف';
    case 'employee': return 'موظف';
    case 'worker': return 'عامل';
    default: return 'موظف';
  }
};

// Build hierarchical structure from flat array
function buildHierarchy(employees: OrgChartEmployee[]): OrgChartEmployee[] {
  const employeeMap = new Map<string, OrgChartEmployee>();
  const roots: OrgChartEmployee[] = [];

  // Create map of all employees
  employees.forEach(emp => {
    employeeMap.set(emp.id, { ...emp, subordinates: [] });
  });

  // Build hierarchy
  employees.forEach(emp => {
    const employee = employeeMap.get(emp.id)!;
    
    if (emp.managerId) {
      const manager = employeeMap.get(emp.managerId);
      if (manager) {
        manager.subordinates = manager.subordinates || [];
        manager.subordinates.push(employee);
      } else {
        // Manager not found, treat as root
        roots.push(employee);
      }
    } else {
      // No manager, this is a root employee
      roots.push(employee);
    }
  });

  return roots;
}

interface EmployeeNodeProps {
  employee: OrgChartEmployee;
  onEmployeeClick?: (employee: OrgChartEmployee) => void;
  onEmployeeEdit?: (employee: OrgChartEmployee) => void;
  showSalaries?: boolean;
  showContacts?: boolean;
  compactView?: boolean;
  level: number;
}

function EmployeeNode({
  employee,
  onEmployeeClick,
  onEmployeeEdit,
  showSalaries,
  showContacts,
  compactView,
  level
}: EmployeeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasSubordinates = employee.subordinates && employee.subordinates.length > 0;

  const handleNodeClick = () => {
    onEmployeeClick?.(employee);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEmployeeEdit?.(employee);
  };

  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Employee Card */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Card 
              className={`
                cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105
                ${employee.isActive === false ? 'opacity-60' : ''}
                ${compactView ? 'w-48' : 'w-64'}
                bg-white border-2 hover:border-primary
              `}
              onClick={handleNodeClick}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getRoleIcon(employee.role)}
                    <Badge className={getRoleBadgeColor(employee.role)}>
                      {getRoleNameAr(employee.role)}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEditClick}
                    className="h-6 w-6 p-0"
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                </div>

                {/* Avatar and Name */}
                <div className="text-center mb-3">
                  <div className="w-16 h-16 mx-auto mb-2 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {employee.avatar ? (
                      <img 
                        src={employee.avatar} 
                        alt={employee.nameAr || employee.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span>{(employee.nameAr || employee.name).charAt(0)}</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-right">
                    {employee.nameAr || employee.name}
                  </h3>
                  {employee.name && employee.nameAr && (
                    <p className="text-sm text-gray-600">{employee.name}</p>
                  )}
                </div>

                {/* Position */}
                <div className="text-center mb-3">
                  <p className="text-sm font-medium text-gray-700 text-right">
                    {employee.positionAr || employee.position}
                  </p>
                  {employee.departmentAr && (
                    <p className="text-xs text-gray-500">
                      {employee.departmentAr}
                    </p>
                  )}
                </div>

                {/* Contact Info */}
                {showContacts && !compactView && (
                  <div className="space-y-1 mb-3">
                    {employee.email && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{employee.email}</span>
                      </div>
                    )}
                    {employee.phone && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Phone className="h-3 w-3" />
                        <span>{employee.phone}</span>
                      </div>
                    )}
                    {employee.location && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <MapPin className="h-3 w-3" />
                        <span>{employee.location}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Subordinates Count */}
                {hasSubordinates && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Users className="h-3 w-3" />
                      <span>{employee.subordinates?.length} مرؤوس</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleExpanded}
                      className="h-6 w-6 p-0"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="text-right">
              <div className="font-medium">{employee.nameAr || employee.name}</div>
              <div className="text-sm text-gray-600">{employee.positionAr || employee.position}</div>
              {employee.departmentAr && (
                <div className="text-sm text-gray-600">{employee.departmentAr}</div>
              )}
              {employee.email && (
                <div className="text-sm text-gray-600">{employee.email}</div>
              )}
              {employee.hireDate && (
                <div className="text-sm text-gray-600">
                  تاريخ التوظيف: {employee.hireDate.toLocaleDateString('ar-YE')}
                </div>
              )}
              {showSalaries && employee.salary && (
                <div className="text-sm text-gray-600">
                  الراتب: {employee.salary.toLocaleString()} ريال
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Connection Line */}
      {hasSubordinates && isExpanded && (
        <div className="w-px h-6 bg-gray-300"></div>
      )}

      {/* Subordinates */}
      {hasSubordinates && isExpanded && (
        <div className="relative">
          {/* Horizontal line */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-px bg-gray-300"></div>
          
          <div className="flex gap-8 pt-6">
            {employee.subordinates?.map((subordinate, index) => (
              <div key={subordinate.id} className="relative">
                {/* Vertical connection line */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-6 bg-gray-300"></div>
                
                <EmployeeNode
                  employee={subordinate}
                  onEmployeeClick={onEmployeeClick}
                  onEmployeeEdit={onEmployeeEdit}
                  showSalaries={showSalaries}
                  showContacts={showContacts}
                  compactView={compactView}
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

export function OrgChart({
  employees,
  onEmployeeClick,
  onEmployeeEdit,
  showSalaries = false,
  showContacts = true,
  compactView = false,
  className = ''
}: OrgChartProps) {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  const hierarchicalData = useMemo(() => {
    let filteredEmployees = employees;
    
    if (selectedDepartment !== 'all') {
      filteredEmployees = employees.filter(emp => 
        emp.department === selectedDepartment || emp.departmentAr === selectedDepartment
      );
    }
    
    return buildHierarchy(filteredEmployees);
  }, [employees, selectedDepartment]);

  const departments = useMemo(() => {
    const depts = new Set<string>();
    employees.forEach(emp => {
      if (emp.departmentAr) depts.add(emp.departmentAr);
    });
    return Array.from(depts);
  }, [employees]);

  const stats = useMemo(() => {
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(emp => emp.isActive !== false).length;
    const departmentCount = departments.length;
    const roleCount = {
      ceo: employees.filter(emp => emp.role === 'ceo').length,
      manager: employees.filter(emp => emp.role === 'manager').length,
      supervisor: employees.filter(emp => emp.role === 'supervisor').length,
      employee: employees.filter(emp => emp.role === 'employee').length,
      worker: employees.filter(emp => emp.role === 'worker').length,
    };

    return { totalEmployees, activeEmployees, departmentCount, roleCount };
  }, [employees, departments.length]);

  return (
    <div className={`org-chart bg-gray-50 rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-6 bg-white border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">الهيكل التنظيمي</h2>
          <div className="flex items-center gap-4">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">جميع الأقسام</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-primary">{stats.totalEmployees}</div>
            <div className="text-sm text-gray-600">إجمالي الموظفين</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded">
            <div className="text-2xl font-bold text-green-600">{stats.activeEmployees}</div>
            <div className="text-sm text-gray-600">نشط</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded">
            <div className="text-2xl font-bold text-blue-600">{stats.departmentCount}</div>
            <div className="text-sm text-gray-600">الأقسام</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded">
            <div className="text-2xl font-bold text-yellow-600">{stats.roleCount.manager}</div>
            <div className="text-sm text-gray-600">المدراء</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded">
            <div className="text-2xl font-bold text-orange-600">{stats.roleCount.worker}</div>
            <div className="text-sm text-gray-600">العمال</div>
          </div>
        </div>
      </div>

      {/* Chart Content */}
      <div className="p-6 overflow-x-auto">
        <div className="flex flex-col items-center space-y-8 min-w-max">
          {hierarchicalData.map(rootEmployee => (
            <EmployeeNode
              key={rootEmployee.id}
              employee={rootEmployee}
              onEmployeeClick={onEmployeeClick}
              onEmployeeEdit={onEmployeeEdit}
              showSalaries={showSalaries}
              showContacts={showContacts}
              compactView={compactView}
              level={0}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 bg-white border-t">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="font-medium text-gray-700">المناصب:</span>
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-yellow-600" />
            <span>مدير تنفيذي</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-600" />
            <span>مدير</span>
          </div>
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-green-600" />
            <span>مشرف</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-600" />
            <span>موظف</span>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-orange-600" />
            <span>عامل</span>
          </div>
        </div>
      </div>
    </div>
  );
}