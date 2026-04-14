import { useEffect, useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, MessageCircle, User, ArrowLeft, ArrowRight, Facebook, Instagram, Link as LinkIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Blog {
  id: string;
  titulo: string;
  slug: string;
  portada_url: string;
  extracto: string;
  contenido: string;
  tags: string[];
  created_at: string;
}

const BlogDetail = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [related, setRelated] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchBlog = async () => {
      if (!slug) return;
      setLoading(true);
      setError(false);

      // Fetch Main Blog
      const { data, error: dbError } = await supabase
        .from("blogs")
        .select("*")
        .eq("slug", slug)
        .eq("estado", "publicado")
        .single();

      if (dbError || !data) {
        setError(true);
        setLoading(false);
        return;
      }

      setBlog(data);

      // Fetch Related Blogs
      const { data: relatedData } = await supabase
        .from("blogs")
        .select("id, titulo, slug, portada_url, extracto, created_at")
        .eq("estado", "publicado")
        .neq("id", data.id)
        .limit(3);
        
      if (relatedData) setRelated(relatedData);
      
      setLoading(false);
    };

    fetchBlog();
  }, [slug]);

  if (error) {
    return <Navigate to="/blog" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <LandingNavbar />
        <div className="w-full h-[60vh] bg-muted animate-pulse"></div>
        <div className="max-w-3xl mx-auto px-4 py-16 space-y-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (!blog) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNavbar />

      <main className="flex-1 w-full">
        {/* Full Header Hero */}
        <div className="relative w-full h-[60vh] min-h-[500px] flex items-center justify-center">
          <div className="absolute inset-0">
            <img 
              src={blog.portada_url} 
              alt={blog.titulo} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50" /> {/* Dark Overlay */}
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center mt-20">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight">
              {blog.titulo}
            </h1>
            
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm md:text-base font-medium text-white/90">
              <span className="flex items-center gap-2">
                <User className="h-4 w-4" /> Annac Viajes
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" /> 
                {format(new Date(blog.created_at), "dd 'de' MMMM, yyyy", { locale: es })}
              </span>
              <span className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" /> 0 Comentarios
              </span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-3xl mx-auto px-4 py-16 md:py-24">
          
          <article 
            className="prose prose-lg md:prose-xl prose-stone max-w-none prose-headings:font-bold prose-a:text-primary hover:prose-a:text-blue-600 prose-img:rounded-xl prose-img:shadow-md"
            dangerouslySetInnerHTML={{ __html: blog.contenido }}
          />

          {/* Footer of Article -> Tags & Share */}
          <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-wrap gap-2">
              {blog.tags && blog.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-muted text-muted-foreground text-xs font-semibold uppercase tracking-wider rounded-full">
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-muted-foreground">COMPARTIR:</span>
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank', 'width=600,height=400')}
              >
                 <Facebook className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200 transition-colors"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast({
                    title: "Enlace copiado",
                    description: "El enlace está listo para pegarlo en tus Historias o bio de Instagram.",
                  });
                }}
              >
                 <Instagram className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full hover:bg-gray-100 transition-colors"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast({
                    title: "Enlace copiado al portapapeles",
                    description: "Ya puedes enviarlo a tus amigos.",
                  });
                }}
              >
                 <LinkIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
        </div>

        {/* Related Posts */}
        {related.length > 0 && (
          <div className="bg-muted/30 py-20 px-4 border-t border-border/50">
            <div className="max-w-7xl mx-auto">
              <h3 className="text-3xl font-extrabold mb-10 text-center">También te puede gustar</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {related.map((rel) => (
                  <Link key={rel.id} to={`/blog/${rel.slug}`} className="group flex flex-col gap-4">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted shadow-sm">
                      <img 
                        src={rel.portada_url} 
                        alt={rel.titulo} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                        {format(new Date(rel.created_at), "MMM dd, yyyy", { locale: es })}
                      </div>
                      <h4 className="text-xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {rel.titulo}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <LandingFooter />
    </div>
  );
};

export default BlogDetail;
