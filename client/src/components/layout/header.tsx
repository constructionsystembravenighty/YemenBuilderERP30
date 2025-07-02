import { Bell, Building, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export default function Header({ onMobileMenuToggle }: HeaderProps) {
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
        
        {/* User Menu */}
        <div className="flex items-center space-x-reverse space-x-4">
          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-secondary"
            >
              <Bell className="h-5 w-5" />
            </Button>
            <div className="notification-dot absolute -top-1 -right-1 w-3 h-3 rounded-full"></div>
          </div>
          
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
    </nav>
  );
}
