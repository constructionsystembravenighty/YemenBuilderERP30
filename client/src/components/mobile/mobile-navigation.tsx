import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Home,
  FolderOpen,
  Calculator,
  Users,
  Warehouse,
  Cog,
  FileText,
  BarChart3,
  TrendingUp,
  Workflow,
  Shield,
  Menu,
  X,
  Search,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

const navigationItems = [
  {
    href: "/",
    icon: Home,
    label: "الرئيسية",
    labelEn: "Dashboard",
    badge: null
  },
  {
    href: "/projects",
    icon: FolderOpen,
    label: "المشاريع",
    labelEn: "Projects",
    badge: "12"
  },
  {
    href: "/financial",
    icon: Calculator,
    label: "المالية",
    labelEn: "Financial",
    badge: null
  },
  {
    href: "/employees",
    icon: Users,
    label: "الموظفين",
    labelEn: "Employees",
    badge: "25"
  },
  {
    href: "/warehouse",
    icon: Warehouse,
    label: "المخازن",
    labelEn: "Warehouse",
    badge: null
  },
  {
    href: "/equipment",
    icon: Cog,
    label: "المعدات",
    labelEn: "Equipment",
    badge: "3"
  },
  {
    href: "/documents",
    icon: FileText,
    label: "الوثائق",
    labelEn: "Documents",
    badge: null
  },
  {
    href: "/reports",
    icon: BarChart3,
    label: "التقارير",
    labelEn: "Reports",
    badge: null
  },
  {
    href: "/analytics",
    icon: TrendingUp,
    label: "التحليلات",
    labelEn: "Analytics",
    badge: "New"
  },
  {
    href: "/workflows",
    icon: Workflow,
    label: "سير العمل",
    labelEn: "Workflows",
    badge: null
  },
  {
    href: "/audit",
    icon: Shield,
    label: "المراجعة",
    labelEn: "Audit",
    badge: null
  }
];

export default function MobileNavigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/20">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3 space-x-reverse">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <MobileNavigationContent onClose={() => setIsOpen(false)} />
              </SheetContent>
            </Sheet>
            
            <div>
              <h1 className="font-bold text-lg text-primary">منصة البناء</h1>
              <p className="text-xs text-gray-600">إدارة المشاريع الإنشائية</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            <Button variant="ghost" size="sm" className="p-2">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2 relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 text-xs p-0 flex items-center justify-center bg-red-500">
                3
              </Badge>
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation for Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-white/20">
        <div className="grid grid-cols-4 gap-1 p-2">
          {navigationItems.slice(0, 4).map((item) => (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex flex-col items-center p-3 rounded-lg transition-all duration-200",
                  isActive(item.href)
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <div className="relative">
                  <item.icon className="h-5 w-5 mb-1" />
                  {item.badge && (
                    <Badge className="absolute -top-2 -right-2 h-4 w-4 text-xs p-0 flex items-center justify-center">
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

function MobileNavigationContent({ onClose }: { onClose: () => void }) {
  const [location] = useLocation();

  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-white to-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 className="font-bold text-xl text-primary">القائمة الرئيسية</h2>
          <p className="text-sm text-gray-600">جميع أقسام المنصة</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={onClose}>
              <div
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl transition-all duration-200",
                  isActive(item.href)
                    ? "bg-primary/10 border border-primary/20 text-primary"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className={cn(
                    "p-2 rounded-lg",
                    isActive(item.href) ? "bg-primary/20" : "bg-gray-100"
                  )}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.labelEn}</p>
                  </div>
                </div>
                {item.badge && (
                  <Badge variant={isActive(item.href) ? "default" : "secondary"}>
                    {item.badge}
                  </Badge>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200">
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-xl">
          <p className="text-sm font-medium text-primary mb-1">نصيحة اليوم</p>
          <p className="text-xs text-gray-600">
            استخدم التحليلات المتقدمة لمراقبة أداء مشاريعك بشكل أفضل
          </p>
        </div>
      </div>
    </div>
  );
}