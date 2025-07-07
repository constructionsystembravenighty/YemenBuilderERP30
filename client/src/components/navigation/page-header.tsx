import { useLocation } from "wouter";
import { ChevronLeft, MoreHorizontal, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "./breadcrumb";
import { QuickActions } from "./quick-actions";
import { cn } from "@/lib/utils";
import { getPageTitle } from "./route-handler";

interface PageHeaderProps {
  title?: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  showBreadcrumb?: boolean;
  showQuickActions?: boolean;
  onRefresh?: () => void;
  customActions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  titleAr,
  description,
  descriptionAr,
  showBreadcrumb = true,
  showQuickActions = true,
  onRefresh,
  customActions,
  className
}: PageHeaderProps) {
  const [location] = useLocation();
  
  // Get page title from route config if not provided
  const { title: routeTitle, titleAr: routeTitleAr } = getPageTitle(location);
  const displayTitle = title || routeTitle;
  const displayTitleAr = titleAr || routeTitleAr;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Breadcrumb Navigation */}
      {showBreadcrumb && (
        <Breadcrumb className="text-sm" />
      )}
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-charcoal-text">
            {displayTitleAr}
          </h1>
          {(description || descriptionAr) && (
            <p className="text-gray-600 text-sm">
              {descriptionAr || description}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-reverse space-x-3">
          {/* Refresh Button */}
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="flex items-center space-x-reverse space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">تحديث</span>
            </Button>
          )}
          
          {/* Custom Actions */}
          {customActions}
          
          {/* Quick Actions */}
          {showQuickActions && (
            <QuickActions />
          )}
        </div>
      </div>
    </div>
  );
}

// Page layout component that includes header and content
interface PageLayoutProps {
  title?: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  showBreadcrumb?: boolean;
  showQuickActions?: boolean;
  onRefresh?: () => void;
  customActions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function PageLayout({
  title,
  titleAr,
  description,
  descriptionAr,
  showBreadcrumb = true,
  showQuickActions = true,
  onRefresh,
  customActions,
  children,
  className
}: PageLayoutProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <PageHeader
        title={title}
        titleAr={titleAr}
        description={description}
        descriptionAr={descriptionAr}
        showBreadcrumb={showBreadcrumb}
        showQuickActions={showQuickActions}
        onRefresh={onRefresh}
        customActions={customActions}
      />
      
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}