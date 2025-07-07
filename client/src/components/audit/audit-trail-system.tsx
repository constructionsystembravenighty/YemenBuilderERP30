import { useState, useEffect } from 'react';
import { Shield, User, Calendar, Activity, FileText, Search, Filter, Download, Eye, AlertTriangle, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatArabicDate } from '@/lib/arabic-utils';

interface AuditEvent {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  userNameAr: string;
  action: string;
  actionAr: string;
  resource: string;
  resourceId: string;
  resourceName?: string;
  resourceNameAr?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  category: 'authentication' | 'data_access' | 'data_modification' | 'system_config' | 'financial' | 'security';
  compliance: {
    gdpr: boolean;
    ifrs: boolean;
    sox: boolean;
    localLaw: boolean;
  };
  metadata: Record<string, any>;
}

interface SecurityAlert {
  id: string;
  timestamp: Date;
  type: 'suspicious_activity' | 'failed_login' | 'unauthorized_access' | 'data_breach' | 'policy_violation';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  userId?: string;
  ipAddress: string;
  affectedResources: string[];
  autoResolved: boolean;
  investigationStatus: 'open' | 'investigating' | 'resolved' | 'false_positive';
}

export function AuditTrailSystem() {
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('24h');
  const [activeTab, setActiveTab] = useState('events');

  // Sample audit events
  useEffect(() => {
    const sampleEvents: AuditEvent[] = [
      {
        id: '1',
        timestamp: new Date('2025-01-07T14:30:00'),
        userId: 'user_1',
        userName: 'Ahmed Ali',
        userNameAr: 'أحمد علي',
        action: 'project_created',
        actionAr: 'إنشاء مشروع',
        resource: 'project',
        resourceId: 'proj_001',
        resourceName: 'New Construction Project',
        resourceNameAr: 'مشروع بناء جديد',
        newValues: {
          name: 'New Construction Project',
          budget: 5000000,
          status: 'planning'
        },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'sess_abc123',
        riskLevel: 'low',
        category: 'data_modification',
        compliance: {
          gdpr: true,
          ifrs: true,
          sox: false,
          localLaw: true
        },
        metadata: {
          projectType: 'residential',
          location: 'Sanaa'
        }
      },
      {
        id: '2',
        timestamp: new Date('2025-01-07T13:45:00'),
        userId: 'user_2',
        userName: 'Fatima Mohammed',
        userNameAr: 'فاطمة محمد',
        action: 'budget_modified',
        actionAr: 'تعديل الميزانية',
        resource: 'project',
        resourceId: 'proj_002',
        resourceName: 'Commercial Complex',
        resourceNameAr: 'مجمع تجاري',
        oldValues: {
          budget: 3000000
        },
        newValues: {
          budget: 3500000
        },
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        sessionId: 'sess_def456',
        riskLevel: 'medium',
        category: 'financial',
        compliance: {
          gdpr: true,
          ifrs: true,
          sox: true,
          localLaw: true
        },
        metadata: {
          approvalRequired: true,
          budgetIncrease: 500000
        }
      },
      {
        id: '3',
        timestamp: new Date('2025-01-07T12:15:00'),
        userId: 'user_3',
        userName: 'Mohammed Omar',
        userNameAr: 'محمد عمر',
        action: 'user_access_granted',
        actionAr: 'منح صلاحية المستخدم',
        resource: 'user',
        resourceId: 'user_4',
        resourceName: 'New Employee Access',
        resourceNameAr: 'صلاحية موظف جديد',
        newValues: {
          role: 'supervisor',
          permissions: ['projects:read', 'projects:update']
        },
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        sessionId: 'sess_ghi789',
        riskLevel: 'high',
        category: 'security',
        compliance: {
          gdpr: true,
          ifrs: false,
          sox: true,
          localLaw: true
        },
        metadata: {
          approvedBy: 'HR Manager',
          effectiveDate: '2025-01-08'
        }
      },
      {
        id: '4',
        timestamp: new Date('2025-01-07T11:30:00'),
        userId: 'system',
        userName: 'System',
        userNameAr: 'النظام',
        action: 'automated_backup',
        actionAr: 'نسخ احتياطي تلقائي',
        resource: 'database',
        resourceId: 'db_main',
        resourceName: 'Main Database',
        resourceNameAr: 'قاعدة البيانات الرئيسية',
        ipAddress: '127.0.0.1',
        userAgent: 'System/Automated',
        sessionId: 'sys_backup',
        riskLevel: 'low',
        category: 'system_config',
        compliance: {
          gdpr: true,
          ifrs: true,
          sox: true,
          localLaw: true
        },
        metadata: {
          backupSize: '2.5GB',
          duration: '45 minutes'
        }
      }
    ];

    const sampleAlerts: SecurityAlert[] = [
      {
        id: 'alert_1',
        timestamp: new Date('2025-01-07T15:00:00'),
        type: 'suspicious_activity',
        severity: 'warning',
        title: 'Multiple Failed Login Attempts',
        titleAr: 'محاولات دخول فاشلة متعددة',
        description: 'User attempted to login 5 times with incorrect credentials',
        descriptionAr: 'المستخدم حاول الدخول 5 مرات بكلمات مرور خاطئة',
        userId: 'user_unknown',
        ipAddress: '192.168.1.50',
        affectedResources: ['authentication_system'],
        autoResolved: false,
        investigationStatus: 'open'
      },
      {
        id: 'alert_2',
        timestamp: new Date('2025-01-07T14:15:00'),
        type: 'unauthorized_access',
        severity: 'error',
        title: 'Access Attempt to Restricted Resource',
        titleAr: 'محاولة وصول لمورد محظور',
        description: 'User tried to access financial data without proper permissions',
        descriptionAr: 'المستخدم حاول الوصول للبيانات المالية بدون صلاحيات',
        userId: 'user_5',
        ipAddress: '192.168.1.105',
        affectedResources: ['financial_reports', 'transaction_data'],
        autoResolved: true,
        investigationStatus: 'resolved'
      }
    ];

    setAuditEvents(sampleEvents);
    setSecurityAlerts(sampleAlerts);
  }, []);

  const filteredEvents = auditEvents.filter(event => {
    const matchesSearch = event.actionAr.includes(searchTerm) || 
                         event.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.resourceNameAr?.includes(searchTerm);
    const matchesUser = userFilter === 'all' || event.userId === userFilter;
    const matchesAction = actionFilter === 'all' || event.action === actionFilter;
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
    const matchesRisk = riskFilter === 'all' || event.riskLevel === riskFilter;

    return matchesSearch && matchesUser && matchesAction && matchesCategory && matchesRisk;
  });

  const getActionIcon = (category: string) => {
    switch (category) {
      case 'authentication': return <Shield className="h-4 w-4" />;
      case 'data_access': return <Eye className="h-4 w-4" />;
      case 'data_modification': return <FileText className="h-4 w-4" />;
      case 'system_config': return <Activity className="h-4 w-4" />;
      case 'financial': return <DollarSign className="h-4 w-4" />;
      case 'security': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'authentication': 'المصادقة',
      'data_access': 'الوصول للبيانات',
      'data_modification': 'تعديل البيانات',
      'system_config': 'إعدادات النظام',
      'financial': 'مالية',
      'security': 'أمان'
    };
    return labels[category] || category;
  };

  const getComplianceIcons = (compliance: any) => {
    const icons = [];
    if (compliance.gdpr) icons.push('GDPR');
    if (compliance.ifrs) icons.push('IFRS');
    if (compliance.sox) icons.push('SOX');
    if (compliance.localLaw) icons.push('قانون محلي');
    return icons;
  };

  const exportAuditReport = () => {
    // In a real implementation, this would generate and download a report
    console.log('Exporting audit report...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">سجل المراجعة والأمان</h2>
          <p className="text-muted-foreground">تتبع شامل لجميع الأنشطة والأحداث الأمنية</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={exportAuditReport}>
            <Download className="h-4 w-4 ml-2" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="البحث في الأحداث..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                  dir="rtl"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="الفئة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الفئات</SelectItem>
                <SelectItem value="authentication">المصادقة</SelectItem>
                <SelectItem value="data_access">الوصول للبيانات</SelectItem>
                <SelectItem value="data_modification">تعديل البيانات</SelectItem>
                <SelectItem value="financial">مالية</SelectItem>
                <SelectItem value="security">أمان</SelectItem>
              </SelectContent>
            </Select>
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger>
                <SelectValue placeholder="مستوى المخاطر" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل المستويات</SelectItem>
                <SelectItem value="low">منخفض</SelectItem>
                <SelectItem value="medium">متوسط</SelectItem>
                <SelectItem value="high">عالي</SelectItem>
                <SelectItem value="critical">حرج</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger>
                <SelectValue placeholder="الفترة الزمنية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24 ساعة</SelectItem>
                <SelectItem value="7d">7 أيام</SelectItem>
                <SelectItem value="30d">30 يوم</SelectItem>
                <SelectItem value="90d">90 يوم</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              تصفية متقدمة
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="events">أحداث المراجعة</TabsTrigger>
          <TabsTrigger value="alerts">التنبيهات الأمنية</TabsTrigger>
          <TabsTrigger value="compliance">الامتثال</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Events List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    أحداث المراجعة
                    <Badge variant="secondary">{filteredEvents.length} حدث</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-2 p-4">
                      {filteredEvents.map((event) => (
                        <div
                          key={event.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedEvent?.id === event.id
                              ? 'bg-primary/10 border-primary'
                              : 'hover:bg-muted/50'
                          }`}
                          onClick={() => setSelectedEvent(event)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getActionIcon(event.category)}
                              <div>
                                <h4 className="font-medium text-sm">{event.actionAr}</h4>
                                <p className="text-xs text-muted-foreground">
                                  {event.userNameAr} • {formatArabicDate(event.timestamp, 'relative')}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1">
                              <Badge variant="outline" className={getRiskColor(event.riskLevel)}>
                                {event.riskLevel}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {getCategoryLabel(event.category)}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="text-xs text-muted-foreground">
                            <span className="font-medium">{event.resourceNameAr || event.resource}</span>
                            <span className="mx-2">•</span>
                            <span>{event.ipAddress}</span>
                          </div>
                          
                          {getComplianceIcons(event.compliance).length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {getComplianceIcons(event.compliance).map((icon, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {icon}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Event Details */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>تفاصيل الحدث</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedEvent ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">{selectedEvent.actionAr}</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedEvent.resourceNameAr || selectedEvent.resource}
                        </p>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">المستخدم:</span>
                          <span>{selectedEvent.userNameAr}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">التوقيت:</span>
                          <span>{formatArabicDate(selectedEvent.timestamp, 'long')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">عنوان IP:</span>
                          <span className="font-mono">{selectedEvent.ipAddress}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">معرف الجلسة:</span>
                          <span className="font-mono text-xs">{selectedEvent.sessionId}</span>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h5 className="font-medium mb-2">مستوى المخاطر</h5>
                        <Badge className={getRiskColor(selectedEvent.riskLevel)}>
                          {selectedEvent.riskLevel}
                        </Badge>
                      </div>

                      {(selectedEvent.oldValues || selectedEvent.newValues) && (
                        <div>
                          <h5 className="font-medium mb-2">التغييرات</h5>
                          <div className="space-y-2 text-sm">
                            {selectedEvent.oldValues && (
                              <div>
                                <span className="font-medium text-red-600">القيم السابقة:</span>
                                <pre className="text-xs bg-muted p-2 rounded mt-1">
                                  {JSON.stringify(selectedEvent.oldValues, null, 2)}
                                </pre>
                              </div>
                            )}
                            {selectedEvent.newValues && (
                              <div>
                                <span className="font-medium text-green-600">القيم الجديدة:</span>
                                <pre className="text-xs bg-muted p-2 rounded mt-1">
                                  {JSON.stringify(selectedEvent.newValues, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div>
                        <h5 className="font-medium mb-2">الامتثال</h5>
                        <div className="flex flex-wrap gap-1">
                          {getComplianceIcons(selectedEvent.compliance).map((icon, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {icon}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">اختر حدث للعرض</h3>
                      <p className="text-muted-foreground">
                        انقر على أحد الأحداث لعرض التفاصيل الكاملة
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>التنبيهات الأمنية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityAlerts.map((alert) => (
                  <div key={alert.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        <div>
                          <h4 className="font-medium">{alert.titleAr}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatArabicDate(alert.timestamp, 'relative')}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        <Badge variant="outline">
                          {alert.investigationStatus}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {alert.descriptionAr}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>IP: {alert.ipAddress}</span>
                      <span>{alert.affectedResources.join(', ')}</span>
                      <span>
                        {alert.autoResolved ? 'حُل تلقائياً' : 'يحتاج تدخل'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">امتثال GDPR</p>
                    <p className="text-2xl font-bold text-green-600">98%</p>
                  </div>
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">امتثال IFRS</p>
                    <p className="text-2xl font-bold text-green-600">95%</p>
                  </div>
                  <FileText className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">امتثال SOX</p>
                    <p className="text-2xl font-bold text-yellow-600">87%</p>
                  </div>
                  <Activity className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">القانون المحلي</p>
                    <p className="text-2xl font-bold text-green-600">100%</p>
                  </div>
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>تقرير الامتثال التفصيلي</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">المعيار</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">آخر مراجعة</TableHead>
                    <TableHead className="text-right">المسؤول</TableHead>
                    <TableHead className="text-right">ملاحظات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">GDPR - حماية البيانات</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">مطابق</Badge>
                    </TableCell>
                    <TableCell>{formatArabicDate(new Date(), 'short')}</TableCell>
                    <TableCell>أحمد علي</TableCell>
                    <TableCell>جميع المتطلبات مستوفاة</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">IFRS - التقارير المالية</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">مطابق</Badge>
                    </TableCell>
                    <TableCell>{formatArabicDate(new Date(), 'short')}</TableCell>
                    <TableCell>فاطمة محمد</TableCell>
                    <TableCell>تحديث المعايير المحاسبية</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">SOX - الضوابط الداخلية</TableCell>
                    <TableCell>
                      <Badge className="bg-yellow-100 text-yellow-800">جاري التحديث</Badge>
                    </TableCell>
                    <TableCell>{formatArabicDate(new Date(), 'short')}</TableCell>
                    <TableCell>محمد عمر</TableCell>
                    <TableCell>تحسينات مطلوبة في نظام المراجعة</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}