import React, { createContext } from 'react';

/**
 * AuthContext structure only.
 * Authentication logic, session tracking, and credentials handling
 * will be implemented in a future phase.
 */
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Shell value representation - no state or active mock logic
  const value = {
    isAuthenticated: false,
    user: null,
    login: async (email, password) => {
      console.warn("login called on AuthContext skeleton shell");
      return null;
    },
    logout: async () => {
      console.warn("logout called on AuthContext skeleton shell");
      return null;
    },
    register: async (name, email, password) => {
      console.warn("register called on AuthContext skeleton shell");
      return null;
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
export default AuthContext;
