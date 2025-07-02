import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  X, 
  ArrowRight, 
  Clock, 
  Building, 
  Users, 
  FileText, 
  Wrench, 
  Calculator,
  Star,
  Filter,
  Sparkles
} from 'lucide-react';
import { formatArabicDate } from '@/lib/arabic-utils';
import { formatCurrency } from '@/lib/currency';

export interface SearchResult {
  id: string;
  title: string;
  titleAr: string;
  description?: string;
  descriptionAr?: string;
  type: 'project' | 'employee' | 'document' | 'transaction' | 'equipment' | 'task';
  typeAr: string;
  url: string;
  metadata?: {
    status?: string;
    date?: Date;
    amount?: number;
    tags?: string[];
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    assignee?: string;
    progress?: number;
  };
  matchedFields?: string[];
  relevanceScore?: number;
}

export interface SearchFilters {
  types: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: string[];
  priority?: string[];
  assignee?: string[];
}

export interface GlobalSearchProps {
  onResultClick?: (result: SearchResult) => void;
  onClose?: () => void;
  placeholder?: string;
  placeholderAr?: string;
  showFilters?: boolean;
  maxResults?: number;
  enableHistory?: boolean;
  className?: string;
}

// Mock search API - replace with real implementation
const useSearchQuery = (query: string, filters: SearchFilters, enabled: boolean) => {
  return useQuery({
    queryKey: ['search', query, filters],
    queryFn: async () => {
      if (!query.trim()) return [];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Mock search results
      const mockResults: SearchResult[] = [
        {
          id: '1',
          title: 'Al-Noor Residential Complex',
          titleAr: 'مجمع النور السكني',
          description: 'Large residential project in Sana\'a',
          descriptionAr: 'مشروع سكني كبير في صنعاء',
          type: 'project',
          typeAr: 'مشروع',
          url: '/projects/1',
          metadata: {
            status: 'in_progress',
            date: new Date('2024-01-15'),
            amount: 5000000,
            progress: 65
          },
          relevanceScore: 0.95
        },
        {
          id: '2',
          title: 'Ahmed Al-Yemeni',
          titleAr: 'أحمد اليمني',
          description: 'Senior Construction Engineer',
          descriptionAr: 'مهندس إنشائي أول',
          type: 'employee',
          typeAr: 'موظف',
          url: '/employees/2',
          metadata: {
            status: 'active',
            tags: ['engineer', 'senior']
          },
          relevanceScore: 0.88
        },
        {
          id: '3',
          title: 'Project Contract - Al-Noor',
          titleAr: 'عقد المشروع - النور',
          description: 'Main construction contract',
          descriptionAr: 'عقد البناء الرئيسي',
          type: 'document',
          typeAr: 'مستند',
          url: '/documents/3',
          metadata: {
            date: new Date('2024-01-10'),
            tags: ['contract', 'legal']
          },
          relevanceScore: 0.82
        },
        {
          id: '4',
          title: 'Excavator CAT 320D',
          titleAr: 'حفارة كات 320دي',
          description: 'Heavy excavation equipment',
          descriptionAr: 'معدة حفر ثقيلة',
          type: 'equipment',
          typeAr: 'معدة',
          url: '/equipment/4',
          metadata: {
            status: 'available',
            date: new Date('2024-02-01')
          },
          relevanceScore: 0.75
        }
      ];
      
      // Filter results based on query and filters
      return mockResults.filter(result => {
        const queryLower = query.toLowerCase();
        const matchesQuery = 
          result.titleAr.toLowerCase().includes(queryLower) ||
          result.title.toLowerCase().includes(queryLower) ||
          result.descriptionAr?.toLowerCase().includes(queryLower) ||
          result.description?.toLowerCase().includes(queryLower);
        
        const matchesType = filters.types.length === 0 || filters.types.includes(result.type);
        
        return matchesQuery && matchesType;
      }).sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
    },
    enabled: enabled && query.trim().length > 0
  });
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'project': return <Building className="h-4 w-4" />;
    case 'employee': return <Users className="h-4 w-4" />;
    case 'document': return <FileText className="h-4 w-4" />;
    case 'equipment': return <Wrench className="h-4 w-4" />;
    case 'transaction': return <Calculator className="h-4 w-4" />;
    default: return <Search className="h-4 w-4" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'project': return 'bg-blue-100 text-blue-800';
    case 'employee': return 'bg-green-100 text-green-800';
    case 'document': return 'bg-purple-100 text-purple-800';
    case 'equipment': return 'bg-orange-100 text-orange-800';
    case 'transaction': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export function GlobalSearch({
  onResultClick,
  onClose,
  placeholder = "Search everything...",
  placeholderAr = "البحث في كل شيء...",
  showFilters = true,
  maxResults = 20,
  enableHistory = true,
  className = ""
}: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    types: []
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const { data: results = [], isLoading, error } = useSearchQuery(
    query, 
    filters, 
    isExpanded && query.trim().length > 0
  );

  const filteredResults = useMemo(() => {
    return results.slice(0, maxResults);
  }, [results, maxResults]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isExpanded) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredResults.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredResults.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredResults[selectedIndex]) {
            handleResultClick(filteredResults[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          handleClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded, filteredResults, selectedIndex]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredResults]);

  // Save to search history
  const addToHistory = (searchQuery: string) => {
    if (!enableHistory || !searchQuery.trim()) return;
    
    setSearchHistory(prev => {
      const newHistory = [searchQuery, ...prev.filter(item => item !== searchQuery)];
      return newHistory.slice(0, 10); // Keep last 10 searches
    });
  };

  const handleResultClick = (result: SearchResult) => {
    addToHistory(query);
    onResultClick?.(result);
    handleClose();
  };

  const handleClose = () => {
    setIsExpanded(false);
    setQuery('');
    setSelectedIndex(0);
    onClose?.();
  };

  const handleInputFocus = () => {
    setIsExpanded(true);
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (value.trim().length === 0) {
      setSelectedIndex(0);
    }
  };

  const toggleFilter = (type: string) => {
    setFilters(prev => ({
      ...prev,
      types: prev.types.includes(type) 
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type]
    }));
  };

  const clearFilters = () => {
    setFilters({ types: [] });
  };

  const availableTypes = [
    { id: 'project', label: 'Projects', labelAr: 'المشاريع' },
    { id: 'employee', label: 'Employees', labelAr: 'الموظفين' },
    { id: 'document', label: 'Documents', labelAr: 'المستندات' },
    { id: 'equipment', label: 'Equipment', labelAr: 'المعدات' },
    { id: 'transaction', label: 'Transactions', labelAr: 'المعاملات' }
  ];

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleInputFocus}
          placeholder={placeholderAr}
          className="pr-10 pl-10 text-right"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setQuery('')}
            className="absolute left-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isExpanded && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={handleClose}
          />
          
          {/* Results Panel */}
          <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-xl max-h-96 overflow-hidden">
            {/* Filters */}
            {showFilters && (
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center gap-2 flex-wrap">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">تصفية حسب:</span>
                  {availableTypes.map(type => (
                    <Badge
                      key={type.id}
                      variant={filters.types.includes(type.id) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/80"
                      onClick={() => toggleFilter(type.id)}
                    >
                      {type.labelAr}
                    </Badge>
                  ))}
                  {filters.types.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-6 px-2 text-xs"
                    >
                      مسح الكل
                    </Button>
                  )}
                </div>
              </div>
            )}

            <ScrollArea className="max-h-80" ref={resultsRef}>
              <CardContent className="p-0">
                {/* Loading State */}
                {isLoading && (
                  <div className="p-6 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">جاري البحث...</p>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="p-6 text-center text-red-600">
                    <p className="text-sm">حدث خطأ أثناء البحث</p>
                  </div>
                )}

                {/* No Results */}
                {!isLoading && !error && query.trim() && filteredResults.length === 0 && (
                  <div className="p-6 text-center text-gray-500">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">لا توجد نتائج لـ "{query}"</p>
                  </div>
                )}

                {/* Search History */}
                {!query.trim() && enableHistory && searchHistory.length > 0 && (
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">البحث السابق</span>
                    </div>
                    <div className="space-y-1">
                      {searchHistory.slice(0, 5).map((item, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          onClick={() => setQuery(item)}
                          className="w-full justify-start text-right h-8"
                        >
                          <Clock className="h-3 w-3 ml-2" />
                          {item}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Results */}
                {filteredResults.length > 0 && (
                  <div className="divide-y">
                    {filteredResults.map((result, index) => (
                      <div
                        key={result.id}
                        className={`p-4 cursor-pointer transition-colors ${
                          index === selectedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleResultClick(result)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${getTypeColor(result.type)}`}>
                            {getTypeIcon(result.type)}
                          </div>
                          
                          <div className="flex-1 text-right">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-gray-900 text-sm">
                                {result.titleAr || result.title}
                              </h3>
                              <Badge variant="outline" className="text-xs">
                                {result.typeAr}
                              </Badge>
                              {result.relevanceScore && result.relevanceScore > 0.9 && (
                                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              )}
                            </div>
                            
                            {result.descriptionAr && (
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {result.descriptionAr}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              {result.metadata?.date && (
                                <span>{formatArabicDate(result.metadata.date, 'short')}</span>
                              )}
                              {result.metadata?.amount && (
                                <span>{formatCurrency(result.metadata.amount)}</span>
                              )}
                              {result.metadata?.progress !== undefined && (
                                <span>{result.metadata.progress}% مكتمل</span>
                              )}
                              {result.metadata?.status && (
                                <Badge variant="secondary" className="text-xs">
                                  {result.metadata.status}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </ScrollArea>

            {/* Footer */}
            {filteredResults.length > 0 && (
              <div className="border-t px-4 py-2 bg-gray-50 text-xs text-gray-500 flex items-center justify-between">
                <span>استخدم ↑↓ للتنقل، Enter للفتح</span>
                <span>{filteredResults.length} نتيجة</span>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

// Compact search for headers/navigation
export function CompactGlobalSearch({ onResultClick }: { onResultClick?: (result: SearchResult) => void }) {
  return (
    <GlobalSearch
      onResultClick={onResultClick}
      placeholderAr="البحث السريع..."
      showFilters={false}
      maxResults={8}
      className="w-64"
    />
  );
}