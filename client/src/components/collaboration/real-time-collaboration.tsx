import { useState, useEffect, useRef } from 'react';
import { Users, MessageCircle, Video, Phone, Share2, Eye, Edit, Lock, Unlock, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatArabicDate } from '@/lib/arabic-utils';

interface User {
  id: string;
  name: string;
  nameAr: string;
  avatar?: string;
  role: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: Date;
  currentPage?: string;
  isTyping?: boolean;
}

interface Message {
  id: string;
  userId: string;
  userName: string;
  userNameAr: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'system' | 'file' | 'mention';
  attachments?: string[];
  reactions?: { emoji: string; users: string[] }[];
}

interface ProjectActivity {
  id: string;
  userId: string;
  userName: string;
  userNameAr: string;
  action: string;
  actionAr: string;
  resource: string;
  resourceId: string;
  resourceName: string;
  resourceNameAr: string;
  timestamp: Date;
  details?: any;
}

interface EditSession {
  id: string;
  userId: string;
  userName: string;
  resource: string;
  resourceId: string;
  startTime: Date;
  lastActivity: Date;
  isLocked: boolean;
}

export function RealTimeCollaboration() {
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activities, setActivities] = useState<ProjectActivity[]>([]);
  const [editSessions, setEditSessions] = useState<EditSession[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [showActivityPanel, setShowActivityPanel] = useState(false);
  const [selectedTab, setSelectedTab] = useState('users');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Simulate real-time data
  useEffect(() => {
    const sampleUsers: User[] = [
      {
        id: '1',
        name: 'Ahmed Ali',
        nameAr: 'أحمد علي',
        avatar: '',
        role: 'Project Manager',
        status: 'online',
        lastSeen: new Date(),
        currentPage: '/projects/1',
        isTyping: false
      },
      {
        id: '2',
        name: 'Fatima Mohammed',
        nameAr: 'فاطمة محمد',
        avatar: '',
        role: 'Finance Manager',
        status: 'online',
        lastSeen: new Date(),
        currentPage: '/financial',
        isTyping: false
      },
      {
        id: '3',
        name: 'Mohammed Omar',
        nameAr: 'محمد عمر',
        avatar: '',
        role: 'Site Supervisor',
        status: 'away',
        lastSeen: new Date(Date.now() - 5 * 60 * 1000),
        currentPage: '/projects/2'
      },
      {
        id: '4',
        name: 'Sara Al-Zahra',
        nameAr: 'سارة الزهراء',
        avatar: '',
        role: 'HR Manager',
        status: 'busy',
        lastSeen: new Date(Date.now() - 2 * 60 * 1000),
        currentPage: '/employees'
      }
    ];

    const sampleMessages: Message[] = [
      {
        id: '1',
        userId: '1',
        userName: 'Ahmed Ali',
        userNameAr: 'أحمد علي',
        content: 'تم تحديث تقدم مشروع المجمع السكني إلى 75%',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        type: 'text'
      },
      {
        id: '2',
        userId: '2',
        userName: 'Fatima Mohammed',
        userNameAr: 'فاطمة محمد',
        content: 'يرجى مراجعة الميزانية المحدثة للمشروع',
        timestamp: new Date(Date.now() - 8 * 60 * 1000),
        type: 'text'
      },
      {
        id: '3',
        userId: 'system',
        userName: 'System',
        userNameAr: 'النظام',
        content: 'انضم محمد عمر إلى الجلسة',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        type: 'system'
      }
    ];

    const sampleActivities: ProjectActivity[] = [
      {
        id: '1',
        userId: '1',
        userName: 'Ahmed Ali',
        userNameAr: 'أحمد علي',
        action: 'updated_project_progress',
        actionAr: 'تحديث تقدم المشروع',
        resource: 'project',
        resourceId: '1',
        resourceName: 'Residential Complex',
        resourceNameAr: 'المجمع السكني',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        details: { progress: 75, previousProgress: 70 }
      },
      {
        id: '2',
        userId: '2',
        userName: 'Fatima Mohammed',
        userNameAr: 'فاطمة محمد',
        action: 'modified_budget',
        actionAr: 'تعديل الميزانية',
        resource: 'project',
        resourceId: '1',
        resourceName: 'Residential Complex',
        resourceNameAr: 'المجمع السكني',
        timestamp: new Date(Date.now() - 3 * 60 * 1000),
        details: { newBudget: 5500000, oldBudget: 5000000 }
      }
    ];

    const sampleEditSessions: EditSession[] = [
      {
        id: '1',
        userId: '1',
        userName: 'أحمد علي',
        resource: 'project',
        resourceId: '1',
        startTime: new Date(Date.now() - 15 * 60 * 1000),
        lastActivity: new Date(Date.now() - 1 * 60 * 1000),
        isLocked: true
      }
    ];

    setActiveUsers(sampleUsers);
    setMessages(sampleMessages);
    setActivities(sampleActivities);
    setEditSessions(sampleEditSessions);

    // Simulate periodic updates
    const interval = setInterval(() => {
      // Update last seen times and simulate user activity
      setActiveUsers(prev => prev.map(user => ({
        ...user,
        lastSeen: user.status === 'online' ? new Date() : user.lastSeen
      })));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'online': 'متصل',
      'away': 'غير متاح',
      'busy': 'مشغول',
      'offline': 'غير متصل'
    };
    return labels[status] || status;
  };

  const sendMessage = () => {
    if (!currentMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      userId: 'current_user',
      userName: 'Current User',
      userNameAr: 'المستخدم الحالي',
      content: currentMessage,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, newMessage]);
    setCurrentMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2);
  };

  const startVideoCall = () => {
    // In a real implementation, this would initiate a video call
    console.log('Starting video call...');
  };

  const startScreenShare = () => {
    // In a real implementation, this would start screen sharing
    console.log('Starting screen share...');
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="flex flex-col gap-2">
        {/* Main Collaboration Panel */}
        <Card className="w-80">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4" />
                التعاون المباشر
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowChatPanel(!showChatPanel)}
                  className="h-6 w-6 p-0"
                >
                  <MessageCircle className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowActivityPanel(!showActivityPanel)}
                  className="h-6 w-6 p-0"
                >
                  <Bell className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3">
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-2 h-7">
                <TabsTrigger value="users" className="text-xs">المستخدمين</TabsTrigger>
                <TabsTrigger value="sessions" className="text-xs">الجلسات</TabsTrigger>
              </TabsList>

              <TabsContent value="users" className="mt-2">
                <ScrollArea className="h-40">
                  <div className="space-y-2">
                    {activeUsers.map((user) => (
                      <div key={user.id} className="flex items-center gap-2 p-1 rounded hover:bg-muted/50">
                        <div className="relative">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="text-xs">
                              {getInitials(user.nameAr)}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${getStatusColor(user.status)}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{user.nameAr}</p>
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs px-1 h-4">
                              {getStatusLabel(user.status)}
                            </Badge>
                            {user.currentPage && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Eye className="h-3 w-3 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{user.currentPage}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </div>
                        {user.isTyping && (
                          <div className="text-xs text-muted-foreground">
                            يكتب...
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="sessions" className="mt-2">
                <ScrollArea className="h-40">
                  <div className="space-y-2">
                    {editSessions.map((session) => (
                      <div key={session.id} className="p-2 border rounded text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{session.userName}</span>
                          <div className="flex items-center gap-1">
                            {session.isLocked ? (
                              <Lock className="h-3 w-3 text-red-500" />
                            ) : (
                              <Unlock className="h-3 w-3 text-green-500" />
                            )}
                            <Edit className="h-3 w-3 text-blue-500" />
                          </div>
                        </div>
                        <div className="text-muted-foreground">
                          <p>{session.resource} #{session.resourceId}</p>
                          <p>{formatArabicDate(session.lastActivity, 'relative')}</p>
                        </div>
                      </div>
                    ))}
                    {editSessions.length === 0 && (
                      <div className="text-center text-muted-foreground text-xs py-4">
                        لا توجد جلسات تحرير نشطة
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>

            <Separator className="my-2" />

            {/* Quick Actions */}
            <div className="flex gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="outline" onClick={startVideoCall} className="h-6 px-2">
                      <Video className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>مكالمة فيديو</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="outline" onClick={startScreenShare} className="h-6 px-2">
                      <Share2 className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>مشاركة الشاشة</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Badge variant="secondary" className="text-xs h-6 px-2 flex items-center">
                {activeUsers.filter(u => u.status === 'online').length} متصل
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Chat Panel */}
        {showChatPanel && (
          <Card className="w-80">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>المحادثة المباشرة</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowChatPanel(false)}
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <ScrollArea className="h-60 mb-3">
                <div className="space-y-2">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-2 rounded text-xs ${
                        message.userId === 'current_user'
                          ? 'bg-primary text-primary-foreground ml-4'
                          : message.type === 'system'
                          ? 'bg-muted text-center text-muted-foreground'
                          : 'bg-muted mr-4'
                      }`}
                    >
                      {message.type !== 'system' && message.userId !== 'current_user' && (
                        <p className="font-medium text-xs mb-1">{message.userNameAr}</p>
                      )}
                      <p>{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {formatArabicDate(message.timestamp, 'relative')}
                      </p>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="flex gap-2">
                <Input
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="اكتب رسالة..."
                  className="text-xs"
                  dir="rtl"
                />
                <Button size="sm" onClick={sendMessage} disabled={!currentMessage.trim()}>
                  إرسال
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Activity Panel */}
        {showActivityPanel && (
          <Card className="w-80">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>النشاطات الحديثة</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowActivityPanel(false)}
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <ScrollArea className="h-60">
                <div className="space-y-2">
                  {activities.map((activity) => (
                    <div key={activity.id} className="p-2 border rounded text-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="h-4 w-4">
                          <AvatarFallback className="text-xs">
                            {getInitials(activity.userNameAr)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{activity.userNameAr}</span>
                      </div>
                      <p className="text-muted-foreground">
                        {activity.actionAr} في {activity.resourceNameAr}
                      </p>
                      <p className="text-muted-foreground mt-1">
                        {formatArabicDate(activity.timestamp, 'relative')}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}