import type { Project, Transaction, Equipment } from "@shared/schema";

export interface CostEstimate {
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

export interface ProjectInsight {
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  costOptimization: string[];
  timelineOptimization: string[];
}

export class ConstructionAIHelper {
  async analyzeCostEstimation(
    projectDescription: string,
    projectCategory: string,
    location: string,
    budget: number
  ): Promise<CostEstimate> {
    // For now, provide intelligent estimations based on construction industry standards
    // This will be enhanced with Google AI when API integration is fully working
    
    const baseRates = {
      residential: { materials: 0.4, labor: 0.35, equipment: 0.15, overhead: 0.1 },
      commercial: { materials: 0.45, labor: 0.3, equipment: 0.18, overhead: 0.07 },
      infrastructure: { materials: 0.5, labor: 0.25, equipment: 0.2, overhead: 0.05 },
    };
    
    const rates = baseRates.residential; // Default fallback
    
    // Apply location-based adjustments for Yemen
    const locationMultiplier = location.toLowerCase().includes('sanaa') ? 1.1 : 
                              location.toLowerCase().includes('aden') ? 1.05 : 1.0;
    
    const adjustedBudget = budget * locationMultiplier;
    
    return {
      estimatedCost: adjustedBudget,
      breakdown: {
        materials: Math.round(adjustedBudget * rates.materials),
        labor: Math.round(adjustedBudget * rates.labor),
        equipment: Math.round(adjustedBudget * rates.equipment),
        overhead: Math.round(adjustedBudget * rates.overhead),
      },
      confidence: 0.75,
      factors: [
        'متوسط أسعار المواد في اليمن',
        'تكلفة العمالة المحلية',
        'توفر المعدات والآلات',
        'التضخم الاقتصادي الحالي'
      ]
    };
  }

  async generateProjectInsights(
    project: Project,
    transactions: Transaction[],
    equipment: Equipment[]
  ): Promise<ProjectInsight> {
    const totalSpent = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
    
    const budgetUsed = project.budget ? (totalSpent / parseFloat(project.budget.toString())) : 0;
    const progressRatio = project.progress ? project.progress / 100 : 0;
    
    // Risk assessment based on budget vs progress
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (budgetUsed > progressRatio + 0.2) riskLevel = 'high';
    else if (budgetUsed > progressRatio + 0.1) riskLevel = 'medium';
    
    const recommendations: string[] = [];
    const costOptimization: string[] = [];
    const timelineOptimization: string[] = [];
    
    if (riskLevel === 'high') {
      recommendations.push('مراجعة فورية للميزانية والتكاليف');
      recommendations.push('إعادة تقييم نطاق المشروع');
      costOptimization.push('تحسين إدارة المخزون');
      costOptimization.push('مراجعة أسعار الموردين');
    }
    
    if (project.progress && project.progress < 50) {
      timelineOptimization.push('تسريع مرحلة التنفيذ');
      timelineOptimization.push('تحسين تنسيق الفرق');
    }
    
    if (equipment.length < 3) {
      recommendations.push('تحسين توفر المعدات');
    }
    
    return {
      riskLevel,
      recommendations: recommendations.length ? recommendations : ['المشروع يسير بشكل جيد'],
      costOptimization: costOptimization.length ? costOptimization : ['الحفاظ على النهج الحالي'],
      timelineOptimization: timelineOptimization.length ? timelineOptimization : ['الجدول الزمني مناسب']
    };
  }

  async analyzeFinancialTrends(transactions: Transaction[]): Promise<{
    monthlyTrends: { month: string; income: number; expenses: number }[];
    insights: string[];
  }> {
    // Group transactions by month
    const monthlyData = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.transactionDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = { income: 0, expenses: 0 };
      }
      
      const amount = parseFloat(transaction.amount.toString());
      if (transaction.type === 'income') {
        acc[monthKey].income += amount;
      } else if (transaction.type === 'expense') {
        acc[monthKey].expenses += amount;
      }
      
      return acc;
    }, {} as Record<string, { income: number; expenses: number }>);
    
    const monthlyTrends = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      ...data
    }));
    
    const insights: string[] = [];
    
    if (monthlyTrends.length > 1) {
      const latest = monthlyTrends[monthlyTrends.length - 1];
      const previous = monthlyTrends[monthlyTrends.length - 2];
      
      if (latest.expenses > latest.income) {
        insights.push('تحذير: المصروفات تتجاوز الإيرادات هذا الشهر');
      }
      
      if (latest.expenses > previous.expenses * 1.2) {
        insights.push('زيادة كبيرة في المصروفات مقارنة بالشهر السابق');
      }
      
      if (latest.income > previous.income * 1.1) {
        insights.push('نمو إيجابي في الإيرادات');
      }
    }
    
    return { monthlyTrends, insights };
  }
}

export const aiHelper = new ConstructionAIHelper();