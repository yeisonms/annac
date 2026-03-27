import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Clientes from "@/pages/Clientes";
import Ventas from "@/pages/Ventas";
import Cartera from "@/pages/Cartera";
import Proveedores from "@/pages/Proveedores";
import LandingPage from "@/pages/LandingPage";
import DestinationDetail from "@/pages/DestinationDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { isAdmin } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/admin/*"
        element={
          <AppLayout>
            <Routes>
              <Route index element={isAdmin ? <Dashboard /> : <Clientes />} />
              <Route path="clientes" element={<Clientes />} />
              <Route path="ventas" element={<Ventas />} />
              <Route path="cartera" element={<Cartera />} />
              <Route path="proveedores" element={<Proveedores />} />
            </Routes>
          </AppLayout>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
