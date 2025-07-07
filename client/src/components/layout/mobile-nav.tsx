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
import { AdvancedNavigation } from "@/components/navigation/advanced-nav";
import { Breadcrumb } from "@/components/navigation/breadcrumb";

// Remove unused menuItems since we're using AdvancedNavigation now

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
          
          {/* Breadcrumb Navigation */}
          <div className="mb-6">
            <Breadcrumb className="text-sm" />
          </div>
          
          {/* Advanced Navigation Menu */}
          <AdvancedNavigation onNavigate={() => onClose()} />
        </div>
      </nav>
    </>
  );
}
