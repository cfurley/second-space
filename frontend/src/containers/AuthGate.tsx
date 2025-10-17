import React from 'react';
import Login from '../components/login';
import { useAuth } from '../contexts/AuthContext';

/**
 * AuthGate shows the Login UI when unauthenticated, otherwise renders children.
 * Keeps auth decision-making in one place so App stays minimal and easy to read.
 */
export const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Login isOpen={true} />;
  return <>{children}</>;
};

export default AuthGate;
