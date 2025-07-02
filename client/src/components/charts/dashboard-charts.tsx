import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Arabic-first chart color palette
const CHART_COLORS = {
  primary: '#1B4332',
  secondary: '#D4AF37', 
  accent: '#40916C',
  danger: '#DC2626',
  warning: '#F59E0B',
  info: '#3B82F6',
  gradient: ['#1B4332', '#40916C', '#D4AF37', '#8B5CF6', '#EF4444']
};

// Sample data structure for charts
interface ChartDataPoint {
  month: string;
  monthAr: string;
  revenue: number;
  expenses: number;
  projects: number;
  employees: number;
}

interface ProjectStatusData {
  status: string;
  statusAr: string;
  count: number;
  percentage: number;
}

interface EquipmentData {
  category: string;
  categoryAr: string;
  available: number;
  maintenance: number;
  offline: number;
}

// Custom Arabic tooltip component
const ArabicTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 border border-white/20 rounded-lg shadow-lg backdrop-blur-md">
        <p className="text-charcoal-text font-semibold text-right">{`${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-right" style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value.toLocaleString('ar-YE')} ﷼`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Revenue vs Expenses Line Chart
export function RevenueChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <div className="w-full h-80 p-4">
      <h3 className="text-lg font-semibold text-charcoal-text mb-4 text-right">
        الإيرادات والمصروفات الشهرية
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="monthAr" 
            tick={{ fontSize: 12, fill: '#374151' }}
            axisLine={{ stroke: '#D1D5DB' }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#374151' }}
            axisLine={{ stroke: '#D1D5DB' }}
            tickFormatter={(value) => `${value.toLocaleString('ar-YE')} ﷼`}
          />
          <Tooltip content={<ArabicTooltip />} />
          <Legend 
            wrapperStyle={{ direction: 'rtl', textAlign: 'right' }}
          />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke={CHART_COLORS.primary}
            strokeWidth={3}
            name="الإيرادات"
            dot={{ fill: CHART_COLORS.primary, strokeWidth: 2, r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="expenses" 
            stroke={CHART_COLORS.danger}
            strokeWidth={3}
            name="المصروفات"
            dot={{ fill: CHART_COLORS.danger, strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Project Status Pie Chart
export function ProjectStatusChart({ data }: { data: ProjectStatusData[] }) {
  return (
    <div className="w-full h-80 p-4">
      <h3 className="text-lg font-semibold text-charcoal-text mb-4 text-right">
        توزيع حالة المشاريع
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ statusAr, percentage }) => `${statusAr} ${percentage}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS.gradient[index % CHART_COLORS.gradient.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number, name: string) => [`${value} مشروع`, name]}
            labelFormatter={(label: string) => `${label}`}
          />
          <Legend 
            wrapperStyle={{ direction: 'rtl', textAlign: 'right' }}
            formatter={(value: string, entry: any) => entry.payload.statusAr}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// Equipment Status Bar Chart
export function EquipmentChart({ data }: { data: EquipmentData[] }) {
  return (
    <div className="w-full h-80 p-4">
      <h3 className="text-lg font-semibold text-charcoal-text mb-4 text-right">
        حالة المعدات حسب الفئة
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="categoryAr" 
            tick={{ fontSize: 12, fill: '#374151' }}
            axisLine={{ stroke: '#D1D5DB' }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#374151' }}
            axisLine={{ stroke: '#D1D5DB' }}
          />
          <Tooltip content={<ArabicTooltip />} />
          <Legend 
            wrapperStyle={{ direction: 'rtl', textAlign: 'right' }}
          />
          <Bar dataKey="available" fill={CHART_COLORS.accent} name="متاح" />
          <Bar dataKey="maintenance" fill={CHART_COLORS.warning} name="صيانة" />
          <Bar dataKey="offline" fill={CHART_COLORS.danger} name="معطل" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Monthly Progress Area Chart
export function MonthlyProgressChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <div className="w-full h-80 p-4">
      <h3 className="text-lg font-semibold text-charcoal-text mb-4 text-right">
        تقدم المشاريع الشهري
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <defs>
            <linearGradient id="projectsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.accent} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={CHART_COLORS.accent} stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="employeesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.secondary} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={CHART_COLORS.secondary} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="monthAr" 
            tick={{ fontSize: 12, fill: '#374151' }}
            axisLine={{ stroke: '#D1D5DB' }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#374151' }}
            axisLine={{ stroke: '#D1D5DB' }}
          />
          <Tooltip content={<ArabicTooltip />} />
          <Legend 
            wrapperStyle={{ direction: 'rtl', textAlign: 'right' }}
          />
          <Area
            type="monotone"
            dataKey="projects"
            stroke={CHART_COLORS.accent}
            fillOpacity={1}
            fill="url(#projectsGradient)"
            name="المشاريع"
          />
          <Area
            type="monotone"
            dataKey="employees"
            stroke={CHART_COLORS.secondary}
            fillOpacity={1}
            fill="url(#employeesGradient)"
            name="الموظفين"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Sample data for testing
export const sampleChartData: ChartDataPoint[] = [
  { month: 'Jan', monthAr: 'يناير', revenue: 850000, expenses: 620000, projects: 12, employees: 245 },
  { month: 'Feb', monthAr: 'فبراير', revenue: 920000, expenses: 680000, projects: 15, employees: 252 },
  { month: 'Mar', monthAr: 'مارس', revenue: 1100000, expenses: 750000, projects: 18, employees: 267 },
  { month: 'Apr', monthAr: 'أبريل', revenue: 1250000, expenses: 820000, projects: 21, employees: 289 },
  { month: 'May', monthAr: 'مايو', revenue: 1400000, expenses: 890000, projects: 24, employees: 312 },
  { month: 'Jun', monthAr: 'يونيو', revenue: 1650000, expenses: 980000, projects: 28, employees: 334 },
];

export const sampleProjectStatus: ProjectStatusData[] = [
  { status: 'active', statusAr: 'نشط', count: 28, percentage: 45 },
  { status: 'planning', statusAr: 'تخطيط', count: 18, percentage: 29 },
  { status: 'completed', statusAr: 'مكتمل', count: 12, percentage: 19 },
  { status: 'on_hold', statusAr: 'متوقف', count: 4, percentage: 7 },
];

export const sampleEquipmentData: EquipmentData[] = [
  { category: 'excavators', categoryAr: 'حفارات', available: 12, maintenance: 2, offline: 1 },
  { category: 'cranes', categoryAr: 'رافعات', available: 8, maintenance: 1, offline: 0 },
  { category: 'trucks', categoryAr: 'شاحنات', available: 25, maintenance: 3, offline: 2 },
  { category: 'mixers', categoryAr: 'خلاطات', available: 15, maintenance: 1, offline: 1 },
  { category: 'tools', categoryAr: 'أدوات', available: 142, maintenance: 8, offline: 5 },
];