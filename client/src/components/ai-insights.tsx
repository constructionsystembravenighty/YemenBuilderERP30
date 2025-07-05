import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign,
  Calendar,
  Target,
  Lightbulb
} from "lucide-react";
import { GlassmorphicCard, GlassContent, GlassHeader } from "./glassmorphic-card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/currency";
import { formatArabicDate } from "@/lib/arabic-utils";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface CostEstimate {
  estimatedCost: number;
  breakdown: {
    materials: number;
    labor: number;
    equipment: number;
    overhead: number;
  };
  confidence: number;
  factors: string[];
}

interface ProjectInsight {
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  costOptimization: string[];
  timelineOptimization: string[];
}

interface AIInsightsProps {
  projectId?: number;
  companyId: number;
}

export function AIInsights({ projectId, companyId }: AIInsightsProps) {
  const { toast } = useToast();
  const [costEstimateOpen, setCostEstimateOpen] = useState(false);

  // Fetch project insights if projectId is provided
  const { data: projectInsights, isLoading: insightsLoading } = useQuery<ProjectInsight>({
    queryKey: ['/api/intelligence/project-insights', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      const response = await fetch(`/api/intelligence/project-insights`, {
        method: 'POST',
        body: JSON.stringify({ projectId }),
        headers: { 'Content-Type': 'application/json' }
      });
      return response.json();
    },
    enabled: !!projectId
  });

  // Fetch financial trends
  const { data: financialTrends, isLoading: trendsLoading } = useQuery<{
    monthlyTrends: any[];
    insights: string[];
  }>({
    queryKey: ['/api/intelligence/financial-trends', companyId],
    queryFn: async () => {
      const response = await fetch(`/api/intelligence/financial-trends?companyId=${companyId}`);
      return response.json();
    }
  });

  // Cost estimation mutation
  const costEstimateMutation = useMutation<CostEstimate, Error, {
    projectType: string;
    area: string;
    location: string;
    complexity: string;
    specifications: string[];
  }>({
    mutationFn: async (data) => {
      const response = await fetch('/api/intelligence/cost-estimation', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم إنشاء التقدير",
        description: "تم إنشاء تقدير التكلفة بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في إنشاء تقدير التكلفة",
        variant: "destructive",
      });
    }
  });

  const handleCostEstimate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const specifications = (formData.get('specifications') as string || '').split(',').filter(s => s.trim());
    const data = {
      projectType: formData.get('projectType') as string,
      area: formData.get('area') as string,
      location: formData.get('location') as string,
      complexity: formData.get('complexity') as string,
      specifications,
    };
    costEstimateMutation.mutate(data);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-500/20 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-500/20 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-500/20 text-green-700 border-green-200';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <GlassmorphicCard>
        <GlassHeader 
          title="Business Intelligence" 
          titleAr="ذكاء الأعمال"
          action={
            <Dialog open={costEstimateOpen} onOpenChange={setCostEstimateOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <BarChart3 className="h-4 w-4 ml-2" />
                  تقدير التكلفة
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md" dir="rtl">
                <DialogHeader>
                  <DialogTitle>حاسبة تقدير التكلفة المهنية</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCostEstimate} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">نوع المشروع</label>
                    <Select name="projectType" required>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع المشروع" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="residential">سكني</SelectItem>
                        <SelectItem value="commercial">تجاري</SelectItem>
                        <SelectItem value="infrastructure">بنية تحتية</SelectItem>
                        <SelectItem value="industrial">صناعي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">المساحة (متر مربع)</label>
                    <Input
                      name="area"
                      type="number"
                      placeholder="500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">الموقع</label>
                    <Input
                      name="location"
                      placeholder="صنعاء، عدن، إلخ..."
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">مستوى التعقيد</label>
                    <Select name="complexity" required>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر مستوى التعقيد" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simple">بسيط</SelectItem>
                        <SelectItem value="medium">متوسط</SelectItem>
                        <SelectItem value="complex">معقد</SelectItem>
                        <SelectItem value="luxury">فاخر</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">متطلبات خاصة (اختياري)</label>
                    <Input
                      name="specifications"
                      placeholder="عزل، مقاوم للزلازل، إلخ... (مفصولة بفاصلة)"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={costEstimateMutation.isPending}
                  >
                    {costEstimateMutation.isPending ? "جاري الحساب..." : "حساب التكلفة"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          }
        />
        <GlassContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Insights */}
            {projectId && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  تحليل المشروع
                </h3>
                
                {insightsLoading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  </div>
                ) : projectInsights ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">مستوى المخاطر:</span>
                      <Badge className={getRiskColor(projectInsights.riskLevel)}>
                        {projectInsights.riskLevel === 'high' ? 'عالي' : 
                         projectInsights.riskLevel === 'medium' ? 'متوسط' : 'منخفض'}
                      </Badge>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                        <Lightbulb className="h-4 w-4" />
                        التوصيات
                      </h4>
                      <ul className="text-sm space-y-1">
                        {projectInsights.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 mt-0.5 text-green-600 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
            
            {/* Financial Trends */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                الاتجاهات المالية
              </h3>
              
              {trendsLoading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              ) : financialTrends ? (
                <div className="space-y-3">
                  {financialTrends.insights.map((insight: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                      <AlertTriangle className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                      <span className="text-sm">{insight}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          
          {/* Cost Estimate Results */}
          {costEstimateMutation.data && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
              <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                تقدير التكلفة
              </h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <span className="text-sm text-gray-600">التكلفة الإجمالية</span>
                  <p className="text-lg font-bold text-primary">
                    {formatCurrency(costEstimateMutation.data.estimatedCost)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">المواد</span>
                  <p className="font-semibold">
                    {formatCurrency(costEstimateMutation.data.breakdown.materials)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">العمالة</span>
                  <p className="font-semibold">
                    {formatCurrency(costEstimateMutation.data.breakdown.labor)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">المعدات</span>
                  <p className="font-semibold">
                    {formatCurrency(costEstimateMutation.data.breakdown.equipment)}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">مستوى الثقة:</span>
                  <Badge variant="outline">
                    {Math.round(costEstimateMutation.data.confidence * 100)}%
                  </Badge>
                </div>
                
                <div>
                  <span className="text-sm font-medium">العوامل المؤثرة:</span>
                  <ul className="text-sm mt-1 space-y-1">
                    {costEstimateMutation.data.factors.map((factor: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </GlassContent>
      </GlassmorphicCard>
    </div>
  );
}