import React, { createContext, useContext, useState, useEffect } from 'react';

type UserData = {
  id?: number;
  username: string;
  role: string;
  sub_role?: string;
};

type AuthContextType = {
  token: string | null;
  user: UserData | null;
  signIn: (jwt: string, profile: UserData) => void;
  signOut: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  signIn: () => {},
  signOut: () => {},
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // In production, this would hydrate from `@react-native-async-storage/async-storage` 
  // or `expo-secure-store`.
  useEffect(() => {
    // Simulate async hydration
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  const signIn = (jwt: string, profile: UserData) => {
    setToken(jwt);
    setUser(profile);
  };

  const signOut = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, signIn, signOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
