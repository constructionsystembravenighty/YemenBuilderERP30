import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Search,
  BookOpen,
  Video,
  MessageCircle,
  Star,
  Clock,
  User,
  ChevronRight,
  Play,
  Download,
  ExternalLink,
  HelpCircle,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  Calendar,
} from 'lucide-react';

interface HelpArticle {
  id: string;
  title: string;
  titleAr: string;
  content: string;
  contentAr: string;
  category: string;
  categoryAr: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  readTime: number;
  rating: number;
  views: number;
  lastUpdated: Date;
  tags: string[];
  tagsAr: string[];
}

interface VideoTutorial {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  category: string;
  categoryAr: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  thumbnail: string;
  videoUrl: string;
  rating: number;
  views: number;
  transcript?: string;
  transcriptAr?: string;
}

interface FAQ {
  id: string;
  question: string;
  questionAr: string;
  answer: string;
  answerAr: string;
  category: string;
  categoryAr: string;
  helpful: number;
  notHelpful: number;
  lastUpdated: Date;
}

interface HelpCenterProps {
  language?: 'ar' | 'en';
  onContactSupport?: () => void;
  onBookTraining?: () => void;
}

export function HelpCenter({ 
  language = 'ar', 
  onContactSupport,
  onBookTraining 
}: HelpCenterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoTutorial | null>(null);

  // Sample help content - in production, this would come from an API
  const helpArticles: HelpArticle[] = [
    {
      id: '1',
      title: 'Getting Started with Project Management',
      titleAr: 'البدء في إدارة المشاريع',
      content: 'Complete guide to creating and managing construction projects...',
      contentAr: 'دليل شامل لإنشاء وإدارة مشاريع البناء...',
      category: 'projects',
      categoryAr: 'المشاريع',
      difficulty: 'beginner',
      readTime: 5,
      rating: 4.8,
      views: 1250,
      lastUpdated: new Date('2024-01-15'),
      tags: ['projects', 'getting-started', 'basics'],
      tagsAr: ['المشاريع', 'البداية', 'الأساسيات'],
    },
    {
      id: '2',
      title: 'Financial Management and IFRS Compliance',
      titleAr: 'الإدارة المالية والامتثال لمعايير IFRS',
      content: 'Understanding financial management and international accounting standards...',
      contentAr: 'فهم الإدارة المالية ومعايير المحاسبة الدولية...',
      category: 'finance',
      categoryAr: 'المالية',
      difficulty: 'intermediate',
      readTime: 8,
      rating: 4.6,
      views: 890,
      lastUpdated: new Date('2024-01-10'),
      tags: ['finance', 'ifrs', 'accounting'],
      tagsAr: ['المالية', 'معايير', 'محاسبة'],
    },
    {
      id: '3',
      title: 'Employee Management and HR Workflows',
      titleAr: 'إدارة الموظفين وسير عمل الموارد البشرية',
      content: 'Complete guide to managing employees and HR processes...',
      contentAr: 'دليل شامل لإدارة الموظفين وعمليات الموارد البشرية...',
      category: 'hr',
      categoryAr: 'الموارد البشرية',
      difficulty: 'beginner',
      readTime: 6,
      rating: 4.7,
      views: 1100,
      lastUpdated: new Date('2024-01-12'),
      tags: ['employees', 'hr', 'management'],
      tagsAr: ['الموظفين', 'الموارد البشرية', 'الإدارة'],
    },
  ];

  const videoTutorials: VideoTutorial[] = [
    {
      id: '1',
      title: 'Platform Overview: Dashboard and Navigation',
      titleAr: 'نظرة عامة على المنصة: لوحة التحكم والتنقل',
      description: 'Learn how to navigate the platform and use the dashboard effectively',
      descriptionAr: 'تعلم كيفية التنقل في المنصة واستخدام لوحة التحكم بفعالية',
      category: 'getting-started',
      categoryAr: 'البداية',
      duration: 450, // seconds
      difficulty: 'beginner',
      thumbnail: '/api/placeholder/video-thumb-1',
      videoUrl: '/api/videos/dashboard-overview',
      rating: 4.9,
      views: 2100,
    },
    {
      id: '2',
      title: 'Creating and Managing Projects',
      titleAr: 'إنشاء وإدارة المشاريع',
      description: 'Step-by-step guide to project creation and management',
      descriptionAr: 'دليل خطوة بخطوة لإنشاء المشاريع وإدارتها',
      category: 'projects',
      categoryAr: 'المشاريع',
      duration: 720,
      difficulty: 'intermediate',
      thumbnail: '/api/placeholder/video-thumb-2',
      videoUrl: '/api/videos/project-management',
      rating: 4.8,
      views: 1680,
    },
  ];

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I create a new project?',
      questionAr: 'كيف أنشئ مشروعاً جديداً؟',
      answer: 'To create a new project, go to the Projects section and click the "Add Project" button...',
      answerAr: 'لإنشاء مشروع جديد، اذهب إلى قسم المشاريع واضغط على زر "إضافة مشروع"...',
      category: 'projects',
      categoryAr: 'المشاريع',
      helpful: 45,
      notHelpful: 3,
      lastUpdated: new Date('2024-01-15'),
    },
    {
      id: '2',
      question: 'How do I add team members to a project?',
      questionAr: 'كيف أضيف أعضاء الفريق إلى المشروع؟',
      answer: 'You can add team members by going to the project details and using the team management section...',
      answerAr: 'يمكنك إضافة أعضاء الفريق عن طريق الذهاب إلى تفاصيل المشروع واستخدام قسم إدارة الفريق...',
      category: 'projects',
      categoryAr: 'المشاريع',
      helpful: 38,
      notHelpful: 2,
      lastUpdated: new Date('2024-01-14'),
    },
    {
      id: '3',
      question: 'How do I generate financial reports?',
      questionAr: 'كيف أولد التقارير المالية؟',
      answer: 'Financial reports can be generated from the Reports section with various filtering options...',
      answerAr: 'يمكن إنتاج التقارير المالية من قسم التقارير مع خيارات تصفية مختلفة...',
      category: 'finance',
      categoryAr: 'المالية',
      helpful: 52,
      notHelpful: 1,
      lastUpdated: new Date('2024-01-13'),
    },
  ];

  const categories = [
    { id: 'all', name: 'All Categories', nameAr: 'جميع الفئات' },
    { id: 'getting-started', name: 'Getting Started', nameAr: 'البداية' },
    { id: 'projects', name: 'Projects', nameAr: 'المشاريع' },
    { id: 'finance', name: 'Finance', nameAr: 'المالية' },
    { id: 'hr', name: 'Human Resources', nameAr: 'الموارد البشرية' },
    { id: 'equipment', name: 'Equipment', nameAr: 'المعدات' },
    { id: 'documents', name: 'Documents', nameAr: 'المستندات' },
  ];

  // Filter content based on search and category
  const filteredArticles = useMemo(() => {
    return helpArticles.filter(article => {
      const matchesSearch = searchQuery === '' || 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.titleAr.includes(searchQuery) ||
        article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.contentAr.includes(searchQuery);
      
      const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const filteredVideos = useMemo(() => {
    return videoTutorials.filter(video => {
      const matchesSearch = searchQuery === '' || 
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.titleAr.includes(searchQuery) ||
        video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.descriptionAr.includes(searchQuery);
      
      const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const filteredFAQs = useMemo(() => {
    return faqs.filter(faq => {
      const matchesSearch = searchQuery === '' || 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.questionAr.includes(searchQuery) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answerAr.includes(searchQuery);
      
      const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const getDifficultyBadge = (difficulty: string) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800',
    };
    const labels = {
      beginner: language === 'ar' ? 'مبتدئ' : 'Beginner',
      intermediate: language === 'ar' ? 'متوسط' : 'Intermediate',
      advanced: language === 'ar' ? 'متقدم' : 'Advanced',
    };
    return (
      <Badge className={colors[difficulty as keyof typeof colors]}>
        {labels[difficulty as keyof typeof labels]}
      </Badge>
    );
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary">
          {language === 'ar' ? 'مركز المساعدة' : 'Help Center'}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {language === 'ar' 
            ? 'ابحث عن إجابات، شاهد البرامج التعليمية، واحصل على الدعم للاستفادة القصوى من منصة إدارة البناء'
            : 'Find answers, watch tutorials, and get support to make the most of your construction management platform'
          }
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={language === 'ar' ? 'ابحث في المساعدة...' : 'Search help articles...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {language === 'ar' ? category.nameAr : category.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="articles" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="articles" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            {language === 'ar' ? 'المقالات' : 'Articles'}
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            {language === 'ar' ? 'الفيديوهات' : 'Videos'}
          </TabsTrigger>
          <TabsTrigger value="faqs" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            {language === 'ar' ? 'الأسئلة الشائعة' : 'FAQs'}
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            {language === 'ar' ? 'تواصل معنا' : 'Contact'}
          </TabsTrigger>
        </TabsList>

        {/* Articles Tab */}
        <TabsContent value="articles" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArticles.map((article) => (
              <Card key={article.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedArticle(article)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">
                      {language === 'ar' ? article.titleAr : article.title}
                    </CardTitle>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardDescription>
                    {language === 'ar' ? article.categoryAr : article.category}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-3">
                    {getDifficultyBadge(article.difficulty)}
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {article.rating}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {article.readTime} {language === 'ar' ? 'دقائق' : 'min read'}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {article.views.toLocaleString()} {language === 'ar' ? 'مشاهدة' : 'views'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Videos Tab */}
        <TabsContent value="videos" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVideos.map((video) => (
              <Card key={video.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedVideo(video)}>
                <div className="relative">
                  <div className="aspect-video bg-gray-200 rounded-t-lg flex items-center justify-center">
                    <Play className="h-12 w-12 text-primary" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                    {formatDuration(video.duration)}
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {language === 'ar' ? video.titleAr : video.title}
                  </CardTitle>
                  <CardDescription>
                    {language === 'ar' ? video.descriptionAr : video.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-3">
                    {getDifficultyBadge(video.difficulty)}
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {video.rating}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {video.views.toLocaleString()} {language === 'ar' ? 'مشاهدة' : 'views'}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* FAQs Tab */}
        <TabsContent value="faqs" className="space-y-4">
          <div className="space-y-3">
            {filteredFAQs.map((faq) => (
              <Card key={faq.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {language === 'ar' ? faq.questionAr : faq.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {language === 'ar' ? faq.answerAr : faq.answer}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button size="sm" variant="outline" className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3" />
                        {language === 'ar' ? 'مفيد' : 'Helpful'} ({faq.helpful})
                      </Button>
                      <Button size="sm" variant="outline" className="flex items-center gap-2">
                        <AlertCircle className="h-3 w-3" />
                        {language === 'ar' ? 'غير مفيد' : 'Not helpful'} ({faq.notHelpful})
                      </Button>
                    </div>
                    <Badge variant="secondary">
                      {language === 'ar' ? faq.categoryAr : faq.category}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  {language === 'ar' ? 'الدعم الهاتفي' : 'Phone Support'}
                </CardTitle>
                <CardDescription>
                  {language === 'ar' ? 'تحدث مع فريق الدعم مباشرة' : 'Speak directly with our support team'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-medium mb-2">+967 1 234-567</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {language === 'ar' ? 'الأحد - الخميس: 8:00 ص - 6:00 م' : 'Sunday - Thursday: 8:00 AM - 6:00 PM'}
                </p>
                <Button className="w-full">
                  {language === 'ar' ? 'اتصل الآن' : 'Call Now'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  {language === 'ar' ? 'الدعم عبر البريد الإلكتروني' : 'Email Support'}
                </CardTitle>
                <CardDescription>
                  {language === 'ar' ? 'احصل على إجابة خلال 24 ساعة' : 'Get a response within 24 hours'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-medium mb-2">support@constructionplatform.com</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {language === 'ar' ? 'نرد على جميع الرسائل خلال يوم عمل واحد' : 'We respond to all emails within one business day'}
                </p>
                <Button className="w-full" onClick={onContactSupport}>
                  {language === 'ar' ? 'إرسال رسالة' : 'Send Message'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {language === 'ar' ? 'جلسة تدريب شخصية' : 'Personal Training Session'}
                </CardTitle>
                <CardDescription>
                  {language === 'ar' ? 'احجز جلسة تدريب مع خبير' : 'Book a training session with an expert'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {language === 'ar' 
                    ? 'احصل على تدريب شخصي لفريقك لمدة 60 دقيقة'
                    : 'Get personalized training for your team in a 60-minute session'
                  }
                </p>
                <Button className="w-full" onClick={onBookTraining}>
                  {language === 'ar' ? 'احجز جلسة' : 'Book Session'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Article Dialog */}
      {selectedArticle && (
        <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {language === 'ar' ? selectedArticle.titleAr : selectedArticle.title}
              </DialogTitle>
              <DialogDescription>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="secondary">
                    {language === 'ar' ? selectedArticle.categoryAr : selectedArticle.category}
                  </Badge>
                  {getDifficultyBadge(selectedArticle.difficulty)}
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="h-3 w-3" />
                    {selectedArticle.readTime} {language === 'ar' ? 'دقائق' : 'min read'}
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
            <div className="mt-6">
              <div className="prose max-w-none">
                {language === 'ar' ? selectedArticle.contentAr : selectedArticle.content}
              </div>
              <Separator className="my-6" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button size="sm" variant="outline">
                    <Star className="h-4 w-4 mr-2" />
                    {language === 'ar' ? 'تقييم' : 'Rate'}
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    {language === 'ar' ? 'تحميل PDF' : 'Download PDF'}
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'آخر تحديث:' : 'Last updated:'} {selectedArticle.lastUpdated.toLocaleDateString()}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Video Dialog */}
      {selectedVideo && (
        <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {language === 'ar' ? selectedVideo.titleAr : selectedVideo.title}
              </DialogTitle>
              <DialogDescription>
                {language === 'ar' ? selectedVideo.descriptionAr : selectedVideo.description}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-6">
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <Play className="h-16 w-16 text-primary mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    {language === 'ar' ? 'مشغل الفيديو' : 'Video Player'} - {formatDuration(selectedVideo.duration)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {getDifficultyBadge(selectedVideo.difficulty)}
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {selectedVideo.rating}
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedVideo.views.toLocaleString()} {language === 'ar' ? 'مشاهدة' : 'views'}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}