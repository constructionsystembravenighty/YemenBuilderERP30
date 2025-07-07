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
import { AdvancedNavigation } from "@/components/navigation/advanced-nav";
import { Breadcrumb } from "@/components/navigation/breadcrumb";

// Remove unused menuItems and quickActions since we're using AdvancedNavigation now

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="glass-sidebar w-80 min-h-screen fixed right-0 top-20 z-30 hidden lg:block">
      <div className="p-6">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Breadcrumb className="text-sm" />
        </div>
        
        {/* Advanced Navigation Menu */}
        <AdvancedNavigation />
        
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
