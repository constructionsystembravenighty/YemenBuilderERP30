import { z } from "zod";

// IFRS 15 Revenue Recognition Types
export interface IFRSProgressBilling {
  contractValue: number;
  contractCurrency: string;
  costsIncurredToDate: number;
  estimatedTotalCosts: number;
  percentageComplete: number;
  revenueRecognized: number;
  billingToDate: number;
  overbilling: number;
  underbilling: number;
  retainage: number;
  changeOrders: number;
}

export interface PercentageOfCompletion {
  method: 'cost-to-cost' | 'units-of-delivery' | 'labor-hours' | 'physical-progress';
  percentageComplete: number;
  revenueThisPeriod: number;
  cumulativeRevenue: number;
  grossProfit: number;
  grossProfitPercentage: number;
  estimatedGrossProfit: number;
  forecastToComplete: number;
}

export interface WIPSchedule {
  projectId: number;
  projectName: string;
  contractValue: number;
  costsIncurred: number;
  estimatedCosts: number;
  percentComplete: number;
  earnedRevenue: number;
  billedToDate: number;
  overbilledAmount: number;
  underbilledAmount: number;
  retainageWithheld: number;
  forecastProfit: number;
  varianceToOriginal: number;
}

// Multi-Currency Support
export interface CurrencyEngine {
  baseCurrency: 'YER' | 'USD' | 'EUR' | 'GBP' | 'SAR' | 'AED';
  exchangeRates: Map<string, ExchangeRate>;
  updateFrequency: 'real-time' | 'daily' | 'weekly';
  historicalRates: ExchangeHistory[];
  conversionPrecision: number;
}

export interface ExchangeRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  lastUpdated: Date;
  source: 'central-bank' | 'commercial-bank' | 'market-rate';
  volatilityIndex: number;
}

export interface ExchangeHistory {
  date: Date;
  rates: Record<string, number>;
  dailyVolatility: Record<string, number>;
}

// Global Localization Types
export interface RegionalCompliance {
  countryCode: string;
  region: 'MENA' | 'APAC' | 'EMEA' | 'AMERICAS';
  buildingCodes: LocalBuildingCode[];
  taxRegulations: TaxRegulation[];
  laborLaws: LaborLaw[];
  environmentalStandards: EnvironmentalStandard[];
  safetyStandards: SafetyStandard[];
}

export interface LocalBuildingCode {
  name: string;
  nameLocal: string;
  version: string;
  mandatoryCompliance: boolean;
  certificationRequired: boolean;
  inspectionRequirements: string[];
  penalties: PenaltyStructure[];
}

export interface TaxRegulation {
  taxType: 'VAT' | 'GST' | 'Sales' | 'Income' | 'Property' | 'Municipal';
  rate: number;
  applicablePhases: string[];
  exemptions: string[];
  reportingFrequency: 'monthly' | 'quarterly' | 'annual';
}

export interface PenaltyStructure {
  violationType: string;
  penaltyAmount: number;
  penaltyCurrency: string;
  escalationStructure: string[];
}

// Advanced Analytics Types
export interface ProjectAnalytics {
  budgetVarianceAnalysis: BudgetVariance[];
  scheduleVarianceAnalysis: ScheduleVariance[];
  riskAssessment: RiskFactor[];
  performanceKPIs: ProjectKPI[];
  predictedOutcome: ProjectPrediction;
  benchmarkComparison: BenchmarkData[];
}

export interface BudgetVariance {
  category: string;
  budgeted: number;
  actual: number;
  variance: number;
  variancePercentage: number;
  trend: 'improving' | 'stable' | 'declining';
  forecastToComplete: number;
}

export interface ScheduleVariance {
  task: string;
  plannedStart: Date;
  actualStart: Date;
  plannedEnd: Date;
  forecastEnd: Date;
  daysVariance: number;
  criticalPath: boolean;
  impactOnProject: 'none' | 'low' | 'medium' | 'high';
}

