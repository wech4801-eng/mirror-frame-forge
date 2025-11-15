import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Prospects from "./pages/Prospects";
import Campaigns from "./pages/Campaigns";
import Webinars from "./pages/Webinars";
import WebinarRoom from "./pages/WebinarRoom";
import Branding from "./pages/Branding";
import Mail from "./pages/Mail";
import Workflow from "./pages/Workflow";
import WorkflowEditor from "./pages/WorkflowEditor";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/prospects" element={<Prospects />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/webinars" element={<Webinars />} />
          <Route path="/webinar/:id/:mode" element={<WebinarRoom />} />
          <Route path="/webinar/:id" element={<WebinarRoom />} />
          <Route path="/branding" element={<Branding />} />
          <Route path="/mail" element={<Mail />} />
          <Route path="/workflow" element={<Workflow />} />
          <Route path="/workflow/:id" element={<WorkflowEditor />} />
          <Route path="/settings" element={<Settings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
