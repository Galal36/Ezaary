import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { auth } from "@/lib/api-client";

interface AdminUser {
  email: string;
  role: "admin";
  token: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if admin is already logged in (from localStorage)
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const email = localStorage.getItem("admin_email");
    if (token && email) {
      setAdmin({ email, role: "admin", token });
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await auth.login(email, password);
      const adminUser: AdminUser = { 
        email: response.user.email, 
        role: "admin", 
        token: response.token 
      };
      
      setAdmin(adminUser);
      localStorage.setItem("admin_token", response.token);
      localStorage.setItem("admin_email", response.user.email);
      
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await auth.logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
    setAdmin(null);
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_email");
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        isLoading,
        login,
        logout,
        isAdmin: !!admin,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
};
