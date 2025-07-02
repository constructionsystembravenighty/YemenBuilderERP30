import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Calculator,
  ChartLine,
  Cog,
  FileText,
  FolderOpen,
  Plus,
  TrendingUp,
  Users,
  Warehouse,
  UserPlus,
  File
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassmorphicCard } from "@/components/glassmorphic-card";

const menuItems = [
  { path: "/dashboard", icon: ChartLine, label: "لوحة التحكم", labelEn: "Dashboard" },
  { path: "/projects", icon: FolderOpen, label: "إدارة المشاريع", labelEn: "Projects" },
  { path: "/financial", icon: Calculator, label: "الإدارة المالية", labelEn: "Financial" },
  { path: "/employees", icon: Users, label: "إدارة الموظفين", labelEn: "Employees" },
  { path: "/warehouse", icon: Warehouse, label: "إدارة المخازن", labelEn: "Warehouse" },
  { path: "/equipment", icon: Cog, label: "إدارة المعدات", labelEn: "Equipment" },
  { path: "/documents", icon: FileText, label: "إدارة الوثائق", labelEn: "Documents" },
  { path: "/reports", icon: BarChart3, label: "التقارير والتحليلات", labelEn: "Reports" },
];

const quickActions = [
  { icon: Plus, label: "مشروع جديد", labelEn: "New Project", action: "project" },
  { icon: UserPlus, label: "إضافة موظف", labelEn: "Add Employee", action: "employee" },
  { icon: File, label: "إنشاء فاتورة", labelEn: "Create Invoice", action: "invoice" },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="glass-sidebar w-80 min-h-screen fixed right-0 top-20 z-30 hidden lg:block">
      <div className="p-6">
        {/* Navigation Menu */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path || (location === "/" && item.path === "/dashboard");
            
            return (
              <Link key={item.path} href={item.path}>
                <a className={cn(
                  "flex items-center space-x-reverse space-x-3 p-3 rounded-lg hover-glass transition-all duration-200",
                  isActive && "bg-white bg-opacity-20"
                )}>
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="text-charcoal-text font-medium">{item.label}</span>
                </a>
              </Link>
            );
          })}
        </nav>
        
        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-charcoal-text mb-4">الإجراءات السريعة</h3>
          <div className="space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.action}
                  variant="ghost"
                  className="w-full flex items-center justify-start space-x-reverse space-x-3 p-3 glass-card hover-glass transition-all duration-200"
                >
                  <Icon className="h-4 w-4 text-accent" />
                  <span className="text-charcoal-text text-sm">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
        
        {/* Exchange Rate */}
        <div className="mt-8">
          <GlassmorphicCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-charcoal-text">سعر الصرف الحالي</p>
                <p className="text-xs text-gray-500">ريال يمني / دولار أمريكي</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary">250.75</p>
                <div className="flex items-center">
                  <TrendingUp className="h-3 w-3 text-green-600 ml-1" />
                  <p className="text-xs text-green-600">+2.5%</p>
                </div>
              </div>
            </div>
          </GlassmorphicCard>
        </div>
      </div>
    </aside>
  );
}
