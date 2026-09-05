import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, UserProfile, mockCurrentUser, mockAdminUser } from '../services/supabase';

interface AuthContextType {
  user: UserProfile;
  userRole: 'USER' | 'ADMIN';
  setUserRole: (role: 'USER' | 'ADMIN') => void;
  signInWithGitHub: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => supabase.getUser());
  const [userRole, setUserRoleState] = useState<'USER' | 'ADMIN'>(user.role);

  const setUserRole = (role: 'USER' | 'ADMIN') => {
    supabase.setUserRole(role);
    setUserRoleState(role);
    setUser(role === 'ADMIN' ? mockAdminUser : mockCurrentUser);
  };

  const signInWithGitHub = async () => {
    const res = await supabase.signInWithGitHub();
    if (res.user) {
      setUser(res.user);
      setUserRoleState(res.user.role);
    }
  };

  const signOut = async () => {
    await supabase.signOut();
    setUser(mockCurrentUser);
    setUserRoleState('USER');
  };

  return (
    <AuthContext.Provider value={{ user, userRole, setUserRole, signInWithGitHub, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
