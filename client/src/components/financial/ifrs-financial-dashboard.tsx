import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calculator, 
  FileText, 
  Calendar,
  BarChart3,
  PieChart,
  Download,
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface FinancialStatement {
  period: string;
  periodAr: string;
  startDate: Date;
  endDate: Date;
  balanceSheet: {
    assets: {
      currentAssets: {
        cash: number;
        accountsReceivable: number;
        inventory: number;
        prepaidExpenses: number;
        total: number;
      };
      nonCurrentAssets: {
        propertyPlantEquipment: number;
        intangibleAssets: number;
        investments: number;
        total: number;
      };
      totalAssets: number;
    };
    liabilities: {
      currentLiabilities: {
        accountsPayable: number;
        shortTermDebt: number;
        accruedExpenses: number;
        total: number;
      };
      nonCurrentLiabilities: {
        longTermDebt: number;
        deferredTax: number;
        provisions: number;
        total: number;
      };
      totalLiabilities: number;
    };
    equity: {
      shareCapital: number;
      retainedEarnings: number;
      reserves: number;
      total: number;
    };
  };
  incomeStatement: {
    revenue: {
      contractRevenue: number;
      serviceRevenue: number;
      otherRevenue: number;
      total: number;
    };
    costOfSales: {
      materials: number;
      labor: number;
      subcontractors: number;
      equipment: number;
      overhead: number;
      total: number;
    };
    grossProfit: number;
    operatingExpenses: {
      administrative: number;
      selling: number;
      general: number;
      total: number;
    };
    operatingProfit: number;
    financialExpenses: number;
    profitBeforeTax: number;
    incomeTax: number;
    netProfit: number;
  };
  cashFlow: {
    operatingActivities: {
      netIncome: number;
      depreciation: number;
      workingCapitalChanges: number;
      total: number;
    };
    investingActivities: {
      equipmentPurchases: number;
      assetDisposals: number;
      investments: number;
      total: number;
    };
    financingActivities: {
      loanProceeds: number;
      loanRepayments: number;
      dividends: number;
      total: number;
    };
    netCashFlow: number;
    cashBeginning: number;
    cashEnding: number;
  };
}

interface FinancialRatios {
  liquidity: {
    currentRatio: number;
    quickRatio: number;
    cashRatio: number;
  };
  profitability: {
    grossProfitMargin: number;
    operatingProfitMargin: number;
    netProfitMargin: number;
    returnOnAssets: number;
    returnOnEquity: number;
  };
  efficiency: {
    assetTurnover: number;
    receivablesTurnover: number;
    inventoryTurnover: number;
    payablesTurnover: number;
  };
  leverage: {
    debtToAssets: number;
    debtToEquity: number;
    interestCoverage: number;
    timesInterestEarned: number;
  };
}

interface ComplianceCheck {
  id: string;
  standard: string;
  standardAr: string;
  requirement: string;
  requirementAr: string;
  status: 'compliant' | 'non_compliant' | 'partial' | 'pending';
  lastChecked: Date;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  notes?: string;
  notesAr?: string;
}

