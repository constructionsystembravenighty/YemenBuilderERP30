import React from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { formatCurrency } from '@/lib/currency';
import { formatArabicDate } from '@/lib/arabic-utils';

// Chart color palettes
export const CHART_COLORS = {
  primary: '#1B4332',
  secondary: '#D4AF37', 
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  gray: '#6B7280'
};

export const PALETTE_CONSTRUCTION = [
  '#1B4332', '#D4AF37', '#40916C', '#52B788', '#74C69D', 
  '#95D5B2', '#B7E4C7', '#D8F3DC', '#F1F8E9'
];

export const PALETTE_FINANCIAL = [
  '#10B981', '#059669', '#047857', '#065F46', '#064E3B',
  '#F59E0B', '#D97706', '#B45309', '#92400E', '#78350F'
];

// Custom tooltip component
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  currencyFormat?: boolean;
  dateFormat?: boolean;
}

export function CustomTooltip({ active, payload, label, currencyFormat, dateFormat }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900 mb-2 text-right">
          {dateFormat && label ? formatArabicDate(label) : (label || '')}
        </p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm text-right">
            {entry.name}: {currencyFormat ? formatCurrency(entry.value) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

// Enhanced Line Chart
interface EnhancedLineChartProps {
  data: any[];
  lines: Array<{
    dataKey: string;
    name: string;
    nameAr: string;
    color?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
  }>;
  xAxisKey: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  currencyFormat?: boolean;
  dateFormat?: boolean;
  gradientFill?: boolean;
}

export function EnhancedLineChart({
  data,
  lines,
  xAxisKey,
  height = 300,
  showGrid = true,
  showLegend = true,
  currencyFormat = false,
  dateFormat = false,
  gradientFill = false
}: EnhancedLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
        <XAxis 
          dataKey={xAxisKey} 
          stroke="#6b7280"
          tick={{ fill: '#6b7280', fontSize: 12 }}
        />
        <YAxis 
          stroke="#6b7280"
          tick={{ fill: '#6b7280', fontSize: 12 }}
          tickFormatter={currencyFormat ? (value) => formatCurrency(value) : undefined}
        />
        <Tooltip 
          content={<CustomTooltip currencyFormat={currencyFormat} dateFormat={dateFormat} />}
        />
        {showLegend && <Legend />}
        
        {/* Gradient definitions */}
        {gradientFill && (
          <defs>
            {lines.map((line, index) => (
              <linearGradient key={line.dataKey} id={`gradient-${line.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={line.color || CHART_COLORS.primary} stopOpacity={0.8} />
                <stop offset="95%" stopColor={line.color || CHART_COLORS.primary} stopOpacity={0.1} />
              </linearGradient>
            ))}
          </defs>
        )}
        
        {lines.map((line, index) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.color || PALETTE_CONSTRUCTION[index % PALETTE_CONSTRUCTION.length]}
            strokeWidth={line.strokeWidth || 2}
            strokeDasharray={line.strokeDasharray}
            name={line.nameAr || line.name}
            dot={{ fill: line.color || PALETTE_CONSTRUCTION[index % PALETTE_CONSTRUCTION.length], strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: line.color || PALETTE_CONSTRUCTION[index % PALETTE_CONSTRUCTION.length], strokeWidth: 2 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

// Enhanced Bar Chart
interface EnhancedBarChartProps {
  data: any[];
  bars: Array<{
    dataKey: string;
    name: string;
    nameAr: string;
    color?: string;
  }>;
  xAxisKey: string;
  height?: number;
  layout?: 'horizontal' | 'vertical';
  showGrid?: boolean;
  showLegend?: boolean;
  currencyFormat?: boolean;
  stackId?: string;
}

export function EnhancedBarChart({
  data,
  bars,
  xAxisKey,
  height = 300,
  layout = 'vertical',
  showGrid = true,
  showLegend = true,
  currencyFormat = false,
  stackId
}: EnhancedBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart 
        data={data} 
        layout={layout}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
        <XAxis 
          type={layout === 'vertical' ? 'number' : 'category'}
          dataKey={layout === 'vertical' ? undefined : xAxisKey}
          stroke="#6b7280"
          tick={{ fill: '#6b7280', fontSize: 12 }}
          tickFormatter={currencyFormat && layout === 'vertical' ? (value) => formatCurrency(value) : undefined}
        />
        <YAxis 
          type={layout === 'vertical' ? 'category' : 'number'}
          dataKey={layout === 'vertical' ? xAxisKey : undefined}
          stroke="#6b7280"
          tick={{ fill: '#6b7280', fontSize: 12 }}
          tickFormatter={currencyFormat && layout !== 'vertical' ? (value) => formatCurrency(value) : undefined}
        />
        <Tooltip content={<CustomTooltip currencyFormat={currencyFormat} />} />
        {showLegend && <Legend />}
        
        {bars.map((bar, index) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            fill={bar.color || PALETTE_CONSTRUCTION[index % PALETTE_CONSTRUCTION.length]}
            name={bar.nameAr || bar.name}
            stackId={stackId}
            radius={[2, 2, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

// Enhanced Area Chart
interface EnhancedAreaChartProps {
  data: any[];
  areas: Array<{
    dataKey: string;
    name: string;
    nameAr: string;
    color?: string;
    stackId?: string;
  }>;
  xAxisKey: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  currencyFormat?: boolean;
  dateFormat?: boolean;
}

export function EnhancedAreaChart({
  data,
  areas,
  xAxisKey,
  height = 300,
  showGrid = true,
  showLegend = true,
  currencyFormat = false,
  dateFormat = false
}: EnhancedAreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          {areas.map((area, index) => (
            <linearGradient key={area.dataKey} id={`gradient-${area.dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={area.color || PALETTE_CONSTRUCTION[index]} stopOpacity={0.8} />
              <stop offset="95%" stopColor={area.color || PALETTE_CONSTRUCTION[index]} stopOpacity={0.1} />
            </linearGradient>
          ))}
        </defs>
        
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
        <XAxis 
          dataKey={xAxisKey}
          stroke="#6b7280"
          tick={{ fill: '#6b7280', fontSize: 12 }}
        />
        <YAxis 
          stroke="#6b7280"
          tick={{ fill: '#6b7280', fontSize: 12 }}
          tickFormatter={currencyFormat ? (value) => formatCurrency(value) : undefined}
        />
        <Tooltip content={<CustomTooltip currencyFormat={currencyFormat} dateFormat={dateFormat} />} />
        {showLegend && <Legend />}
        
        {areas.map((area, index) => (
          <Area
            key={area.dataKey}
            type="monotone"
            dataKey={area.dataKey}
            stackId={area.stackId}
            stroke={area.color || PALETTE_CONSTRUCTION[index]}
            fill={`url(#gradient-${area.dataKey})`}
            name={area.nameAr || area.name}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Enhanced Pie Chart
interface EnhancedPieChartProps {
  data: Array<{
    name: string;
    nameAr?: string;
    value: number;
    color?: string;
  }>;
  height?: number;
  showLegend?: boolean;
  showLabels?: boolean;
  innerRadius?: number;
  currencyFormat?: boolean;
  percentageFormat?: boolean;
}

export function EnhancedPieChart({
  data,
  height = 300,
  showLegend = true,
  showLabels = true,
  innerRadius = 0,
  currencyFormat = false,
  percentageFormat = false
}: EnhancedPieChartProps) {
  const RADIAN = Math.PI / 180;
  
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent, index, value
  }: any) => {
    if (!showLabels) return null;
    
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {percentageFormat ? `${(percent * 100).toFixed(0)}%` : 
         currencyFormat ? formatCurrency(value) : value}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={80}
          innerRadius={innerRadius}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.color || PALETTE_CONSTRUCTION[index % PALETTE_CONSTRUCTION.length]} 
            />
          ))}
        </Pie>
        <Tooltip 
          content={<CustomTooltip currencyFormat={currencyFormat} />}
        />
        {showLegend && (
          <Legend 
            formatter={(value, entry) => {
              const item = data.find(d => (d.nameAr || d.name) === value);
              return item?.nameAr || value;
            }}
          />
        )}
      </PieChart>
    </ResponsiveContainer>
  );
}

// KPI Card Component
interface KPICardProps {
  title: string;
  titleAr?: string;
  value: number;
  previousValue?: number;
  format?: 'currency' | 'number' | 'percentage';
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  color?: string;
  className?: string;
}

export function KPICard({
  title,
  titleAr,
  value,
  previousValue,
  format = 'number',
  trend,
  icon,
  color = CHART_COLORS.primary,
  className = ''
}: KPICardProps) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return formatCurrency(val);
      case 'percentage':
        return `${val.toFixed(1)}%`;
      default:
        return val.toLocaleString('ar-YE');
    }
  };

  const calculateChange = () => {
    if (!previousValue || previousValue === 0) return null;
    const change = ((value - previousValue) / previousValue) * 100;
    return change.toFixed(1);
  };

  const change = calculateChange();

  return (
    <div className={`bg-white rounded-lg border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-600 text-right">
            {titleAr || title}
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {formatValue(value)}
          </p>
        </div>
        {icon && (
          <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20`, color }}>
            {icon}
          </div>
        )}
      </div>
      
      {change && (
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 text-sm ${
            parseFloat(change) > 0 ? 'text-green-600' : 
            parseFloat(change) < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            <span>{parseFloat(change) > 0 ? '↗' : parseFloat(change) < 0 ? '↘' : '→'}</span>
            <span>{Math.abs(parseFloat(change))}%</span>
          </div>
          <span className="text-sm text-gray-500">من الشهر السابق</span>
        </div>
      )}
    </div>
  );
}

// Progress Ring Component
interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showLabel?: boolean;
  label?: string;
  labelAr?: string;
}

export function ProgressRing({
  percentage,
  size = 120,
  strokeWidth = 8,
  color = CHART_COLORS.primary,
  backgroundColor = '#e5e7eb',
  showLabel = true,
  label,
  labelAr
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        height={size}
        width={size}
        className="transform -rotate-90"
      >
        <circle
          stroke={backgroundColor}
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          className="transition-all duration-500 ease-in-out"
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">
            {percentage.toFixed(0)}%
          </span>
          {(label || labelAr) && (
            <span className="text-xs text-gray-600 text-center">
              {labelAr || label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}