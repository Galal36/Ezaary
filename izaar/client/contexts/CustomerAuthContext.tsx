import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { customerAuth } from "@/lib/api-client";

export interface CustomerProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  is_verified: boolean;
  created_at: string;
}

interface CustomerAuthContextType {
  customer: CustomerProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; unverified?: boolean; email?: string }>;
  logout: () => Promise<void>;
  register: (data: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    password: string;
    password_confirm: string;
  }) => Promise<void>;
  updateProfile: (data: { first_name?: string; last_name?: string; phone?: string }) => Promise<void>;
  isAuthenticated: boolean;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

const CUSTOMER_TOKEN_KEY = "ezaary_customer_token";

export const CustomerAuthProvider = ({ children }: { children: ReactNode }) => {
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(CUSTOMER_TOKEN_KEY);
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    setToken(storedToken);
    customerAuth
      .getProfile()
      .then((profile) => {
        setCustomer(profile);
      })
      .catch(() => {
        localStorage.removeItem(CUSTOMER_TOKEN_KEY);
        setToken(null);
        setCustomer(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; unverified?: boolean; email?: string }> => {
    try {
      const response = await customerAuth.login(email, password);
      if ('unverified' in response && response.unverified) {
        return { success: false, unverified: true, email: response.email };
      }
      setToken(response.token);
      setCustomer(response.customer);
      localStorage.setItem(CUSTOMER_TOKEN_KEY, response.token);
      return { success: true };
    } catch {
      return { success: false };
    }
  };

  const logout = async () => {
    try {
      await customerAuth.logout();
    } catch {
      // Ignore errors on logout
    }
    setCustomer(null);
    setToken(null);
    localStorage.removeItem(CUSTOMER_TOKEN_KEY);
  };

  const register = async (data: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    password: string;
    password_confirm: string;
  }) => {
    await customerAuth.register(data);
  };

  const updateProfile = async (data: {
    first_name?: string;
    last_name?: string;
    phone?: string;
  }) => {
    const updated = await customerAuth.updateProfile(data);
    setCustomer(updated);
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        token,
        isLoading,
        login,
        logout,
        register,
        updateProfile,
        isAuthenticated: !!customer && !!token,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
  }
  return context;
};
