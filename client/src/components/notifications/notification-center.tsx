import { useState, useEffect, useCallback } from 'react';
import { Bell, X, AlertTriangle, CheckCircle, Info, AlertCircle, Settings, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDate } from '@/lib/arabic-utils';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'project' | 'financial' | 'employee' | 'equipment' | 'system';
  actionUrl?: string;
  actionLabel?: string;
  actionLabelAr?: string;
  metadata?: Record<string, any>;
}

interface NotificationSettings {
  projectUpdates: boolean;
  financialAlerts: boolean;
  systemNotifications: boolean;
  employeeUpdates: boolean;
  equipmentAlerts: boolean;
  budgetWarnings: boolean;
  deadlineReminders: boolean;
  soundEnabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    projectUpdates: true,
    financialAlerts: true,
    systemNotifications: true,
    employeeUpdates: false,
    equipmentAlerts: true,
    budgetWarnings: true,
    deadlineReminders: true,
    soundEnabled: true,
    emailNotifications: false,
    pushNotifications: true
  });
  
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all');
  const [activeTab, setActiveTab] = useState('notifications');

  // Mock notifications (replace with actual API)
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'warning',
        title: 'Budget Alert',
        titleAr: 'تنبيه الميزانية',
        message: 'Modern Housing Complex project is 85% over budget',
        messageAr: 'مشروع مجمع الإسكان الحديث تجاوز الميزانية بنسبة 85%',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        read: false,
        priority: 'high',
        category: 'financial',
        actionUrl: '/projects/1',
        actionLabel: 'View Project',
        actionLabelAr: 'عرض المشروع'
      },
      {
        id: '2',
        type: 'success',
        title: 'Project Milestone',
        titleAr: 'إنجاز مرحلة المشروع',
        message: 'Foundation work completed successfully',
        messageAr: 'تم إنجاز أعمال الأساسات بنجاح',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: false,
        priority: 'medium',
        category: 'project',
        actionUrl: '/projects/1',
        actionLabel: 'View Details',
        actionLabelAr: 'عرض التفاصيل'
      },
      {
        id: '3',
        type: 'error',
        title: 'Equipment Failure',
        titleAr: 'عطل في المعدات',
        message: 'Excavator #EX001 requires immediate maintenance',
        messageAr: 'الحفارة رقم EX001 تحتاج إلى صيانة فورية',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        read: true,
        priority: 'critical',
        category: 'equipment',
        actionUrl: '/equipment/1',
        actionLabel: 'Schedule Maintenance',
        actionLabelAr: 'جدولة الصيانة'
      },
      {
        id: '4',
        type: 'info',
        title: 'System Update',
        titleAr: 'تحديث النظام',
        message: 'New features available in project management module',
        messageAr: 'ميزات جديدة متاحة في وحدة إدارة المشاريع',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        read: true,
        priority: 'low',
        category: 'system',
        actionUrl: '/help',
        actionLabel: 'Learn More',
        actionLabelAr: 'تعلم المزيد'
      }
    ];
    
    setNotifications(mockNotifications);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'high') return notification.priority === 'high' || notification.priority === 'critical';
    return true;
  });

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'secondary';
      case 'medium':
        return 'outline';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (!isOpen) {
    return (
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="relative"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
      <Card className="w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              مركز التنبيهات
              {unreadCount > 0 && (
                <Badge variant="secondary">
                  {unreadCount} غير مقروء
                </Badge>
              )}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="notifications">التنبيهات</TabsTrigger>
              <TabsTrigger value="settings">الإعدادات</TabsTrigger>
            </TabsList>

            <TabsContent value="notifications" className="mt-0">
              {/* Filter Controls */}
              <div className="p-4 border-b bg-muted/30">
                <div className="flex items-center gap-2">
                  <Button
                    variant={filter === 'all' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter('all')}
                  >
                    الكل ({notifications.length})
                  </Button>
                  <Button
                    variant={filter === 'unread' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter('unread')}
                  >
                    غير مقروء ({unreadCount})
                  </Button>
                  <Button
                    variant={filter === 'high' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter('high')}
                  >
                    أولوية عالية
                  </Button>
                  
                  {unreadCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={markAllAsRead}
                      className="mr-auto"
                    >
                      تحديد الكل كمقروء
                    </Button>
                  )}
                </div>
              </div>

              {/* Notifications List */}
              <ScrollArea className="h-96">
                <div className="p-4 space-y-3">
                  {filteredNotifications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      لا توجد تنبيهات
                    </div>
                  ) : (
                    filteredNotifications.map(notification => (
                      <Card 
                        key={notification.id}
                        className={`p-4 cursor-pointer transition-all hover:bg-muted/50 ${
                          !notification.read ? 'border-l-4 border-l-primary bg-muted/20' : ''
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-medium text-sm text-right" dir="rtl">
                                {notification.titleAr}
                              </h4>
                              <div className="flex items-center gap-1">
                                <Badge variant={getPriorityColor(notification.priority)} className="text-xs">
                                  {notification.priority === 'critical' ? 'حرج' :
                                   notification.priority === 'high' ? 'عالي' :
                                   notification.priority === 'medium' ? 'متوسط' : 'منخفض'}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-auto p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground text-right" dir="rtl">
                              {notification.messageAr}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-muted-foreground">
                                {formatDate(notification.timestamp)}
                              </div>
                              
                              {notification.actionUrl && (
                                <Button variant="outline" size="sm" className="text-xs">
                                  {notification.actionLabelAr}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              <ScrollArea className="h-96">
                <div className="p-4 space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      إعدادات التنبيهات
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">تحديثات المشاريع</span>
                        <Switch
                          checked={settings.projectUpdates}
                          onCheckedChange={(checked) => updateSetting('projectUpdates', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">التنبيهات المالية</span>
                        <Switch
                          checked={settings.financialAlerts}
                          onCheckedChange={(checked) => updateSetting('financialAlerts', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">إشعارات النظام</span>
                        <Switch
                          checked={settings.systemNotifications}
                          onCheckedChange={(checked) => updateSetting('systemNotifications', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">تحديثات الموظفين</span>
                        <Switch
                          checked={settings.employeeUpdates}
                          onCheckedChange={(checked) => updateSetting('employeeUpdates', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">تنبيهات المعدات</span>
                        <Switch
                          checked={settings.equipmentAlerts}
                          onCheckedChange={(checked) => updateSetting('equipmentAlerts', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">تحذيرات الميزانية</span>
                        <Switch
                          checked={settings.budgetWarnings}
                          onCheckedChange={(checked) => updateSetting('budgetWarnings', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">تذكيرات المواعيد النهائية</span>
                        <Switch
                          checked={settings.deadlineReminders}
                          onCheckedChange={(checked) => updateSetting('deadlineReminders', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-semibold">خيارات التسليم</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">تفعيل الأصوات</span>
                        <Switch
                          checked={settings.soundEnabled}
                          onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">إشعارات البريد الإلكتروني</span>
                        <Switch
                          checked={settings.emailNotifications}
                          onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">الإشعارات الفورية</span>
                        <Switch
                          checked={settings.pushNotifications}
                          onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <Archive className="h-4 w-4 mr-2" />
                      أرشفة كل التنبيهات
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}