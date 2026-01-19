import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DeliveryLoginPage from "./pages/DeliveryLogin";
import DeliveryDashboardPage from "./pages/DeliveryDashboard";
import AdminLoginPage from "./pages/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminMenu from "./pages/admin/AdminMenu";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminStats from "./pages/admin/AdminStats";
import AdminDelivery from "./pages/admin/AdminDelivery";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/delivery" element={<DeliveryLoginPage />} />
          <Route path="/delivery/dashboard" element={<DeliveryDashboardPage />} />
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/menu" element={<AdminMenu />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/stats" element={<AdminStats />} />
          <Route path="/admin/delivery" element={<AdminDelivery />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
