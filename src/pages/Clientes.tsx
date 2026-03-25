import { useState } from "react";
import { clientes as initialClientes, Cliente } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Clientes() {
  const { isAdmin } = useAuth();
  const [clientesList, setClientesList] = useState<Cliente[]>(initialClientes);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [form, setForm] = useState({ nombre_cliente: "", cedula: "", fecha_nacimiento: "", correo: "", celular: "" });

  const filtered = clientesList.filter(
    (c) => c.nombre_cliente.toLowerCase().includes(search.toLowerCase()) || c.cedula.includes(search)
  );

  const openNew = () => { setEditing(null); setForm({ nombre_cliente: "", cedula: "", fecha_nacimiento: "", correo: "", celular: "" }); setOpen(true); };
  const openEdit = (c: Cliente) => { setEditing(c); setForm({ ...c }); setOpen(true); };

  const handleSave = () => {
    if (!form.nombre_cliente || !form.cedula) { toast.error("Nombre y cédula son obligatorios"); return; }
    if (editing) {
      setClientesList((prev) => prev.map((c) => (c.id === editing.id ? { ...c, ...form } : c)));
      toast.success("Cliente actualizado");
    } else {
      setClientesList((prev) => [...prev, { ...form, id: `c${Date.now()}` }]);
      toast.success("Cliente creado");
    }
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    setClientesList((prev) => prev.filter((c) => c.id !== id));
    toast.success("Cliente eliminado");
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
                    <Input type={f.type} value={(form as any)[f.key]} onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))} />
                  </div>
                ))}
              </div>
              <DialogFooter><Button onClick={handleSave}>Guardar</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
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
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.nombre_cliente}</TableCell>
                    <TableCell>{c.cedula}</TableCell>
                    <TableCell>{c.correo}</TableCell>
                    <TableCell>{c.celular}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                      {isAdmin && <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
