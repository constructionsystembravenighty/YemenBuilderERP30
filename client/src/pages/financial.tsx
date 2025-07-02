import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Plus, 
  Search, 
  Filter, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  FileText,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  CreditCard,
  Building,
  Shield
} from "lucide-react";
import { GlassmorphicCard, GlassContent, GlassHeader } from "@/components/glassmorphic-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArabicForm } from "@/components/arabic-form";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatFinancialAmount, formatPercentage } from "@/lib/currency";
import { formatArabicDate } from "@/lib/arabic-utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertTransactionSchema } from "@shared/schema";
import { z } from "zod";

const createTransactionFields = [
  {
    name: "type",
    label: "Transaction Type",
    labelAr: "نوع المعاملة",
    type: "select" as const,
    required: true,
    options: [
      { value: "income", label: "Income", labelAr: "إيراد" },
      { value: "expense", label: "Expense", labelAr: "مصروف" },
      { value: "transfer", label: "Transfer", labelAr: "تحويل" },
    ]
  },
  { name: "category", label: "Category", labelAr: "الفئة", type: "text" as const, required: true },
  { name: "categoryAr", label: "Arabic Category", labelAr: "الفئة بالعربية", type: "text" as const, required: true },
  { name: "description", label: "Description", labelAr: "الوصف", type: "textarea" as const },
  { name: "descriptionAr", label: "Arabic Description", labelAr: "الوصف بالعربية", type: "textarea" as const },
  { name: "amount", label: "Amount", labelAr: "المبلغ", type: "number" as const, required: true },
  {
    name: "currency",
    label: "Currency",
    labelAr: "العملة",
    type: "select" as const,
    options: [
      { value: "YER", label: "Yemeni Rial", labelAr: "ريال يمني" },
      { value: "USD", label: "US Dollar", labelAr: "دولار أمريكي" },
      { value: "EUR", label: "Euro", labelAr: "يورو" },
    ]
  },
  { name: "transactionDate", label: "Transaction Date", labelAr: "تاريخ المعاملة", type: "date" as const, required: true },
];

const formSchema = insertTransactionSchema.extend({
  companyId: z.number().default(1),
  createdBy: z.number().default(1),
});

