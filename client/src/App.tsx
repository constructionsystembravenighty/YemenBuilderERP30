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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/projects" component={Projects} />
      <Route path="/financial" component={Financial} />
      <Route path="/employees" component={Employees} />
      <Route path="/warehouse" component={Warehouse} />
      <Route path="/documents" component={Documents} />
      <Route path="/equipment" component={Equipment} />
      <Route path="/reports" component={Reports} />
      <Route path="/forms-demo" component={FormsDemo} />
      <Route component={NotFound} />
    </Switch>
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
