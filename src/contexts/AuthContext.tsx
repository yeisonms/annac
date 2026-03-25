import React, { createContext, useContext, useState } from "react";

type Role = "admin" | "agente";

interface AuthContextType {
  role: Role;
  setRole: (role: Role) => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [role, setRole] = useState<Role>("admin");
  return (
    <AuthContext.Provider value={{ role, setRole, isAdmin: role === "admin" }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
