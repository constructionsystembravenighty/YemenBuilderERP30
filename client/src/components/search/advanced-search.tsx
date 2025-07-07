import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, X, Calendar, MapPin, User, Building, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@/lib/currency';
import { formatDate } from '@/lib/arabic-utils';

interface SearchFilter {
  id: string;
  type: 'text' | 'select' | 'date' | 'range' | 'checkbox';
  label: string;
  labelAr: string;
  value: any;
  options?: { value: string; label: string; labelAr: string }[];
  min?: number;
  max?: number;
}

interface SearchResult {
  id: string;
  type: 'project' | 'employee' | 'equipment' | 'transaction' | 'document';
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  metadata: Record<string, any>;
  relevance: number;
}

interface AdvancedSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onResults: (results: SearchResult[]) => void;
}

export function AdvancedSearch({ isOpen, onClose, onResults }: AdvancedSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilter[]>([
    {
      id: 'type',
      type: 'select',
      label: 'Content Type',
      labelAr: 'نوع المحتوى',
      value: '',
      options: [
        { value: 'project', label: 'Projects', labelAr: 'المشاريع' },
        { value: 'employee', label: 'Employees', labelAr: 'الموظفين' },
        { value: 'equipment', label: 'Equipment', labelAr: 'المعدات' },
        { value: 'transaction', label: 'Transactions', labelAr: 'المعاملات' },
        { value: 'document', label: 'Documents', labelAr: 'المستندات' }
      ]
    },
    {
      id: 'status',
      type: 'select',
      label: 'Status',
      labelAr: 'الحالة',
      value: '',
      options: [
        { value: 'active', label: 'Active', labelAr: 'نشط' },
        { value: 'completed', label: 'Completed', labelAr: 'مكتمل' },
        { value: 'planning', label: 'Planning', labelAr: 'قيد التخطيط' },
        { value: 'on_hold', label: 'On Hold', labelAr: 'معلق' }
      ]
    },
    {
      id: 'dateRange',
      type: 'date',
      label: 'Date Range',
      labelAr: 'نطاق التاريخ',
      value: { from: null, to: null }
    },
    {
      id: 'budgetRange',
      type: 'range',
      label: 'Budget Range (YER)',
      labelAr: 'نطاق الميزانية (ريال يمني)',
      value: [0, 10000000],
      min: 0,
      max: 10000000
    }
  ]);

  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch initial data for search
  const { data: projects } = useQuery({ queryKey: ['/api/projects'] });
  const { data: employees } = useQuery({ queryKey: ['/api/users'] });
  const { data: equipment } = useQuery({ queryKey: ['/api/equipment'] });
  const { data: transactions } = useQuery({ queryKey: ['/api/transactions'] });

  // Perform search with filters
  const performSearch = useMemo(() => {
    if (!searchQuery.trim() && activeFilters.length === 0) {
      return [];
    }

    setIsSearching(true);
    const results: SearchResult[] = [];
    const query = searchQuery.toLowerCase();

    // Search projects
    if (projects && (!getFilterValue('type') || getFilterValue('type') === 'project')) {
      projects.forEach((project: any) => {
        const relevance = calculateRelevance(query, project, 'project');
        if (relevance > 0 && passesFilters(project, 'project')) {
          results.push({
            id: `project-${project.id}`,
            type: 'project',
            title: project.name,
            titleAr: project.nameAr,
            description: project.description || 'Construction project',
            descriptionAr: project.descriptionAr || 'مشروع إنشاءات',
            metadata: {
              status: project.status,
              budget: project.budget,
              progress: project.progress,
              location: project.location
            },
            relevance
          });
        }
      });
    }

    // Search employees
    if (employees && (!getFilterValue('type') || getFilterValue('type') === 'employee')) {
      employees.forEach((employee: any) => {
        const relevance = calculateRelevance(query, employee, 'employee');
        if (relevance > 0 && passesFilters(employee, 'employee')) {
          results.push({
            id: `employee-${employee.id}`,
            type: 'employee',
            title: employee.name,
            titleAr: employee.nameAr,
            description: `${employee.role} - ${employee.department}`,
            descriptionAr: `${employee.role} - ${employee.departmentAr}`,
            metadata: {
              role: employee.role,
              department: employee.department,
              email: employee.email,
              phone: employee.phone
            },
            relevance
          });
        }
      });
    }

    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance);
    
    setTimeout(() => setIsSearching(false), 500);
    return results.slice(0, 50); // Limit to 50 results
  }, [searchQuery, activeFilters, projects, employees, equipment, transactions]);

  useEffect(() => {
    setSearchResults(performSearch);
    onResults(performSearch);
  }, [performSearch, onResults]);

  function getFilterValue(filterId: string) {
    const filter = filters.find(f => f.id === filterId);
    return filter?.value;
  }

  function updateFilter(filterId: string, value: any) {
    setFilters(prev => prev.map(filter => 
      filter.id === filterId ? { ...filter, value } : filter
    ));
    
    if (value && !activeFilters.includes(filterId)) {
      setActiveFilters(prev => [...prev, filterId]);
    } else if (!value && activeFilters.includes(filterId)) {
      setActiveFilters(prev => prev.filter(id => id !== filterId));
    }
  }

  function calculateRelevance(query: string, item: any, type: string): number {
    if (!query) return 1;
    
    let score = 0;
    const searchFields = getSearchFields(item, type);
    
    searchFields.forEach(field => {
      if (field && field.toLowerCase().includes(query)) {
        score += field.toLowerCase() === query ? 10 : 5;
      }
    });
    
    return score;
  }

  function getSearchFields(item: any, type: string): string[] {
    switch (type) {
      case 'project':
        return [item.name, item.nameAr, item.description, item.descriptionAr, item.location];
      case 'employee':
        return [item.name, item.nameAr, item.email, item.department, item.role];
      case 'equipment':
        return [item.name, item.nameAr, item.type, item.location];
      case 'transaction':
        return [item.description, item.descriptionAr, item.category];
      default:
        return [];
    }
  }

  function passesFilters(item: any, type: string): boolean {
    // Type filter
    const typeFilter = getFilterValue('type');
    if (typeFilter && typeFilter !== type) return false;

    // Status filter
    const statusFilter = getFilterValue('status');
    if (statusFilter && item.status !== statusFilter) return false;

    // Budget range filter
    const budgetRange = getFilterValue('budgetRange');
    if (budgetRange && item.budget) {
      if (item.budget < budgetRange[0] || item.budget > budgetRange[1]) return false;
    }

    // Date range filter
    const dateRange = getFilterValue('dateRange');
    if (dateRange?.from && dateRange?.to && item.createdAt) {
      const itemDate = new Date(item.createdAt);
      if (itemDate < dateRange.from || itemDate > dateRange.to) return false;
    }

    return true;
  }

  function clearAllFilters() {
    setFilters(prev => prev.map(filter => ({
      ...filter,
      value: filter.type === 'range' ? [filter.min || 0, filter.max || 100] : 
             filter.type === 'date' ? { from: null, to: null } : ''
    })));
    setActiveFilters([]);
  }

  function clearFilter(filterId: string) {
    const filter = filters.find(f => f.id === filterId);
    if (filter) {
      const defaultValue = filter.type === 'range' ? [filter.min || 0, filter.max || 100] :
                          filter.type === 'date' ? { from: null, to: null } : '';
      updateFilter(filterId, defaultValue);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
      <Card className="w-full max-w-4xl mx-4 max-h-[80vh] overflow-auto">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              البحث المتقدم
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Search Input */}
          <div className="relative mb-6">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث في المشاريع، الموظفين، المعدات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 text-right"
              dir="rtl"
            />
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">المرشحات النشطة:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="mr-auto"
                >
                  مسح الكل
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeFilters.map(filterId => {
                  const filter = filters.find(f => f.id === filterId);
                  if (!filter) return null;
                  
                  return (
                    <Badge key={filterId} variant="secondary" className="flex items-center gap-1">
                      {filter.labelAr}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 hover:bg-transparent"
                        onClick={() => clearFilter(filterId)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {filters.map(filter => (
              <div key={filter.id} className="space-y-2">
                <label className="text-sm font-medium">{filter.labelAr}</label>
                
                {filter.type === 'select' && (
                  <Select
                    value={filter.value}
                    onValueChange={(value) => updateFilter(filter.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">الكل</SelectItem>
                      {filter.options?.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.labelAr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {filter.type === 'range' && (
                  <div className="space-y-2">
                    <Slider
                      value={filter.value}
                      onValueChange={(value) => updateFilter(filter.id, value)}
                      min={filter.min}
                      max={filter.max}
                      step={100000}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatCurrency(filter.value[0])}</span>
                      <span>{formatCurrency(filter.value[1])}</span>
                    </div>
                  </div>
                )}

                {filter.type === 'date' && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-right">
                        <Calendar className="ml-2 h-4 w-4" />
                        {filter.value.from ? (
                          filter.value.to ? (
                            `${formatDate(filter.value.from)} - ${formatDate(filter.value.to)}`
                          ) : (
                            formatDate(filter.value.from)
                          )
                        ) : (
                          "اختر التاريخ"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="range"
                        selected={filter.value}
                        onSelect={(value) => updateFilter(filter.id, value)}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            ))}
          </div>

          <Separator className="mb-6" />

          {/* Search Results */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                نتائج البحث ({searchResults.length})
              </h3>
              {isSearching && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                  جاري البحث...
                </div>
              )}
            </div>

            {searchResults.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery || activeFilters.length > 0 ? 
                  'لا توجد نتائج تطابق البحث' : 
                  'ابدأ بالبحث أو تطبيق المرشحات'
                }
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-auto">
                {searchResults.map(result => (
                  <Card key={result.id} className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {result.type === 'project' && <Building className="h-5 w-5 text-blue-500" />}
                        {result.type === 'employee' && <User className="h-5 w-5 text-green-500" />}
                        {result.type === 'equipment' && <MapPin className="h-5 w-5 text-orange-500" />}
                        {result.type === 'transaction' && <DollarSign className="h-5 w-5 text-purple-500" />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-right" dir="rtl">
                          {result.titleAr}
                        </h4>
                        <p className="text-sm text-muted-foreground text-right" dir="rtl">
                          {result.descriptionAr}
                        </p>
                        
                        {/* Metadata */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Object.entries(result.metadata).map(([key, value]) => {
                            if (!value) return null;
                            return (
                              <Badge key={key} variant="outline" className="text-xs">
                                {typeof value === 'number' && key === 'budget' ? 
                                  formatCurrency(value) : 
                                  String(value)
                                }
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 text-xs text-muted-foreground">
                        {Math.round(result.relevance * 10)}% تطابق
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}