export interface RiskFactor {
  category: 'financial' | 'schedule' | 'quality' | 'safety' | 'regulatory';
  description: string;
  probability: number; // 0-1
  impact: number; // 0-1
  riskScore: number;
  mitigationPlan: string;
  status: 'identified' | 'mitigating' | 'resolved' | 'materialized';
}

export interface ProjectKPI {
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  performanceRating: 'excellent' | 'good' | 'fair' | 'poor';
  industryBenchmark: number;
}

export interface ProjectPrediction {
  finalCost: number;
  finalDuration: number;
  profitMargin: number;
  completionDate: Date;
  confidenceLevel: number;
  keyRisks: string[];
  recommendations: string[];
}

export interface BenchmarkData {
  metric: string;
  projectValue: number;
  industryAverage: number;
  topQuartile: number;
  bottomQuartile: number;
  ranking: 'top-10%' | 'top-25%' | 'average' | 'below-average' | 'bottom-25%';
}

// Enhanced Cost Estimation Types
export interface GlobalCostEstimation {
  region: string;
  country: string;
  city?: string;
  projectType: string;
  materialCosts: MaterialCostBreakdown;
  laborCosts: LaborCostBreakdown;
  equipmentCosts: EquipmentCostBreakdown;
  overheadCosts: OverheadCostBreakdown;
  contingency: number;
  profitMargin: number;
  localFactors: LocalCostFactor[];
}

export interface MaterialCostBreakdown {
  concrete: number;
  steel: number;
  lumber: number;
  electrical: number;
  plumbing: number;
  finishes: number;
  specialtyItems: Record<string, number>;
  priceVolatility: Record<string, number>;
  supplierReliability: Record<string, number>;
}

export interface LaborCostBreakdown {
  engineers: number;
  foremen: number;
  skilledWorkers: number;
  generalWorkers: number;
  specialists: Record<string, number>;
  productivityFactors: Record<string, number>;
  unionRates: boolean;
  overtimeRates: Record<string, number>;
}

export interface EquipmentCostBreakdown {
  heavyMachinery: number;
  tools: number;
  vehicles: number;
  temporaryStructures: number;
  safetyEquipment: number;
  utilizationRates: Record<string, number>;
  depreciationRates: Record<string, number>;
}

export interface OverheadCostBreakdown {
  generalAdmin: number;
  insurance: number;
  bonds: number;
  permits: number;
  utilities: number;
  supervision: number;
  temporaryFacilities: number;
}

export interface LocalCostFactor {
  factor: string;
  multiplier: number;
  description: string;
  reliability: 'high' | 'medium' | 'low';
  lastUpdated: Date;
}

// Validation Schemas
export const IFRSProgressBillingSchema = z.object({
  contractValue: z.number().positive(),
  contractCurrency: z.enum(['YER', 'USD', 'EUR', 'GBP', 'SAR', 'AED']),
  costsIncurredToDate: z.number().min(0),
  estimatedTotalCosts: z.number().positive(),
  percentageComplete: z.number().min(0).max(100),
  revenueRecognized: z.number().min(0),
  billingToDate: z.number().min(0),
  overbilling: z.number().min(0),
  underbilling: z.number().min(0),
  retainage: z.number().min(0),
  changeOrders: z.number(),
});

export const CurrencyEngineSchema = z.object({
  baseCurrency: z.enum(['YER', 'USD', 'EUR', 'GBP', 'SAR', 'AED']),
  exchangeRates: z.record(z.object({
    fromCurrency: z.string(),
    toCurrency: z.string(),
    rate: z.number().positive(),
    lastUpdated: z.date(),
    source: z.enum(['central-bank', 'commercial-bank', 'market-rate']),
    volatilityIndex: z.number().min(0).max(1),
  })),
  updateFrequency: z.enum(['real-time', 'daily', 'weekly']),
  conversionPrecision: z.number().int().min(2).max(8),
});

export type IFRSProgressBillingInput = z.infer<typeof IFRSProgressBillingSchema>;
export type CurrencyEngineInput = z.infer<typeof CurrencyEngineSchema>;