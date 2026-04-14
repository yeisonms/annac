import { useEffect, useState, useRef, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Edit3, Plus, Trash2, Loader2, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Editor Enriquecido
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface Blog {
  id: string; // supongo UUID
  titulo: string;
  slug: string;
  portada_url: string;
  extracto: string;
  contenido: string;
  estado: "borrador" | "publicado";
  tags: string[]; // cambiado a array
  autor_id: string;
  created_at: string;
}

const emptyForm = {
  titulo: "",
  slug: "",
  extracto: "",
  contenido: "",
  estado: "borrador" as "borrador" | "publicado",
  tags: ""
};

const BlogAdmin = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  
  const quillRef = useRef<ReactQuill>(null);

  const fetchBlogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setBlogs(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Generador de Slug dinámico
  useEffect(() => {
    if (!editingId) {
      const gSlug = form.titulo
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remover tildes
        .replace(/[^a-z0-9 -]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setForm((prev) => ({ ...prev, slug: gSlug }));
    }
  }, [form.titulo, editingId]);

  // Manejador de Imágenes interno del Quill Editor
  const imageHandler = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files ? input.files[0] : null;
      if (!file) return;

      toast({ title: "Subiendo imagen...", description: "Cargando imagen al contenido..." });

      const fileExt = file.name.split('.').pop();
      const fileName = `editor_${crypto.randomUUID()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("portadas_blog")
        .upload(fileName, file);

      if (error) {
        toast({ title: "Error", description: "No se pudo subir la imagen", variant: "destructive" });
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("portadas_blog")
        .getPublicUrl(fileName);

      const url = publicUrlData.publicUrl;
      
      const quill = quillRef.current?.getEditor();
      if (quill) {
        const range = quill.getSelection();
        const cursorPosition = range ? range.index : 0;
        quill.insertEmbed(cursorPosition, "image", url);
        quill.setSelection({ index: cursorPosition + 1, length: 0 });
      }
      
      toast({ title: "Éxito", description: "Imagen incrustada" });
    };
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    }
  }), []);

  const handleSave = async () => {
    if (!form.titulo || !form.contenido) {
      toast({ title: "Campos requeridos", description: "El título y contenido son obligatorios.", variant: "destructive" });
      return;
    }

    setSaving(true);
    let finalPortadaUrl = ""; // Para mantener existente si no seleccionó nueva durante edit

    try {
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('portadas_blog')
          .upload(fileName, selectedFile);

        if (uploadError) throw new Error("Error subiendo la portada: " + uploadError.message);

        const { data: publicUrlData } = supabase.storage.from('portadas_blog').getPublicUrl(fileName);
        finalPortadaUrl = publicUrlData.publicUrl;
      }

      const session = await supabase.auth.getSession();
      const userId = session.data.session?.user.id;

      const payload = {
        titulo: form.titulo,
        slug: form.slug,
        extracto: form.extracto,
        contenido: form.contenido,
        estado: form.estado,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean), // convert string to array
        ...(finalPortadaUrl && { portada_url: finalPortadaUrl })
      };

      let dbError;

      if (editingId) {
        const { error } = await supabase.from("blogs").update(payload).eq("id", editingId);
        dbError = error;
      } else {
        const { error } = await supabase.from("blogs").insert([{ ...payload, autor_id: userId }]);
        dbError = error;
      }
      
      if (dbError) throw dbError;

      toast({ title: "Éxito", description: `Artículo ${editingId ? 'actualizado' : 'creado'} exitosamente.` });
      setCreateOpen(false);
      resetForm();
      fetchBlogs();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Ocurrió un error al guardar.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (blog: Blog) => {
    setForm({
      titulo: blog.titulo,
      slug: blog.slug,
      extracto: blog.extracto,
      contenido: blog.contenido,
      estado: blog.estado,
      tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : (blog.tags || "")
    });
    setEditingId(blog.id);
    setSelectedFile(null);
    setCreateOpen(true);
  };

  const deleteBlog = async (id: string) => {
    if (!window.confirm("¿Estás seguro de eliminar permanentemente este artículo?")) return;
    const { error } = await supabase.from("blogs").delete().eq("id", id);
    if (!error) {
      setBlogs(prev => prev.filter(b => b.id !== id));
      toast({ title: "Eliminado", description: "Artículo borrado exitosamente." });
    } else {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setSelectedFile(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Gestión de Blogs</h1>
          <p className="text-muted-foreground text-sm">Crea, edita y publica artículos para tu audiencia.</p>
        </div>
        <Button onClick={() => { resetForm(); setCreateOpen(true); }} className="gap-1.5 shadow-sm">
          <Plus className="h-4 w-4" /> Nuevo Artículo
        </Button>
      </div>

      <Card className="border-none shadow-md bg-card/80 backdrop-blur">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <Edit3 className="h-5 w-5 text-indigo-500" />
            Directorio de Artículos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <div className="p-16 text-center text-muted-foreground flex flex-col items-center gap-2">
              <Edit3 className="h-8 w-8 text-muted-foreground/40" />
              <p>No tienes ningún artículo creado. ¡Muestra tu conocimiento redactando tu primer post!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Creación</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blogs.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-semibold">{b.titulo}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 flex items-center w-fit gap-1.5 rounded-full text-xs font-medium border ${b.estado === 'publicado' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${b.estado === 'publicado' ? 'bg-green-600' : 'bg-gray-400'}`}></span>
                          {b.estado.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(b.created_at), "dd MMM yyyy", { locale: es })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(b)}>
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteBlog(b.id)} className="text-red-500 hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={(v) => { if(!v) resetForm(); setCreateOpen(v); }}>
        <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col gap-0 p-0">
          <DialogHeader className="px-6 py-4 border-b shrink-0">
            <DialogTitle className="text-lg">{editingId ? "Editar Artículo" : "Nuevo Artículo de Blog"}</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Título del Artículo *</Label>
                <Input value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))} className="text-lg font-medium" />
              </div>
              <div className="space-y-2 col-span-2 text-muted-foreground">
                <p className="text-xs flex items-center gap-1">
                  <LinkIcon className="h-3 w-3" /> /{form.slug || "slug-generado-automaticamente"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2">
                <Label>Imagen de Portada {!editingId && "*"}</Label>
                <Input 
                  type="file" 
                  accept="image/jpeg, image/png, image/webp"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="cursor-pointer file:text-muted-foreground file:font-semibold" 
                />
                {editingId && !selectedFile && <p className="text-xs text-muted-foreground">Deja vacío para no cambiar la portada actual.</p>}
              </div>

              <div className="space-y-2">
                <Label>Estado de Publicación</Label>
                <Select value={form.estado} onValueChange={(val: "borrador" | "publicado") => setForm(p => ({ ...p, estado: val }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="borrador">Borrador (Oculto)</SelectItem>
                    <SelectItem value="publicado">Publicado (Visible)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Extracto / Resumen (SEO y Tarjetas)</Label>
              <Textarea 
                value={form.extracto} 
                onChange={e => setForm(p => ({ ...p, extracto: e.target.value }))} 
                placeholder="Breve introducción para atrapar al lector..." 
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Contenido Completo (Editor) *</Label>
              <div className="bg-card rounded-md border min-h-[300px]">
                <ReactQuill 
                  ref={quillRef}
                  theme="snow" 
                  value={form.contenido} 
                  onChange={(val) => setForm(p => ({ ...p, contenido: val }))} 
                  modules={modules}
                  className="h-[300px]"
                />
              </div>
            </div>

            <div className="space-y-2 pt-6">
              <Label>Etiquetas (Separadas por comas)</Label>
              <Input 
                value={form.tags} 
                onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} 
                placeholder="Ej. Europa, Tips, Presupuesto..." 
              />
            </div>
            
          </div>

          <DialogFooter className="px-6 py-4 border-t shrink-0">
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingId ? "Actualizar Artículo" : "Publicar Artículo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlogAdmin;
