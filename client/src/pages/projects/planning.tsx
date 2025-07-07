import { useQuery } from "@tanstack/react-query";
import { Filter, Clock, Calendar, MapPin, DollarSign } from "lucide-react";
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

export default function PlanningProjects() {
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects?companyId=1&status=planning'],
  });

  const planningProjects = projects?.filter(p => p.status === 'planning') || [];

  return (
    <PageLayout
      titleAr="المشاريع قيد التخطيط"
      descriptionAr="المشاريع في مرحلة التخطيط والإعداد"
      customActions={
        <div className="flex gap-2">
          <Button size="sm">
            <Clock className="h-4 w-4 ml-2" />
            بدء مشروع
          </Button>
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
                <p className="text-sm font-medium text-gray-600">إجمالي المشاريع قيد التخطيط</p>
                <p className="text-2xl font-bold text-blue-600">{planningProjects.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </GlassContent>
        </GlassmorphicCard>

        <GlassmorphicCard>
          <GlassContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">الميزانية المخططة</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(planningProjects.reduce((sum, p) => sum + p.budget, 0))}
                </p>
              </div>
              <div className="h-12 w-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-accent" />
              </div>
            </div>
          </GlassContent>
        </GlassmorphicCard>

        <GlassmorphicCard>
          <GlassContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">متوسط التخطيط</p>
                <p className="text-2xl font-bold text-primary">
                  {planningProjects.length > 0 
                    ? Math.round(planningProjects.reduce((sum, p) => sum + p.progress, 0) / planningProjects.length)
                    : 0}%
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </GlassContent>
        </GlassmorphicCard>

        <GlassmorphicCard>
          <GlassContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">جاهز للبدء</p>
                <p className="text-2xl font-bold text-green-600">
                  {planningProjects.filter(p => p.progress >= 80).length}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </GlassContent>
        </GlassmorphicCard>
      </div>

      {/* Planning Projects List */}
      <GlassmorphicCard>
        <GlassHeader>
          <h2 className="text-xl font-bold text-charcoal-text">المشاريع قيد التخطيط</h2>
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
              {planningProjects.map((project) => (
                <div key={project.id} className="p-6 bg-white bg-opacity-60 rounded-lg hover-glass transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-charcoal-text mb-1">
                        {project.nameAr}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <MapPin className="h-4 w-4" />
                        {project.locationAr}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>البداية المخططة: {formatArabicDate(project.startDate, 'short')}</span>
                        <span>النهاية المتوقعة: {formatArabicDate(project.endDate, 'short')}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="mb-2 bg-blue-500/20 text-blue-700 border-blue-200">
                        قيد التخطيط
                      </Badge>
                      <p className="text-lg font-bold text-primary">
                        {formatCurrency(project.budget)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">التخطيط:</span>
                        <span className="text-sm font-medium">{project.progress}%</span>
                      </div>
                      {project.progress >= 80 && (
                        <Badge className="bg-green-500/20 text-green-700 border-green-200">
                          جاهز للبدء
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        تعديل الخطة
                      </Button>
                      {project.progress >= 80 && (
                        <Button size="sm">
                          بدء المشروع
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {planningProjects.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">لا توجد مشاريع قيد التخطيط حالياً</p>
                </div>
              )}
            </div>
          )}
        </GlassContent>
      </GlassmorphicCard>
    </PageLayout>
  );
}