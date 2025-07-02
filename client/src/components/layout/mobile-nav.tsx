import { Link } from "wouter";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Calculator,
  ChartLine,
  Cog,
  FileText,
  FolderOpen,
  Users,
  Warehouse,
} from "lucide-react";

const menuItems = [
  { path: "/dashboard", icon: ChartLine, label: "لوحة التحكم" },
  { path: "/projects", icon: FolderOpen, label: "إدارة المشاريع" },
  { path: "/financial", icon: Calculator, label: "الإدارة المالية" },
  { path: "/employees", icon: Users, label: "إدارة الموظفين" },
  { path: "/warehouse", icon: Warehouse, label: "إدارة المخازن" },
  { path: "/equipment", icon: Cog, label: "إدارة المعدات" },
  { path: "/documents", icon: FileText, label: "إدارة الوثائق" },
  { path: "/reports", icon: BarChart3, label: "التقارير والتحليلات" },
];

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="mobile-nav-overlay fixed inset-0 z-40 lg:hidden" 
        onClick={onClose}
      />
      
      {/* Mobile Menu */}
      <nav className={`mobile-menu glass-sidebar fixed top-0 right-0 h-full w-80 z-50 lg:hidden ${isOpen ? 'active' : ''}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-primary">القائمة الرئيسية</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-500 hover:text-primary"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Mobile Menu Items */}
          <div className="space-y-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} href={item.path}>
                  <div 
                    className="flex items-center space-x-reverse space-x-3 p-3 rounded-lg hover-glass transition-all duration-200 cursor-pointer"
                    onClick={onClose}
                  >
                    <Icon className="h-5 w-5 text-primary" />
                    <span className="text-charcoal-text font-medium">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
