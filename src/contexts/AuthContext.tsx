import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  AppRole,
  AuthUser,
  clearStoredToken,
  fetchCurrentUser,
  getStoredToken,
  loginWithPassword,
  registerUser,
  setStoredToken,
} from "@/services/authService";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  role: AppRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  role: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const hydrateRole = (nextUser: AuthUser | null) => {
    const nextRole = nextUser?.role === "admin" ? "admin" : "user";
    setRole(nextUser ? nextRole : null);
  };

  useEffect(() => {
    const init = async () => {
      const savedToken = getStoredToken();
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const me = await fetchCurrentUser(savedToken);
        if (!me) {
          clearStoredToken();
          setLoading(false);
          return;
        }

        setToken(savedToken);
        setUser(me);
        hydrateRole(me);
      } catch {
        clearStoredToken();
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const signIn = async (email: string, password: string) => {
    const response = await loginWithPassword(email, password);
    setStoredToken(response.token);
    setToken(response.token);
    setUser(response.user);
    hydrateRole(response.user);
  };

  const signUp = async (name: string, email: string, password: string, phone?: string) => {
    await registerUser(name, email, password, phone);
  };

  const signOut = async () => {
    clearStoredToken();
    setUser(null);
    setToken(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, role, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
