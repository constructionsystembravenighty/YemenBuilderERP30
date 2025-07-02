import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { 
  ChevronRight, 
  ChevronLeft, 
  Home, 
  Building, 
  Users, 
  FileText, 
  BarChart3, 
  Wrench,
  Settings,
  HelpCircle
} from 'lucide-react';

export interface BreadcrumbItem {
  id: string;
  label: string;
  labelAr: string;
  href?: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  isDropdown?: boolean;
  dropdownItems?: BreadcrumbItem[];
}

export interface BreadcrumbNavigationProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  showHome?: boolean;
  homeLabel?: string;
  homeLabelAr?: string;
  homeHref?: string;
  maxItems?: number;
  className?: string;
}

// Get default icon for common routes
const getDefaultIcon = (href?: string) => {
  if (!href) return null;
  
  switch (true) {
    case href === '/': 
    case href === '/dashboard':
      return <Home className="h-4 w-4" />;
    case href.startsWith('/projects'):
      return <Building className="h-4 w-4" />;
    case href.startsWith('/employees'):
      return <Users className="h-4 w-4" />;
    case href.startsWith('/documents'):
      return <FileText className="h-4 w-4" />;
    case href.startsWith('/reports'):
      return <BarChart3 className="h-4 w-4" />;
    case href.startsWith('/equipment'):
      return <Wrench className="h-4 w-4" />;
    case href.startsWith('/settings'):
      return <Settings className="h-4 w-4" />;
    case href.startsWith('/help'):
      return <HelpCircle className="h-4 w-4" />;
    default:
      return null;
  }
};