// Sample data for demonstration
const sampleFinancialStatement: FinancialStatement = {
  period: 'Q4 2024',
  periodAr: 'الربع الرابع 2024',
  startDate: new Date('2024-10-01'),
  endDate: new Date('2024-12-31'),
  balanceSheet: {
    assets: {
      currentAssets: {
        cash: 850000,
        accountsReceivable: 420000,
        inventory: 180000,
        prepaidExpenses: 35000,
        total: 1485000,
      },
      nonCurrentAssets: {
        propertyPlantEquipment: 2100000,
        intangibleAssets: 150000,
        investments: 200000,
        total: 2450000,
      },
      totalAssets: 3935000,
    },
    liabilities: {
      currentLiabilities: {
        accountsPayable: 320000,
        shortTermDebt: 180000,
        accruedExpenses: 95000,
        total: 595000,
      },
      nonCurrentLiabilities: {
        longTermDebt: 1200000,
        deferredTax: 85000,
        provisions: 120000,
        total: 1405000,
      },
      totalLiabilities: 2000000,
    },
    equity: {
      shareCapital: 1000000,
      retainedEarnings: 835000,
      reserves: 100000,
      total: 1935000,
    },
  },
  incomeStatement: {
    revenue: {
      contractRevenue: 3200000,
      serviceRevenue: 450000,
      otherRevenue: 80000,
      total: 3730000,
    },
    costOfSales: {
      materials: 1200000,
      labor: 980000,
      subcontractors: 420000,
      equipment: 180000,
      overhead: 220000,
      total: 3000000,
    },
    grossProfit: 730000,
    operatingExpenses: {
      administrative: 180000,
      selling: 95000,
      general: 125000,
      total: 400000,
    },
    operatingProfit: 330000,
    financialExpenses: 85000,
    profitBeforeTax: 245000,
    incomeTax: 49000,
    netProfit: 196000,
  },
  cashFlow: {
    operatingActivities: {
      netIncome: 196000,
      depreciation: 180000,
      workingCapitalChanges: -45000,
      total: 331000,
    },
    investingActivities: {
      equipmentPurchases: -220000,
      assetDisposals: 45000,
      investments: -50000,
      total: -225000,
    },
    financingActivities: {
      loanProceeds: 200000,
      loanRepayments: -150000,
      dividends: -80000,
      total: -30000,
    },
    netCashFlow: 76000,
    cashBeginning: 774000,
    cashEnding: 850000,
  },
};

const sampleComplianceChecks: ComplianceCheck[] = [
  {
    id: '1',
    standard: 'IFRS 15',
    standardAr: 'معيار التقرير المالي الدولي 15',
    requirement: 'Revenue Recognition',
    requirementAr: 'الاعتراف بالإيرادات',
    status: 'compliant',
    lastChecked: new Date('2024-12-15'),
    priority: 'high',
    notes: 'All contract revenue properly recognized',
    notesAr: 'تم الاعتراف بجميع إيرادات العقود بشكل صحيح',
  },
  {
    id: '2',
    standard: 'IFRS 16',
    standardAr: 'معيار التقرير المالي الدولي 16',
    requirement: 'Lease Accounting',
    requirementAr: 'محاسبة عقود الإيجار',
    status: 'partial',
    lastChecked: new Date('2024-11-30'),
    dueDate: new Date('2025-01-31'),
    priority: 'medium',
    notes: 'Equipment leases need review',
    notesAr: 'تحتاج عقود إيجار المعدات لمراجعة',
  },
  {
    id: '3',
    standard: 'IAS 16',
    standardAr: 'معيار المحاسبة الدولي 16',
    requirement: 'Property, Plant & Equipment',
    requirementAr: 'الممتلكات والمصانع والمعدات',
    status: 'compliant',
    lastChecked: new Date('2024-12-10'),
    priority: 'high',
    notes: 'Asset depreciation up to date',
    notesAr: 'إهلاك الأصول محدث',
  },
  {
    id: '4',
    standard: 'IFRS 9',
    standardAr: 'معيار التقرير المالي الدولي 9',
    requirement: 'Financial Instruments',
    requirementAr: 'الأدوات المالية',
    status: 'pending',
    lastChecked: new Date('2024-10-15'),
    dueDate: new Date('2025-02-28'),
    priority: 'critical',
    notes: 'Expected credit loss model needs implementation',
    notesAr: 'يحتاج نموذج الخسائر الائتمانية المتوقعة للتطبيق',
  },
];

