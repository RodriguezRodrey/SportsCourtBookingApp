import {
    createContext,
    useContext,
    useState,
    type PropsWithChildren,
} from "react";
import { loginUser } from "../database/db";
import type { User } from "../database/types";

type AuthContextValue = {
  user: User | null;
  isSigningIn: boolean;
  signIn: (email: string, password: string) => Promise<User | null>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  async function signIn(email: string, password: string): Promise<User | null> {
    setIsSigningIn(true);

    try {
      const result = await loginUser(email, password);

      if (!result) return null;

      setUser(result);
      return result;
    } finally {
      setIsSigningIn(false);
    }
  }

  function signOut() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isSigningIn, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
}
