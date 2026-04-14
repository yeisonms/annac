import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star, Plus, ImageIcon, Trash2, Loader2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface CasoExito {
  id: string;
  created_at: string;
  cliente_nombre: string;
  destino: string;
  tipo: "foto" | "video";
  imagen_url: string;
  video_url: string;
  testimonio: string;
  activo: boolean;
}

const emptyForm = {
  cliente_nombre: "",
  destino: "",
  tipo: "foto" as "foto" | "video",
  video_url: "",
  testimonio: "",
  activo: true
};

const CasosExitoAdmin = () => {
  const [casos, setCasos] = useState<CasoExito[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchCasos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("casos_exito_imagenes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: "No se pudieron cargar los casos de éxito.", variant: "destructive" });
    } else {
      setCasos(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCasos();
  }, []);

  const handleSave = async () => {
    if (!selectedFile) {
      toast({ title: "Archivo requerido", description: "Debes subir una imagen (o miniatura).", variant: "destructive" });
      return;
    }
    if (!form.cliente_nombre || !form.destino) {
      toast({ title: "Campos requeridos", description: "El nombre y el destino son obligatorios.", variant: "destructive" });
      return;
    }
    
    setSaving(true);
    let finalImageUrl = "";

    try {
      // 1. Upload to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('casos_exito_imagenes')
        .upload(fileName, selectedFile);

      if (uploadError) throw new Error("Error subiendo la imagen: " + uploadError.message);

      // 2. Get Public URL
      const { data: publicUrlData } = supabase.storage
        .from('casos_exito_imagenes')
        .getPublicUrl(fileName);

      finalImageUrl = publicUrlData.publicUrl;

      // 3. Insert into Database
      const { error: dbError } = await supabase.from("casos_exito_imagenes").insert([{
        cliente_nombre: form.cliente_nombre,
        destino: form.destino,
        tipo: form.tipo,
        imagen_url: finalImageUrl,
        video_url: form.video_url,
        testimonio: form.testimonio,
        activo: form.activo
      }]);
      
      if (dbError) throw dbError;

      toast({ title: "Éxito", description: "Caso guardado exitosamente." });
      setCreateOpen(false);
      setForm(emptyForm);
      setSelectedFile(null);
      fetchCasos();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Ocurrió un error al guardar.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("casos_exito_imagenes")
      .update({ activo: !currentStatus })
      .eq("id", id);
      
    if (error) {
      toast({ title: "Error", description: "No se pudo actualizar el estado.", variant: "destructive" });
    } else {
      setCasos(prev => prev.map(c => c.id === id ? { ...c, activo: !currentStatus } : c));
      toast({ title: "Actualizado", description: "Estado modificado exitosamente." });
    }
  };

  const deleteCaso = async (id: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar este caso de éxito?")) return;
    const { error } = await supabase.from("casos_exito_imagenes").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "No se pudo eliminar el caso.", variant: "destructive" });
    } else {
      setCasos(prev => prev.filter(c => c.id !== id));
      toast({ title: "Eliminado", description: "Caso eliminado exitosamente." });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Gestión de Casos de Éxito</h1>
          <p className="text-muted-foreground text-sm">Sube fotos de viajes u organiza testimonios en vídeo.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-1.5 shadow-sm">
          <Plus className="h-4 w-4" /> Nuevo Caso
        </Button>
      </div>

      <Card className="border-none shadow-md bg-card/80 backdrop-blur">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <Star className="h-5 w-5 text-yellow-500" />
            Galería y Testimonios
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : casos.length === 0 ? (
            <div className="p-16 text-center text-muted-foreground flex flex-col items-center gap-2">
              <Star className="h-8 w-8 text-muted-foreground/40" />
              <p>No hay casos de éxito registrados.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Imagen</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Destino</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Visible</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {casos.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className="h-16 w-24 rounded-md overflow-hidden bg-muted border relative">
                          <img src={c.imagen_url} alt="Portada" className="w-full h-full object-cover" />
                          {c.tipo === 'video' && (
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <Video className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">{c.cliente_nombre}</TableCell>
                      <TableCell className="text-muted-foreground">{c.destino}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.tipo === 'video' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                          {c.tipo.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={c.activo}
                          onCheckedChange={() => toggleActive(c.id, c.activo)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => deleteCaso(c.id)} className="text-red-500 hover:bg-red-50 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Añadir Nuevo Caso de Éxito</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Nombre del Cliente *</Label>
                <Input value={form.cliente_nombre} onChange={e => setForm(p => ({ ...p, cliente_nombre: e.target.value }))} placeholder="Ej. Familia Pérez" />
              </div>
              <div className="grid gap-2">
                <Label>Destino *</Label>
                <Input value={form.destino} onChange={e => setForm(p => ({ ...p, destino: e.target.value }))} placeholder="Ej. Cancún" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Tipo de Contenido</Label>
              <Select value={form.tipo} onValueChange={(val: "foto" | "video") => setForm(p => ({ ...p, tipo: val }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="foto">Foto de Galería</SelectItem>
                  <SelectItem value="video">Video Testimonio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Imagen (o miniatura) *</Label>
              <div className="relative">
                <Input 
                  type="file" 
                  accept="image/jpeg, image/png, image/webp"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="cursor-pointer file:text-muted-foreground file:font-semibold" 
                />
              </div>
              {selectedFile && <p className="text-xs text-muted-foreground">Archivo: {selectedFile.name}</p>}
            </div>

            {form.tipo === 'video' && (
              <>
                <div className="grid gap-2 animate-in fade-in slide-in-from-top-2">
                  <Label>Testimonio (Escrito) *</Label>
                  <Textarea 
                    value={form.testimonio} 
                    onChange={e => setForm(p => ({ ...p, testimonio: e.target.value }))} 
                    placeholder="El viaje superó mis expectativas..." 
                    rows={3}
                  />
                </div>
                {/* 
                // Oculté la subida del link del video xq el prompt dice Opcional
                */}
                <div className="grid gap-2 animate-in fade-in slide-in-from-top-2">
                  <Label>Enlace Externo del Video (Opcional)</Label>
                  <Input 
                    value={form.video_url} 
                    onChange={e => setForm(p => ({ ...p, video_url: e.target.value }))} 
                    placeholder="https://youtube.com/..." 
                  />
                </div>
              </>
            )}

            <div className="flex items-center space-x-2 pt-2">
              <Switch id="activo-new" checked={form.activo} onCheckedChange={(v) => setForm(p => ({ ...p, activo: v }))} />
              <Label htmlFor="activo-new">Mostrar inmediatamente en la página web</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Caso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CasosExitoAdmin;
