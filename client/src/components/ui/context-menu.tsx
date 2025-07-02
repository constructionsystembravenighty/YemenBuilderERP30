import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Edit, 
  Trash2, 
  Copy, 
  Share, 
  Download, 
  Star, 
  Eye, 
  EyeOff,
  MoreHorizontal,
  ArrowRight,
  Check,
  X,
  Plus,
  Minus
} from 'lucide-react';

export interface ContextMenuItem {
  id: string;
  label: string;
  labelAr: string;
  icon?: React.ReactNode;
  shortcut?: string;
  onClick?: () => void;
  disabled?: boolean;
  dangerous?: boolean;
  checked?: boolean;
  submenu?: ContextMenuItem[];
  separator?: boolean;
}

export interface ContextMenuProps {
  items: ContextMenuItem[];
  children: React.ReactNode;
  className?: string;
  onOpenChange?: (open: boolean) => void;
}

export function ContextMenu({ items, children, className = "", onOpenChange }: ContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [submenuOpen, setSubmenuOpen] = useState<string | null>(null);
  const [submenuPosition, setSubmenuPosition] = useState({ x: 0, y: 0 });
  
  const menuRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);

  // Handle right-click to open context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = (e.target as Element).getBoundingClientRect();
    setPosition({
      x: e.clientX,
      y: e.clientY
    });
    
    setIsOpen(true);
    onOpenChange?.(true);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSubmenuOpen(null);
        onOpenChange?.(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onOpenChange]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          setIsOpen(false);
          setSubmenuOpen(null);
          onOpenChange?.(false);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onOpenChange]);

  // Adjust menu position to stay within viewport
  const getAdjustedPosition = (x: number, y: number, menuWidth: number, menuHeight: number) => {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    let adjustedX = x;
    let adjustedY = y;

    // Adjust horizontal position
    if (x + menuWidth > viewport.width) {
      adjustedX = x - menuWidth;
    }

    // Adjust vertical position
    if (y + menuHeight > viewport.height) {
      adjustedY = y - menuHeight;
    }

    return { x: Math.max(0, adjustedX), y: Math.max(0, adjustedY) };
  };

  const handleItemClick = (item: ContextMenuItem) => {
    if (item.disabled) return;
    
    if (item.submenu) {
      // Handle submenu
      if (submenuOpen === item.id) {
        setSubmenuOpen(null);
      } else {
        setSubmenuOpen(item.id);
        // Position submenu to the left of the main menu
        if (menuRef.current) {
          const menuRect = menuRef.current.getBoundingClientRect();
          setSubmenuPosition({
            x: menuRect.left - 200, // submenu width
            y: menuRect.top
          });
        }
      }
    } else {
      // Execute action and close menu
      item.onClick?.();
      setIsOpen(false);
      setSubmenuOpen(null);
      onOpenChange?.(false);
    }
  };

  const handleSubmenuItemClick = (item: ContextMenuItem) => {
    if (item.disabled) return;
    
    item.onClick?.();
    setIsOpen(false);
    setSubmenuOpen(null);
    onOpenChange?.(false);
  };

  const renderMenuItem = (item: ContextMenuItem, isSubmenu: boolean = false) => {
    if (item.separator) {
      return <Separator key={`separator-${item.id}`} className="my-1" />;
    }

    return (
      <div key={item.id}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => isSubmenu ? handleSubmenuItemClick(item) : handleItemClick(item)}
          disabled={item.disabled}
          className={`
            w-full justify-between h-8 px-3 py-1 text-right
            ${item.dangerous ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : ''}
            ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}
            ${submenuOpen === item.id ? 'bg-gray-100' : ''}
          `}
        >
          <div className="flex items-center gap-2">
            {item.shortcut && (
              <Badge variant="outline" className="text-xs h-5 px-1">
                {item.shortcut}
              </Badge>
            )}
            {item.submenu && (
              <ArrowRight className="h-3 w-3" />
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm">{item.labelAr}</span>
            {item.checked !== undefined && (
              item.checked ? <Check className="h-3 w-3" /> : null
            )}
            {item.icon && (
              <div className="flex-shrink-0">
                {React.cloneElement(item.icon as React.ReactElement, {
                  className: "h-4 w-4"
                })}
              </div>
            )}
          </div>
        </Button>
      </div>
    );
  };

  return (
    <>
      <div onContextMenu={handleContextMenu} className={className}>
        {children}
      </div>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-50" />
          
          {/* Main Menu */}
          <div
            ref={menuRef}
            className="fixed z-50 min-w-[200px] bg-white border rounded-lg shadow-lg py-2"
            style={{
              left: position.x,
              top: position.y,
              transform: 'translate(0, 0)'
            }}
          >
            {items.map((item, index) => renderMenuItem(item, false))}
          </div>

          {/* Submenu */}
          {submenuOpen && (
            <div
              ref={submenuRef}
              className="fixed z-50 min-w-[180px] bg-white border rounded-lg shadow-lg py-2"
              style={{
                left: submenuPosition.x,
                top: submenuPosition.y
              }}
            >
              {items
                .find(item => item.id === submenuOpen)
                ?.submenu?.map(item => renderMenuItem(item, true))
              }
            </div>
          )}
        </>
      )}
    </>
  );
}

