import { useState } from "react";
import {
  HelpCircle,
  BookOpen,
  Video,
  MessageCircle,
  Search,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Phone,
  Mail,
  Globe,
  FileText,
  PlayCircle,
  Users,
  Settings,
  Lightbulb,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GlassmorphicCard } from "@/components/glassmorphic-card";

// Help Content Structure
interface HelpSection {
  id: string;
  title: string;
  titleAr: string;
  icon: React.ComponentType<any>;
  articles: HelpArticle[];
}

interface HelpArticle {
  id: string;
  title: string;
  titleAr: string;
  content: string;
  contentAr: string;
  category: string;
  tags: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  videoUrl?: string;
  estimatedTime: number; // in minutes
}

interface VideoTutorial {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  duration: string;
  thumbnail: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}

interface FAQ {
  id: string;
  question: string;
  questionAr: string;
  answer: string;
  answerAr: string;
  category: string;
  helpful: number;
}

// Sample help content
const helpSections: HelpSection[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    titleAr: "البدء السريع",
    icon: PlayCircle,
    articles: [
      {
        id: "setup-company",
        title: "Setting Up Your Company",
        titleAr: "إعداد شركتك",
        content: "Learn how to configure your company profile and branches...",
        contentAr: "تعلم كيفية تكوين ملف شركتك والفروع...",
        category: "setup",
        tags: ["company", "setup", "profile"],
        difficulty: "beginner",
        estimatedTime: 5,
      },
      {
        id: "first-project",
        title: "Creating Your First Project",
        titleAr: "إنشاء مشروعك الأول",
        content: "Step-by-step guide to create and manage your first construction project...",
        contentAr: "دليل خطوة بخطوة لإنشاء وإدارة مشروع البناء الأول...",
        category: "projects",
        tags: ["project", "creation", "management"],
        difficulty: "beginner",
        estimatedTime: 10,
      },
    ],
  },
  {
    id: "project-management",
    title: "Project Management",
    titleAr: "إدارة المشاريع",
    icon: Settings,
    articles: [
      {
        id: "gantt-charts",
        title: "Using Gantt Charts",
        titleAr: "استخدام مخططات جانت",
        content: "Master project timeline visualization and task dependencies...",
        contentAr: "إتقان تصور الجدول الزمني للمشروع وتبعيات المهام...",
        category: "projects",
        tags: ["gantt", "timeline", "tasks"],
        difficulty: "intermediate",
        estimatedTime: 15,
        videoUrl: "https://example.com/gantt-tutorial",
      },
    ],
  },
  {
    id: "financial",
    title: "Financial Management",
    titleAr: "الإدارة المالية",
    icon: BookOpen,
    articles: [
      {
        id: "ifrs-compliance",
        title: "IFRS Compliance",
        titleAr: "الامتثال لمعايير التقارير المالية الدولية",
        content: "Understanding IFRS standards for construction accounting...",
        contentAr: "فهم معايير التقارير المالية الدولية لمحاسبة البناء...",
        category: "financial",
        tags: ["ifrs", "compliance", "accounting"],
        difficulty: "advanced",
        estimatedTime: 20,
      },
    ],
  },
];

const videoTutorials: VideoTutorial[] = [
  {
    id: "intro-tour",
    title: "Platform Introduction Tour",
    titleAr: "جولة تعريفية بالمنصة",
    description: "Complete overview of the construction management platform",
    descriptionAr: "نظرة عامة كاملة على منصة إدارة البناء",
    duration: "8:45",
    thumbnail: "/api/placeholder/320/180",
    category: "introduction",
    difficulty: "beginner",
  },
  {
    id: "project-setup",
    title: "Advanced Project Setup",
    titleAr: "إعداد المشروع المتقدم",
    description: "Learn advanced features for project configuration",
    descriptionAr: "تعلم الميزات المتقدمة لتكوين المشروع",
    duration: "12:30",
    thumbnail: "/api/placeholder/320/180",
    category: "projects",
    difficulty: "intermediate",
  },
];

