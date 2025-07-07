import { Link, useLocation } from "wouter";
import { ChevronLeft, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface BreadcrumbItem {
  id: string;
  label: string;
  labelAr: string;
  href?: string;
  isActive: boolean;
}

interface BreadcrumbProps {
  className?: string;
  customItems?: BreadcrumbItem[];
  showHome?: boolean;
}

// Generate breadcrumbs based on current path
function useBreadcrumbs(customItems?: BreadcrumbItem[]) {
  const [currentPath] = useLocation();
  
  return useMemo(() => {
    if (customItems) return customItems;
    
    const pathSegments = currentPath.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];
    
    // Add home
    breadcrumbs.push({
      id: 'home',
      label: 'Dashboard',
      labelAr: 'الرئيسية',
      href: '/dashboard',
      isActive: currentPath === '/' || currentPath === '/dashboard'
    });
    
    // Generate breadcrumbs from path
    let currentHref = '';
    pathSegments.forEach((segment, index) => {
      currentHref += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      breadcrumbs.push({
        id: segment,
        label: getSegmentLabel(segment),
        labelAr: getSegmentLabelAr(segment),
        href: isLast ? undefined : currentHref,
        isActive: isLast
      });
    });
    
    return breadcrumbs;
  }, [currentPath, customItems]);
}

// Helper functions to get labels for path segments
function getSegmentLabel(segment: string): string {
  const labels: Record<string, string> = {
    'projects': 'Projects',
    'financial': 'Financial',
    'employees': 'Employees',
    'warehouse': 'Warehouse',
    'equipment': 'Equipment',
    'documents': 'Documents',
    'reports': 'Reports',
    'active': 'Active',
    'completed': 'Completed',
    'planning': 'Planning',
    'transactions': 'Transactions',
    'budgets': 'Budgets',
    'departments': 'Departments',
    'attendance': 'Attendance',
    'payroll': 'Payroll',
    'inventory': 'Inventory',
    'suppliers': 'Suppliers',
    'orders': 'Orders',
    'edit': 'Edit',
    'create': 'Create',
    'view': 'View'
  };
  
  return labels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
}

function getSegmentLabelAr(segment: string): string {
  const labels: Record<string, string> = {
    'projects': 'المشاريع',
    'financial': 'المالية',
    'employees': 'الموظفين',
    'warehouse': 'المخازن',
    'equipment': 'المعدات',
    'documents': 'الوثائق',
    'reports': 'التقارير',
    'active': 'النشطة',
    'completed': 'المكتملة',
    'planning': 'قيد التخطيط',
    'transactions': 'المعاملات',
    'budgets': 'الميزانيات',
    'departments': 'الأقسام',
    'attendance': 'الحضور والانصراف',
    'payroll': 'كشوف المرتبات',
    'inventory': 'المخزون',
    'suppliers': 'الموردين',
    'orders': 'طلبات الشراء',
    'edit': 'تعديل',
    'create': 'إنشاء',
    'view': 'عرض'
  };
  
  return labels[segment] || segment;
}

export function Breadcrumb({ className, customItems, showHome = true }: BreadcrumbProps) {
  const breadcrumbs = useBreadcrumbs(customItems);
  
  if (breadcrumbs.length <= 1 && !showHome) return null;
  
  return (
    <nav className={cn("flex items-center space-x-reverse space-x-1 text-sm", className)}>
      <ol className="flex items-center space-x-reverse space-x-1">
        {breadcrumbs.map((item, index) => (
          <li key={item.id} className="flex items-center">
            {index > 0 && (
              <ChevronLeft className="h-4 w-4 text-gray-400 mx-2" />
            )}
            
            {item.href && !item.isActive ? (
              <Link href={item.href}>
                <span className="text-gray-600 hover:text-primary transition-colors duration-200 cursor-pointer">
                  {item.labelAr}
                </span>
              </Link>
            ) : (
              <span className={cn(
                "font-medium",
                item.isActive ? "text-primary" : "text-gray-500"
              )}>
                {item.labelAr}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Predefined breadcrumb configurations for complex pages
export const breadcrumbConfigs = {
  projectsList: () => [
    { id: 'home', label: 'Dashboard', labelAr: 'الرئيسية', href: '/dashboard', isActive: false },
    { id: 'projects', label: 'Projects', labelAr: 'المشاريع', isActive: true }
  ],
  
  projectDetails: (projectId: string, projectName: string) => [
    { id: 'home', label: 'Dashboard', labelAr: 'الرئيسية', href: '/dashboard', isActive: false },
    { id: 'projects', label: 'Projects', labelAr: 'المشاريع', href: '/projects', isActive: false },
    { id: 'project', label: projectName, labelAr: projectName, isActive: true }
  ],
  
  projectEdit: (projectId: string, projectName: string) => [
    { id: 'home', label: 'Dashboard', labelAr: 'الرئيسية', href: '/dashboard', isActive: false },
    { id: 'projects', label: 'Projects', labelAr: 'المشاريع', href: '/projects', isActive: false },
    { id: 'project', label: projectName, labelAr: projectName, href: `/projects/${projectId}`, isActive: false },
    { id: 'edit', label: 'Edit', labelAr: 'تعديل', isActive: true }
  ],
  
  employeesList: () => [
    { id: 'home', label: 'Dashboard', labelAr: 'الرئيسية', href: '/dashboard', isActive: false },
    { id: 'employees', label: 'Employees', labelAr: 'الموظفين', isActive: true }
  ],
  
  employeeProfile: (employeeId: string, employeeName: string) => [
    { id: 'home', label: 'Dashboard', labelAr: 'الرئيسية', href: '/dashboard', isActive: false },
    { id: 'employees', label: 'Employees', labelAr: 'الموظفين', href: '/employees', isActive: false },
    { id: 'employee', label: employeeName, labelAr: employeeName, isActive: true }
  ],
  
  financialReports: () => [
    { id: 'home', label: 'Dashboard', labelAr: 'الرئيسية', href: '/dashboard', isActive: false },
    { id: 'financial', label: 'Financial', labelAr: 'المالية', href: '/financial', isActive: false },
    { id: 'reports', label: 'Reports', labelAr: 'التقارير', isActive: true }
  ],
  
  warehouseInventory: () => [
    { id: 'home', label: 'Dashboard', labelAr: 'الرئيسية', href: '/dashboard', isActive: false },
    { id: 'warehouse', label: 'Warehouse', labelAr: 'المخازن', href: '/warehouse', isActive: false },
    { id: 'inventory', label: 'Inventory', labelAr: 'المخزون', isActive: true }
  ],
  
  settings: () => [
    { id: 'home', label: 'Dashboard', labelAr: 'الرئيسية', href: '/dashboard', isActive: false },
    { id: 'settings', label: 'Settings', labelAr: 'الإعدادات', isActive: true }
  ]
};