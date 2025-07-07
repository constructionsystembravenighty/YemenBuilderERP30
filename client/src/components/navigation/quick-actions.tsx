import { useState } from "react";
import { useLocation } from "wouter";
import { 
  Plus, 
  UserPlus, 
  File, 
  FolderPlus, 
  Package, 
  Wrench, 
  Calculator,
  FileText,
  Upload,
  Download,
  Settings,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface QuickAction {
  id: string;
  label: string;
  labelAr: string;
  icon: any;
  action: () => void;
  context?: string[];
  shortcut?: string;
  variant?: "default" | "primary" | "secondary" | "danger";
}

interface QuickActionsProps {
  className?: string;
  onAction?: (actionId: string) => void;
}

export function QuickActions({ className, onAction }: QuickActionsProps) {
  const [location] = useLocation();

  // Context-aware quick actions based on current page
  const getQuickActions = (): QuickAction[] => {
    const baseActions: QuickAction[] = [
      {
        id: "new-project",
        label: "New Project",
        labelAr: "مشروع جديد",
        icon: FolderPlus,
        action: () => handleAction("new-project"),
        context: ["/", "/dashboard", "/projects"],
        shortcut: "Ctrl+N",
        variant: "primary"
      },
      {
        id: "add-employee",
        label: "Add Employee",
        labelAr: "إضافة موظف",
        icon: UserPlus,
        action: () => handleAction("add-employee"),
        context: ["/", "/dashboard", "/employees"],
        shortcut: "Ctrl+E"
      },
      {
        id: "create-invoice",
        label: "Create Invoice",
        labelAr: "إنشاء فاتورة",
        icon: File,
        action: () => handleAction("create-invoice"),
        context: ["/", "/dashboard", "/financial"],
        shortcut: "Ctrl+I"
      },
      {
        id: "add-transaction",
        label: "Add Transaction",
        labelAr: "إضافة معاملة",
        icon: Calculator,
        action: () => handleAction("add-transaction"),
        context: ["/financial", "/financial/transactions"]
      },
      {
        id: "upload-document",
        label: "Upload Document",
        labelAr: "رفع وثيقة",
        icon: Upload,
        action: () => handleAction("upload-document"),
        context: ["/documents"]
      },
      {
        id: "add-equipment",
        label: "Add Equipment",
        labelAr: "إضافة معدة",
        icon: Wrench,
        action: () => handleAction("add-equipment"),
        context: ["/equipment"]
      },
      {
        id: "add-warehouse",
        label: "Add Warehouse",
        labelAr: "إضافة مخزن",
        icon: Package,
        action: () => handleAction("add-warehouse"),
        context: ["/warehouse"]
      },
      {
        id: "generate-report",
        label: "Generate Report",
        labelAr: "إنشاء تقرير",
        icon: FileText,
        action: () => handleAction("generate-report"),
        context: ["/reports"]
      }
    ];

    // Filter actions based on current context
    return baseActions.filter(action => 
      !action.context || action.context.includes(location) || action.context.includes("/")
    );
  };

  const handleAction = (actionId: string) => {
    console.log(`Quick action triggered: ${actionId}`);
    onAction?.(actionId);
    
    // Here you can implement the actual actions
    switch (actionId) {
      case "new-project":
        // Navigate to new project form or open modal
        window.location.href = "/projects/create";
        break;
      case "add-employee":
        // Open employee creation modal
        break;
      case "create-invoice":
        // Open invoice creation modal
        break;
      case "add-transaction":
        // Open transaction form
        break;
      case "upload-document":
        // Trigger file upload
        document.getElementById('file-upload')?.click();
        break;
      case "add-equipment":
        // Open equipment form
        break;
      case "add-warehouse":
        // Open warehouse form
        break;
      case "generate-report":
        // Open report generator
        break;
      default:
        console.log(`Unknown action: ${actionId}`);
    }
  };

  const quickActions = getQuickActions();
  const primaryActions = quickActions.filter(a => a.variant === "primary").slice(0, 2);
  const secondaryActions = quickActions.filter(a => a.variant !== "primary");

  return (
    <div className={cn("flex items-center space-x-reverse space-x-2", className)}>
      {/* Primary Actions - Always visible */}
      {primaryActions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.id}
            onClick={action.action}
            className="flex items-center space-x-reverse space-x-2"
            size="sm"
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{action.labelAr}</span>
          </Button>
        );
      })}

      {/* Secondary Actions - Dropdown menu */}
      {secondaryActions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">المزيد</span>
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-right">الإجراءات السريعة</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuGroup>
              {secondaryActions.map((action) => {
                const Icon = action.icon;
                return (
                  <DropdownMenuItem
                    key={action.id}
                    onClick={action.action}
                    className="cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-reverse space-x-2">
                      <Icon className="h-4 w-4" />
                      <span>{action.labelAr}</span>
                    </div>
                    {action.shortcut && (
                      <span className="text-xs text-gray-500">{action.shortcut}</span>
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="h-4 w-4 ml-2" />
              <span>تخصيص الإجراءات</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

// Simple floating action button for mobile
export function FloatingActionButton({ className }: { className?: string }) {
  const [location] = useLocation();
  
  const getPrimaryAction = () => {
    switch (location) {
      case "/projects":
        return { icon: FolderPlus, label: "مشروع جديد", action: "new-project" };
      case "/employees":
        return { icon: UserPlus, label: "إضافة موظف", action: "add-employee" };
      case "/financial":
        return { icon: Calculator, label: "معاملة جديدة", action: "add-transaction" };
      case "/documents":
        return { icon: Upload, label: "رفع وثيقة", action: "upload-document" };
      case "/equipment":
        return { icon: Wrench, label: "إضافة معدة", action: "add-equipment" };
      case "/warehouse":
        return { icon: Package, label: "إضافة مخزن", action: "add-warehouse" };
      default:
        return { icon: Plus, label: "جديد", action: "general-add" };
    }
  };

  const primaryAction = getPrimaryAction();
  const Icon = primaryAction.icon;

  return (
    <Button
      className={cn(
        "fixed bottom-6 left-6 h-14 w-14 rounded-full shadow-lg lg:hidden z-50",
        "bg-primary hover:bg-primary/90 text-white",
        className
      )}
      onClick={() => console.log(`FAB action: ${primaryAction.action}`)}
    >
      <Icon className="h-6 w-6" />
      <span className="sr-only">{primaryAction.label}</span>
    </Button>
  );
}