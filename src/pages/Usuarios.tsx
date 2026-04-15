import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, RefreshCw, ShieldCheck, UserCog, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

type EstadoPerfil = "pendiente" | "activo" | "inactivo";
type Rol = "admin" | "agente" | "marketing";

interface Perfil {
  id: string;
  nombre_completo: string;
  email: string | null;
  rol: Rol;
  estado: EstadoPerfil;
  created_at: string;
}

const estadoBadge: Record<EstadoPerfil, JSX.Element> = {
  pendiente: <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-100">Pendiente</Badge>,
  activo:    <Badge className="bg-green-100 text-green-800 border-green-300 hover:bg-green-100">Activo</Badge>,
  inactivo:  <Badge className="bg-red-100 text-red-800 border-red-300 hover:bg-red-100">Inactivo</Badge>,
};

const rolBadge: Record<Rol, JSX.Element> = {
  admin:     <Badge variant="outline" className="border-primary text-primary gap-1"><ShieldCheck className="h-3 w-3" />Admin</Badge>,
  agente:    <Badge variant="outline" className="gap-1"><UserCog className="h-3 w-3" />Agente</Badge>,
  marketing: <Badge variant="outline" className="border-purple-500 text-purple-600 gap-1"><Star className="h-3 w-3" />Marketing</Badge>,
};

export default function Usuarios() {
  const { user: authUser } = useAuth();
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchPerfiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("perfiles")
      .select("id, nombre_completo, rol, estado, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error al cargar usuarios: " + error.message);
    } else {
      setPerfiles((data as Perfil[]) ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPerfiles();
  }, []);

  const handleCambioEstado = async (id: string, nuevoEstado: EstadoPerfil) => {
    if (id === authUser?.id) {
      toast.warning("No puedes cambiar tu propio estado.");
      return;
    }
    setUpdating(id + "-estado");
    const { error, count } = await supabase
      .from("perfiles")
      .update({ estado: nuevoEstado })
      .eq("id", id)
      .select();

    if (error) {
      toast.error("Error al actualizar estado: " + error.message);
    } else if (count === 0) {
      toast.error("Sin permisos para actualizar. Verifica las políticas RLS en Supabase.");
    } else {
      toast.success(`Estado actualizado a "${nuevoEstado}".`);
      setPerfiles((prev) =>
        prev.map((p) => (p.id === id ? { ...p, estado: nuevoEstado } : p))
      );
    }
    setUpdating(null);
  };

  const handleCambioRol = async (id: string, nuevoRol: Rol) => {
    if (id === authUser?.id) {
      toast.warning("No puedes cambiar tu propio rol.");
      return;
    }
    setUpdating(id + "-rol");
    const { error, count } = await supabase
      .from("perfiles")
      .update({ rol: nuevoRol })
      .eq("id", id)
      .select();

    if (error) {
      toast.error("Error al actualizar rol: " + error.message);
    } else if (count === 0) {
      toast.error("Sin permisos para actualizar. Verifica las políticas RLS en Supabase.");
    } else {
      toast.success(`Rol actualizado a "${nuevoRol}".`);
      setPerfiles((prev) =>
        prev.map((p) => (p.id === id ? { ...p, rol: nuevoRol } : p))
      );
    }
    setUpdating(null);
  };

  const pendientes = perfiles.filter((p) => p.estado === "pendiente").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Gestión de Agentes
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Aprueba, desactiva y administra los roles de los agentes.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchPerfiles} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", count: perfiles.length, color: "text-foreground" },
          { label: "Pendientes", count: pendientes, color: "text-yellow-600" },
          { label: "Activos", count: perfiles.filter((p) => p.estado === "activo").length, color: "text-green-600" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center shadow-sm">
            <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Alert for pending */}
      {pendientes > 0 && (
        <div className="flex items-center gap-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl px-4 py-3 text-sm text-yellow-800 dark:text-yellow-300">
          <span className="text-lg">⏳</span>
          <span><strong>{pendientes} agente{pendientes > 1 ? "s" : ""}</strong> esperando aprobación. Cámbia{pendientes > 1 ? "les" : "le"} el estado a <strong>Activo</strong> para darles acceso.</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Registrado</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Cambiar Estado</TableHead>
              <TableHead className="text-right">Cambiar Rol</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : perfiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  No hay agentes registrados aún.
                </TableCell>
              </TableRow>
            ) : (
              perfiles.map((perfil) => (
                <TableRow
                  key={perfil.id}
                  className={perfil.id === authUser?.id ? "bg-primary/5" : ""}
                >
                  <TableCell className="font-medium">
                    {perfil.nombre_completo}
                    {perfil.id === authUser?.id && (
                      <span className="ml-2 text-xs text-muted-foreground">(tú)</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {perfil.email ?? <span className="italic text-muted-foreground/50">—</span>}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(perfil.created_at).toLocaleDateString("es-CO", {
                      day: "2-digit", month: "short", year: "numeric"
                    })}
                  </TableCell>
                  <TableCell>{rolBadge[perfil.rol]}</TableCell>
                  <TableCell>{estadoBadge[perfil.estado]}</TableCell>

                  {/* Cambiar Estado */}
                  <TableCell className="text-right">
                    <Select
                      value={perfil.estado}
                      onValueChange={(val) => handleCambioEstado(perfil.id, val as EstadoPerfil)}
                      disabled={updating === perfil.id + "-estado" || perfil.id === authUser?.id}
                    >
                      <SelectTrigger className="w-36 ml-auto">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendiente">⏳ Pendiente</SelectItem>
                        <SelectItem value="activo">✅ Activo</SelectItem>
                        <SelectItem value="inactivo">🚫 Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>

                  {/* Cambiar Rol */}
                  <TableCell className="text-right">
                    <Select
                      value={perfil.rol}
                      onValueChange={(val) => handleCambioRol(perfil.id, val as Rol)}
                      disabled={updating === perfil.id + "-rol" || perfil.id === authUser?.id}
                    >
                      <SelectTrigger className="w-32 ml-auto">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agente">Agente</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
