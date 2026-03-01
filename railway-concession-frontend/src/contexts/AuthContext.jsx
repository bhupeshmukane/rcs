import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔐 On app load → check session from backend
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await authService.getCurrentUser();
        setUser(response.user);
        setRole(response.role);
      } catch {
        setUser(null);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = (userData, userRole) => {
    setUser(userData);
    setRole(userRole);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        login,
        logout,
        isAuthenticated: !!user,
        isStudent: role === 'student',
        isStaff: role === 'staff',
        loading
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;