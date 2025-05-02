
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "@/components/ui/sonner";

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  logout: () => {},
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Check localStorage for existing session on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem("kediaUser");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user data:", error);
        localStorage.removeItem("kediaUser");
      }
    }
  }, []);

  // Mock login function (in a real app, this would connect to a backend)
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // For demo purposes, we'll accept any non-empty email/password combo
      if (!email || !password) {
        toast.error("Email and password are required");
        return false;
      }

      // Mock successful login
      const mockUser: User = {
        id: "user-" + Math.floor(Math.random() * 1000),
        name: email.split("@")[0], // Use part of email as name
        email,
      };

      // Store user data in localStorage
      localStorage.setItem("kediaUser", JSON.stringify(mockUser));
      setUser(mockUser);
      toast.success("Login successful");
      return true;
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("kediaUser");
    setUser(null);
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
