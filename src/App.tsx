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
import Login from "@/pages/Login";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { isAdmin, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/destinos/:slug" element={<DestinationDetail />} />
      <Route
        path="/login"
        element={user ? <Navigate to="/admin" replace /> : <Login />}
      />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Routes>
                <Route index element={isAdmin ? <Dashboard /> : <Navigate to="/admin/ventas" replace />} />
                <Route path="clientes" element={<Clientes />} />
                <Route path="ventas" element={<Ventas />} />
                <Route path="cartera" element={<Cartera />} />
                <Route path="proveedores" element={<Proveedores />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
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
