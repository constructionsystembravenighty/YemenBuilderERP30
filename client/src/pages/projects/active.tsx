import { useQuery } from "@tanstack/react-query";
import { Filter, Calendar, Clock, TrendingUp } from "lucide-react";
import { GlassmorphicCard, GlassContent, GlassHeader } from "@/components/glassmorphic-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageLayout } from "@/components/navigation/page-header";
import { formatCurrency } from "@/lib/currency";
import { formatArabicDate } from "@/lib/arabic-utils";

interface Project {
  id: number;
  name: string;
  nameAr: string;
  status: string;
  progress: number;
  budget: number;
  startDate: string;
  endDate: string;
  location: string;
  locationAr: string;
}

export default function ActiveProjects() {
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects?companyId=1&status=active'],
  });

  const activeProjects = projects?.filter(p => p.status === 'active') || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-700 border-green-200';
      case 'planning': return 'bg-blue-500/20 text-blue-700 border-blue-200';
      case 'completed': return 'bg-gray-500/20 text-gray-700 border-gray-200';
      case 'on_hold': return 'bg-yellow-500/20 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-500/20 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-500/20 text-green-700 border-green-200';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-200';
    }
  };

  return (
    <PageLayout
      titleAr="المشاريع النشطة"
      descriptionAr="جميع المشاريع قيد التنفيذ"
      customActions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 ml-2" />
            فلترة
          </Button>
        </div>
      }
    >
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassmorphicCard>
          <GlassContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي المشاريع النشطة</p>
                <p className="text-2xl font-bold text-primary">{activeProjects.length}</p>
              </div>
              <div className="h-12 w-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </GlassContent>
        </GlassmorphicCard>

        <GlassmorphicCard>
          <GlassContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">متوسط التقدم</p>
                <p className="text-2xl font-bold text-primary">
                  {activeProjects.length > 0 
                    ? Math.round(activeProjects.reduce((sum, p) => sum + p.progress, 0) / activeProjects.length)
                    : 0}%
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </GlassContent>
        </GlassmorphicCard>

        <GlassmorphicCard>
          <GlassContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">الميزانية الإجمالية</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(activeProjects.reduce((sum, p) => sum + p.budget, 0))}
                </p>
              </div>
              <div className="h-12 w-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-accent" />
              </div>
            </div>
          </GlassContent>
        </GlassmorphicCard>

        <GlassmorphicCard>
          <GlassContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">المشاريع المتأخرة</p>
                <p className="text-2xl font-bold text-red-600">
                  {activeProjects.filter(p => new Date(p.endDate) < new Date()).length}
                </p>
              </div>
              <div className="h-12 w-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </GlassContent>
        </GlassmorphicCard>
      </div>

      {/* Active Projects List */}
      <GlassmorphicCard>
        <GlassHeader>
          <h2 className="text-xl font-bold text-charcoal-text">المشاريع النشطة</h2>
        </GlassHeader>
        <GlassContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {activeProjects.map((project) => (
                <div key={project.id} className="p-6 bg-white bg-opacity-60 rounded-lg hover-glass transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-charcoal-text mb-1">
                        {project.nameAr}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{project.locationAr}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>البداية: {formatArabicDate(project.startDate, 'short')}</span>
                        <span>النهاية: {formatArabicDate(project.endDate, 'short')}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`mb-2 ${getStatusColor(project.status)}`}>
                        نشط
                      </Badge>
                      <p className="text-lg font-bold text-primary">
                        {formatCurrency(project.budget)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">التقدم</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                </div>
              ))}
              
              {activeProjects.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">لا توجد مشاريع نشطة حالياً</p>
                </div>
              )}
            </div>
          )}
        </GlassContent>
      </GlassmorphicCard>
    </PageLayout>
  );
}