export function BreadcrumbNavigation({
  items,
  separator = <ChevronLeft className="h-4 w-4 text-gray-400" />,
  showHome = true,
  homeLabel = "Home",
  homeLabelAr = "الرئيسية",
  homeHref = "/",
  maxItems = 5,
  className = ""
}: BreadcrumbNavigationProps) {
  // Add home item if requested
  const allItems: BreadcrumbItem[] = showHome ? [
    {
      id: 'home',
      label: homeLabel,
      labelAr: homeLabelAr,
      href: homeHref,
      icon: <Home className="h-4 w-4" />
    },
    ...items
  ] : items;

  // Handle overflow with ellipsis
  let displayItems = allItems;
  let hasOverflow = false;
  
  if (allItems.length > maxItems) {
    hasOverflow = true;
    const firstItem = allItems[0];
    const lastItems = allItems.slice(-2); // Show last 2 items
    displayItems = [firstItem, ...lastItems];
  }

  const renderBreadcrumbItem = (item: BreadcrumbItem, index: number, isLast: boolean) => {
    const icon = item.icon || getDefaultIcon(item.href);
    const content = (
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-medium">
          {item.labelAr || item.label}
        </span>
      </div>
    );

    if (isLast || !item.href) {
      return (
        <span 
          key={item.id}
          className={`flex items-center gap-2 ${
            isLast ? 'text-gray-900' : 'text-gray-500'
          }`}
        >
          {content}
        </span>
      );
    }

    return (
      <Link key={item.id} href={item.href}>
        <Button 
          variant="ghost" 
          size="sm"
          className="h-auto p-2 hover:bg-gray-100 text-gray-600 hover:text-gray-900"
        >
          {content}
        </Button>
      </Link>
    );
  };

  const renderSeparator = (index: number) => (
    <div key={`separator-${index}`} className="flex items-center">
      {separator}
    </div>
  );

  return (
    <nav 
      className={`flex items-center space-x-1 overflow-hidden ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const showEllipsis = hasOverflow && index === 1;
          
          return (
            <React.Fragment key={item.id}>
              {/* Show ellipsis for overflow */}
              {showEllipsis && (
                <>
                  <li className="flex items-center">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-auto p-2 text-gray-500"
                      disabled
                    >
                      <span className="text-sm">...</span>
                    </Button>
                  </li>
                  {renderSeparator(index)}
                </>
              )}
              
              {/* Breadcrumb item */}
              <li className="flex items-center">
                {renderBreadcrumbItem(item, index, isLast)}
              </li>
              
              {/* Separator */}
              {!isLast && renderSeparator(index)}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

// Hook to generate breadcrumbs from current path
export function useBreadcrumbs(currentPath: string, customItems?: BreadcrumbItem[]): BreadcrumbItem[] {
  return React.useMemo(() => {
    if (customItems) return customItems;
    
    const pathSegments = currentPath.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];
    
    pathSegments.forEach((segment, index) => {
      const path = '/' + pathSegments.slice(0, index + 1).join('/');
      const isLast = index === pathSegments.length - 1;
      
      // Map common segments to Arabic labels
      const getLabelMapping = (segment: string) => {
        const mappings: { [key: string]: { label: string; labelAr: string } } = {
          'projects': { label: 'Projects', labelAr: 'المشاريع' },
          'employees': { label: 'Employees', labelAr: 'الموظفين' },
          'financial': { label: 'Financial', labelAr: 'المالية' },
          'documents': { label: 'Documents', labelAr: 'المستندات' },
          'equipment': { label: 'Equipment', labelAr: 'المعدات' },
          'warehouse': { label: 'Warehouse', labelAr: 'المستودع' },
          'reports': { label: 'Reports', labelAr: 'التقارير' },
          'settings': { label: 'Settings', labelAr: 'الإعدادات' },
          'help': { label: 'Help', labelAr: 'المساعدة' },
          'new': { label: 'New', labelAr: 'جديد' },
          'edit': { label: 'Edit', labelAr: 'تعديل' },
          'view': { label: 'View', labelAr: 'عرض' },
          'create': { label: 'Create', labelAr: 'إنشاء' },
          'manage': { label: 'Manage', labelAr: 'إدارة' }
        };
        
        return mappings[segment] || { 
          label: segment.charAt(0).toUpperCase() + segment.slice(1), 
          labelAr: segment 
        };
      };
      
      const mapping = getLabelMapping(segment);
      
      breadcrumbs.push({
        id: segment,
        label: mapping.label,
        labelAr: mapping.labelAr,
        href: isLast ? undefined : path,
        isActive: isLast
      });
    });
    
    return breadcrumbs;
  }, [currentPath, customItems]);
}

// Predefined breadcrumb configurations for common pages
export const breadcrumbConfigs = {
  projectsList: [
    { id: 'projects', label: 'Projects', labelAr: 'المشاريع', href: '/projects' }
  ],
  
  projectDetails: (projectId: string, projectName: string) => [
    { id: 'projects', label: 'Projects', labelAr: 'المشاريع', href: '/projects' },
    { id: 'project', label: projectName, labelAr: projectName, href: `/projects/${projectId}` }
  ],
  
  projectEdit: (projectId: string, projectName: string) => [
    { id: 'projects', label: 'Projects', labelAr: 'المشاريع', href: '/projects' },
    { id: 'project', label: projectName, labelAr: projectName, href: `/projects/${projectId}` },
    { id: 'edit', label: 'Edit', labelAr: 'تعديل' }
  ],
  
  employeesList: [
    { id: 'employees', label: 'Employees', labelAr: 'الموظفين', href: '/employees' }
  ],
  
  employeeProfile: (employeeId: string, employeeName: string) => [
    { id: 'employees', label: 'Employees', labelAr: 'الموظفين', href: '/employees' },
    { id: 'employee', label: employeeName, labelAr: employeeName, href: `/employees/${employeeId}` }
  ],
  
  financialReports: [
    { id: 'financial', label: 'Financial', labelAr: 'المالية', href: '/financial' },
    { id: 'reports', label: 'Reports', labelAr: 'التقارير' }
  ],
  
  settings: [
    { id: 'settings', label: 'Settings', labelAr: 'الإعدادات' }
  ],
  
  help: [
    { id: 'help', label: 'Help Center', labelAr: 'مركز المساعدة' }
  ]
};

// Component for quick navigation actions
export function BreadcrumbActions({ 
  actions,
  className = ""
}: { 
  actions: Array<{
    id: string;
    label: string;
    labelAr: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary";
  }>;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {actions.map((action) => (
        <Button
          key={action.id}
          variant={action.variant || "outline"}
          size="sm"
          onClick={action.onClick}
          className="gap-2"
        >
          {action.icon}
          {action.labelAr || action.label}
        </Button>
      ))}
    </div>
  );
}