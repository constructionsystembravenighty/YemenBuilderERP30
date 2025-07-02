import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  Settings, 
  User, 
  Search,
  Menu,
  X,
  Home,
  Building,
  Users,
  FileText,
  BarChart3,
  Wrench,
  HelpCircle,
  LogOut,
  Plus,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { formatArabicDate } from '@/lib/arabic-utils';
import { formatCurrency } from '@/lib/currency';

export interface DashboardWidget {
  id: string;
  title: string;
  titleAr: string;
  type: 'metric' | 'chart' | 'list' | 'progress' | 'table';
  size: 'small' | 'medium' | 'large' | 'full';
  data: any;
  refreshable?: boolean;
  exportable?: boolean;
  configurable?: boolean;
}

export interface Notification {
  id: string;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  actionTextAr?: string;
}

export interface QuickAction {
  id: string;
  label: string;
  labelAr: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: string;
  disabled?: boolean;
}

export interface DashboardLayoutProps {
  widgets: DashboardWidget[];
  notifications: Notification[];
  quickActions: QuickAction[];
  user: {
    name: string;
    nameAr?: string;
    role: string;
    roleAr?: string;
    avatar?: string;
  };
  onWidgetRefresh?: (widgetId: string) => void;
  onWidgetExport?: (widgetId: string, format: 'pdf' | 'excel' | 'csv') => void;
  onWidgetConfig?: (widgetId: string) => void;
  onNotificationRead?: (notificationId: string) => void;
  onNotificationAction?: (notificationId: string) => void;
  children?: React.ReactNode;
  className?: string;
}

