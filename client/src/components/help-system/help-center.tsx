import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Book, 
  Video, 
  MessageCircle, 
  Phone, 
  Calendar,
  Star,
  ThumbsUp,
  ThumbsDown,
  Download,
  Play,
  FileText,
  HelpCircle,
  ChevronRight,
  Clock,
  User
} from 'lucide-react';

export interface HelpArticle {
  id: string;
  title: string;
  titleAr: string;
  content: string;
  contentAr: string;
  category: string;
  categoryAr: string;
  tags: string[];
  tagsAr: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  lastUpdated: Date;
  views: number;
  rating: number;
  helpful: number;
  notHelpful: number;
}

export interface VideoTutorial {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: number;
  category: string;
  categoryAr: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  views: number;
  rating: number;
  instructor: string;
  instructorAr: string;
  createdAt: Date;
}

export interface FAQ {
  id: string;
  question: string;
  questionAr: string;
  answer: string;
  answerAr: string;
  category: string;
  categoryAr: string;
  popularity: number;
  lastUpdated: Date;
}

export interface HelpCenterProps {
  articles: HelpArticle[];
  videos: VideoTutorial[];
  faqs: FAQ[];
  onArticleView?: (articleId: string) => void;
  onVideoPlay?: (videoId: string) => void;
  onContactSupport?: () => void;
  onBookTraining?: () => void;
  onFeedback?: (type: 'helpful' | 'not-helpful', itemId: string, itemType: 'article' | 'video' | 'faq') => void;
  className?: string;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner': return 'bg-green-100 text-green-800';
    case 'intermediate': return 'bg-yellow-100 text-yellow-800';
    case 'advanced': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getDifficultyText = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner': return 'مبتدئ';
    case 'intermediate': return 'متوسط';
    case 'advanced': return 'متقدم';
    default: return difficulty;
  }
};

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export function HelpCenter({
  articles,
  videos,
  faqs,
  onArticleView,
  onVideoPlay,
  onContactSupport,
  onBookTraining,
  onFeedback,
  className = ''
}: HelpCenterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('articles');

  const categories = useMemo(() => {
    const cats = new Set<string>();
    [...articles, ...videos, ...faqs].forEach(item => {
      if (item.categoryAr) cats.add(item.categoryAr);
    });
    return Array.from(cats);
  }, [articles, videos, faqs]);

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesSearch = searchTerm === '' || 
        article.titleAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.contentAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tagsAr.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || article.categoryAr === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || article.difficulty === selectedDifficulty;
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [articles, searchTerm, selectedCategory, selectedDifficulty]);

  const filteredVideos = useMemo(() => {
    return videos.filter(video => {
      const matchesSearch = searchTerm === '' || 
        video.titleAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.descriptionAr.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || video.categoryAr === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || video.difficulty === selectedDifficulty;
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [videos, searchTerm, selectedCategory, selectedDifficulty]);

  const filteredFAQs = useMemo(() => {
    return faqs.filter(faq => {
      const matchesSearch = searchTerm === '' || 
        faq.questionAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answerAr.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || faq.categoryAr === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [faqs, searchTerm, selectedCategory]);

  const handleFeedback = (type: 'helpful' | 'not-helpful', itemId: string, itemType: 'article' | 'video' | 'faq') => {
    onFeedback?.(type, itemId, itemType);
  };

  return (
    <div className={`help-center bg-white rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b bg-gradient-to-r from-primary to-secondary text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 text-right">مركز المساعدة والتدريب</h1>
          <p className="text-lg opacity-90 text-right">
            دليلك الشامل لاستخدام نظام إدارة شركات المقاولات
          </p>
          
          <div className="mt-6 relative">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="ابحث في المقالات والفيديوهات والأسئلة الشائعة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-12 h-12 text-lg bg-white/10 border-white/20 text-white placeholder:text-white/70"
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-6 border-b bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onContactSupport}>
              <CardContent className="p-4 text-center">
                <MessageCircle className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-medium text-sm">تواصل مع الدعم</h3>
                <p className="text-xs text-gray-600 mt-1">متاح 24/7</p>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onBookTraining}>
              <CardContent className="p-4 text-center">
                <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-medium text-sm">حجز جلسة تدريب</h3>
                <p className="text-xs text-gray-600 mt-1">تدريب شخصي</p>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <Phone className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-medium text-sm">الدعم الهاتفي</h3>
                <p className="text-xs text-gray-600 mt-1">+967 1 234 567</p>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <Download className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-medium text-sm">دليل المستخدم</h3>
                <p className="text-xs text-gray-600 mt-1">PDF كامل</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">جميع الفئات</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">جميع المستويات</option>
            <option value="beginner">مبتدئ</option>
            <option value="intermediate">متوسط</option>
            <option value="advanced">متقدم</option>
          </select>
          
          <Badge variant="secondary" className="text-sm">
            النتائج: {filteredArticles.length + filteredVideos.length + filteredFAQs.length}
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="articles" className="flex items-center gap-2">
              <Book className="h-4 w-4" />
              المقالات ({filteredArticles.length})
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              الفيديوهات ({filteredVideos.length})
            </TabsTrigger>
            <TabsTrigger value="faqs" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              الأسئلة الشائعة ({filteredFAQs.length})
            </TabsTrigger>
          </TabsList>
          
          {/* Articles Tab */}
          <TabsContent value="articles">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredArticles.map(article => (
                <Card key={article.id} className="cursor-pointer hover:shadow-lg transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-right mb-2">
                          {article.titleAr}
                        </CardTitle>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getDifficultyColor(article.difficulty)}>
                            {getDifficultyText(article.difficulty)}
                          </Badge>
                          <Badge variant="outline">{article.categoryAr}</Badge>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="h-3 w-3" />
                            {article.estimatedTime} دقيقة
                          </div>
                        </div>
                      </div>
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-gray-600 text-right text-sm mb-4 line-clamp-3">
                      {article.contentAr.substring(0, 150)}...
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {article.rating.toFixed(1)}
                        </div>
                        <div>{article.views} مشاهدة</div>
                      </div>
                      
                      <Button 
                        size="sm" 
                        onClick={() => onArticleView?.(article.id)}
                        className="gap-2"
                      >
                        قراءة المقال
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <Separator className="my-3" />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {article.tagsAr.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFeedback('helpful', article.id, 'article')}
                          className="h-6 px-2"
                        >
                          <ThumbsUp className="h-3 w-3" />
                          {article.helpful}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFeedback('not-helpful', article.id, 'article')}
                          className="h-6 px-2"
                        >
                          <ThumbsDown className="h-3 w-3" />
                          {article.notHelpful}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Videos Tab */}
          <TabsContent value="videos">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map(video => (
                <Card key={video.id} className="cursor-pointer hover:shadow-lg transition-all">
                  <div className="relative">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.titleAr}
                      className="w-full h-40 object-cover rounded-t-lg"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-t-lg">
                      <Button
                        size="lg"
                        onClick={() => onVideoPlay?.(video.id)}
                        className="rounded-full h-12 w-12 p-0"
                      >
                        <Play className="h-6 w-6" />
                      </Button>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {formatDuration(video.duration)}
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-medium text-right mb-2">{video.titleAr}</h3>
                    <p className="text-sm text-gray-600 text-right mb-3 line-clamp-2">
                      {video.descriptionAr}
                    </p>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={getDifficultyColor(video.difficulty)}>
                        {getDifficultyText(video.difficulty)}
                      </Badge>
                      <Badge variant="outline">{video.categoryAr}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {video.instructorAr}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {video.rating.toFixed(1)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* FAQs Tab */}
          <TabsContent value="faqs">
            <div className="space-y-4">
              {filteredFAQs.map(faq => (
                <Card key={faq.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-medium text-right flex-1">
                        {faq.questionAr}
                      </h3>
                      <Badge variant="outline">{faq.categoryAr}</Badge>
                    </div>
                    
                    <p className="text-gray-600 text-right mb-4 leading-relaxed">
                      {faq.answerAr}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        آخر تحديث: {faq.lastUpdated.toLocaleDateString('ar-YE')}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFeedback('helpful', faq.id, 'faq')}
                          className="h-6 px-2"
                        >
                          <ThumbsUp className="h-3 w-3" />
                          مفيد
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFeedback('not-helpful', faq.id, 'faq')}
                          className="h-6 px-2"
                        >
                          <ThumbsDown className="h-3 w-3" />
                          غير مفيد
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Footer */}
      <div className="border-t bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600 mb-4">
            لا تجد ما تبحث عنه؟ فريق الدعم الفني متاح لمساعدتك
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button onClick={onContactSupport} className="gap-2">
              <MessageCircle className="h-4 w-4" />
              تواصل معنا
            </Button>
            <Button variant="outline" onClick={onBookTraining} className="gap-2">
              <Calendar className="h-4 w-4" />
              احجز تدريب
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}