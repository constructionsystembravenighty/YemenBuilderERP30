import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  X, 
  Check, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  XCircle,
  Clock,
  User,
  Building,
  FileText,
  Calendar,
  ArrowRight,
  Eye,
  Settings,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import { formatArabicDate } from '@/lib/arabic-utils';
import { formatCurrency } from '@/lib/currency';

export interface SmartNotification {
  id: string;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'urgent';
  category: 'project' | 'employee' | 'financial' | 'equipment' | 'system' | 'task';
  categoryAr: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actions?: NotificationAction[];
  metadata?: {
    projectId?: string;
    employeeId?: string;
    amount?: number;
    dueDate?: Date;
    assignee?: string;
    location?: string;
    url?: string;
  };
  expiresAt?: Date;
  requiresAcknowledgment?: boolean;
  autoRead?: boolean;
}

export interface NotificationAction {
  id: string;
  label: string;
  labelAr: string;
  variant?: 'default' | 'outline' | 'destructive' | 'secondary';
  icon?: React.ReactNode;
  onClick: () => void;
}

export interface SmartNotificationsProps {
  notifications: SmartNotification[];
  onNotificationRead?: (notificationId: string) => void;
  onNotificationDismiss?: (notificationId: string) => void;
  onBulkAction?: (notificationIds: string[], action: 'read' | 'dismiss') => void;
  maxVisible?: number;
  autoReadDelay?: number; // seconds
  showFilters?: boolean;
  groupByCategory?: boolean;
  className?: string;
}

const getTypeIcon = (type: SmartNotification['type']) => {
  switch (type) {
    case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
    case 'urgent': return <AlertTriangle className="h-4 w-4 text-red-600 animate-pulse" />;
    default: return <Info className="h-4 w-4 text-blue-600" />;
  }
};

const getTypeColor = (type: SmartNotification['type']) => {
  switch (type) {
    case 'success': return 'border-l-green-500 bg-green-50';
    case 'warning': return 'border-l-yellow-500 bg-yellow-50';
    case 'error': return 'border-l-red-500 bg-red-50';
    case 'urgent': return 'border-l-red-500 bg-red-100 animate-pulse';
    default: return 'border-l-blue-500 bg-blue-50';
  }
};

const getCategoryIcon = (category: SmartNotification['category']) => {
  switch (category) {
    case 'project': return <Building className="h-3 w-3" />;
    case 'employee': return <User className="h-3 w-3" />;
    case 'financial': return <Clock className="h-3 w-3" />;
    case 'equipment': return <Settings className="h-3 w-3" />;
    case 'task': return <FileText className="h-3 w-3" />;
    default: return <Info className="h-3 w-3" />;
  }
};

