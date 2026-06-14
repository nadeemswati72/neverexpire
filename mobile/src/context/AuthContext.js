import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import * as AuthService from "../services/AuthService";

const AuthContext = createContext(null);

/**
 * Session state for the demo-mode login. Wraps AuthService so screens never
 * touch AsyncStorage directly. Must wrap DataProvider (DataContext reads
 * `user` from here to scope family members/documents per account).
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    AuthService.getCurrentUser().then((storedUser) => {
      if (isMounted) {
        setUser(storedUser);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const loggedInUser = await AuthService.login(email, password);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const logout = useCallback(async () => {
    await AuthService.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (updates) => {
    const updated = await AuthService.updateProfile(updates);
    setUser(updated);
    return updated;
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
