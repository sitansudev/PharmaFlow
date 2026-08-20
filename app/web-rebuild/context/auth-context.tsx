"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { User } from "@/types/auth";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: React.Dispatch<
    React.SetStateAction<User | null>
  >;
}

const AuthContext =
  createContext<AuthContextType | null>(null);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  /*
   * Restore authentication only from the
   * current browser session.
   *
   * sessionStorage is intentionally used
   * instead of localStorage so authentication
   * does not persist as permanent browser data.
   */
  useEffect(() => {
    try {
      const token =
        sessionStorage.getItem(
          "accessToken"
        );

      const storedUser =
        sessionStorage.getItem("user");

      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error(
        "Failed to restore authentication:",
        error
      );

      sessionStorage.removeItem(
        "accessToken"
      );

      sessionStorage.removeItem("user");

      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /*
   * Store authentication for the current
   * browser session only.
   */
  const login = (
    user: User,
    token: string
  ) => {
    sessionStorage.setItem(
      "accessToken",
      token
    );

    sessionStorage.setItem(
      "user",
      JSON.stringify(user)
    );

    setUser(user);
  };

  /*
   * Completely clear the current session.
   */
  const logout = () => {
    sessionStorage.removeItem(
      "accessToken"
    );

    sessionStorage.removeItem("user");

    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      setUser,
      login,
      logout,
      isAuthenticated: !!user,
      isLoading,
    }),
    [user, isLoading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}