const getPriorityColor = (priority: SmartNotification['priority']) => {
  switch (priority) {
    case 'urgent': return 'bg-red-500';
    case 'high': return 'bg-orange-500';
    case 'medium': return 'bg-yellow-500';
    case 'low': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

export function SmartNotifications({
  notifications,
  onNotificationRead,
  onNotificationDismiss,
  onBulkAction,
  maxVisible = 50,
  autoReadDelay = 5,
  showFilters = true,
  groupByCategory = false,
  className = ""
}: SmartNotificationsProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [expandedNotifications, setExpandedNotifications] = useState<Set<string>>(new Set());

  const autoReadTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Auto-read notifications after delay
  useEffect(() => {
    notifications.forEach(notification => {
      if (!notification.read && notification.autoRead && !autoReadTimers.current.has(notification.id)) {
        const timer = setTimeout(() => {
          onNotificationRead?.(notification.id);
          autoReadTimers.current.delete(notification.id);
        }, autoReadDelay * 1000);
        
        autoReadTimers.current.set(notification.id, timer);
      }
    });

    return () => {
      autoReadTimers.current.forEach(timer => clearTimeout(timer));
      autoReadTimers.current.clear();
    };
  }, [notifications, autoReadDelay, onNotificationRead]);

  // Filter notifications
  const filteredNotifications = React.useMemo(() => {
    return notifications
      .filter(notification => {
        const matchesType = filterType === 'all' || notification.type === filterType;
        const matchesCategory = filterCategory === 'all' || notification.category === filterCategory;
        const matchesReadState = !showOnlyUnread || !notification.read;
        
        return matchesType && matchesCategory && matchesReadState;
      })
      .slice(0, maxVisible);
  }, [notifications, filterType, filterCategory, showOnlyUnread, maxVisible]);

  // Group notifications by category
  const groupedNotifications = React.useMemo(() => {
    if (!groupByCategory) return { all: filteredNotifications };
    
    const groups: { [key: string]: SmartNotification[] } = {};
    filteredNotifications.forEach(notification => {
      const category = notification.categoryAr || notification.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(notification);
    });
    
    return groups;
  }, [filteredNotifications, groupByCategory]);

  const handleNotificationClick = (notification: SmartNotification) => {
    if (!notification.read) {
      onNotificationRead?.(notification.id);
    }
    
    if (notification.metadata?.url) {
      window.location.href = notification.metadata.url;
    }
  };

  const handleSelectNotification = (notificationId: string, selected: boolean) => {
    const newSelected = new Set(selectedIds);
    if (selected) {
      newSelected.add(notificationId);
    } else {
      newSelected.delete(notificationId);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkRead = () => {
    const unreadSelected = Array.from(selectedIds).filter(id => 
      notifications.find(n => n.id === id && !n.read)
    );
    if (unreadSelected.length > 0) {
      onBulkAction?.(unreadSelected, 'read');
      setSelectedIds(new Set());
    }
  };

  const handleBulkDismiss = () => {
    if (selectedIds.size > 0) {
      onBulkAction?.(Array.from(selectedIds), 'dismiss');
      setSelectedIds(new Set());
    }
  };

  const toggleExpanded = (notificationId: string) => {
    const newExpanded = new Set(expandedNotifications);
    if (newExpanded.has(notificationId)) {
      newExpanded.delete(notificationId);
    } else {
      newExpanded.add(notificationId);
    }
    setExpandedNotifications(newExpanded);
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const urgentCount = notifications.filter(n => n.priority === 'urgent' && !n.read).length;

  const renderNotification = (notification: SmartNotification) => {
    const isSelected = selectedIds.has(notification.id);
    const isExpanded = expandedNotifications.has(notification.id);
    const isOverdue = notification.metadata?.dueDate && 
      new Date(notification.metadata.dueDate) < new Date();

    return (
      <Card
        key={notification.id}
        className={`mb-3 transition-all duration-200 hover:shadow-md cursor-pointer ${
          notification.read ? 'opacity-70' : ''
        } ${isSelected ? 'ring-2 ring-primary' : ''}`}
      >
        <CardContent className="p-4">
          <div className={`border-l-4 pl-4 ${getTypeColor(notification.type)}`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getTypeIcon(notification.type)}
                <div className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`} />
                <Badge variant="outline" className="text-xs">
                  {getCategoryIcon(notification.category)}
                  {notification.categoryAr}
                </Badge>
                {isOverdue && (
                  <Badge variant="destructive" className="text-xs">
                    متأخر
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {formatArabicDate(notification.timestamp, 'relative')}
                </span>
                
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => handleSelectNotification(notification.id, e.target.checked)}
                  className="w-4 h-4"
                  onClick={(e) => e.stopPropagation()}
                />
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNotificationDismiss?.(notification.id);
                  }}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div onClick={() => handleNotificationClick(notification)}>
              <h3 className="font-medium text-gray-900 text-right mb-1">
                {notification.titleAr || notification.title}
              </h3>
              
              <p className={`text-sm text-gray-600 text-right ${
                isExpanded ? '' : 'line-clamp-2'
              }`}>
                {notification.messageAr || notification.message}
              </p>
              
              {notification.message.length > 100 && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpanded(notification.id);
                  }}
                  className="h-auto p-0 text-xs mt-1"
                >
                  {isExpanded ? 'عرض أقل' : 'عرض المزيد'}
                </Button>
              )}
            </div>

            {/* Metadata */}
            {notification.metadata && (
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                {notification.metadata.amount && (
                  <span>{formatCurrency(notification.metadata.amount)}</span>
                )}
                {notification.metadata.dueDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatArabicDate(notification.metadata.dueDate, 'short')}</span>
                  </div>
                )}
                {notification.metadata.assignee && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{notification.metadata.assignee}</span>
                  </div>
                )}
                {notification.metadata.location && (
                  <span>{notification.metadata.location}</span>
                )}
              </div>
            )}

            {/* Actions */}
            {notification.actions && notification.actions.length > 0 && (
              <div className="flex items-center gap-2 mt-3">
                {notification.actions.map(action => (
                  <Button
                    key={action.id}
                    variant={action.variant || 'outline'}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      action.onClick();
                    }}
                    className="gap-2"
                  >
                    {action.icon}
                    {action.labelAr || action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`smart-notifications ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="h-6 w-6 text-gray-700" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">الإشعارات</h2>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{unreadCount} غير مقروء</span>
              {urgentCount > 0 && (
                <span className="text-red-600 font-medium">{urgentCount} عاجل</span>
              )}
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {selectedIds.size} محدد
            </Badge>
            <Button variant="outline" size="sm" onClick={handleBulkRead}>
              تعليم كمقروء
            </Button>
            <Button variant="outline" size="sm" onClick={handleBulkDismiss}>
              حذف المحدد
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
          <Filter className="h-4 w-4 text-gray-500" />
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="all">جميع الأنواع</option>
            <option value="urgent">عاجل</option>
            <option value="warning">تحذير</option>
            <option value="info">معلومات</option>
            <option value="success">نجح</option>
            <option value="error">خطأ</option>
          </select>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="all">جميع الفئات</option>
            <option value="project">المشاريع</option>
            <option value="employee">الموظفين</option>
            <option value="financial">المالية</option>
            <option value="equipment">المعدات</option>
            <option value="task">المهام</option>
            <option value="system">النظام</option>
          </select>
          
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showOnlyUnread}
              onChange={(e) => setShowOnlyUnread(e.target.checked)}
              className="w-4 h-4"
            />
            غير مقروء فقط
          </label>
        </div>
      )}

      {/* Notifications */}
      <ScrollArea className="h-[600px]">
        {Object.keys(groupedNotifications).length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">لا توجد إشعارات</h3>
            <p className="text-sm">ستظهر الإشعارات الجديدة هنا</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedNotifications).map(([category, categoryNotifications]) => (
              <div key={category}>
                {groupByCategory && (
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="font-medium text-gray-700">{category}</h3>
                    <Badge variant="outline" className="text-xs">
                      {categoryNotifications.length}
                    </Badge>
                    <Separator className="flex-1" />
                  </div>
                )}
                
                <div className="space-y-3">
                  {categoryNotifications.map(renderNotification)}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

// Notification toast component for real-time notifications
export function NotificationToast({ 
  notification, 
  onDismiss,
  onAction 
}: {
  notification: SmartNotification;
  onDismiss: () => void;
  onAction?: (actionId: string) => void;
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (notification.autoRead) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, 300);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [notification.autoRead, onDismiss]);

  if (!isVisible) return null;

  return (
    <div className={`
      fixed top-4 right-4 z-50 max-w-sm w-full
      transform transition-all duration-300
      ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
    `}>
      <Card className={`shadow-lg ${getTypeColor(notification.type)} border-l-4`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {getTypeIcon(notification.type)}
                <h4 className="font-medium text-gray-900 text-sm text-right">
                  {notification.titleAr || notification.title}
                </h4>
              </div>
              
              <p className="text-sm text-gray-600 text-right mb-3">
                {notification.messageAr || notification.message}
              </p>
              
              {notification.actions && (
                <div className="flex gap-2">
                  {notification.actions.map(action => (
                    <Button
                      key={action.id}
                      variant={action.variant || 'outline'}
                      size="sm"
                      onClick={() => onAction?.(action.id)}
                      className="gap-1"
                    >
                      {action.icon}
                      {action.labelAr || action.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}