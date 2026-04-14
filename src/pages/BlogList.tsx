import { useEffect, useState } from "react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

interface Blog {
  id: string;
  titulo: string;
  slug: string;
  portada_url: string;
  extracto: string;
  created_at: string;
}

const BlogList = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
    
    const fetchBlogs = async () => {
      const { data } = await supabase
        .from("blogs")
        .select("id, titulo, slug, portada_url, extracto, created_at")
        .eq("estado", "publicado")
        .order("created_at", { ascending: false });
      
      if (data) setBlogs(data);
      setLoading(false);
    };
    fetchBlogs();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNavbar />
      
      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 mt-4">
              Nuestro <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Blog</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Explora historias, guías de viaje, consejos y todo lo que necesitas saber para tu próxima gran aventura alrededor del mundo.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="flex flex-col gap-4">
                  <Skeleton className="w-full aspect-[4/3] rounded-2xl" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed text-muted-foreground">
              Aún no hay artículos publicados. ¡Vuelve muy pronto!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {blogs.map((blog) => (
                <Link key={blog.id} to={`/blog/${blog.slug}`} className="group flex flex-col gap-5">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted shadow-sm">
                    <img 
                      src={blog.portada_url} 
                      alt={blog.titulo} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  
                  <div className="flex flex-col flex-1">
                    <div className="flex text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 gap-4">
                      <span>{format(new Date(blog.created_at), "dd MMM, yyyy", { locale: es })}</span>
                      <span className="flex items-center gap-1.5"><MessageCircle className="h-3.5 w-3.5" /> 0</span>
                    </div>
                    <h3 className="text-2xl font-bold text-foreground leading-tight mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {blog.titulo}
                    </h3>
                    <p className="text-muted-foreground flex-1 line-clamp-3 leading-relaxed mb-4">
                      {blog.extracto}
                    </p>
                    
                    <div className="mt-auto text-sm font-bold text-primary flex items-center group-hover:underline underline-offset-4">
                      LEER ARTÍCULO <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <LandingFooter />
    </div>
  );
};

export default BlogList;