// Widget renderer component
function WidgetRenderer({ widget, onRefresh, onExport, onConfig }: {
  widget: DashboardWidget;
  onRefresh?: (id: string) => void;
  onExport?: (id: string, format: 'pdf' | 'excel' | 'csv') => void;
  onConfig?: (id: string) => void;
}) {
  const getSizeClasses = () => {
    switch (widget.size) {
      case 'small': return 'col-span-1';
      case 'medium': return 'col-span-1 md:col-span-2';
      case 'large': return 'col-span-1 md:col-span-2 lg:col-span-3';
      case 'full': return 'col-span-full';
      default: return 'col-span-1';
    }
  };

  const renderWidgetContent = () => {
    switch (widget.type) {
      case 'metric':
        return (
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              {typeof widget.data.value === 'number' 
                ? formatCurrency(widget.data.value) 
                : widget.data.value}
            </div>
            {widget.data.change && (
              <div className={`text-sm flex items-center justify-center gap-1 ${
                widget.data.change > 0 ? 'text-green-600' : 
                widget.data.change < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                <span>{widget.data.change > 0 ? '↗' : widget.data.change < 0 ? '↘' : '→'}</span>
                <span>{Math.abs(widget.data.change)}%</span>
              </div>
            )}
            {widget.data.description && (
              <p className="text-sm text-gray-600 mt-2">{widget.data.description}</p>
            )}
          </div>
        );

      case 'progress':
        return (
          <div className="space-y-4">
            {widget.data.items?.map((item: any, index: number) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-right">{item.nameAr || item.name}</span>
                  <span className="text-sm text-gray-600">{item.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        );

      case 'list':
        return (
          <div className="space-y-3">
            {widget.data.items?.slice(0, 5).map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div className="text-right">
                  <div className="font-medium text-sm">{item.titleAr || item.title}</div>
                  {item.subtitle && (
                    <div className="text-xs text-gray-600">{item.subtitleAr || item.subtitle}</div>
                  )}
                </div>
                {item.value && (
                  <Badge variant="outline">{item.value}</Badge>
                )}
              </div>
            ))}
          </div>
        );

      case 'table':
        return (
          <div className="overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {widget.data.headers?.map((header: any, index: number) => (
                    <th key={index} className="text-right p-2 font-medium">
                      {header.labelAr || header.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {widget.data.rows?.slice(0, 5).map((row: any, index: number) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    {row.cells?.map((cell: any, cellIndex: number) => (
                      <td key={cellIndex} className="text-right p-2">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-32 text-gray-500">
            {widget.titleAr || widget.title}
          </div>
        );
    }
  };

  return (
    <Card className={`${getSizeClasses()} hover:shadow-md transition-shadow`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-right">
            {widget.titleAr || widget.title}
          </CardTitle>
          <div className="flex items-center gap-1">
            {widget.refreshable && onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRefresh(widget.id)}
                className="h-6 w-6 p-0"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}
            {widget.exportable && onExport && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onExport(widget.id, 'excel')}
                className="h-6 w-6 p-0"
              >
                <Download className="h-3 w-3" />
              </Button>
            )}
            {widget.configurable && onConfig && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onConfig(widget.id)}
                className="h-6 w-6 p-0"
              >
                <Settings className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {renderWidgetContent()}
      </CardContent>
    </Card>
  );
}

// Notification panel component
function NotificationPanel({ 
  notifications, 
  onRead, 
  onAction 
}: {
  notifications: Notification[];
  onRead?: (id: string) => void;
  onAction?: (id: string) => void;
}) {
  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      default: return 'ℹ️';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'error': return 'border-l-red-500 bg-red-50';
      case 'warning': return 'border-l-yellow-500 bg-yellow-50';
      case 'success': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-blue-500 bg-blue-50';
    }
  };

  return (
    <div className="w-80 h-96 flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-right">الإشعارات</h3>
        {unreadCount > 0 && (
          <Badge variant="destructive">{unreadCount}</Badge>
        )}
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">لا توجد إشعارات</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border-l-4 cursor-pointer hover:shadow-sm transition-shadow ${
                  getNotificationColor(notification.type)
                } ${notification.read ? 'opacity-60' : ''}`}
                onClick={() => onRead?.(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                  <div className="flex-1 text-right">
                    <h4 className="font-medium text-sm mb-1">
                      {notification.titleAr || notification.title}
                    </h4>
                    <p className="text-xs text-gray-600 mb-2">
                      {notification.messageAr || notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {formatArabicDate(notification.timestamp, 'relative')}
                      </span>
                      {notification.actionText && (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAction?.(notification.id);
                          }}
                          className="h-auto p-0 text-xs"
                        >
                          {notification.actionTextAr || notification.actionText}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export function DashboardLayout({
  widgets,
  notifications,
  quickActions,
  user,
  onWidgetRefresh,
  onWidgetExport,
  onWidgetConfig,
  onNotificationRead,
  onNotificationAction,
  children,
  className = ''
}: DashboardLayoutProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className={`dashboard-layout min-h-screen bg-gray-50 ${className}`}>
      {/* Top Header */}
      <header className="bg-white border-b px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMobileMenu(true)}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Logo and title */}
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-primary rounded flex items-center justify-center">
                <Building className="h-5 w-5 text-white" />
              </div>
              <h1 className="font-bold text-xl text-gray-900 hidden sm:block">
                نظام إدارة المقاولات
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Actions */}
            <div className="hidden lg:flex items-center gap-2">
              {quickActions.slice(0, 3).map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className="gap-2"
                  style={{ borderColor: action.color, color: action.color }}
                >
                  {action.icon}
                  {action.labelAr || action.label}
                </Button>
              ))}
            </div>

            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="البحث..."
                className="pl-4 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary w-64"
              />
            </div>

            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                    {unreadNotifications}
                  </Badge>
                )}
              </Button>
              
              {showNotifications && (
                <div className="absolute top-full right-0 mt-2 bg-white border rounded-lg shadow-lg z-50">
                  <NotificationPanel
                    notifications={notifications}
                    onRead={onNotificationRead}
                    onAction={onNotificationAction}
                  />
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="font-medium text-sm">{user.nameAr || user.name}</div>
                <div className="text-xs text-gray-600">{user.roleAr || user.role}</div>
              </div>
              <div className="h-8 w-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-medium">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Quick Actions Bar - Mobile */}
        <div className="lg:hidden mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                onClick={action.onClick}
                disabled={action.disabled}
                className="gap-2 whitespace-nowrap flex-shrink-0"
                style={{ borderColor: action.color, color: action.color }}
              >
                {action.icon}
                {action.labelAr || action.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Widgets Grid */}
        {widgets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {widgets.map((widget) => (
              <WidgetRenderer
                key={widget.id}
                widget={widget}
                onRefresh={onWidgetRefresh}
                onExport={onWidgetExport}
                onConfig={onWidgetConfig}
              />
            ))}
          </div>
        )}

        {/* Custom Content */}
        {children}
      </main>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileMenu(false)} />
          <div className="absolute top-0 right-0 h-full w-80 bg-white shadow-xl">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold">القائمة الرئيسية</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileMenu(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <ScrollArea className="h-full pb-20">
              <div className="p-4 space-y-4">
                {/* Navigation items would go here */}
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start gap-3">
                    <Home className="h-4 w-4" />
                    الرئيسية
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-3">
                    <Building className="h-4 w-4" />
                    المشاريع
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-3">
                    <Users className="h-4 w-4" />
                    الموظفين
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-3">
                    <FileText className="h-4 w-4" />
                    المالية
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-3">
                    <BarChart3 className="h-4 w-4" />
                    التقارير
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-3">
                    <Wrench className="h-4 w-4" />
                    المعدات
                  </Button>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start gap-3">
                    <HelpCircle className="h-4 w-4" />
                    المساعدة
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-3">
                    <Settings className="h-4 w-4" />
                    الإعدادات
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-3 text-red-600">
                    <LogOut className="h-4 w-4" />
                    تسجيل الخروج
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      )}

      {/* Click outside to close notifications */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
}