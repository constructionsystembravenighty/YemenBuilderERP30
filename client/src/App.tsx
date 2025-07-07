import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RTLProvider } from "@/components/ui/rtl-provider";
import { initializeClientDatabase } from "./lib/client-database";
import { initializeOfflineAPI } from "./lib/offline-first-api";
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
import Layout from "@/components/layout/layout";
import { RouteHandler } from "@/components/navigation/route-handler";
import MobileNavigation from "@/components/mobile/mobile-navigation";
import { ServiceWorkerSetup } from "@/components/pwa/service-worker-setup";
import { OfflineBanner } from "@/components/network-status";
import { PWASetup } from "@/components/pwa/pwa-setup";
import AndroidPWASetup from "@/components/pwa/android-pwa-setup";
import EnhancedServiceWorker from "@/components/pwa/enhanced-service-worker";

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
        
        setIsInitialized(true);
        console.log('App: Offline-first system fully operational');
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
