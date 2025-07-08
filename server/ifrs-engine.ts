import { IFRSProgressBilling, PercentageOfCompletion, WIPSchedule, ProjectAnalytics } from "@shared/ifrs-types";
import { Project } from "@shared/schema";

/**
 * IFRS 15 Revenue Recognition Engine
 * Professional implementation of percentage of completion method
 * for construction contracts following international standards
 */
export class IFRSRevenueEngine {
  
  /**
   * Calculate percentage of completion using cost-to-cost method
   * This is the most widely used method in construction industry
   */
  calculatePercentageOfCompletion(
    costsIncurredToDate: number,
    estimatedTotalCosts: number,
    method: 'cost-to-cost' | 'units-of-delivery' | 'labor-hours' | 'physical-progress' = 'cost-to-cost'
  ): number {
    if (estimatedTotalCosts <= 0) {
      throw new Error('Estimated total costs must be greater than zero');
    }
    
    switch (method) {
      case 'cost-to-cost':
        return Math.min((costsIncurredToDate / estimatedTotalCosts) * 100, 100);
      
      case 'units-of-delivery':
        // Implementation would vary based on specific deliverables
        return (costsIncurredToDate / estimatedTotalCosts) * 100;
        
      case 'labor-hours':
        // Based on labor hours completed vs. total estimated
        return (costsIncurredToDate / estimatedTotalCosts) * 100;
        
      case 'physical-progress':
        // Based on physical milestones achieved
        return (costsIncurredToDate / estimatedTotalCosts) * 100;
        
      default:
        return (costsIncurredToDate / estimatedTotalCosts) * 100;
    }
  }

  /**
   * Calculate revenue recognition according to IFRS 15
   */
  calculateRevenueRecognition(project: {
    contractValue: number;
    costsIncurredToDate: number;
    estimatedTotalCosts: number;
    revenueRecognizedToDate: number;
  }): PercentageOfCompletion {
    const percentageComplete = this.calculatePercentageOfCompletion(
      project.costsIncurredToDate,
      project.estimatedTotalCosts
    );

    const cumulativeRevenue = (project.contractValue * percentageComplete) / 100;
    const revenueThisPeriod = cumulativeRevenue - project.revenueRecognizedToDate;
    
    const grossProfit = cumulativeRevenue - project.costsIncurredToDate;
    const grossProfitPercentage = cumulativeRevenue > 0 ? (grossProfit / cumulativeRevenue) * 100 : 0;
    
    const estimatedGrossProfit = project.contractValue - project.estimatedTotalCosts;
    const forecastToComplete = project.estimatedTotalCosts - project.costsIncurredToDate;

    return {
      method: 'cost-to-cost',
      percentageComplete,
      revenueThisPeriod,
      cumulativeRevenue,
      grossProfit,
      grossProfitPercentage,
      estimatedGrossProfit,
      forecastToComplete,
    };
  }

  /**
   * Generate comprehensive WIP (Work in Progress) schedule
   */
  generateWIPSchedule(projects: Array<{
    id: number;
    name: string;
    contractValue: number;
    costsIncurredToDate: number;
    estimatedTotalCosts: number;
    billingToDate: number;
    revenueRecognizedToDate: number;
  }>): WIPSchedule[] {
    return projects.map(project => {
      const revenueCalc = this.calculateRevenueRecognition(project);
      const billingVariance = project.billingToDate - revenueCalc.cumulativeRevenue;
      const retainageWithheld = project.billingToDate * 0.05; // Assume 5% retainage
      
      return {
        projectId: project.id,
        projectName: project.name,
        contractValue: project.contractValue,
        costsIncurred: project.costsIncurredToDate,
        estimatedCosts: project.estimatedTotalCosts,
        percentComplete: revenueCalc.percentageComplete,
        earnedRevenue: revenueCalc.cumulativeRevenue,
        billedToDate: project.billingToDate,
        overbilledAmount: Math.max(billingVariance, 0),
        underbilledAmount: Math.max(-billingVariance, 0),
        retainageWithheld,
        forecastProfit: revenueCalc.estimatedGrossProfit,
        varianceToOriginal: project.estimatedTotalCosts - project.contractValue,
      };
    });
  }

