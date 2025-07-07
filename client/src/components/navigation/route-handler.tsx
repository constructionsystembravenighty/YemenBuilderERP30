import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";

interface RouteHandlerProps {
  children: React.ReactNode;
}

// Route change handler for analytics, cache management, and side effects
export function RouteHandler({ children }: RouteHandlerProps) {
  const [location] = useLocation();
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // Analytics: Track page views
    if (typeof window !== 'undefined') {
      // Here you can add analytics tracking
      console.log('Page view:', location);
    }
    
    // Scroll to top on route change
    window.scrollTo(0, 0);
    
    // Optional: Prefetch related data based on route
    prefetchRouteData(location, queryClient);
    
  }, [location, queryClient]);
  
  return <>{children}</>;
}

// Prefetch data based on route to improve performance
function prefetchRouteData(path: string, queryClient: any) {
  const prefetchMap: Record<string, string[]> = {
    '/projects': ['/api/projects', '/api/dashboard/stats'],
    '/financial': ['/api/transactions', '/api/exchange-rates'],
    '/employees': ['/api/users'],
    '/warehouse': ['/api/warehouses', '/api/equipment'],
    '/equipment': ['/api/equipment'],
    '/documents': ['/api/documents'],
    '/reports': ['/api/dashboard/stats', '/api/intelligence/financial-trends']
  };
  
  const endpointsToPrefetch = prefetchMap[path];
  if (endpointsToPrefetch) {
    endpointsToPrefetch.forEach(endpoint => {
      queryClient.prefetchQuery({
        queryKey: [endpoint],
        staleTime: 30000 // 30 seconds
      });
    });
  }
}

// Enhanced route configuration with metadata
export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  title: string;
  titleAr: string;
  description?: string;
  descriptionAr?: string;
  requiresAuth?: boolean;
  roles?: string[];
  preload?: string[];
  metadata?: Record<string, any>;
}

export const routeConfigs: RouteConfig[] = [
  {
    path: "/",
    component: (() => {}) as any,
    title: "Dashboard",
    titleAr: "لوحة التحكم",
    description: "Main dashboard with overview and statistics",
    descriptionAr: "لوحة التحكم الرئيسية مع نظرة عامة والإحصائيات"
  },
  {
    path: "/dashboard",
    component: (() => {}) as any,
    title: "Dashboard",
    titleAr: "لوحة التحكم",
    description: "Main dashboard with overview and statistics",
    descriptionAr: "لوحة التحكم الرئيسية مع نظرة عامة والإحصائيات",
    preload: ['/api/dashboard/stats', '/api/projects']
  },
  {
    path: "/projects",
    component: (() => {}) as any,
    title: "Projects",
    titleAr: "المشاريع",
    description: "Manage construction projects and track progress",
    descriptionAr: "إدارة مشاريع البناء وتتبع التقدم",
    preload: ['/api/projects']
  },
  {
    path: "/projects/:id",
    component: (() => {}) as any,
    title: "Project Details",
    titleAr: "تفاصيل المشروع",
    description: "Detailed view of construction project",
    descriptionAr: "عرض تفصيلي لمشروع البناء"
  },
  {
    path: "/financial",
    component: (() => {}) as any,
    title: "Financial Management",
    titleAr: "الإدارة المالية",
    description: "Manage finances, transactions, and budgets",
    descriptionAr: "إدارة المالية والمعاملات والميزانيات",
    preload: ['/api/transactions', '/api/exchange-rates']
  },
  {
    path: "/employees",
    component: (() => {}) as any,
    title: "Employee Management",
    titleAr: "إدارة الموظفين",
    description: "Manage workforce and human resources",
    descriptionAr: "إدارة القوى العاملة والموارد البشرية",
    preload: ['/api/users']
  },
  {
    path: "/warehouse",
    component: (() => {}) as any,
    title: "Warehouse Management",
    titleAr: "إدارة المخازن",
    description: "Manage inventory and materials",
    descriptionAr: "إدارة المخزون والمواد",
    preload: ['/api/warehouses']
  },
  {
    path: "/equipment",
    component: (() => {}) as any,
    title: "Equipment Management",
    titleAr: "إدارة المعدات",
    description: "Track equipment and maintenance",
    descriptionAr: "تتبع المعدات والصيانة",
    preload: ['/api/equipment']
  },
  {
    path: "/documents",
    component: (() => {}) as any,
    title: "Document Management",
    titleAr: "إدارة الوثائق",
    description: "Organize and share documents",
    descriptionAr: "تنظيم ومشاركة الوثائق",
    preload: ['/api/documents']
  },
  {
    path: "/reports",
    component: (() => {}) as any,
    title: "Reports & Analytics",
    titleAr: "التقارير والتحليلات",
    description: "Comprehensive reports and data analytics",
    descriptionAr: "تقارير شاملة وتحليلات البيانات",
    preload: ['/api/dashboard/stats', '/api/intelligence/financial-trends']
  }
];

// Route utilities
export function getRouteConfig(path: string): RouteConfig | undefined {
  return routeConfigs.find(config => config.path === path);
}

export function getPageTitle(path: string): { title: string; titleAr: string } {
  const config = getRouteConfig(path);
  return {
    title: config?.title || "Construction Management",
    titleAr: config?.titleAr || "منصة إدارة البناء"
  };
}

// Dynamic route parameter extraction
export function extractRouteParams(pattern: string, path: string): Record<string, string> {
  const patternSegments = pattern.split('/');
  const pathSegments = path.split('/');
  const params: Record<string, string> = {};
  
  patternSegments.forEach((segment, index) => {
    if (segment.startsWith(':')) {
      const paramName = segment.slice(1);
      params[paramName] = pathSegments[index] || '';
    }
  });
  
  return params;
}