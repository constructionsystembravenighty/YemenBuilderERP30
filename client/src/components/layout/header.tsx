import { Bell, Building, Menu, User, Search, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { HelpSystem } from "@/components/help/help-system";
import { Input } from "@/components/ui/input";
import { QuickActions } from "@/components/navigation/quick-actions";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { AdvancedSearch } from "@/components/search/advanced-search";
import { PerformanceMonitor } from "@/components/performance/performance-monitor";
import { NetworkStatus } from "@/components/network-status";
import { useState } from "react";

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export default function Header({ onMobileMenuToggle }: HeaderProps) {
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  return (
    <nav className="glass-nav fixed top-0 right-0 left-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Mobile Menu Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-white hover:text-secondary"
          onClick={onMobileMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        {/* Company/Branch Selector */}
        <div className="branch-selector rounded-lg px-4 py-2 hidden lg:block">
          <Select defaultValue="main">
            <SelectTrigger className="bg-transparent text-white border-none outline-none text-sm font-medium min-w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="main">شركة المقاولات العامة - الفرع الرئيسي</SelectItem>
              <SelectItem value="aden">شركة المقاولات العامة - فرع عدن</SelectItem>
              <SelectItem value="taiz">شركة المقاولات العامة - فرع تعز</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Logo and Title */}
        <div className="flex items-center space-x-reverse space-x-4">
          <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
            <Building className="text-white h-5 w-5" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">منصة إدارة البناء</h1>
            <p className="text-gray-200 text-xs">نظام إدارة شركات المقاولات</p>
          </div>
        </div>
        
        {/* Search and Actions */}
        <div className="flex items-center space-x-reverse space-x-4">
          {/* Global Search */}
          <div className="relative hidden md:block">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="البحث..."
              className="w-64 pr-10 bg-white bg-opacity-20 border-white border-opacity-30 text-white placeholder-gray-300"
              onFocus={() => setShowAdvancedSearch(true)}
            />
          </div>
          
          {/* Performance Monitor Button */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-secondary"
              onClick={() => setShowPerformanceMonitor(!showPerformanceMonitor)}
            >
              <Activity className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Network Status */}
          <NetworkStatus />
          
          {/* Quick Actions */}
          <div className="hidden lg:block">
            <QuickActions />
          </div>
          
          {/* Notifications */}
          <NotificationCenter />
          
          {/* User Profile */}
          <div className="flex items-center space-x-reverse space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-accent text-white">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <p className="text-white text-sm font-medium">أحمد محمد السالم</p>
              <p className="text-gray-200 text-xs">مدير المشاريع</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Help System */}
      <HelpSystem />
      
      {/* Advanced Search Modal */}
      <AdvancedSearch 
        isOpen={showAdvancedSearch}
        onClose={() => setShowAdvancedSearch(false)}
        onResults={setSearchResults}
      />
      
      {/* Performance Monitor */}
      {showPerformanceMonitor && (
        <div className="fixed bottom-4 right-4 w-96 z-50">
          <PerformanceMonitor />
        </div>
      )}
    </nav>
  );
}