  /**
   * Calculate progress billing amounts
   */
  calculateProgressBilling(project: {
    contractValue: number;
    costsIncurredToDate: number;
    estimatedTotalCosts: number;
    billingToDate: number;
    contractCurrency: string;
  }): IFRSProgressBilling {
    const revenueCalc = this.calculateRevenueRecognition(project);
    const billingVariance = project.billingToDate - revenueCalc.cumulativeRevenue;
    
    return {
      contractValue: project.contractValue,
      contractCurrency: project.contractCurrency,
      costsIncurredToDate: project.costsIncurredToDate,
      estimatedTotalCosts: project.estimatedTotalCosts,
      percentageComplete: revenueCalc.percentageComplete,
      revenueRecognized: revenueCalc.cumulativeRevenue,
      billingToDate: project.billingToDate,
      overbilling: Math.max(billingVariance, 0),
      underbilling: Math.max(-billingVariance, 0),
      retainage: project.billingToDate * 0.05, // Standard 5% retainage
      changeOrders: 0, // Would be calculated from change order table
    };
  }

  /**
   * Detect potential losses and calculate loss recognition
   */
  calculateLossRecognition(project: {
    contractValue: number;
    costsIncurredToDate: number;
    estimatedTotalCosts: number;
  }): {
    hasLoss: boolean;
    lossAmount: number;
    lossPercentage: number;
    recommendedAction: string;
  } {
    const projectedTotalCost = project.estimatedTotalCosts;
    const expectedLoss = projectedTotalCost - project.contractValue;
    
    if (expectedLoss > 0) {
      return {
        hasLoss: true,
        lossAmount: expectedLoss,
        lossPercentage: (expectedLoss / project.contractValue) * 100,
        recommendedAction: 'Recognize full loss immediately per IFRS 15 requirements',
      };
    }
    
    return {
      hasLoss: false,
      lossAmount: 0,
      lossPercentage: 0,
      recommendedAction: 'Continue normal percentage of completion recognition',
    };
  }

  /**
   * Calculate change order impact on revenue recognition
   */
  calculateChangeOrderImpact(
    originalContract: number,
    approvedChangeOrders: number,
    pendingChangeOrders: number,
    probabilityOfApproval: number = 0.7
  ): {
    revisedContractValue: number;
    conservativeContractValue: number;
    changeOrderRisk: 'low' | 'medium' | 'high';
  } {
    const revisedContractValue = originalContract + approvedChangeOrders + pendingChangeOrders;
    const conservativeContractValue = originalContract + approvedChangeOrders + (pendingChangeOrders * probabilityOfApproval);
    
    const changeOrderPercentage = (approvedChangeOrders + pendingChangeOrders) / originalContract;
    let changeOrderRisk: 'low' | 'medium' | 'high' = 'low';
    
    if (changeOrderPercentage > 0.2) {
      changeOrderRisk = 'high';
    } else if (changeOrderPercentage > 0.1) {
      changeOrderRisk = 'medium';
    }
    
    return {
      revisedContractValue,
      conservativeContractValue,
      changeOrderRisk,
    };
  }

  /**
   * Generate compliance report for IFRS 15
   */
  generateComplianceReport(projects: WIPSchedule[]): {
    totalContracts: number;
    totalRevenue: number;
    totalCosts: number;
    totalOverbilling: number;
    totalUnderbilling: number;
    averageCompletion: number;
    riskProjects: WIPSchedule[];
    complianceStatus: 'compliant' | 'minor-issues' | 'major-issues';
  } {
    const totalContracts = projects.length;
    const totalRevenue = projects.reduce((sum, p) => sum + p.earnedRevenue, 0);
    const totalCosts = projects.reduce((sum, p) => sum + p.costsIncurred, 0);
    const totalOverbilling = projects.reduce((sum, p) => sum + p.overbilledAmount, 0);
    const totalUnderbilling = projects.reduce((sum, p) => sum + p.underbilledAmount, 0);
    const averageCompletion = projects.reduce((sum, p) => sum + p.percentComplete, 0) / totalContracts;
    
    // Identify risk projects (>20% over budget or <5% profit margin)
    const riskProjects = projects.filter(p => 
      p.varianceToOriginal > p.contractValue * 0.2 ||
      p.forecastProfit < p.contractValue * 0.05
    );
    
    let complianceStatus: 'compliant' | 'minor-issues' | 'major-issues' = 'compliant';
    if (riskProjects.length > totalContracts * 0.3) {
      complianceStatus = 'major-issues';
    } else if (riskProjects.length > totalContracts * 0.1) {
      complianceStatus = 'minor-issues';
    }
    
    return {
      totalContracts,
      totalRevenue,
      totalCosts,
      totalOverbilling,
      totalUnderbilling,
      averageCompletion,
      riskProjects,
      complianceStatus,
    };
  }
}

export const ifrsEngine = new IFRSRevenueEngine();