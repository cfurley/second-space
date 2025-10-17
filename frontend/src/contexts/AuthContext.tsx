import React, { createContext, useContext, useState } from 'react';
import { validatePassword, validateUsername } from '../utils/validators';

// AuthContext centralizes authentication concerns so components don't
// need to know how auth works. Start here when you need to replace the
// mock implementations with real API calls.

type CreateAccountResult = { success: true } | { success: false; errors: string[] };

type AuthContextType = {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  createAccount: (username: string, password: string) => Promise<CreateAccountResult>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // NOTE: these functions are mocks for now. Replace network calls with real API
  // requests when the auth microserver is available.
  const login = async (username: string, password: string) => {
    // For dev: accept any username/password and mark authenticated.
    // Replace with POST /api/auth/login in the future.
    setIsAuthenticated(true);
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const createAccount = async (username: string, password: string): Promise<CreateAccountResult> => {
    const usernameErrors = validateUsername(username);
    const passwordErrors = validatePassword(password);
    const errors = [...usernameErrors, ...passwordErrors];
    if (errors.length) return { success: false, errors };
    // Mock behavior: create account and sign in.
    // Replace with POST /api/users in the future.
    setIsAuthenticated(true);
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, createAccount }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
