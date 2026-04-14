import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Instagram, Plus, ExternalLink, ImageIcon, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Reel {
  id: number;
  created_at: string;
  portada_url: string;
  instagram_url: string;
  vistas: string;
  activo: boolean;
}

const emptyForm = {
  portada_url: "",
  instagram_url: "",
  vistas: "",
  activo: true
};

const Reels = () => {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchReels = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reels_destacados")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: "No se pudieron cargar los reels.", variant: "destructive" });
    } else {
      setReels(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReels();
  }, []);

  const handleSave = async () => {
    if (!selectedFile || !form.instagram_url) {
      toast({ title: "Campos requeridos", description: "La imagen de la portada y el enlace de Instagram son obligatorios.", variant: "destructive" });
      return;
    }
    
    setSaving(true);
    let finalPortadaUrl = "";

    try {
      // 1. Upload to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('portadas_reels')
        .upload(fileName, selectedFile);

      if (uploadError) throw new Error("Error subiendo la imagen: " + uploadError.message);

      // 2. Get Public URL
      const { data: publicUrlData } = supabase.storage
        .from('portadas_reels')
        .getPublicUrl(fileName);

      finalPortadaUrl = publicUrlData.publicUrl;

      // 3. Insert into Database
      const { error: dbError } = await supabase.from("reels_destacados").insert([{
        instagram_url: form.instagram_url,
        vistas: form.vistas,
        activo: form.activo,
        portada_url: finalPortadaUrl
      }]);
      
      if (dbError) throw dbError;

      toast({ title: "Éxito", description: "Reel guardado exitosamente." });
      setCreateOpen(false);
      setForm(emptyForm);
      setSelectedFile(null);
      fetchReels();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Ocurrió un error inesperado al guardar.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase
      .from("reels_destacados")
      .update({ activo: !currentStatus })
      .eq("id", id);
      
    if (error) {
      toast({ title: "Error", description: "No se pudo actualizar el estado.", variant: "destructive" });
    } else {
      setReels(prev => prev.map(r => r.id === id ? { ...r, activo: !currentStatus } : r));
      toast({ title: "Actualizado", description: "Estado modificado exitosamente." });
    }
  };

  const deleteReel = async (id: number) => {
    if (!window.confirm("¿Seguro que deseas eliminar este reel?")) return;
    const { error } = await supabase.from("reels_destacados").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "No se pudo eliminar el reel.", variant: "destructive" });
    } else {
      setReels(prev => prev.filter(r => r.id !== id));
      toast({ title: "Eliminado", description: "Reel eliminado exitosamente." });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Gestión de Redes (Reels)</h1>
          <p className="text-muted-foreground text-sm">Administra los videos destacados de Instagram que aparecen en la Landing Page.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-1.5 shadow-sm">
          <Plus className="h-4 w-4" /> Nuevo Reel
        </Button>
      </div>

      <Card className="border-none shadow-md bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <Instagram className="h-5 w-5 text-pink-600" />
            Reels Destacados
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : reels.length === 0 ? (
            <div className="p-16 text-center text-muted-foreground flex flex-col items-center gap-2">
              <Instagram className="h-8 w-8 text-muted-foreground/40" />
              <p>No hay reels registrados. Agrega el primero para mostrarlo en tu web.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Portada</TableHead>
                    <TableHead>Link Instagram</TableHead>
                    <TableHead>Vistas</TableHead>
                    <TableHead>Fecha Creación</TableHead>
                    <TableHead>Visible</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reels.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div className="h-16 w-10 md:w-12 rounded-md overflow-hidden bg-muted border">
                          <img src={r.portada_url} alt="Portada" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/150")} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <a href={r.instagram_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-sm font-medium">
                          Ver en IG <ExternalLink className="h-3 w-3" />
                        </a>
                      </TableCell>
                      <TableCell className="font-semibold text-muted-foreground">
                        {r.vistas || "0"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {format(new Date(r.created_at), "dd MMM yyyy", { locale: es })}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={r.activo}
                          onCheckedChange={() => toggleActive(r.id, r.activo)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => deleteReel(r.id)} className="text-red-500 hover:bg-red-50 hover:text-red-600">
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Añadir Nuevo Reel</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Imagen de Portada (JPG/PNG/WEBP) *</Label>
              <div className="relative">
                <Input 
                  type="file" 
                  accept="image/jpeg, image/png, image/webp"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="cursor-pointer file:text-muted-foreground file:font-semibold" 
                />
              </div>
              {selectedFile && (
                <p className="text-xs text-muted-foreground">Archivo seleccionado: {selectedFile.name}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label>URL del Reel de Instagram *</Label>
              <div className="relative">
                <Instagram className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input value={form.instagram_url} onChange={e => setForm(p => ({ ...p, instagram_url: e.target.value }))} placeholder="https://instagram.com/reel/..." className="pl-9" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Texto de Vistas / Likes (Ej: 4.5K)</Label>
              <Input value={form.vistas} onChange={e => setForm(p => ({ ...p, vistas: e.target.value }))} placeholder="12.4K" />
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Switch id="activo-new" checked={form.activo} onCheckedChange={(v) => setForm(p => ({ ...p, activo: v }))} />
              <Label htmlFor="activo-new">¿Mostrar inmediatamente en Landing Page?</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-pink-600 hover:bg-pink-700 text-white">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Reel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reels;
