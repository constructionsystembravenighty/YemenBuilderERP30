import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { detectDevice, PERFORMANCE_CONFIG } from '../../lib/performance-config';
import { MobileOptimizedCard } from './mobile-optimized-card';
import { formatCurrency } from '../../lib/currency';
import { 
  BarChart, 
  LineChart, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Bar,
  Line
} from 'recharts';

export function UltraDashboard() {
  const device = detectDevice();
  
  // Ultra-optimized data fetching with smart caching
  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    staleTime: PERFORMANCE_CONFIG.CACHE_TTL.dynamic,
    refetchInterval: device.isMobile ? 30000 : 15000, // Less frequent on mobile to save battery
  });
  
  const { data: financialTrends } = useQuery({
    queryKey: ['/api/intelligence/financial-trends', { companyId: 1 }],
    staleTime: PERFORMANCE_CONFIG.CACHE_TTL.static,
  });
  
  // Dynamic grid layout based on device capabilities
  const gridLayout = useMemo(() => {
    if (device.isMobile) return 'grid-cols-1';
    if (device.isTablet) return 'grid-cols-2';
    if (device.is8K) return 'grid-cols-4';
    if (device.is4K) return 'grid-cols-3';
    return 'grid-cols-2';
  }, [device]);
  
  // Performance-optimized chart data
  const chartData = useMemo(() => {
    if (!financialTrends?.monthlyTrends) return [];
    return financialTrends.monthlyTrends.map(trend => ({
      month: trend.month,
      revenue: trend.income,
      expenses: trend.expenses,
      profit: trend.profit
    }));
  }, [financialTrends]);
  
  // KPI cards data with real-time formatting
  const kpiCards = useMemo(() => [
    {
      title: 'إجمالي الإيرادات',
      value: dashboardStats?.totalRevenue || 0,
      format: 'currency',
      trend: '+12%',
      priority: 'high' as const,
      color: 'text-green-400'
    },
    {
      title: 'إجمالي المصروفات', 
      value: dashboardStats?.totalExpenses || 0,
      format: 'currency',
      trend: '-3%',
      priority: 'medium' as const,
      color: 'text-red-400'
    },
    {
      title: 'المشاريع النشطة',
      value: dashboardStats?.activeProjects || 0,
      format: 'number',
      trend: '+2',
      priority: 'medium' as const,
      color: 'text-blue-400'
    },
    {
      title: 'إجمالي الموظفين',
      value: dashboardStats?.totalEmployees || 0,
      format: 'number',
      trend: '+5',
      priority: 'low' as const,
      color: 'text-purple-400'
    }
  ], [dashboardStats]);
  
  // Format values based on type
  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'currency':
        return formatCurrency(value);
      case 'number':
        return value.toLocaleString('ar');
      default:
        return value.toString();
    }
  };
  
  // Ultra-responsive chart configuration
  const chartConfig = {
    height: device.isMobile ? 250 : device.isTablet ? 300 : device.is4K ? 400 : 350,
    margin: { top: 5, right: 30, left: 20, bottom: 5 },
    animationDuration: PERFORMANCE_CONFIG.ANIMATION_DURATION
  };
  
  return (
    <div className="ultra-dashboard p-6 space-y-6" dir="rtl">
      {/* Performance indicator */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 left-4 bg-black/80 text-white text-xs px-2 py-1 rounded z-50">
          {device.width}x{device.height} | {device.pixelRatio}x | {device.isMobile ? 'Mobile' : device.isTablet ? 'Tablet' : 'Desktop'}
        </div>
      )}
      
      {/* KPI Cards Grid */}
      <div className={`grid ${gridLayout} gap-6`}>
        {kpiCards.map((kpi, index) => (
          <MobileOptimizedCard
            key={index}
            priority={kpi.priority}
            glow={kpi.priority === 'high'}
            loading={isLoading}
            className="transform-gpu"
          >
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-white/80">{kpi.title}</h3>
              <div className="flex items-end justify-between">
                <div>
                  <p className={`text-2xl font-bold ${kpi.color}`}>
                    {formatValue(kpi.value, kpi.format)}
                  </p>
                  <p className="text-xs text-white/60 mt-1">
                    {kpi.trend} من الشهر الماضي
                  </p>
                </div>
                <div className="w-12 h-8 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                  <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          </MobileOptimizedCard>
        ))}
      </div>
      
      {/* Charts Section */}
      <div className={`grid ${device.isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-6`}>
        {/* Revenue Chart */}
        <MobileOptimizedCard 
          blur="heavy"
          className="col-span-1"
          loading={!chartData.length}
        >
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">الاتجاهات المالية</h3>
            <ResponsiveContainer width="100%" height={chartConfig.height}>
              <LineChart
                data={chartData}
                margin={chartConfig.margin}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="month" 
                  stroke="rgba(255,255,255,0.7)"
                  fontSize={device.isMobile ? 10 : 12}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.7)"
                  fontSize={device.isMobile ? 10 : 12}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                  labelFormatter={(label) => `الشهر: ${label}`}
                  formatter={(value: any, name: string) => [
                    formatCurrency(Number(value)),
                    name === 'revenue' ? 'الإيرادات' : name === 'expenses' ? 'المصروفات' : 'الربح'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                  animationDuration={chartConfig.animationDuration}
                />
                <Line 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#EF4444" 
                  strokeWidth={3}
                  dot={{ fill: '#EF4444', strokeWidth: 2, r: 6 }}
                  animationDuration={chartConfig.animationDuration}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </MobileOptimizedCard>
        
        {/* Project Status Chart */}
        <MobileOptimizedCard 
          blur="heavy"
          className="col-span-1"
          loading={!chartData.length}
        >
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">أرباح المشاريع</h3>
            <ResponsiveContainer width="100%" height={chartConfig.height}>
              <BarChart
                data={chartData}
                margin={chartConfig.margin}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="month" 
                  stroke="rgba(255,255,255,0.7)"
                  fontSize={device.isMobile ? 10 : 12}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.7)"
                  fontSize={device.isMobile ? 10 : 12}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                  labelFormatter={(label) => `الشهر: ${label}`}
                  formatter={(value: any) => [formatCurrency(Number(value)), 'الربح الصافي']}
                />
                <Bar 
                  dataKey="profit" 
                  fill="url(#profitGradient)"
                  radius={[4, 4, 0, 0]}
                  animationDuration={chartConfig.animationDuration}
                />
                <defs>
                  <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#1E40AF" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </MobileOptimizedCard>
      </div>
      
      {/* Quick Actions for Mobile */}
      {device.isMobile && (
        <MobileOptimizedCard className="sticky bottom-4 z-40" priority="high">
          <div className="flex justify-around py-2">
            {[
              { label: 'مشروع جديد', icon: '🏗️' },
              { label: 'موظف جديد', icon: '👷' },
              { label: 'معاملة مالية', icon: '💰' },
              { label: 'تقرير', icon: '📊' }
            ].map((action, index) => (
              <button
                key={index}
                className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/10 transition-colors duration-150"
              >
                <span className="text-2xl">{action.icon}</span>
                <span className="text-xs text-white/80">{action.label}</span>
              </button>
            ))}
          </div>
        </MobileOptimizedCard>
      )}
      
      <style jsx>{`
        .ultra-dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%);
          background-attachment: fixed;
        }
        
        /* Ultra-high resolution optimizations */
        @media (min-width: 3840px) {
          .ultra-dashboard {
            padding: 3rem;
          }
          
          .space-y-6 > * + * {
            margin-top: 2rem;
          }
        }
        
        @media (min-width: 7680px) {
          .ultra-dashboard {
            padding: 4rem;
          }
          
          .space-y-6 > * + * {
            margin-top: 3rem;
          }
        }
        
        /* High refresh rate optimizations */
        @media (min-resolution: 120dpi) {
          * {
            transform: translateZ(0);
            backface-visibility: hidden;
          }
        }
        
        /* Touch optimization */
        @media (hover: none) and (pointer: coarse) {
          button {
            min-height: 44px;
            min-width: 44px;
          }
        }
      `}</style>
    </div>
  );
}