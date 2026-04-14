import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface Blog {
  id: string;
  titulo: string;
  slug: string;
  portada_url: string;
  extracto: string;
  created_at: string;
}

export const LatestBlogsSection = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      const { data } = await supabase
        .from("blogs")
        .select("id, titulo, slug, portada_url, extracto, created_at")
        .eq("estado", "publicado")
        .order("created_at", { ascending: false })
        .limit(3);
      
      if (data) setBlogs(data);
      setLoading(false);
    };
    fetchLatest();
  }, []);

  return (
    <section className="py-24 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-border/50 pb-6">
          <div className="max-w-2xl">
             <span className="text-sm font-bold tracking-wider text-primary uppercase mb-2 block">Actualidad</span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">Noticias de Viaje</h2>
            <p className="mt-4 text-muted-foreground text-lg">Descubre tips, guías y anécdotas de nuestros últimos destinos alrededor del mundo.</p>
          </div>
          <Button variant="outline" asChild className="hidden md:flex mt-6 md:mt-0 rounded-full">
            <a href="/blog">Ver Todos los Artículos <ArrowRight className="ml-2 h-4 w-4" /></a>
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex flex-col gap-4">
                 <Skeleton className="w-full aspect-[4/3] rounded-2xl" />
                 <Skeleton className="h-6 w-full" />
                 <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed">
            Aún no hay artículos publicados. ¡Vuelve pronto!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <a key={blog.id} href={`/blog/${blog.slug}`} className="group flex flex-col gap-5">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
                  <img 
                    src={blog.portada_url} 
                    alt={blog.titulo} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Badge Categoría opcional */}
                </div>
                
                <div className="flex flex-col flex-1">
                  <div className="flex text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 gap-4">
                    <span>{format(new Date(blog.created_at), "dd MMM, yyyy", { locale: es })}</span>
                    <span className="flex items-center gap-1.5"><MessageCircle className="h-3.5 w-3.5" /> 0</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground leading-tight mb-3 group-hover:text-primary transition-colors">
                    {blog.titulo}
                  </h3>
                  <p className="text-muted-foreground flex-1 line-clamp-3 leading-relaxed">
                    {blog.extracto}
                  </p>
                  
                  <div className="mt-5 text-sm font-bold text-primary flex items-center group-hover:underline underline-offset-4">
                    LEER MÁS <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
        
        <div className="mt-10 flex md:hidden justify-center">
            <Button variant="outline" asChild className="rounded-full w-full max-w-sm">
              <a href="/blog">Ver Todos los Artículos</a>
            </Button>
        </div>
      </div>
    </section>
  );
};
