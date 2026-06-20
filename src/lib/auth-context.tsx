import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, getToken, setToken, clearToken } from "@/lib/api";

interface AuthContextValue {
  user: { email: string } | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    api.auth
      .me()
      .then(({ user: u }) => setUser({ email: u.email }))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { token, user: u } = await api.auth.login(email, password);
      setToken(token);
      setUser({ email: u.email });
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Login failed" };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { token, user: u } = await api.auth.register(email, password);
      setToken(token);
      setUser({ email: u.email });
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Registration failed" };
    }
  };

  const signOut = () => {
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
