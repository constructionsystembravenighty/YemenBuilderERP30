import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { 
  BarChart3,
  Calculator,
  ChartLine,
  Cog,
  FileText,
  FolderOpen,
  Users,
  Warehouse,
  Home,
  ChevronDown,
  ChevronLeft,
  Search,
  Settings,
  HelpCircle,
  Bookmark,
  Building,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  path: string;
  icon: any;
  label: string;
  badge?: string;
  children?: NavItem[];
  description?: string;
}

const navigationItems: NavItem[] = [
  { 
    path: "/dashboard", 
    icon: ChartLine, 
    label: "لوحة التحكم",
    description: "عرض عام للمشاريع والإحصائيات"
  },
  { 
    path: "/projects", 
    icon: FolderOpen, 
    label: "إدارة المشاريع",
    description: "إدارة المشاريع وتتبع التقدم",
    children: [
      { path: "/projects", icon: FolderOpen, label: "جميع المشاريع" },
      { path: "/projects/active", icon: ChartLine, label: "المشاريع النشطة", badge: "12" },
      { path: "/projects/completed", icon: BarChart3, label: "المشاريع المكتملة" },
      { path: "/projects/planning", icon: Settings, label: "قيد التخطيط", badge: "3" }
    ]
  },
  { 
    path: "/financial", 
    icon: Calculator, 
    label: "الإدارة المالية",
    description: "إدارة الحسابات والمعاملات المالية",
    children: [
      { path: "/financial", icon: Calculator, label: "نظرة عامة" },
      { path: "/financial/transactions", icon: FileText, label: "المعاملات المالية" },
      { path: "/financial/budgets", icon: BarChart3, label: "الميزانيات" },
      { path: "/financial/reports", icon: ChartLine, label: "التقارير المالية" }
    ]
  },
  { 
    path: "/employees", 
    icon: Users, 
    label: "إدارة الموظفين",
    description: "إدارة فريق العمل والموارد البشرية",
    children: [
      { path: "/employees", icon: Users, label: "جميع الموظفين" },
      { path: "/employees/departments", icon: Building, label: "الأقسام" },
      { path: "/employees/attendance", icon: Clock, label: "الحضور والانصراف" },
      { path: "/employees/payroll", icon: Calculator, label: "كشوف المرتبات" }
    ]
  },
  { 
    path: "/warehouse", 
    icon: Warehouse, 
    label: "إدارة المخازن",
    description: "إدارة المخزون والمواد",
    children: [
      { path: "/warehouse", icon: Warehouse, label: "نظرة عامة" },
      { path: "/warehouse/inventory", icon: FileText, label: "المخزون" },
      { path: "/warehouse/suppliers", icon: Users, label: "الموردين" },
      { path: "/warehouse/orders", icon: FolderOpen, label: "طلبات الشراء" }
    ]
  },
  { 
    path: "/equipment", 
    icon: Cog, 
    label: "إدارة المعدات",
    description: "تتبع المعدات والصيانة"
  },
  { 
    path: "/documents", 
    icon: FileText, 
    label: "إدارة الوثائق",
    description: "تنظيم ومشاركة المستندات"
  },
  { 
    path: "/reports", 
    icon: BarChart3, 
    label: "التقارير والتحليلات",
    description: "تقارير شاملة وتحليلات بيانات"
  }
];

interface AdvancedNavProps {
  className?: string;
  onNavigate?: (path: string) => void;
}

