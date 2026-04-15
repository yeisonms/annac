import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

type Role = "admin" | "agente";
type EstadoPerfil = "pendiente" | "activo" | "inactivo" | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: Role;
  isAdmin: boolean;
  estadoPerfil: EstadoPerfil;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role>("agente");
  const [estadoPerfil, setEstadoPerfil] = useState<EstadoPerfil>(null);
  const [loading, setLoading] = useState(true);

  const fetchPerfil = async (userId: string) => {
    const { data, error } = await supabase
      .from("perfiles")
      .select("rol, estado")
      .eq("id", userId)
      .single();

    if (!error && data) {
      setRole((data.rol as Role) ?? "agente");
      setEstadoPerfil((data.estado as EstadoPerfil) ?? "pendiente");
    } else {
      // No cambiar estadoPerfil si hay error — dejar null para no bloquear
      // al usuario mientras se resuelven las políticas RLS
      setRole("agente");
      setEstadoPerfil(null);
    }
  };

  useEffect(() => {
    // Set up auth listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, sess) => {
        setSession(sess);
        setUser(sess?.user ?? null);

        if (sess?.user) {
          // Use setTimeout to avoid Supabase deadlock
          setTimeout(() => fetchPerfil(sess.user.id), 0);
        } else {
          setRole("agente");
          setEstadoPerfil(null);
        }
        setLoading(false);
      }
    );

    // THEN check existing session
    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        fetchPerfil(sess.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole("agente");
    setEstadoPerfil(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, role, isAdmin: role === "admin", estadoPerfil, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
