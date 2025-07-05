import { Transaction, Project } from "@shared/schema";

// Yemen Construction Market Rates (in YER)
export const MARKET_RATES = {
  // Materials (per unit)
  materials: {
    cement: { price: 4500, unit: 'bag_50kg' }, // YER per 50kg bag
    steel: { price: 280000, unit: 'ton' }, // YER per ton
    sand: { price: 8000, unit: 'm3' }, // YER per cubic meter
    gravel: { price: 12000, unit: 'm3' },
    blocks: { price: 150, unit: 'piece' }, // concrete blocks
    tiles: { price: 4500, unit: 'm2' },
    paint: { price: 8500, unit: 'gallon' },
    doors: { price: 85000, unit: 'piece' },
    windows: { price: 45000, unit: 'm2' }
  },
  
  // Labor rates (per day in YER)
  labor: {
    engineer: 15000,
    foreman: 12000,
    skilled_worker: 8000,
    general_worker: 6000,
    driver: 7000,
    electrician: 10000,
    plumber: 9000,
    painter: 7500
  },
  
  // Equipment rental (per day in YER)
  equipment: {
    excavator: 45000,
    crane: 65000,
    mixer: 25000,
    truck: 20000,
    generator: 15000,
    compactor: 18000,
    scaffolding: 500 // per m2 per day
  },
  
  // Project type multipliers
  complexity: {
    simple: 1.0,
    medium: 1.3,
    complex: 1.8,
    luxury: 2.5
  },
  
  // Location multipliers for Yemen
  location: {
    sanaa: 1.0,
    aden: 1.1,
    taiz: 0.9,
    hodeidah: 0.95,
    ibb: 0.85,
    remote: 1.4
  }
};

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
  timeline: number; // estimated days
}

export interface ProjectInsight {
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  costOptimization: string[];
  timelineOptimization: string[];
  budgetStatus: 'on_track' | 'over_budget' | 'under_budget';
  scheduleStatus: 'on_time' | 'delayed' | 'ahead';
}

export interface FinancialTrend {
  monthlyTrends: Array<{
    month: string;
    income: number;
    expenses: number;
    profit: number;
    profitMargin: number;
  }>;
  insights: string[];
  alerts: Array<{
    type: 'warning' | 'info' | 'success';
    message: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  projections: {
    nextMonthRevenue: number;
    nextMonthExpenses: number;
    yearEndProjection: number;
  };
}

export class BusinessIntelligenceEngine {
  
  /**
   * Professional Cost Calculation Engine
   * Uses actual Yemen market rates and construction industry standards
   */
  calculateProjectCost(
    projectType: string,
    area: number, // in square meters
    location: string,
    complexity: 'simple' | 'medium' | 'complex' | 'luxury',
    specifications: string[]
  ): CostEstimate {
    
    // Base calculations per square meter
    const baseRates = this.getBaseRates(projectType);
    const locationMultiplier = this.getLocationMultiplier(location);
    const complexityMultiplier = MARKET_RATES.complexity[complexity];
    
    // Calculate material costs
    const materialCost = this.calculateMaterialCosts(projectType, area, specifications);
    
    // Calculate labor costs
    const laborCost = this.calculateLaborCosts(projectType, area, complexity);
    
    // Calculate equipment costs
    const equipmentCost = this.calculateEquipmentCosts(projectType, area);
    
    // Calculate overhead (15-25% of total)
    const subtotal = materialCost + laborCost + equipmentCost;
    const overhead = subtotal * 0.20; // 20% overhead
    
    // Apply multipliers
    const totalBeforeMultipliers = subtotal + overhead;
    const finalCost = totalBeforeMultipliers * locationMultiplier * complexityMultiplier;
    
    // Estimate timeline
    const timeline = this.calculateTimeline(projectType, area, complexity);
    
    // Calculate confidence based on project parameters
    const confidence = this.calculateConfidence(projectType, specifications);
    
    // Generate cost factors
    const factors = this.generateCostFactors(location, complexity, specifications);
    
    return {
      estimatedCost: Math.round(finalCost),
      breakdown: {
        materials: Math.round(materialCost * locationMultiplier * complexityMultiplier),
        labor: Math.round(laborCost * locationMultiplier * complexityMultiplier),
        equipment: Math.round(equipmentCost * locationMultiplier * complexityMultiplier),
        overhead: Math.round(overhead * locationMultiplier * complexityMultiplier)
      },
      confidence,
      factors,
      timeline
    };
  }

