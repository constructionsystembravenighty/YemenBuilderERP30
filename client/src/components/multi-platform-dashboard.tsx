import { useQuery } from "@tanstack/react-query";
import { GlassmorphicCard } from "./glassmorphic-card";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Building2, Smartphone, Monitor, Server, 
  TrendingUp, Target, Users, Calendar,
  CheckCircle, Clock, AlertCircle
} from "lucide-react";

interface Platform {
  platform: string;
  status: string;
  features: number;
  lastUpdate: Date;
  estimatedCompletion?: string;
}

interface DevelopmentPlan {
  overview: {
    title: string;
    status: string;
    completion: string;
    nextMilestone: string;
    estimatedCompletion: string;
  };
  currentPhase: {
    name: string;
    duration: string;
    progress: string;
    features: string[];
    platforms: string[];
    priority: string;
  };
  technicalStack: {
    frontend: string;
    backend: string;
    mobile: string;
    windows: string;
    design: string;
    compliance: string;
  };
  marketPosition: {
    targetMarket: string;
    competitiveAdvantage: string;
    globalExpansion: string;
    revenueProjection: string;
  };
}

interface UserPersona {
  name: string;
  role: string;
  demographics: string;
  technicalSkills: string;
  primaryGoals: string[];
  painPoints: string[];
  useCases: string[];
}

