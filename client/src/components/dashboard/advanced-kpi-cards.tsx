import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  Activity,
  Zap,
  BarChart3,
  PieChart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";

interface KPIData {
  title: string;
  titleAr: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ElementType;
  color: string;
  bgColor: string;
  target?: number;
  progress?: number;
  trend: number[];
}

const kpiData: KPIData[] = [
  {
    title: "Total Revenue",
    titleAr: "إجمالي الإيرادات",
    value: formatCurrency(28500000, 'YER'),
    change: 12.5,
    changeType: 'increase',
    icon: DollarSign,
    color: "text-green-600",
    bgColor: "bg-green-50",
    target: 30000000,
    progress: 95,
    trend: [65, 68, 70, 75, 82, 88, 95]
  },
  {
    title: "Active Projects",
    titleAr: "المشاريع النشطة",
    value: 8,
    change: 2,
    changeType: 'increase',
    icon: Target,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    target: 10,
    progress: 80,
    trend: [6, 7, 6, 8, 9, 8, 8]
  },
  {
    title: "Team Efficiency",
    titleAr: "كفاءة الفريق",
    value: "89%",
    change: 5.2,
    changeType: 'increase',
    icon: Users,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    target: 95,
    progress: 89,
    trend: [78, 82, 85, 87, 88, 89, 89]
  },
  {
    title: "Project Delays",
    titleAr: "تأخير المشاريع",
    value: 3,
    change: -1,
    changeType: 'decrease',
    icon: AlertTriangle,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    target: 0,
    progress: 25,
    trend: [6, 5, 4, 4, 3, 3, 3]
  },
  {
    title: "Cost Savings",
    titleAr: "توفير التكاليف",
    value: formatCurrency(2100000, 'YER'),
    change: 18.3,
    changeType: 'increase',
    icon: TrendingUp,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    target: 2500000,
    progress: 84,
    trend: [1200000, 1400000, 1600000, 1800000, 1900000, 2000000, 2100000]
  },
  {
    title: "Safety Score",
    titleAr: "نقاط السلامة",
    value: "96%",
    change: 2.1,
    changeType: 'increase',
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
    target: 100,
    progress: 96,
    trend: [92, 93, 94, 95, 95, 96, 96]
  }
];

export default function AdvancedKPICards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {kpiData.map((kpi, index) => (
        <Card key={index} className="glass-card border-0 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className={cn("p-2 rounded-lg", kpi.bgColor)}>
                <kpi.icon className={cn("h-5 w-5", kpi.color)} />
              </div>
              <TrendIndicator change={kpi.change} type={kpi.changeType} />
            </div>
            <CardTitle className="text-sm font-medium text-gray-600">
              {kpi.titleAr}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {/* Main Value */}
              <div className="flex items-baseline space-x-2 space-x-reverse">
                <span className="text-2xl font-bold text-primary">
                  {kpi.value}
                </span>
                {kpi.target && (
                  <span className="text-sm text-gray-500">
                    / {typeof kpi.target === 'number' && kpi.target > 1000000 
                      ? formatCurrency(kpi.target, 'YER')
                      : kpi.target
                    }
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              {kpi.progress && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>التقدم</span>
                    <span>{kpi.progress}%</span>
                  </div>
                  <Progress 
                    value={kpi.progress} 
                    className="h-2"
                    style={{
                      background: `linear-gradient(to right, ${kpi.color.replace('text-', 'bg-').replace('-600', '-200')} 0%, ${kpi.color.replace('text-', 'bg-').replace('-600', '-500')} 100%)`
                    }}
                  />
                </div>
              )}

              {/* Mini Trend Chart */}
              <div className="flex items-end space-x-1 h-8">
                {kpi.trend.map((value, idx) => {
                  const maxValue = Math.max(...kpi.trend);
                  const height = (value / maxValue) * 100;
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "flex-1 rounded-sm transition-all duration-200 hover:opacity-80",
                        kpi.changeType === 'increase' ? 'bg-green-200' : 
                        kpi.changeType === 'decrease' ? 'bg-red-200' : 'bg-gray-200'
                      )}
                      style={{ height: `${height}%` }}
                    />
                  );
                })}
              </div>

              {/* Action Button */}
              <Button
                variant="ghost"
                size="sm"
                className={cn("w-full mt-3 text-xs", kpi.color)}
              >
                <BarChart3 className="h-3 w-3 ml-1" />
                عرض التفاصيل
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TrendIndicator({ change, type }: { change: number; type: 'increase' | 'decrease' | 'neutral' }) {
  const isPositive = type === 'increase';
  const isNegative = type === 'decrease';
  
  return (
    <div className={cn(
      "flex items-center space-x-1 space-x-reverse px-2 py-1 rounded-full text-xs font-medium",
      isPositive && "bg-green-100 text-green-700",
      isNegative && "bg-red-100 text-red-700",
      type === 'neutral' && "bg-gray-100 text-gray-700"
    )}>
      {isPositive && <TrendingUp className="h-3 w-3" />}
      {isNegative && <TrendingDown className="h-3 w-3" />}
      {type === 'neutral' && <Activity className="h-3 w-3" />}
      <span>
        {isPositive && '+'}
        {change}%
      </span>
    </div>
  );
}