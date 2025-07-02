import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Command, 
  ArrowRight, 
  Plus, 
  User, 
  Building, 
  FileText, 
  Calculator,
  Settings,
  HelpCircle,
  BarChart3,
  Wrench
} from 'lucide-react';

export interface CommandItem {
  id: string;
  title: string;
  titleAr: string;
  description?: string;
  descriptionAr?: string;
  category: string;
  categoryAr: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
  keywords: string[];
  keywordsAr: string[];
}

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: CommandItem[];
  placeholder?: string;
  placeholderAr?: string;
  emptyText?: string;
  emptyTextAr?: string;
}

export function CommandPalette({
  isOpen,
  onClose,
  commands,
  placeholder = "Type a command or search...",
  placeholderAr = "اكتب أمر أو ابحث...",
  emptyText = "No results found",
  emptyTextAr = "لا توجد نتائج"
}: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filter commands based on search
  const filteredCommands = useMemo(() => {
    if (!search.trim()) return commands;
    
    const searchLower = search.toLowerCase();
    return commands.filter(command => 
      command.titleAr.toLowerCase().includes(searchLower) ||
      command.title.toLowerCase().includes(searchLower) ||
      command.descriptionAr?.toLowerCase().includes(searchLower) ||
      command.description?.toLowerCase().includes(searchLower) ||
      command.keywordsAr.some(keyword => keyword.toLowerCase().includes(searchLower)) ||
      command.keywords.some(keyword => keyword.toLowerCase().includes(searchLower)) ||
      command.categoryAr.toLowerCase().includes(searchLower) ||
      command.category.toLowerCase().includes(searchLower)
    );
  }, [commands, search]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: { [key: string]: CommandItem[] } = {};
    filteredCommands.forEach(command => {
      const category = command.categoryAr || command.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(command);
    });
    return groups;
  }, [filteredCommands]);

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            onClose();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  // Clear search when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleItemClick = (command: CommandItem) => {
    command.action();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="border-b">
          <div className="flex items-center px-4 py-3">
            <Search className="h-4 w-4 text-gray-400 ml-3" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={placeholderAr}
              className="border-0 focus:ring-0 text-right bg-transparent"
              autoFocus
            />
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">⌘</kbd>
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">K</kbd>
            </div>
          </div>
        </div>

        <ScrollArea className="max-h-96">
          {Object.keys(groupedCommands).length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm">{emptyTextAr}</p>
            </div>
          ) : (
            <div className="p-2">
              {Object.entries(groupedCommands).map(([category, items]) => (
                <div key={category} className="mb-4 last:mb-0">
                  <div className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {category}
                  </div>
                  <div className="space-y-1">
                    {items.map((command, index) => {
                      const globalIndex = filteredCommands.indexOf(command);
                      const isSelected = globalIndex === selectedIndex;
                      
                      return (
                        <div
                          key={command.id}
                          className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                            isSelected ? 'bg-primary text-white' : 'hover:bg-gray-100'
                          }`}
                          onClick={() => handleItemClick(command)}
                        >
                          <div className={`p-1 rounded ${
                            isSelected ? 'bg-white/20' : 'bg-gray-100'
                          }`}>
                            <div className={isSelected ? 'text-white' : 'text-gray-600'}>
                              {command.icon}
                            </div>
                          </div>
                          
                          <div className="flex-1 text-right">
                            <div className={`text-sm font-medium ${
                              isSelected ? 'text-white' : 'text-gray-900'
                            }`}>
                              {command.titleAr || command.title}
                            </div>
                            {command.descriptionAr && (
                              <div className={`text-xs ${
                                isSelected ? 'text-white/80' : 'text-gray-500'
                              }`}>
                                {command.descriptionAr}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {command.shortcut && (
                              <Badge 
                                variant={isSelected ? "secondary" : "outline"}
                                className="text-xs"
                              >
                                {command.shortcut}
                              </Badge>
                            )}
                            <ArrowRight className={`h-3 w-3 ${
                              isSelected ? 'text-white' : 'text-gray-400'
                            }`} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="border-t px-4 py-2 text-xs text-gray-500 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>استخدم ↑↓ للتنقل</span>
            <span>Enter للتنفيذ</span>
            <span>Esc للخروج</span>
          </div>
          <div className="flex items-center gap-1">
            <Command className="h-3 w-3" />
            <span>لوحة الأوامر</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook for command palette
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isOpen,
    setIsOpen,
    toggle: () => setIsOpen(!isOpen),
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
}

// Default commands for construction management
export const getDefaultCommands = (navigate: (path: string) => void): CommandItem[] => [
  {
    id: 'create-project',
    title: 'Create New Project',
    titleAr: 'إنشاء مشروع جديد',
    description: 'Start a new construction project',
    descriptionAr: 'بدء مشروع بناء جديد',
    category: 'Projects',
    categoryAr: 'المشاريع',
    icon: <Plus className="h-4 w-4" />,
    shortcut: 'Ctrl+N',
    action: () => navigate('/projects/new'),
    keywords: ['project', 'new', 'create', 'construction'],
    keywordsAr: ['مشروع', 'جديد', 'إنشاء', 'بناء']
  },
  {
    id: 'add-employee',
    title: 'Add Employee',
    titleAr: 'إضافة موظف',
    description: 'Add a new team member',
    descriptionAr: 'إضافة عضو جديد للفريق',
    category: 'Team',
    categoryAr: 'الفريق',
    icon: <User className="h-4 w-4" />,
    action: () => navigate('/employees/new'),
    keywords: ['employee', 'staff', 'team', 'user'],
    keywordsAr: ['موظف', 'فريق', 'عضو', 'مستخدم']
  },
  {
    id: 'financial-reports',
    title: 'Financial Reports',
    titleAr: 'التقارير المالية',
    description: 'View financial analytics',
    descriptionAr: 'عرض التحليلات المالية',
    category: 'Finance',
    categoryAr: 'المالية',
    icon: <BarChart3 className="h-4 w-4" />,
    shortcut: 'Ctrl+R',
    action: () => navigate('/reports/financial'),
    keywords: ['finance', 'reports', 'analytics', 'money'],
    keywordsAr: ['مالية', 'تقارير', 'تحليلات', 'أموال']
  },
  {
    id: 'equipment-tracker',
    title: 'Equipment Tracker',
    titleAr: 'متتبع المعدات',
    description: 'Track construction equipment',
    descriptionAr: 'تتبع معدات البناء',
    category: 'Equipment',
    categoryAr: 'المعدات',
    icon: <Wrench className="h-4 w-4" />,
    action: () => navigate('/equipment'),
    keywords: ['equipment', 'tools', 'machinery', 'tracking'],
    keywordsAr: ['معدات', 'أدوات', 'آلات', 'تتبع']
  },
  {
    id: 'documents',
    title: 'Document Library',
    titleAr: 'مكتبة المستندات',
    description: 'Access project documents',
    descriptionAr: 'الوصول لمستندات المشروع',
    category: 'Documents',
    categoryAr: 'المستندات',
    icon: <FileText className="h-4 w-4" />,
    shortcut: 'Ctrl+D',
    action: () => navigate('/documents'),
    keywords: ['documents', 'files', 'papers', 'contracts'],
    keywordsAr: ['مستندات', 'ملفات', 'أوراق', 'عقود']
  },
  {
    id: 'settings',
    title: 'Settings',
    titleAr: 'الإعدادات',
    description: 'Configure application settings',
    descriptionAr: 'تكوين إعدادات التطبيق',
    category: 'System',
    categoryAr: 'النظام',
    icon: <Settings className="h-4 w-4" />,
    action: () => navigate('/settings'),
    keywords: ['settings', 'preferences', 'configuration'],
    keywordsAr: ['إعدادات', 'تفضيلات', 'تكوين']
  },
  {
    id: 'help',
    title: 'Help Center',
    titleAr: 'مركز المساعدة',
    description: 'Get help and support',
    descriptionAr: 'الحصول على المساعدة والدعم',
    category: 'Support',
    categoryAr: 'الدعم',
    icon: <HelpCircle className="h-4 w-4" />,
    shortcut: 'F1',
    action: () => navigate('/help'),
    keywords: ['help', 'support', 'documentation', 'guide'],
    keywordsAr: ['مساعدة', 'دعم', 'توثيق', 'دليل']
  }
];