export function MultiPlatformDashboard() {
  const { data: platformStatus } = useQuery({
    queryKey: ['/api/platforms/status'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: roadmap } = useQuery({
    queryKey: ['/api/platforms/roadmap'],
  });

  const { data: developmentPlan } = useQuery<DevelopmentPlan>({
    queryKey: ['/api/development/plan'],
  });

  const { data: userPersonas } = useQuery<UserPersona[]>({
    queryKey: ['/api/development/user-personas'],
  });

  const { data: technicalSpecs } = useQuery({
    queryKey: ['/api/platforms/technical-specs'],
  });

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'web': return <Building2 className="w-5 h-5" />;
      case 'react-native': 
      case 'native-ios':
      case 'native-android': return <Smartphone className="w-5 h-5" />;
      case 'windows-server':
      case 'windows-client': return platform.includes('server') ? <Server className="w-5 h-5" /> : <Monitor className="w-5 h-5" />;
      default: return <Building2 className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'planned': return 'bg-blue-500';
      case 'in-progress': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 min-h-screen" dir="rtl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          خطة التطوير الشاملة متعددة المنصات
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          منصة إدارة المشاريع الإنشائية - استراتيجية المؤسسات متعددة المنصات
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="platforms">المنصات</TabsTrigger>
          <TabsTrigger value="roadmap">خريطة الطريق</TabsTrigger>
          <TabsTrigger value="personas">المستخدمون</TabsTrigger>
          <TabsTrigger value="technical">المواصفات التقنية</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {developmentPlan && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <GlassmorphicCard>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">حالة المشروع</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{developmentPlan.overview.completion}</div>
                    <p className="text-xs text-muted-foreground">
                      {developmentPlan.overview.status}
                    </p>
                    <Progress value={parseInt(developmentPlan.overview.completion)} className="mt-2" />
                  </CardContent>
                </GlassmorphicCard>

                <GlassmorphicCard>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">المرحلة الحالية</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{developmentPlan.currentPhase.progress}</div>
                    <p className="text-xs text-muted-foreground">
                      {developmentPlan.currentPhase.name}
                    </p>
                    <Badge className={getPriorityColor(developmentPlan.currentPhase.priority)} variant="secondary">
                      {developmentPlan.currentPhase.priority === 'high' ? 'أولوية عالية' : 'أولوية متوسطة'}
                    </Badge>
                  </CardContent>
                </GlassmorphicCard>

                <GlassmorphicCard>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">المدة المتوقعة</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">16</div>
                    <p className="text-xs text-muted-foreground">
                      أسبوع للتنفيذ الكامل
                    </p>
                  </CardContent>
                </GlassmorphicCard>

                <GlassmorphicCard>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">الهدف المالي</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$5M</div>
                    <p className="text-xs text-muted-foreground">
                      ARR بحلول السنة الثانية
                    </p>
                  </CardContent>
                </GlassmorphicCard>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassmorphicCard>
                  <CardHeader>
                    <CardTitle>المكدس التقني</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium mb-1">الواجهة الأمامية</p>
                        <p className="text-xs text-muted-foreground">{developmentPlan.technicalStack.frontend}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">الخلفية</p>
                        <p className="text-xs text-muted-foreground">{developmentPlan.technicalStack.backend}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">الجوال</p>
                        <p className="text-xs text-muted-foreground">{developmentPlan.technicalStack.mobile}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Windows</p>
                        <p className="text-xs text-muted-foreground">{developmentPlan.technicalStack.windows}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">التصميم</p>
                        <p className="text-xs text-muted-foreground">{developmentPlan.technicalStack.design}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">الامتثال</p>
                        <p className="text-xs text-muted-foreground">{developmentPlan.technicalStack.compliance}</p>
                      </div>
                    </div>
                  </CardContent>
                </GlassmorphicCard>

                <GlassmorphicCard>
                  <CardHeader>
                    <CardTitle>الموقف في السوق</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-1">السوق المستهدف</p>
                      <p className="text-xs text-muted-foreground">{developmentPlan.marketPosition.targetMarket}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">الميزة التنافسية</p>
                      <p className="text-xs text-muted-foreground">{developmentPlan.marketPosition.competitiveAdvantage}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">التوسع العالمي</p>
                      <p className="text-xs text-muted-foreground">{developmentPlan.marketPosition.globalExpansion}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">توقعات الإيرادات</p>
                      <p className="text-xs text-muted-foreground">{developmentPlan.marketPosition.revenueProjection}</p>
                    </div>
                  </CardContent>
                </GlassmorphicCard>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="platforms" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformStatus?.platforms?.map((platform: Platform) => (
              <GlassmorphicCard key={platform.platform}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {getPlatformIcon(platform.platform)}
                    <span className="mr-2">
                      {platform.platform === 'web' && 'الويب PWA'}
                      {platform.platform === 'react-native' && 'React Native'}
                      {platform.platform === 'native-ios' && 'iOS الأصلي'}
                      {platform.platform === 'native-android' && 'Android الأصلي'}
                      {platform.platform === 'windows-server' && 'خادم Windows'}
                      {platform.platform === 'windows-client' && 'عميل Windows'}
                    </span>
                  </CardTitle>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(platform.status)}`} />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">الحالة:</span>
                      <Badge variant="secondary">
                        {platform.status === 'active' && 'نشط'}
                        {platform.status === 'planned' && 'مخطط'}
                        {platform.status === 'in-progress' && 'قيد التطوير'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">الميزات:</span>
                      <span className="text-sm font-medium">{platform.features}</span>
                    </div>
                    {platform.estimatedCompletion && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm">التنفيذ المتوقع:</span>
                        <span className="text-sm font-medium">{platform.estimatedCompletion}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </GlassmorphicCard>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="roadmap" className="space-y-6">
          {roadmap?.phases?.map((phase: any, index: number) => (
            <GlassmorphicCard key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{phase.phase}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge className={getPriorityColor(phase.priority)}>
                      {phase.priority === 'high' ? 'أولوية عالية' : 'أولوية متوسطة'}
                    </Badge>
                    <Badge variant="outline">{phase.duration}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">الميزات:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {phase.features.map((feature: string, featureIndex: number) => (
                        <div key={featureIndex} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">المنصات:</p>
                    <div className="flex flex-wrap gap-2">
                      {phase.platforms.map((platform: string, platformIndex: number) => (
                        <Badge key={platformIndex} variant="secondary">
                          {platform === 'web' && 'الويب'}
                          {platform === 'react-native' && 'React Native'}
                          {platform === 'ios' && 'iOS'}
                          {platform === 'android' && 'Android'}
                          {platform === 'windows-server' && 'خادم Windows'}
                          {platform === 'windows-client' && 'عميل Windows'}
                          {platform === 'all' && 'جميع المنصات'}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </GlassmorphicCard>
          ))}
        </TabsContent>

        <TabsContent value="personas" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {userPersonas?.map((persona, index) => (
              <GlassmorphicCard key={index}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Users className="w-8 h-8 text-blue-500" />
                    <div>
                      <CardTitle className="text-lg">{persona.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{persona.role}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">الديموغرافيا:</p>
                    <p className="text-xs text-muted-foreground">{persona.demographics}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">المهارات التقنية:</p>
                    <p className="text-xs text-muted-foreground">{persona.technicalSkills}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">الأهداف الأساسية:</p>
                    <ul className="space-y-1">
                      {persona.primaryGoals.slice(0, 2).map((goal, goalIndex) => (
                        <li key={goalIndex} className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-xs">{goal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">نقاط الألم:</p>
                    <ul className="space-y-1">
                      {persona.painPoints.slice(0, 2).map((pain, painIndex) => (
                        <li key={painIndex} className="flex items-start space-x-2">
                          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <span className="text-xs">{pain}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </GlassmorphicCard>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="technical" className="space-y-6">
          {technicalSpecs && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <GlassmorphicCard>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">المنصات</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{technicalSpecs.platforms}</div>
                  <p className="text-xs text-muted-foreground">منصات متعددة</p>
                </CardContent>
              </GlassmorphicCard>

              <GlassmorphicCard>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">الميزات</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{technicalSpecs.features}+</div>
                  <p className="text-xs text-muted-foreground">ميزات متقدمة</p>
                </CardContent>
              </GlassmorphicCard>

              <GlassmorphicCard>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">التكاملات</CardTitle>
                  <Server className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{technicalSpecs.integrations}+</div>
                  <p className="text-xs text-muted-foreground">تكاملات خارجية</p>
                </CardContent>
              </GlassmorphicCard>

              <GlassmorphicCard>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">وقت التطوير</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">16</div>
                  <p className="text-xs text-muted-foreground">أسبوع تقديري</p>
                </CardContent>
              </GlassmorphicCard>
            </div>
          )}

          <GlassmorphicCard>
            <CardHeader>
              <CardTitle>الموقف في السوق</CardTitle>
            </CardHeader>
            <CardContent>
              {technicalSpecs && (
                <p className="text-center text-lg font-medium text-muted-foreground">
                  {technicalSpecs.marketPosition}
                </p>
              )}
            </CardContent>
          </GlassmorphicCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}