  /**
   * Business Rules Engine for Project Analysis
   */
  analyzeProject(
    project: Project,
    transactions: Transaction[],
    currentDate: Date = new Date()
  ): ProjectInsight {
    
    const recommendations: string[] = [];
    const costOptimization: string[] = [];
    const timelineOptimization: string[] = [];
    
    // Analyze budget performance
    const budgetSpent = parseFloat(project.spent || "0");
    const totalBudget = parseFloat(project.budget || "0");
    const budgetUtilization = totalBudget > 0 ? (budgetSpent / totalBudget) : 0;
    
    // Analyze timeline performance
    const startDate = new Date(project.startDate || currentDate);
    const endDate = new Date(project.endDate || currentDate);
    const totalDuration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const elapsed = Math.ceil((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const timeUtilization = totalDuration > 0 ? (elapsed / totalDuration) : 0;
    
    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    
    if (budgetUtilization > 0.9 || timeUtilization > 0.9) {
      riskLevel = 'high';
      recommendations.push('المشروع يتطلب مراجعة فورية للميزانية والجدولة');
    } else if (budgetUtilization > 0.7 || timeUtilization > 0.7) {
      riskLevel = 'medium';
      recommendations.push('يُنصح بمراقبة التقدم عن كثب');
    }
    
    // Generate cost optimization suggestions
    if (budgetUtilization > 0.6) {
      costOptimization.push('مراجعة تكاليف المواد والبحث عن موردين بديلين');
      costOptimization.push('تحسين إدارة المخزون لتقليل الهدر');
    }
    
    // Generate timeline optimization suggestions
    const projectProgress = project.progress || 0;
    if (timeUtilization > projectProgress / 100) {
      timelineOptimization.push('زيادة عدد العمال في المراحل الحرجة');
      timelineOptimization.push('استخدام معدات إضافية لتسريع العمل');
    }
    
    // Determine budget and schedule status
    const budgetStatus = budgetUtilization > 1.1 ? 'over_budget' : 
                        budgetUtilization < 0.9 ? 'under_budget' : 'on_track';
    
    const expectedProgress = timeUtilization * 100;
    const scheduleStatus = projectProgress < expectedProgress - 10 ? 'delayed' :
                          projectProgress > expectedProgress + 10 ? 'ahead' : 'on_time';
    
    return {
      riskLevel,
      recommendations,
      costOptimization,
      timelineOptimization,
      budgetStatus,
      scheduleStatus
    };
  }

  /**
   * Statistical Analysis Engine for Financial Trends
   */
  analyzeFinancialTrends(transactions: Transaction[]): FinancialTrend {
    // Group transactions by month
    const monthlyData = this.groupTransactionsByMonth(transactions);
    
    // Calculate trends
    const monthlyTrends = monthlyData.map(month => ({
      month: month.month,
      income: month.income,
      expenses: month.expenses,
      profit: month.income - month.expenses,
      profitMargin: month.income > 0 ? ((month.income - month.expenses) / month.income) * 100 : 0
    }));
    
    // Generate insights
    const insights = this.generateFinancialInsights(monthlyTrends);
    
    // Generate alerts
    const alerts = this.generateFinancialAlerts(monthlyTrends);
    
    // Calculate projections
    const projections = this.calculateFinancialProjections(monthlyTrends);
    
    return {
      monthlyTrends,
      insights,
      alerts,
      projections
    };
  }

  // Helper methods
  private getBaseRates(projectType: string): { material: number; labor: number; equipment: number } {
    const rates = {
      residential: { material: 45000, labor: 25000, equipment: 8000 }, // per m2
      commercial: { material: 65000, labor: 35000, equipment: 12000 },
      industrial: { material: 85000, labor: 45000, equipment: 18000 },
      infrastructure: { material: 95000, labor: 55000, equipment: 25000 }
    };
    
    return rates[projectType as keyof typeof rates] || rates.residential;
  }

  private getLocationMultiplier(location: string): number {
    const normalizedLocation = location.toLowerCase();
    
    if (normalizedLocation.includes('صنعاء') || normalizedLocation.includes('sanaa')) return MARKET_RATES.location.sanaa;
    if (normalizedLocation.includes('عدن') || normalizedLocation.includes('aden')) return MARKET_RATES.location.aden;
    if (normalizedLocation.includes('تعز') || normalizedLocation.includes('taiz')) return MARKET_RATES.location.taiz;
    if (normalizedLocation.includes('الحديدة') || normalizedLocation.includes('hodeidah')) return MARKET_RATES.location.hodeidah;
    if (normalizedLocation.includes('إب') || normalizedLocation.includes('ibb')) return MARKET_RATES.location.ibb;
    
    return MARKET_RATES.location.remote; // Default for remote locations
  }

  private calculateMaterialCosts(projectType: string, area: number, specifications: string[]): number {
    const baseRates = this.getBaseRates(projectType);
    let materialCost = baseRates.material * area;
    
    // Adjust for specifications
    specifications.forEach(spec => {
      if (spec.includes('luxury') || spec.includes('فاخر')) materialCost *= 1.4;
      if (spec.includes('earthquake') || spec.includes('زلزال')) materialCost *= 1.2;
      if (spec.includes('insulation') || spec.includes('عزل')) materialCost *= 1.15;
    });
    
    return materialCost;
  }

  private calculateLaborCosts(projectType: string, area: number, complexity: string): number {
    const baseRates = this.getBaseRates(projectType);
    const complexityMultiplier = MARKET_RATES.complexity[complexity as keyof typeof MARKET_RATES.complexity];
    
    return baseRates.labor * area * complexityMultiplier;
  }

  private calculateEquipmentCosts(projectType: string, area: number): number {
    const baseRates = this.getBaseRates(projectType);
    return baseRates.equipment * area;
  }

  private calculateTimeline(projectType: string, area: number, complexity: string): number {
    // Base timeline calculation (days per square meter)
    const baseTimeline = {
      residential: 0.8,
      commercial: 1.2,
      industrial: 1.8,
      infrastructure: 2.5
    };
    
    const timePerM2 = baseTimeline[projectType as keyof typeof baseTimeline] || baseTimeline.residential;
    const complexityMultiplier = MARKET_RATES.complexity[complexity as keyof typeof MARKET_RATES.complexity];
    
    return Math.ceil(area * timePerM2 * complexityMultiplier);
  }

  private calculateConfidence(projectType: string, specifications: string[]): number {
    let confidence = 0.9; // Base confidence
    
    // Reduce confidence for complex specifications
    if (specifications.length > 5) confidence -= 0.1;
    if (specifications.some(spec => spec.includes('custom') || spec.includes('مخصص'))) confidence -= 0.15;
    
    return Math.max(0.6, confidence);
  }

  private generateCostFactors(location: string, complexity: string, specifications: string[]): string[] {
    const factors = [
      `موقع المشروع: ${location}`,
      `مستوى التعقيد: ${complexity}`,
      'أسعار السوق اليمني الحالية'
    ];
    
    if (specifications.length > 0) {
      factors.push(`متطلبات خاصة: ${specifications.slice(0, 2).join(', ')}`);
    }
    
    return factors;
  }

  private groupTransactionsByMonth(transactions: Transaction[]) {
    const monthlyData: { [key: string]: { month: string; income: number; expenses: number } } = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.transactionDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey, income: 0, expenses: 0 };
      }
      
      const amount = parseFloat(transaction.amount);
      if (transaction.type === 'income') {
        monthlyData[monthKey].income += amount;
      } else if (transaction.type === 'expense') {
        monthlyData[monthKey].expenses += amount;
      }
    });
    
    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  }

  private generateFinancialInsights(trends: any[]): string[] {
    const insights: string[] = [];
    
    if (trends.length < 2) return ['يحتاج المزيد من البيانات لتحليل الاتجاهات'];
    
    const latest = trends[trends.length - 1];
    const previous = trends[trends.length - 2];
    
    // Revenue trend
    if (latest.income > previous.income) {
      insights.push(`زيادة في الإيرادات بنسبة ${((latest.income - previous.income) / previous.income * 100).toFixed(1)}%`);
    } else {
      insights.push(`انخفاض في الإيرادات بنسبة ${((previous.income - latest.income) / previous.income * 100).toFixed(1)}%`);
    }
    
    // Profit margin analysis
    if (latest.profitMargin > 15) {
      insights.push('هامش ربح ممتاز - أداء مالي قوي');
    } else if (latest.profitMargin > 5) {
      insights.push('هامش ربح مقبول - يمكن تحسينه');
    } else {
      insights.push('هامش ربح منخفض - يتطلب مراجعة التكاليف');
    }
    
    return insights;
  }

  private generateFinancialAlerts(trends: any[]) {
    const alerts: any[] = [];
    const latest = trends[trends.length - 1];
    
    if (latest.profitMargin < 5) {
      alerts.push({
        type: 'warning',
        message: 'هامش الربح منخفض جداً - مراجعة فورية مطلوبة',
        severity: 'high'
      });
    }
    
    if (latest.expenses > latest.income * 0.8) {
      alerts.push({
        type: 'warning',
        message: 'المصروفات مرتفعة نسبة للإيرادات',
        severity: 'medium'
      });
    }
    
    return alerts;
  }

  private calculateFinancialProjections(trends: any[]) {
    if (trends.length < 3) {
      return {
        nextMonthRevenue: trends[trends.length - 1]?.income || 0,
        nextMonthExpenses: trends[trends.length - 1]?.expenses || 0,
        yearEndProjection: 0
      };
    }
    
    // Simple linear regression for projections
    const recentTrends = trends.slice(-3);
    const avgRevenue = recentTrends.reduce((sum, t) => sum + t.income, 0) / recentTrends.length;
    const avgExpenses = recentTrends.reduce((sum, t) => sum + t.expenses, 0) / recentTrends.length;
    
    return {
      nextMonthRevenue: Math.round(avgRevenue),
      nextMonthExpenses: Math.round(avgExpenses),
      yearEndProjection: Math.round((avgRevenue - avgExpenses) * 12)
    };
  }
}

export const businessIntelligence = new BusinessIntelligenceEngine();