const faqs: FAQ[] = [
  {
    id: "currency-support",
    question: "Which currencies are supported?",
    questionAr: "ما هي العملات المدعومة؟",
    answer: "The platform primarily supports Yemeni Rial (YER) with real-time exchange rates for USD and EUR.",
    answerAr: "تدعم المنصة بشكل أساسي الريال اليمني مع أسعار الصرف الفورية للدولار الأمريكي واليورو.",
    category: "financial",
    helpful: 15,
  },
  {
    id: "user-roles",
    question: "What user roles are available?",
    questionAr: "ما هي أدوار المستخدمين المتاحة؟",
    answer: "The system supports CEO, Manager, Supervisor, Employee, and Worker roles with different access levels.",
    answerAr: "يدعم النظام أدوار الرئيس التنفيذي والمدير والمشرف والموظف والعامل بمستويات وصول مختلفة.",
    category: "users",
    helpful: 22,
  },
];

export function HelpSystem() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("articles");
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const filteredSections = helpSections.map(section => ({
    ...section,
    articles: section.articles.filter(article =>
      article.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.contentAr.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(section => section.articles.length > 0);

  const filteredFAQs = faqs.filter(faq =>
    faq.questionAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answerAr.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVideos = videoTutorials.filter(video =>
    video.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.descriptionAr.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90">
          <HelpCircle className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] p-0 glass-card">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold text-charcoal-text">
                مركز المساعدة والدعم
              </DialogTitle>
              <p className="text-sm text-gray-500 mt-1">
                دليل شامل لاستخدام منصة إدارة البناء
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-6 pt-4">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="ابحث في المساعدة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input pr-10"
            />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 glass-card">
              <TabsTrigger value="articles" className="text-xs">
                <FileText className="h-4 w-4 ml-2" />
                المقالات
              </TabsTrigger>
              <TabsTrigger value="videos" className="text-xs">
                <Video className="h-4 w-4 ml-2" />
                الفيديوهات
              </TabsTrigger>
              <TabsTrigger value="faq" className="text-xs">
                <MessageCircle className="h-4 w-4 ml-2" />
                الأسئلة الشائعة
              </TabsTrigger>
              <TabsTrigger value="contact" className="text-xs">
                <Phone className="h-4 w-4 ml-2" />
                اتصل بنا
              </TabsTrigger>
            </TabsList>

            {/* Articles Tab */}
            <TabsContent value="articles" className="mt-6 max-h-96 overflow-y-auto">
              <div className="space-y-4">
                {filteredSections.map((section) => (
                  <Collapsible
                    key={section.id}
                    open={expandedSections.includes(section.id)}
                    onOpenChange={() => toggleSection(section.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors">
                        <div className="flex items-center space-x-reverse space-x-3">
                          <section.icon className="h-5 w-5 text-primary" />
                          <span className="font-medium text-charcoal-text">
                            {section.titleAr}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {section.articles.length}
                          </Badge>
                        </div>
                        {expandedSections.includes(section.id) ? (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="mt-2">
                      <div className="space-y-2 pr-4">
                        {section.articles.map((article) => (
                          <div
                            key={article.id}
                            className="p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors border-r-4 border-accent"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-charcoal-text text-sm">
                                  {article.titleAr}
                                </h4>
                                <p className="text-xs text-gray-500 mt-1">
                                  {article.contentAr.substring(0, 100)}...
                                </p>
                                <div className="flex items-center space-x-reverse space-x-2 mt-2">
                                  <Badge
                                    variant={
                                      article.difficulty === "beginner" ? "default" :
                                      article.difficulty === "intermediate" ? "secondary" : "destructive"
                                    }
                                    className="text-xs"
                                  >
                                    {article.difficulty === "beginner" ? "مبتدئ" :
                                     article.difficulty === "intermediate" ? "متوسط" : "متقدم"}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {article.estimatedTime} دقيقة
                                  </span>
                                  {article.videoUrl && (
                                    <PlayCircle className="h-3 w-3 text-accent" />
                                  )}
                                </div>
                              </div>
                              <ExternalLink className="h-4 w-4 text-gray-400" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </TabsContent>

            {/* Videos Tab */}
            <TabsContent value="videos" className="mt-6 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredVideos.map((video) => (
                  <GlassmorphicCard key={video.id} className="p-4 hover:bg-white/10 cursor-pointer transition-colors">
                    <div className="aspect-video bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                      <PlayCircle className="h-12 w-12 text-primary" />
                    </div>
                    <h4 className="font-medium text-charcoal-text text-sm mb-1">
                      {video.titleAr}
                    </h4>
                    <p className="text-xs text-gray-500 mb-2">
                      {video.descriptionAr}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={
                          video.difficulty === "beginner" ? "default" :
                          video.difficulty === "intermediate" ? "secondary" : "destructive"
                        }
                        className="text-xs"
                      >
                        {video.difficulty === "beginner" ? "مبتدئ" :
                         video.difficulty === "intermediate" ? "متوسط" : "متقدم"}
                      </Badge>
                      <span className="text-xs text-gray-500">{video.duration}</span>
                    </div>
                  </GlassmorphicCard>
                ))}
              </div>
            </TabsContent>

            {/* FAQ Tab */}
            <TabsContent value="faq" className="mt-6 max-h-96 overflow-y-auto">
              <div className="space-y-4">
                {filteredFAQs.map((faq) => (
                  <Collapsible key={faq.id}>
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors">
                        <div className="flex items-center space-x-reverse space-x-3">
                          <HelpCircle className="h-4 w-4 text-accent" />
                          <span className="font-medium text-charcoal-text text-sm">
                            {faq.questionAr}
                          </span>
                        </div>
                        <div className="flex items-center space-x-reverse space-x-2">
                          <span className="text-xs text-gray-500">
                            {faq.helpful} مفيد
                          </span>
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="p-4 bg-white/5 rounded-lg mt-2 border-r-4 border-accent">
                        <p className="text-sm text-charcoal-text">
                          {faq.answerAr}
                        </p>
                        <div className="flex items-center space-x-reverse space-x-2 mt-3">
                          <Button size="sm" variant="ghost" className="text-xs">
                            مفيد
                          </Button>
                          <Button size="sm" variant="ghost" className="text-xs">
                            غير مفيد
                          </Button>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </TabsContent>

            {/* Contact Tab */}
            <TabsContent value="contact" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlassmorphicCard className="p-6">
                  <h3 className="font-semibold text-charcoal-text mb-4 flex items-center">
                    <Phone className="h-5 w-5 ml-2 text-primary" />
                    الدعم الفني
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-reverse space-x-3">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-charcoal-text">+967 1 234 567</span>
                    </div>
                    <div className="flex items-center space-x-reverse space-x-3">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-charcoal-text">support@construction-platform.com</span>
                    </div>
                    <div className="flex items-center space-x-reverse space-x-3">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-charcoal-text">www.construction-platform.com</span>
                    </div>
                  </div>
                </GlassmorphicCard>

                <GlassmorphicCard className="p-6">
                  <h3 className="font-semibold text-charcoal-text mb-4 flex items-center">
                    <Users className="h-5 w-5 ml-2 text-primary" />
                    التدريب والإرشاد
                  </h3>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      نقدم جلسات تدريبية مخصصة لفريقك لضمان الاستفادة القصوى من المنصة
                    </p>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                      احجز جلسة تدريبية
                    </Button>
                  </div>
                </GlassmorphicCard>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Quick Help Tooltip Component
interface QuickHelpProps {
  content: string;
  contentAr: string;
  position?: "top" | "bottom" | "left" | "right";
}

export function QuickHelp({ content, contentAr, position = "top" }: QuickHelpProps) {
  return (
    <div className="group relative inline-block">
      <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
      <div className={`absolute z-10 invisible group-hover:visible bg-charcoal-text text-white text-xs rounded py-2 px-3 whitespace-nowrap ${
        position === "top" ? "bottom-full mb-2 left-1/2 transform -translate-x-1/2" :
        position === "bottom" ? "top-full mt-2 left-1/2 transform -translate-x-1/2" :
        position === "left" ? "right-full mr-2 top-1/2 transform -translate-y-1/2" :
        "left-full ml-2 top-1/2 transform -translate-y-1/2"
      }`}>
        {contentAr}
      </div>
    </div>
  );
}