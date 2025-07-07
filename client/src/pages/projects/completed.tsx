import { useQuery } from "@tanstack/react-query";
import { Filter, CheckCircle, Calendar, TrendingUp, Award } from "lucide-react";
import { GlassmorphicCard, GlassContent, GlassHeader } from "@/components/glassmorphic-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export default function CompletedProjects() {
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects?companyId=1&status=completed'],
  });

  const completedProjects = projects?.filter(p => p.status === 'completed') || [];

  return (
    <PageLayout
      titleAr="المشاريع المكتملة"
      descriptionAr="جميع المشاريع المنجزة بنجاح"
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
                <p className="text-sm font-medium text-gray-600">إجمالي المشاريع المكتملة</p>
                <p className="text-2xl font-bold text-green-600">{completedProjects.length}</p>
              </div>
              <div className="h-12 w-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </GlassContent>
        </GlassmorphicCard>

        <GlassmorphicCard>
          <GlassContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">معدل النجاح</p>
                <p className="text-2xl font-bold text-green-600">100%</p>
              </div>
              <div className="h-12 w-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </GlassContent>
        </GlassmorphicCard>

        <GlassmorphicCard>
          <GlassContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">القيمة الإجمالية</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(completedProjects.reduce((sum, p) => sum + p.budget, 0))}
                </p>
              </div>
              <div className="h-12 w-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
            </div>
          </GlassContent>
        </GlassmorphicCard>

        <GlassmorphicCard>
          <GlassContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">متوسط المدة</p>
                <p className="text-2xl font-bold text-primary">
                  {completedProjects.length > 0 ? Math.round(
                    completedProjects.reduce((sum, p) => {
                      const start = new Date(p.startDate);
                      const end = new Date(p.endDate);
                      return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
                    }, 0) / completedProjects.length
                  ) : 0} يوم
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </GlassContent>
        </GlassmorphicCard>
      </div>

      {/* Completed Projects List */}
      <GlassmorphicCard>
        <GlassHeader>
          <h2 className="text-xl font-bold text-charcoal-text">المشاريع المكتملة</h2>
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
              {completedProjects.map((project) => (
                <div key={project.id} className="p-6 bg-white bg-opacity-60 rounded-lg hover-glass transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-charcoal-text mb-1">
                        {project.nameAr}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{project.locationAr}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>تم الإنجاز في: {formatArabicDate(project.endDate, 'short')}</span>
                        <span>المدة: {Math.round((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24))} يوم</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="mb-2 bg-green-500/20 text-green-700 border-green-200">
                        مكتمل
                      </Badge>
                      <p className="text-lg font-bold text-primary">
                        {formatCurrency(project.budget)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-600">مشروع مكتمل بنجاح</span>
                    </div>
                    <Button variant="outline" size="sm">
                      عرض التفاصيل
                    </Button>
                  </div>
                </div>
              ))}
              
              {completedProjects.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">لا توجد مشاريع مكتملة حالياً</p>
                </div>
              )}
            </div>
          )}
        </GlassContent>
      </GlassmorphicCard>
    </PageLayout>
  );
}