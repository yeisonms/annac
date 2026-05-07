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
import Historial from "@/pages/Historial";
import Reels from "@/pages/Reels";
import LandingPage from "@/pages/LandingPage";
import BlogList from "@/pages/BlogList";
import BlogDetail from "@/pages/BlogDetail";
import CasosExito from "@/pages/CasosExito";
import CasosExitoAdmin from "@/pages/CasosExitoAdmin";
import BlogAdmin from "@/pages/BlogAdmin";
import DestinationDetail from "@/pages/DestinationDetail";
import Login from "@/pages/Login";
import Registro from "@/pages/Registro";
import RecuperarPassword from "@/pages/RecuperarPassword";
import ActualizarPassword from "@/pages/ActualizarPassword";
import Espera from "@/pages/Espera";
import QuoteRedirect from "@/pages/QuoteRedirect";
import Cotizaciones from "@/pages/Cotizaciones";
import Usuarios from "@/pages/Usuarios";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, estadoPerfil } = useAuth();

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

  // Gatekeeper: solo usuarios activos pueden entrar al admin
  if (estadoPerfil !== null && estadoPerfil !== "activo") {
    return <Navigate to="/espera" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { isAdmin, isMarketing, role, user, loading } = useAuth();

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
      <Route path="/blog" element={<BlogList />} />
      <Route path="/blog/:slug" element={<BlogDetail />} />
      <Route path="/casos-exito" element={<CasosExito />} />
      <Route path="/cotizacion/whatsapp" element={<QuoteRedirect />} />
      <Route path="/destinos/:slug" element={<DestinationDetail />} />
      <Route
        path="/login"
        element={user ? <Navigate to="/admin" replace /> : <Login />}
      />
      <Route
        path="/registro"
        element={user ? <Navigate to="/admin" replace /> : <Registro />}
      />
      <Route
        path="/recuperar-password"
        element={user ? <Navigate to="/admin" replace /> : <RecuperarPassword />}
      />
      <Route
        path="/actualizar-password"
        element={<ActualizarPassword />}
      />
      <Route
        path="/espera"
        element={!user ? <Navigate to="/login" replace /> : <Espera />}
      />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Routes>
                <Route
                  index
                  element={
                    isAdmin ? <Dashboard /> :
                    isMarketing ? <Navigate to="/admin/blog" replace /> :
                    <Navigate to="/admin/ventas" replace />
                  }
                />
                {/* Rutas CRM — bloqueadas para marketing */}
                <Route path="clientes"    element={!isMarketing ? <Clientes />    : <Navigate to="/admin/blog" replace />} />
                <Route path="ventas"      element={!isMarketing ? <Ventas />      : <Navigate to="/admin/blog" replace />} />
                <Route path="cartera"     element={!isMarketing ? <Cartera />     : <Navigate to="/admin/blog" replace />} />
                <Route path="proveedores" element={!isMarketing ? <Proveedores /> : <Navigate to="/admin/blog" replace />} />
                <Route path="cotizaciones" element={!isMarketing ? <Cotizaciones /> : <Navigate to="/admin/blog" replace />} />
                <Route path="historial"   element={!isMarketing ? <Historial />   : <Navigate to="/admin/blog" replace />} />
                {/* Rutas Content — admin y marketing */}
                <Route path="blog"        element={(isAdmin || isMarketing) ? <BlogAdmin />       : <Navigate to="/admin/ventas" replace />} />
                <Route path="reels"       element={(isAdmin || isMarketing) ? <Reels />           : <Navigate to="/admin/ventas" replace />} />
                <Route path="casos-admin" element={(isAdmin || isMarketing) ? <CasosExitoAdmin /> : <Navigate to="/admin/ventas" replace />} />
                {/* Rutas exclusivas de admin */}
                <Route path="usuarios" element={isAdmin ? <Usuarios /> : <Navigate to="/admin" replace />} />
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
