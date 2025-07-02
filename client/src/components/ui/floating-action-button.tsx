import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Plus, 
  X, 
  MessageCircle, 
  Phone, 
  Mail, 
  FileText, 
  User, 
  Building,
  Calculator,
  Camera,
  Upload,
  Settings,
  HelpCircle
} from 'lucide-react';

export interface FABAction {
  id: string;
  label: string;
  labelAr: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: string;
  badge?: number;
  disabled?: boolean;
  shortcut?: string;
}

export interface FloatingActionButtonProps {
  actions: FABAction[];
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  mainIcon?: React.ReactNode;
  mainLabel?: string;
  mainLabelAr?: string;
  size?: 'sm' | 'md' | 'lg';
  expandDirection?: 'up' | 'down' | 'left' | 'right';
  expandOnHover?: boolean;
  hideLabels?: boolean;
  className?: string;
}

export function FloatingActionButton({
  actions,
  position = 'bottom-right',
  mainIcon = <Plus className="h-5 w-5" />,
  mainLabel = "Quick Actions",
  mainLabelAr = "الإجراءات السريعة",
  size = 'md',
  expandDirection = 'up',
  expandOnHover = false,
  hideLabels = false,
  className = ""
}: FloatingActionButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-right':
        return 'fixed bottom-6 left-6 z-50';
      case 'bottom-left':
        return 'fixed bottom-6 right-6 z-50';
      case 'top-right':
        return 'fixed top-6 left-6 z-50';
      case 'top-left':
        return 'fixed top-6 right-6 z-50';
      default:
        return 'fixed bottom-6 left-6 z-50';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return { main: 'h-12 w-12', action: 'h-10 w-10', icon: 'h-4 w-4' };
      case 'lg':
        return { main: 'h-16 w-16', action: 'h-12 w-12', icon: 'h-6 w-6' };
      default:
        return { main: 'h-14 w-14', action: 'h-11 w-11', icon: 'h-5 w-5' };
    }
  };

  const getExpandClasses = () => {
    if (!isExpanded) return '';
    
    switch (expandDirection) {
      case 'up':
        return 'flex-col-reverse';
      case 'down':
        return 'flex-col';
      case 'left':
        return 'flex-row-reverse';
      case 'right':
        return 'flex-row';
      default:
        return 'flex-col-reverse';
    }
  };

  const sizeClasses = getSizeClasses();

  const handleMainClick = () => {
    if (actions.length === 1) {
      actions[0].onClick();
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  const handleMouseEnter = () => {
    if (expandOnHover) {
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (expandOnHover) {
      setIsExpanded(false);
    }
  };

  return (
    <TooltipProvider>
      <div 
        className={`${getPositionClasses()} ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={`flex items-center gap-3 ${getExpandClasses()}`}>
          {/* Action Buttons */}
          {isExpanded && actions.map((action, index) => (
            <div 
              key={action.id}
              className={`flex items-center gap-3 animate-in slide-in-from-bottom-2 duration-200`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Label */}
              {!hideLabels && (expandDirection === 'up' || expandDirection === 'down') && (
                <div className="bg-black text-white px-3 py-1 rounded-md text-sm whitespace-nowrap shadow-lg">
                  {action.labelAr || action.label}
                </div>
              )}
              
              {/* Action Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className={`
                      ${sizeClasses.action} p-0 rounded-full shadow-lg hover:shadow-xl 
                      transition-all duration-200 hover:scale-110 active:scale-95
                      ${action.color ? '' : 'bg-secondary hover:bg-secondary/90'}
                    `}
                    style={action.color ? { backgroundColor: action.color } : {}}
                  >
                    <div className="relative">
                      {React.cloneElement(action.icon as React.ReactElement, {
                        className: sizeClasses.icon
                      })}
                      {action.badge && action.badge > 0 && (
                        <Badge 
                          className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500"
                        >
                          {action.badge > 99 ? '99+' : action.badge}
                        </Badge>
                      )}
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <div className="text-right">
                    <div className="font-medium">{action.labelAr || action.label}</div>
                    {action.shortcut && (
                      <div className="text-xs text-gray-400">{action.shortcut}</div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>

              {/* Label for horizontal expansion */}
              {!hideLabels && (expandDirection === 'left' || expandDirection === 'right') && (
                <div className="bg-black text-white px-3 py-1 rounded-md text-sm whitespace-nowrap shadow-lg">
                  {action.labelAr || action.label}
                </div>
              )}
            </div>
          ))}

          {/* Main FAB Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleMainClick}
                className={`
                  ${sizeClasses.main} p-0 rounded-full shadow-lg hover:shadow-xl 
                  transition-all duration-300 hover:scale-110 active:scale-95
                  bg-primary hover:bg-primary/90
                  ${isExpanded ? 'rotate-45' : 'rotate-0'}
                `}
              >
                {isExpanded && actions.length > 1 ? (
                  <X className={sizeClasses.icon} />
                ) : (
                  React.cloneElement(mainIcon as React.ReactElement, {
                    className: sizeClasses.icon
                  })
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <div className="text-right">
                {mainLabelAr || mainLabel}
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}

// Predefined FAB configurations for construction management
export const constructionFABActions = {
  // Quick create actions
  quickCreate: [
    {
      id: 'new-project',
      label: 'New Project',
      labelAr: 'مشروع جديد',
      icon: <Building className="h-5 w-5" />,
      onClick: () => console.log('New project'),
      color: '#1B4332'
    },
    {
      id: 'new-employee',
      label: 'Add Employee',
      labelAr: 'إضافة موظف',
      icon: <User className="h-5 w-5" />,
      onClick: () => console.log('Add employee'),
      color: '#40916C'
    },
    {
      id: 'upload-document',
      label: 'Upload Document',
      labelAr: 'رفع مستند',
      icon: <Upload className="h-5 w-5" />,
      onClick: () => console.log('Upload document'),
      color: '#D4AF37'
    },
    {
      id: 'take-photo',
      label: 'Take Photo',
      labelAr: 'التقاط صورة',
      icon: <Camera className="h-5 w-5" />,
      onClick: () => console.log('Take photo'),
      color: '#52B788'
    }
  ],

  // Communication actions
  communication: [
    {
      id: 'send-message',
      label: 'Send Message',
      labelAr: 'إرسال رسالة',
      icon: <MessageCircle className="h-5 w-5" />,
      onClick: () => console.log('Send message'),
      color: '#3B82F6',
      badge: 3
    },
    {
      id: 'make-call',
      label: 'Make Call',
      labelAr: 'إجراء مكالمة',
      icon: <Phone className="h-5 w-5" />,
      onClick: () => console.log('Make call'),
      color: '#10B981'
    },
    {
      id: 'send-email',
      label: 'Send Email',
      labelAr: 'إرسال بريد',
      icon: <Mail className="h-5 w-5" />,
      onClick: () => console.log('Send email'),
      color: '#F59E0B'
    }
  ],

  // Single action examples
  help: [
    {
      id: 'help',
      label: 'Get Help',
      labelAr: 'طلب المساعدة',
      icon: <HelpCircle className="h-5 w-5" />,
      onClick: () => console.log('Get help'),
      color: '#8B5CF6'
    }
  ],

  calculator: [
    {
      id: 'calculator',
      label: 'Quick Calculator',
      labelAr: 'حاسبة سريعة',
      icon: <Calculator className="h-5 w-5" />,
      onClick: () => console.log('Calculator'),
      color: '#EF4444'
    }
  ]
};

// Mobile-optimized FAB for touch interfaces
export function MobileFAB({
  actions,
  className = ""
}: {
  actions: FABAction[];
  className?: string;
}) {
  return (
    <FloatingActionButton
      actions={actions}
      position="bottom-right"
      size="lg"
      expandDirection="up"
      expandOnHover={false}
      hideLabels={false}
      className={`md:hidden ${className}`}
    />
  );
}

// Context-aware FAB that changes based on current page
export function ContextualFAB({
  currentPath,
  onNavigate
}: {
  currentPath: string;
  onNavigate: (path: string) => void;
}) {
  const getContextualActions = (): FABAction[] => {
    switch (true) {
      case currentPath.startsWith('/projects'):
        return [
          {
            id: 'new-project',
            label: 'New Project',
            labelAr: 'مشروع جديد',
            icon: <Building className="h-5 w-5" />,
            onClick: () => onNavigate('/projects/new')
          },
          {
            id: 'upload-plan',
            label: 'Upload Plan',
            labelAr: 'رفع مخطط',
            icon: <Upload className="h-5 w-5" />,
            onClick: () => console.log('Upload plan')
          }
        ];
      
      case currentPath.startsWith('/employees'):
        return [
          {
            id: 'add-employee',
            label: 'Add Employee',
            labelAr: 'إضافة موظف',
            icon: <User className="h-5 w-5" />,
            onClick: () => onNavigate('/employees/new')
          }
        ];
      
      case currentPath.startsWith('/documents'):
        return [
          {
            id: 'upload-document',
            label: 'Upload Document',
            labelAr: 'رفع مستند',
            icon: <Upload className="h-5 w-5" />,
            onClick: () => console.log('Upload document')
          },
          {
            id: 'scan-document',
            label: 'Scan Document',
            labelAr: 'مسح مستند',
            icon: <Camera className="h-5 w-5" />,
            onClick: () => console.log('Scan document')
          }
        ];
      
      default:
        return constructionFABActions.quickCreate;
    }
  };

  return (
    <FloatingActionButton
      actions={getContextualActions()}
      position="bottom-right"
      size="md"
      expandDirection="up"
    />
  );
}