import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Search, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Cliente {
  id: string;
  nombre_cliente: string;
  cedula: string;
  fecha_nacimiento: string | null;
  correo: string | null;
  celular: string | null;
}

const emptyForm = { nombre_cliente: "", cedula: "", fecha_nacimiento: "", correo: "", celular: "" };

export default function Clientes() {
  const { isAdmin } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchClientes = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order("nombre_cliente");
    if (error) {
      toast.error("Error al cargar clientes: " + error.message);
    } else {
      setClientes(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchClientes(); }, [fetchClientes]);

  const filtered = clientes.filter(
    (c) =>
      c.nombre_cliente.toLowerCase().includes(search.toLowerCase()) ||
      c.cedula.includes(search)
  );

  const openNew = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (c: Cliente) => {
    setEditing(c);
    setForm({
      nombre_cliente: c.nombre_cliente,
      cedula: c.cedula,
      fecha_nacimiento: c.fecha_nacimiento ?? "",
      correo: c.correo ?? "",
      celular: c.celular ?? "",
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.nombre_cliente || !form.cedula) {
      toast.error("Nombre y cédula son obligatorios");
      return;
    }
    setSaving(true);
    const payload = {
      nombre_cliente: form.nombre_cliente,
      cedula: form.cedula,
      fecha_nacimiento: form.fecha_nacimiento || null,
      correo: form.correo || null,
      celular: form.celular || null,
    };

    if (editing) {
      const { error } = await supabase.from("clientes").update(payload).eq("id", editing.id);
      if (error) { toast.error("Error al actualizar: " + error.message); }
      else { toast.success("Cliente actualizado"); }
    } else {
      const { error } = await supabase.from("clientes").insert(payload);
      if (error) { toast.error("Error al crear: " + error.message); }
      else { toast.success("Cliente creado"); }
    }
    setSaving(false);
    setOpen(false);
    fetchClientes();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("clientes").delete().eq("id", id);
    if (error) { toast.error("Error al eliminar: " + error.message); }
    else { toast.success("Cliente eliminado"); fetchClientes(); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nombre o cédula..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-64" />
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Nuevo Cliente</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? "Editar Cliente" : "Nuevo Cliente"}</DialogTitle></DialogHeader>
              <div className="grid gap-3 py-2">
                {[
                  { key: "nombre_cliente", label: "Nombre Completo", type: "text" },
                  { key: "cedula", label: "Cédula", type: "text" },
                  { key: "fecha_nacimiento", label: "Fecha de Nacimiento", type: "date" },
                  { key: "correo", label: "Correo Electrónico", type: "email" },
                  { key: "celular", label: "Celular", type: "text" },
                ].map((f) => (
                  <div key={f.key} className="grid gap-1.5">
                    <Label>{f.label}</Label>
                    <Input
                      type={f.type}
                      value={(form as any)[f.key]}
                      onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                  Guardar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Cargando clientes...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Cédula</TableHead>
                    <TableHead>Correo</TableHead>
                    <TableHead>Celular</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No se encontraron clientes.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.nombre_cliente}</TableCell>
                        <TableCell>{c.cedula}</TableCell>
                        <TableCell>{c.correo ?? "—"}</TableCell>
                        <TableCell>{c.celular ?? "—"}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {isAdmin && (
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