export function IFRSFinancialDashboard({ companyId }: { companyId: number }) {
  const [selectedPeriod, setSelectedPeriod] = useState('Q4-2024');
  const [selectedView, setSelectedView] = useState<'summary' | 'detailed'>('summary');

  // In a real application, these would fetch from the API
  const { data: financialData = sampleFinancialStatement } = useQuery({
    queryKey: [`/api/financial/statements?companyId=${companyId}&period=${selectedPeriod}`],
    queryFn: () => Promise.resolve(sampleFinancialStatement),
  });

  const { data: complianceData = sampleComplianceChecks } = useQuery({
    queryKey: [`/api/financial/compliance?companyId=${companyId}`],
    queryFn: () => Promise.resolve(sampleComplianceChecks),
  });

  // Calculate financial ratios
  const ratios: FinancialRatios = {
    liquidity: {
      currentRatio: financialData.balanceSheet.assets.currentAssets.total / financialData.balanceSheet.liabilities.currentLiabilities.total,
      quickRatio: (financialData.balanceSheet.assets.currentAssets.total - financialData.balanceSheet.assets.currentAssets.inventory) / financialData.balanceSheet.liabilities.currentLiabilities.total,
      cashRatio: financialData.balanceSheet.assets.currentAssets.cash / financialData.balanceSheet.liabilities.currentLiabilities.total,
    },
    profitability: {
      grossProfitMargin: (financialData.incomeStatement.grossProfit / financialData.incomeStatement.revenue.total) * 100,
      operatingProfitMargin: (financialData.incomeStatement.operatingProfit / financialData.incomeStatement.revenue.total) * 100,
      netProfitMargin: (financialData.incomeStatement.netProfit / financialData.incomeStatement.revenue.total) * 100,
      returnOnAssets: (financialData.incomeStatement.netProfit / financialData.balanceSheet.assets.totalAssets) * 100,
      returnOnEquity: (financialData.incomeStatement.netProfit / financialData.balanceSheet.equity.total) * 100,
    },
    efficiency: {
      assetTurnover: financialData.incomeStatement.revenue.total / financialData.balanceSheet.assets.totalAssets,
      receivablesTurnover: financialData.incomeStatement.revenue.total / financialData.balanceSheet.assets.currentAssets.accountsReceivable,
      inventoryTurnover: financialData.incomeStatement.costOfSales.total / financialData.balanceSheet.assets.currentAssets.inventory,
      payablesTurnover: financialData.incomeStatement.costOfSales.total / financialData.balanceSheet.liabilities.currentLiabilities.accountsPayable,
    },
    leverage: {
      debtToAssets: (financialData.balanceSheet.liabilities.totalLiabilities / financialData.balanceSheet.assets.totalAssets) * 100,
      debtToEquity: (financialData.balanceSheet.liabilities.totalLiabilities / financialData.balanceSheet.equity.total) * 100,
      interestCoverage: financialData.incomeStatement.operatingProfit / financialData.incomeStatement.financialExpenses,
      timesInterestEarned: financialData.incomeStatement.operatingProfit / financialData.incomeStatement.financialExpenses,
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">التقارير المالية المتوافقة مع معايير IFRS</h1>
          <p className="text-gray-600 mt-1">إدارة مالية شاملة متوافقة مع المعايير الدولية</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Q4-2024">الربع الرابع 2024</SelectItem>
              <SelectItem value="Q3-2024">الربع الثالث 2024</SelectItem>
              <SelectItem value="Q2-2024">الربع الثاني 2024</SelectItem>
              <SelectItem value="Q1-2024">الربع الأول 2024</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedView} onValueChange={(value: any) => setSelectedView(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="summary">ملخص</SelectItem>
              <SelectItem value="detailed">مفصل</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 ml-1" />
            تصدير
          </Button>
        </div>
      </div>

      {/* Key Financial Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatCurrency(financialData.incomeStatement.revenue.total, 'YER')}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 ml-1">+12.5%</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">صافي الربح</p>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(financialData.incomeStatement.netProfit, 'YER')}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 ml-1">+8.3%</span>
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">إجمالي الأصول</p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatCurrency(financialData.balanceSheet.assets.totalAssets, 'YER')}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 ml-1">+5.2%</span>
                </div>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">هامش صافي الربح</p>
                <p className="text-2xl font-bold text-orange-900">
                  {ratios.profitability.netProfitMargin.toFixed(1)}%
                </p>
                <div className="flex items-center mt-1">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-600 ml-1">-1.2%</span>
                </div>
              </div>
              <PieChart className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="statements" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="statements">القوائم المالية</TabsTrigger>
          <TabsTrigger value="ratios">النسب المالية</TabsTrigger>
          <TabsTrigger value="compliance">الامتثال للمعايير</TabsTrigger>
          <TabsTrigger value="reports">التقارير</TabsTrigger>
        </TabsList>

        <TabsContent value="statements" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Balance Sheet */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  الميزانية العمومية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-green-700 mb-2">الأصول</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>الأصول المتداولة</span>
                      <span className="font-medium">{formatCurrency(financialData.balanceSheet.assets.currentAssets.total, 'YER')}</span>
                    </div>
                    <div className="flex justify-between ml-4">
                      <span>النقد والنقد المعادل</span>
                      <span>{formatCurrency(financialData.balanceSheet.assets.currentAssets.cash, 'YER')}</span>
                    </div>
                    <div className="flex justify-between ml-4">
                      <span>الذمم المدينة</span>
                      <span>{formatCurrency(financialData.balanceSheet.assets.currentAssets.accountsReceivable, 'YER')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>الأصول غير المتداولة</span>
                      <span className="font-medium">{formatCurrency(financialData.balanceSheet.assets.nonCurrentAssets.total, 'YER')}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-semibold">
                        <span>إجمالي الأصول</span>
                        <span>{formatCurrency(financialData.balanceSheet.assets.totalAssets, 'YER')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-red-700 mb-2">الخصوم وحقوق الملكية</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>الخصوم المتداولة</span>
                      <span className="font-medium">{formatCurrency(financialData.balanceSheet.liabilities.currentLiabilities.total, 'YER')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>الخصوم غير المتداولة</span>
                      <span className="font-medium">{formatCurrency(financialData.balanceSheet.liabilities.nonCurrentLiabilities.total, 'YER')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>حقوق الملكية</span>
                      <span className="font-medium">{formatCurrency(financialData.balanceSheet.equity.total, 'YER')}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Income Statement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  قائمة الدخل
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between font-semibold text-green-700">
                    <span>إجمالي الإيرادات</span>
                    <span>{formatCurrency(financialData.incomeStatement.revenue.total, 'YER')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>تكلفة المبيعات</span>
                    <span className="text-red-600">({formatCurrency(financialData.incomeStatement.costOfSales.total, 'YER')})</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-2">
                    <span>إجمالي الربح</span>
                    <span>{formatCurrency(financialData.incomeStatement.grossProfit, 'YER')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>المصروفات التشغيلية</span>
                    <span className="text-red-600">({formatCurrency(financialData.incomeStatement.operatingExpenses.total, 'YER')})</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>الربح التشغيلي</span>
                    <span>{formatCurrency(financialData.incomeStatement.operatingProfit, 'YER')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>المصروفات المالية</span>
                    <span className="text-red-600">({formatCurrency(financialData.incomeStatement.financialExpenses, 'YER')})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ضريبة الدخل</span>
                    <span className="text-red-600">({formatCurrency(financialData.incomeStatement.incomeTax, 'YER')})</span>
                  </div>
                  <div className="flex justify-between font-semibold text-green-700 border-t pt-2">
                    <span>صافي الربح</span>
                    <span>{formatCurrency(financialData.incomeStatement.netProfit, 'YER')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ratios" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Liquidity Ratios */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">نسب السيولة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">النسبة الجارية</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {ratios.liquidity.currentRatio.toFixed(2)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">النسبة السريعة</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {ratios.liquidity.quickRatio.toFixed(2)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">نسبة النقد</span>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    {ratios.liquidity.cashRatio.toFixed(2)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Profitability Ratios */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">نسب الربحية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">هامش إجمالي الربح</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {ratios.profitability.grossProfitMargin.toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">هامش الربح التشغيلي</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {ratios.profitability.operatingProfitMargin.toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">هامش صافي الربح</span>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    {ratios.profitability.netProfitMargin.toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">العائد على الأصول</span>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    {ratios.profitability.returnOnAssets.toFixed(1)}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Efficiency Ratios */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">نسب الكفاءة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">دوران الأصول</span>
                  <Badge variant="secondary" className="bg-cyan-100 text-cyan-800">
                    {ratios.efficiency.assetTurnover.toFixed(2)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">دوران الذمم المدينة</span>
                  <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                    {ratios.efficiency.receivablesTurnover.toFixed(1)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">دوران المخزون</span>
                  <Badge variant="secondary" className="bg-pink-100 text-pink-800">
                    {ratios.efficiency.inventoryTurnover.toFixed(1)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Leverage Ratios */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">نسب الرافعة المالية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">الدين إلى الأصول</span>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    {ratios.leverage.debtToAssets.toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">الدين إلى حقوق الملكية</span>
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    {ratios.leverage.debtToEquity.toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">تغطية الفوائد</span>
                  <Badge variant="secondary" className="bg-teal-100 text-teal-800">
                    {ratios.leverage.interestCoverage.toFixed(1)}x
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                الامتثال لمعايير IFRS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceData.map((check) => (
                  <div key={check.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs">
                          {check.standardAr}
                        </Badge>
                        <h3 className="font-medium">{check.requirementAr}</h3>
                        <Badge 
                          variant="secondary"
                          className={cn(
                            check.status === 'compliant' && "bg-green-100 text-green-800",
                            check.status === 'partial' && "bg-yellow-100 text-yellow-800",
                            check.status === 'non_compliant' && "bg-red-100 text-red-800",
                            check.status === 'pending' && "bg-gray-100 text-gray-800"
                          )}
                        >
                          {check.status === 'compliant' && 'متوافق'}
                          {check.status === 'partial' && 'جزئي'}
                          {check.status === 'non_compliant' && 'غير متوافق'}
                          {check.status === 'pending' && 'معلق'}
                        </Badge>
                        <Badge 
                          variant="outline"
                          className={cn(
                            check.priority === 'critical' && "border-red-500 text-red-700",
                            check.priority === 'high' && "border-orange-500 text-orange-700",
                            check.priority === 'medium' && "border-yellow-500 text-yellow-700",
                            check.priority === 'low' && "border-green-500 text-green-700"
                          )}
                        >
                          {check.priority === 'critical' && 'حرج'}
                          {check.priority === 'high' && 'عالي'}
                          {check.priority === 'medium' && 'متوسط'}
                          {check.priority === 'low' && 'منخفض'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{check.notesAr}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                        <span>آخر فحص: {format(check.lastChecked, 'dd/MM/yyyy', { locale: ar })}</span>
                        {check.dueDate && (
                          <span>تاريخ الاستحقاق: {format(check.dueDate, 'dd/MM/yyyy', { locale: ar })}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {check.status === 'compliant' && <CheckCircle className="h-5 w-5 text-green-600" />}
                      {check.status === 'partial' && <Clock className="h-5 w-5 text-yellow-600" />}
                      {check.status === 'non_compliant' && <AlertTriangle className="h-5 w-5 text-red-600" />}
                      {check.status === 'pending' && <Clock className="h-5 w-5 text-gray-600" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">تقرير الأرباح والخسائر</h3>
                <p className="text-sm text-gray-600 mb-4">تقرير مفصل لإيرادات ومصروفات الفترة</p>
                <Button size="sm" className="w-full">تحميل التقرير</Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">تقرير الميزانية العمومية</h3>
                <p className="text-sm text-gray-600 mb-4">موقف الأصول والخصوم وحقوق الملكية</p>
                <Button size="sm" className="w-full">تحميل التقرير</Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">تقرير التدفق النقدي</h3>
                <p className="text-sm text-gray-600 mb-4">تحليل مصادر واستخدامات النقد</p>
                <Button size="sm" className="w-full">تحميل التقرير</Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Calculator className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">تقرير النسب المالية</h3>
                <p className="text-sm text-gray-600 mb-4">تحليل شامل للنسب المالية الرئيسية</p>
                <Button size="sm" className="w-full">تحميل التقرير</Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Target className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">تقرير الامتثال للمعايير</h3>
                <p className="text-sm text-gray-600 mb-4">حالة الامتثال لمعايير IFRS</p>
                <Button size="sm" className="w-full">تحميل التقرير</Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Calendar className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">التقرير الربعي</h3>
                <p className="text-sm text-gray-600 mb-4">تقرير شامل للأداء المالي الربعي</p>
                <Button size="sm" className="w-full">تحميل التقرير</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}