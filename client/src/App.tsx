import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RTLProvider } from "@/components/ui/rtl-provider";
import { initializeClientDatabase } from "./lib/client-database";
import { initializeOfflineAPI } from "./lib/offline-first-api";
import { syncEngine } from "./lib/sync-engine";
import { VersionManager } from "./lib/version-manager";

import { useEffect, useState } from "react";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Projects from "@/pages/projects";
import ActiveProjects from "@/pages/projects/active";
import CompletedProjects from "@/pages/projects/completed";
import PlanningProjects from "@/pages/projects/planning";
import Financial from "@/pages/financial";
import Employees from "@/pages/employees";
import Warehouse from "@/pages/warehouse";
import Documents from "@/pages/documents";
import Equipment from "@/pages/equipment";
import Reports from "@/pages/reports";
import FormsDemo from "@/pages/forms-demo";
import Analytics from "@/pages/analytics";
import Workflows from "@/pages/workflows";
import Audit from "@/pages/audit";
import { GlobalExpansionDemo } from "@/components/global-expansion-demo";
import { MultiPlatformDashboard } from "@/components/multi-platform-dashboard";
import AdvancedFeatures from "@/pages/advanced-features";
import Layout from "@/components/layout/layout";
import { RouteHandler } from "@/components/navigation/route-handler";
import MobileNavigation from "@/components/mobile/mobile-navigation";
import { ServiceWorkerSetup } from "@/components/pwa/service-worker-setup";
import { OfflineBanner } from "@/components/network-status";
import { PWASetup } from "@/components/pwa/pwa-setup";
import AndroidPWASetup from "@/components/pwa/android-pwa-setup";
import EnhancedServiceWorker from "@/components/pwa/enhanced-service-worker";
import { EnhancedInstallPrompt, usePWAInstall } from "@/components/pwa/enhanced-install-prompt";

// PWA Installation Prompt Manager
function InstallPromptManager() {
  const { canInstall, isInstalled } = usePWAInstall();
  const [showPrompt, setShowPrompt] = useState(true);

  useEffect(() => {
    // Only show prompt after a delay to not interfere with initial loading
    const timer = setTimeout(() => {
      if (canInstall && !isInstalled && !sessionStorage.getItem('installPromptDismissed')) {
        setShowPrompt(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [canInstall, isInstalled]);

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('installPromptDismissed', 'true');
  };

  if (!showPrompt || isInstalled || !canInstall) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 pt-4">
      <EnhancedInstallPrompt onDismiss={handleDismiss} />
    </div>
  );
}

function Router() {
  return (
    <RouteHandler>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/projects" component={Projects} />
        <Route path="/projects/:id" component={Projects} />
        <Route path="/projects/active" component={ActiveProjects} />
        <Route path="/projects/completed" component={CompletedProjects} />
        <Route path="/projects/planning" component={PlanningProjects} />
        <Route path="/financial" component={Financial} />
        <Route path="/financial/transactions" component={Financial} />
        <Route path="/financial/budgets" component={Financial} />
        <Route path="/financial/reports" component={Financial} />
        <Route path="/employees" component={Employees} />
        <Route path="/employees/:id" component={Employees} />
        <Route path="/employees/departments" component={Employees} />
        <Route path="/employees/attendance" component={Employees} />
        <Route path="/employees/payroll" component={Employees} />
        <Route path="/warehouse" component={Warehouse} />
        <Route path="/warehouse/inventory" component={Warehouse} />
        <Route path="/warehouse/suppliers" component={Warehouse} />
        <Route path="/warehouse/orders" component={Warehouse} />
        <Route path="/documents" component={Documents} />
        <Route path="/equipment" component={Equipment} />
        <Route path="/reports" component={Reports} />
        <Route path="/forms-demo" component={FormsDemo} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/workflows" component={Workflows} />
        <Route path="/audit" component={Audit} />
        <Route path="/global-expansion" component={GlobalExpansionDemo} />
        <Route path="/multi-platform" component={MultiPlatformDashboard} />
        <Route path="/advanced-features" component={AdvancedFeatures} />
        <Route component={NotFound} />
      </Switch>
    </RouteHandler>
  );
}

function OfflineInitializer({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const initializeOfflineSystem = async () => {
      try {
        console.log('App: Initializing offline-first construction management system');
        
        // Initialize client database with comprehensive data
        await initializeClientDatabase();
        console.log('App: Client database initialized');
        
        // Initialize offline API system
        await initializeOfflineAPI();
        console.log('App: Offline API system initialized');
        
        // Initialize version manager
        await VersionManager.initialize();
        console.log('App: Version manager initialized');
        
        // Initialize sync engine
        await syncEngine.initialize();
        console.log('App: Sync engine initialized');
        
        // Initialize mobile app manager for native capabilities
        if (typeof window !== 'undefined' && window.Capacitor) {
          console.log('App: Mobile capabilities detected but manager not loaded');
        }
        
        setIsInitialized(true);
        console.log('App: Complete offline-first construction management system operational');
      } catch (error) {
        console.error('App: Failed to initialize offline system:', error);
        setInitError(error instanceof Error ? error.message : 'Unknown initialization error');
        setIsInitialized(true); // Still show app, just with error
      }
    };

    initializeOfflineSystem();
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">تهيئة منصة إدارة البناء</h2>
          <p className="text-white/80">جاري تحضير قاعدة البيانات المحلية...</p>
        </div>
      </div>
    );
  }

  if (initError) {
    console.warn('App: Running with initialization error:', initError);
  }

  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RTLProvider>
        <TooltipProvider>
          <OfflineInitializer>
            <OfflineBanner />
            <InstallPromptManager />
            <Layout>
              <Router />
            </Layout>
            <MobileNavigation />
            <ServiceWorkerSetup />
            <PWASetup />
            <AndroidPWASetup />
            <EnhancedServiceWorker />
            <Toaster />
          </OfflineInitializer>
        </TooltipProvider>
      </RTLProvider>
    </QueryClientProvider>
  );
}

export default App;
