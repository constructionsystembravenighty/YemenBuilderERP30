import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RTLProvider } from "@/components/ui/rtl-provider";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Projects from "@/pages/projects";
import Financial from "@/pages/financial";
import Employees from "@/pages/employees";
import Warehouse from "@/pages/warehouse";
import Documents from "@/pages/documents";
import Equipment from "@/pages/equipment";
import Reports from "@/pages/reports";
import FormsDemo from "@/pages/forms-demo";
import Layout from "@/components/layout/layout";
import { RouteHandler } from "@/components/navigation/route-handler";

function Router() {
  return (
    <RouteHandler>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/projects" component={Projects} />
        <Route path="/projects/:id" component={Projects} />
        <Route path="/projects/active" component={Projects} />
        <Route path="/projects/completed" component={Projects} />
        <Route path="/projects/planning" component={Projects} />
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
        <Route component={NotFound} />
      </Switch>
    </RouteHandler>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RTLProvider>
        <TooltipProvider>
          <Layout>
            <Router />
          </Layout>
          <Toaster />
        </TooltipProvider>
      </RTLProvider>
    </QueryClientProvider>
  );
}

export default App;
