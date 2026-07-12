import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import * as AuthService from "../services/AuthService";
import * as ApiService from "../services/ApiService";

const AuthContext = createContext(null);

/**
 * Session state — JWT-backed login against the real Flask backend. Wraps
 * AuthService so screens never touch storage directly. Must wrap
 * DataProvider (DataContext reads `user` from here to scope family
 * members/documents per account). Also exposes `token` for screens that
 * need to attach an Authorization header themselves (authenticated
 * <Image> sources — RN's Image doesn't go through ApiService).
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([AuthService.getCurrentUser(), ApiService.getAuthToken()]).then(([storedUser, storedToken]) => {
      if (isMounted) {
        setUser(storedUser);
        setToken(storedUser ? storedToken : null);
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
    setToken(await ApiService.getAuthToken());
    return loggedInUser;
  }, []);

  const register = useCallback(async (email, password, fullName) => {
    const newUser = await AuthService.register(email, password, fullName);
    setUser(newUser);
    setToken(await ApiService.getAuthToken());
    return newUser;
  }, []);

  const logout = useCallback(async () => {
    await AuthService.logout();
    setUser(null);
    setToken(null);
  }, []);

  const updateProfile = useCallback(async (updates) => {
    const updated = await AuthService.updateProfile(updates);
    setUser(updated);
    return updated;
  }, []);

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
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