export function AdvancedNavigation({ className, onNavigate }: AdvancedNavProps) {
  const [location] = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>(["/dashboard", "/projects"]);

  // Auto-expand parent items based on current location
  useEffect(() => {
    const currentParent = navigationItems.find(item => 
      item.children?.some(child => child.path === location) || item.path === location
    );
    if (currentParent && currentParent.children && !expandedItems.includes(currentParent.path)) {
      setExpandedItems(prev => [...prev, currentParent.path]);
    }
  }, [location]);

  const toggleExpanded = (path: string) => {
    setExpandedItems(prev => 
      prev.includes(path) 
        ? prev.filter(p => p !== path)
        : [...prev, path]
    );
  };

  const toggleFavorite = (path: string) => {
    setFavorites(prev =>
      prev.includes(path)
        ? prev.filter(p => p !== path)
        : [...prev, path]
    );
  };

  const isActive = (path: string) => {
    return location === path || (location === "/" && path === "/dashboard");
  };

  const isParentActive = (item: NavItem) => {
    return item.children?.some(child => isActive(child.path)) || isActive(item.path);
  };

  const filteredItems = navigationItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.children?.some(child => 
      child.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleNavigation = (path: string) => {
    onNavigate?.(path);
  };

  return (
    <nav className={cn("advanced-navigation space-y-2", className)}>
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="البحث في القوائم..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10 glass-input text-right"
        />
      </div>

      {/* Favorites */}
      {favorites.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 mb-3 flex items-center">
            <Bookmark className="h-3 w-3 ml-2" />
            المفضلة
          </h3>
          <div className="space-y-1">
            {favorites.map(favPath => {
              const item = navigationItems.find(nav => nav.path === favPath);
              if (!item) return null;
              const Icon = item.icon;
              
              return (
                <Link key={favPath} href={favPath}>
                  <div 
                    className={cn(
                      "flex items-center space-x-reverse space-x-3 p-2 rounded-lg hover-glass transition-all duration-200 cursor-pointer group",
                      isActive(favPath) && "bg-white bg-opacity-20"
                    )}
                    onClick={() => handleNavigation(favPath)}
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="text-sm text-charcoal-text font-medium">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <div className="space-y-1">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedItems.includes(item.path);
          const isItemActive = isParentActive(item);

          if (hasChildren) {
            return (
              <Collapsible key={item.path} open={isExpanded} onOpenChange={() => toggleExpanded(item.path)}>
                <CollapsibleTrigger asChild>
                  <div className={cn(
                    "flex items-center justify-between w-full p-3 rounded-lg hover-glass transition-all duration-200 cursor-pointer group",
                    isItemActive && "bg-white bg-opacity-20"
                  )}>
                    <div className="flex items-center space-x-reverse space-x-3">
                      <Icon className="h-5 w-5 text-primary" />
                      <div className="text-right">
                        <span className="text-charcoal-text font-medium">{item.label}</span>
                        {item.description && (
                          <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-reverse space-x-2">
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(item.path);
                        }}
                      >
                        <Bookmark className={cn(
                          "h-3 w-3",
                          favorites.includes(item.path) ? "fill-current text-yellow-500" : "text-gray-400"
                        )} />
                      </Button>
                      <ChevronDown className={cn(
                        "h-4 w-4 text-gray-400 transition-transform duration-200",
                        isExpanded && "transform rotate-180"
                      )} />
                    </div>
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="ml-8 mt-2 space-y-1">
                  {item.children?.map((child) => {
                    const ChildIcon = child.icon;
                    const isChildActive = isActive(child.path);
                    
                    return (
                      <Link key={child.path} href={child.path}>
                        <div 
                          className={cn(
                            "flex items-center justify-between p-2 rounded-lg hover-glass transition-all duration-200 cursor-pointer group",
                            isChildActive && "bg-white bg-opacity-15"
                          )}
                          onClick={() => handleNavigation(child.path)}
                        >
                          <div className="flex items-center space-x-reverse space-x-3">
                            <ChildIcon className="h-4 w-4 text-accent" />
                            <span className="text-sm text-charcoal-text">{child.label}</span>
                          </div>
                          <div className="flex items-center space-x-reverse space-x-2">
                            {child.badge && (
                              <Badge variant="outline" className="text-xs">
                                {child.badge}
                              </Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(child.path);
                              }}
                            >
                              <Bookmark className={cn(
                                "h-3 w-3",
                                favorites.includes(child.path) ? "fill-current text-yellow-500" : "text-gray-400"
                              )} />
                            </Button>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            );
          }

          // Simple navigation item
          return (
            <Link key={item.path} href={item.path}>
              <div 
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg hover-glass transition-all duration-200 cursor-pointer group",
                  isActive(item.path) && "bg-white bg-opacity-20"
                )}
                onClick={() => handleNavigation(item.path)}
              >
                <div className="flex items-center space-x-reverse space-x-3">
                  <Icon className="h-5 w-5 text-primary" />
                  <div className="text-right">
                    <span className="text-charcoal-text font-medium">{item.label}</span>
                    {item.description && (
                      <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(item.path);
                  }}
                >
                  <Bookmark className={cn(
                    "h-3 w-3",
                    favorites.includes(item.path) ? "fill-current text-yellow-500" : "text-gray-400"
                  )} />
                </Button>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions Footer */}
      <div className="pt-6 mt-6 border-t border-white border-opacity-20">
        <div className="flex justify-center space-x-reverse space-x-2">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-primary">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-primary">
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}