export default function Financial() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("thisMonth");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["/api/transactions?companyId=1"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats?companyId=1"],
  });

  const { data: exchangeRates } = useQuery({
    queryKey: ["/api/exchange-rates"],
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/transactions", {
        ...data,
        companyId: 1,
        createdBy: 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setIsCreateOpen(false);
      toast({
        title: "تم إنشاء المعاملة بنجاح",
        description: "تم إضافة المعاملة المالية الجديدة إلى النظام",
      });
    },
    onError: () => {
      toast({
        title: "خطأ في إنشاء المعاملة",
        description: "حدث خطأ أثناء إنشاء المعاملة المالية",
        variant: "destructive",
      });
    },
  });

  const filteredTransactions = transactions?.filter((transaction: any) => {
    const matchesSearch = transaction.descriptionAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.categoryAr?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || transaction.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "income":
        return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case "expense":
        return <ArrowDownRight className="h-4 w-4 text-red-600" />;
      case "transfer":
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionBadge = (type: string) => {
    const typeMap: Record<string, { label: string; className: string }> = {
      income: { label: "إيراد", className: "bg-green-100 text-green-800" },
      expense: { label: "مصروف", className: "bg-red-100 text-red-800" },
      transfer: { label: "تحويل", className: "bg-blue-100 text-blue-800" },
    };
    
    const config = typeMap[type] || typeMap.income;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalIncome = stats?.totalRevenue || 0;
  const totalExpenses = stats?.totalExpenses || 0;
  const netProfit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">الإدارة المالية</h1>
          <p className="text-gray-600">نظام مالي متوافق مع معايير IFRS الدولية</p>
        </div>
        
        <div className="flex items-center space-x-reverse space-x-4 mt-4 md:mt-0">
          <Badge className="ifrs-compliance px-3 py-1">
            <Shield className="h-3 w-3 ml-1" />
            معايير IFRS
          </Badge>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent hover:bg-accent/90 text-white">
                <Plus className="h-4 w-4 ml-2" />
                معاملة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card max-w-2xl">
              <DialogHeader>
                <DialogTitle>إنشاء معاملة مالية جديدة</DialogTitle>
              </DialogHeader>
              <ArabicForm
                fields={createTransactionFields}
                schema={formSchema}
                onSubmit={(data) => createTransactionMutation.mutate(data)}
                submitTextAr="إنشاء المعاملة"
                isLoading={createTransactionMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <GlassmorphicCard floating className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold text-green-600">
                {formatFinancialAmount(totalIncome)}
              </p>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-4 w-4 text-green-600 ml-1" />
                <span className="text-sm text-green-600">+12.5%</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ArrowUpRight className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </GlassmorphicCard>

        <GlassmorphicCard floating className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">إجمالي المصروفات</p>
              <p className="text-2xl font-bold text-red-600">
                {formatFinancialAmount(totalExpenses)}
              </p>
              <div className="flex items-center mt-1">
                <TrendingDown className="h-4 w-4 text-red-600 ml-1" />
                <span className="text-sm text-red-600">+8.2%</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <ArrowDownRight className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </GlassmorphicCard>

        <GlassmorphicCard floating className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">الربح الصافي</p>
              <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-primary' : 'text-red-600'}`}>
                {formatFinancialAmount(netProfit)}
              </p>
              <div className="flex items-center mt-1">
                <span className={`text-sm ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  هامش: {formatPercentage(Math.abs(profitMargin))}
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-primary bg-opacity-20 rounded-lg flex items-center justify-center">
              <PieChart className="h-6 w-6 text-primary" />
            </div>
          </div>
        </GlassmorphicCard>

        <GlassmorphicCard floating className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">سعر الصرف</p>
              <p className="text-lg font-bold text-secondary">
                {exchangeRates?.YER_USD || 250.75}
              </p>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-4 w-4 text-green-600 ml-1" />
                <span className="text-sm text-green-600">+2.5%</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-secondary bg-opacity-20 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-secondary" />
            </div>
          </div>
        </GlassmorphicCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Transactions List */}
        <div className="xl:col-span-2">
          <GlassmorphicCard floating>
            <GlassHeader
              title="Financial Transactions"
              titleAr="المعاملات المالية"
              description="سجل جميع المعاملات المالية"
            />
            
            <GlassContent>
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="البحث في المعاملات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="glass-input pr-10"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="glass-input w-32">
                      <SelectValue placeholder="النوع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">الجميع</SelectItem>
                      <SelectItem value="income">إيرادات</SelectItem>
                      <SelectItem value="expense">مصروفات</SelectItem>
                      <SelectItem value="transfer">تحويلات</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="glass-input w-32">
                      <SelectValue placeholder="الفترة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="thisMonth">هذا الشهر</SelectItem>
                      <SelectItem value="lastMonth">الشهر الماضي</SelectItem>
                      <SelectItem value="thisYear">هذا العام</SelectItem>
                      <SelectItem value="lastYear">العام الماضي</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" className="glass-input">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Transactions */}
              <div className="space-y-3">
                {filteredTransactions?.length === 0 ? (
                  <div className="text-center py-8">
                    <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">لا توجد معاملات مالية</p>
                  </div>
                ) : (
                  filteredTransactions?.slice(0, 10).map((transaction: any) => (
                    <GlassmorphicCard key={transaction.id} hover className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-reverse space-x-3">
                          <div className="w-10 h-10 glass-card rounded-lg flex items-center justify-center">
                            {getTransactionIcon(transaction.type)}
                          </div>
                          <div>
                            <h4 className="font-medium text-charcoal-text">
                              {transaction.categoryAr || transaction.category}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {transaction.descriptionAr || transaction.description}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatArabicDate(transaction.transactionDate)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            {getTransactionBadge(transaction.type)}
                            <p className={`font-semibold ${
                              transaction.type === 'income' ? 'text-green-600' : 
                              transaction.type === 'expense' ? 'text-red-600' : 'text-blue-600'
                            }`}>
                              {transaction.type === 'expense' ? '-' : '+'}
                              {formatCurrency(transaction.amount, transaction.currency)}
                            </p>
                          </div>
                          {transaction.currency !== 'YER' && (
                            <p className="text-xs text-gray-500">
                              {formatCurrency(
                                transaction.amount * (transaction.exchangeRate || 1),
                                'YER'
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </GlassmorphicCard>
                  ))
                )}
              </div>
            </GlassContent>
          </GlassmorphicCard>
        </div>

        {/* Financial Analytics */}
        <div className="space-y-6">
          {/* Cash Flow Chart */}
          <GlassmorphicCard floating className="p-6">
            <GlassHeader
              title="Cash Flow"
              titleAr="التدفق النقدي"
              description="آخر 6 أشهر"
            />
            
            <GlassContent>
              <div className="chart-container p-4 rounded-lg">
                <div className="h-40 flex items-end justify-between space-x-reverse space-x-1">
                  {[
                    { month: "يناير", income: 80, expense: 60 },
                    { month: "فبراير", income: 65, expense: 70 },
                    { month: "مارس", income: 90, expense: 55 },
                    { month: "أبريل", income: 75, expense: 65 },
                    { month: "مايو", income: 85, expense: 60 },
                    { month: "يونيو", income: 95, expense: 70 },
                  ].map((data, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div className="w-full flex justify-between items-end h-32 mb-2">
                        <div 
                          className="bg-green-500 rounded-t w-2/5" 
                          style={{ height: `${data.income}%` }}
                        />
                        <div 
                          className="bg-red-500 rounded-t w-2/5" 
                          style={{ height: `${data.expense}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{data.month}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="text-xs text-gray-600">إيرادات</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span className="text-xs text-gray-600">مصروفات</span>
                  </div>
                </div>
              </div>
            </GlassContent>
          </GlassmorphicCard>

          {/* Expense Categories */}
          <GlassmorphicCard floating className="p-6">
            <GlassHeader
              title="Expense Categories"
              titleAr="فئات المصروفات"
              description="التوزيع الشهري"
            />
            
            <GlassContent>
              <div className="space-y-3">
                {[
                  { category: "المواد الخام", categoryEn: "Raw Materials", amount: 850000, percentage: 35 },
                  { category: "الرواتب", categoryEn: "Salaries", amount: 600000, percentage: 25 },
                  { category: "المعدات", categoryEn: "Equipment", amount: 480000, percentage: 20 },
                  { category: "النقل", categoryEn: "Transportation", amount: 240000, percentage: 10 },
                  { category: "أخرى", categoryEn: "Others", amount: 240000, percentage: 10 },
                ].map((item, index) => (
                  <div key={index} className="glass-card p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-charcoal-text">
                        {item.category}
                      </span>
                      <span className="text-sm font-semibold text-primary">
                        {formatFinancialAmount(item.amount, "YER", { compact: true })}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">{item.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassContent>
          </GlassmorphicCard>

          {/* Financial Goals */}
          <GlassmorphicCard floating className="p-6">
            <GlassHeader
              title="Financial Goals"
              titleAr="الأهداف المالية"
              description="2024"
            />
            
            <GlassContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">إيرادات سنوية</span>
                    <span className="font-medium">
                      {formatFinancialAmount(totalIncome * 12, "YER", { compact: true })} / 
                      {formatFinancialAmount(50000000, "YER", { compact: true })}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="progress-gradient h-2 rounded-full" 
                      style={{ width: `${Math.min((totalIncome * 12 / 50000000) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">توفير تكاليف</span>
                    <span className="font-medium">15% / 20%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-accent h-2 rounded-full" 
                      style={{ width: "75%" }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">هامش الربح</span>
                    <span className="font-medium">{formatPercentage(profitMargin)} / 30%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-secondary h-2 rounded-full" 
                      style={{ width: `${Math.min((profitMargin / 30) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </GlassContent>
          </GlassmorphicCard>
        </div>
      </div>
    </div>
  );
}