// Predefined context menu configurations for construction management
export const contextMenuConfigs = {
  // Project context menu
  project: (projectId: string): ContextMenuItem[] => [
    {
      id: 'view',
      label: 'View Project',
      labelAr: 'عرض المشروع',
      icon: <Eye className="h-4 w-4" />,
      shortcut: 'Enter',
      onClick: () => console.log('View project', projectId)
    },
    {
      id: 'edit',
      label: 'Edit Project',
      labelAr: 'تعديل المشروع',
      icon: <Edit className="h-4 w-4" />,
      shortcut: 'Ctrl+E',
      onClick: () => console.log('Edit project', projectId)
    },
    { id: 'separator-1', label: '', labelAr: '', separator: true },
    {
      id: 'share',
      label: 'Share',
      labelAr: 'مشاركة',
      icon: <Share className="h-4 w-4" />,
      submenu: [
        {
          id: 'share-link',
          label: 'Copy Link',
          labelAr: 'نسخ الرابط',
          icon: <Copy className="h-4 w-4" />,
          onClick: () => console.log('Copy link')
        },
        {
          id: 'share-team',
          label: 'Share with Team',
          labelAr: 'مشاركة مع الفريق',
          icon: <Plus className="h-4 w-4" />,
          onClick: () => console.log('Share with team')
        }
      ]
    },
    {
      id: 'download',
      label: 'Download Report',
      labelAr: 'تحميل التقرير',
      icon: <Download className="h-4 w-4" />,
      onClick: () => console.log('Download report', projectId)
    },
    {
      id: 'favorite',
      label: 'Add to Favorites',
      labelAr: 'إضافة للمفضلة',
      icon: <Star className="h-4 w-4" />,
      onClick: () => console.log('Add to favorites', projectId)
    },
    { id: 'separator-2', label: '', labelAr: '', separator: true },
    {
      id: 'delete',
      label: 'Delete Project',
      labelAr: 'حذف المشروع',
      icon: <Trash2 className="h-4 w-4" />,
      dangerous: true,
      onClick: () => console.log('Delete project', projectId)
    }
  ],

  // Employee context menu
  employee: (employeeId: string): ContextMenuItem[] => [
    {
      id: 'view-profile',
      label: 'View Profile',
      labelAr: 'عرض الملف الشخصي',
      icon: <Eye className="h-4 w-4" />,
      onClick: () => console.log('View profile', employeeId)
    },
    {
      id: 'edit-employee',
      label: 'Edit Employee',
      labelAr: 'تعديل الموظف',
      icon: <Edit className="h-4 w-4" />,
      onClick: () => console.log('Edit employee', employeeId)
    },
    { id: 'separator-1', label: '', labelAr: '', separator: true },
    {
      id: 'assign-project',
      label: 'Assign to Project',
      labelAr: 'تعيين لمشروع',
      icon: <Plus className="h-4 w-4" />,
      onClick: () => console.log('Assign to project', employeeId)
    },
    {
      id: 'view-tasks',
      label: 'View Tasks',
      labelAr: 'عرض المهام',
      icon: <Eye className="h-4 w-4" />,
      onClick: () => console.log('View tasks', employeeId)
    },
    { id: 'separator-2', label: '', labelAr: '', separator: true },
    {
      id: 'deactivate',
      label: 'Deactivate Employee',
      labelAr: 'إلغاء تفعيل الموظف',
      icon: <EyeOff className="h-4 w-4" />,
      dangerous: true,
      onClick: () => console.log('Deactivate employee', employeeId)
    }
  ],

  // Document context menu
  document: (documentId: string): ContextMenuItem[] => [
    {
      id: 'open',
      label: 'Open Document',
      labelAr: 'فتح المستند',
      icon: <Eye className="h-4 w-4" />,
      onClick: () => console.log('Open document', documentId)
    },
    {
      id: 'download',
      label: 'Download',
      labelAr: 'تحميل',
      icon: <Download className="h-4 w-4" />,
      onClick: () => console.log('Download document', documentId)
    },
    {
      id: 'copy-link',
      label: 'Copy Link',
      labelAr: 'نسخ الرابط',
      icon: <Copy className="h-4 w-4" />,
      onClick: () => console.log('Copy link', documentId)
    },
    { id: 'separator-1', label: '', labelAr: '', separator: true },
    {
      id: 'rename',
      label: 'Rename',
      labelAr: 'إعادة تسمية',
      icon: <Edit className="h-4 w-4" />,
      onClick: () => console.log('Rename document', documentId)
    },
    {
      id: 'move',
      label: 'Move to Folder',
      labelAr: 'نقل لمجلد',
      icon: <ArrowRight className="h-4 w-4" />,
      onClick: () => console.log('Move document', documentId)
    },
    { id: 'separator-2', label: '', labelAr: '', separator: true },
    {
      id: 'delete',
      label: 'Delete Document',
      labelAr: 'حذف المستند',
      icon: <Trash2 className="h-4 w-4" />,
      dangerous: true,
      onClick: () => console.log('Delete document', documentId)
    }
  ],

  // Equipment context menu
  equipment: (equipmentId: string): ContextMenuItem[] => [
    {
      id: 'view-details',
      label: 'View Details',
      labelAr: 'عرض التفاصيل',
      icon: <Eye className="h-4 w-4" />,
      onClick: () => console.log('View equipment', equipmentId)
    },
    {
      id: 'edit-equipment',
      label: 'Edit Equipment',
      labelAr: 'تعديل المعدة',
      icon: <Edit className="h-4 w-4" />,
      onClick: () => console.log('Edit equipment', equipmentId)
    },
    { id: 'separator-1', label: '', labelAr: '', separator: true },
    {
      id: 'schedule-maintenance',
      label: 'Schedule Maintenance',
      labelAr: 'جدولة الصيانة',
      icon: <Plus className="h-4 w-4" />,
      onClick: () => console.log('Schedule maintenance', equipmentId)
    },
    {
      id: 'assign-project',
      label: 'Assign to Project',
      labelAr: 'تعيين لمشروع',
      icon: <ArrowRight className="h-4 w-4" />,
      onClick: () => console.log('Assign equipment', equipmentId)
    },
    { id: 'separator-2', label: '', labelAr: '', separator: true },
    {
      id: 'mark-inactive',
      label: 'Mark as Inactive',
      labelAr: 'تعليم كغير نشط',
      icon: <EyeOff className="h-4 w-4" />,
      dangerous: true,
      onClick: () => console.log('Mark inactive', equipmentId)
    }
  ],

  // Table row context menu
  tableRow: (rowData: any): ContextMenuItem[] => [
    {
      id: 'view',
      label: 'View',
      labelAr: 'عرض',
      icon: <Eye className="h-4 w-4" />,
      onClick: () => console.log('View row', rowData)
    },
    {
      id: 'edit',
      label: 'Edit',
      labelAr: 'تعديل',
      icon: <Edit className="h-4 w-4" />,
      onClick: () => console.log('Edit row', rowData)
    },
    {
      id: 'duplicate',
      label: 'Duplicate',
      labelAr: 'تكرار',
      icon: <Copy className="h-4 w-4" />,
      onClick: () => console.log('Duplicate row', rowData)
    },
    { id: 'separator-1', label: '', labelAr: '', separator: true },
    {
      id: 'delete',
      label: 'Delete',
      labelAr: 'حذف',
      icon: <Trash2 className="h-4 w-4" />,
      dangerous: true,
      onClick: () => console.log('Delete row', rowData)
    }
  ]
};

// Quick context menu trigger button
export function ContextMenuTrigger({ 
  items, 
  children,
  className = ""
}: {
  items: ContextMenuItem[];
  children?: React.ReactNode;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ContextMenu items={items} onOpenChange={setIsOpen} className={className}>
      {children || (
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      )}
    </ContextMenu>
  );
}