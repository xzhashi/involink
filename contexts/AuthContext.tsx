import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import type { Session, User as SupabaseAuthUser, AuthResponse } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient.ts';
import type { User } from '../types.ts'; // Import extended User type

interface AuthContextType {
  session: Session | null;
  user: User | null; // Use our extended User type here
  loading: boolean;
  isAdmin: boolean;
  userRole: 'admin' | 'user' | null;
  login: (email: string, password_string: string) => Promise<AuthResponse>;
  signup: (email: string, password_string: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null); // Use extended User type
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);

  const updateUserRoleAndAdminStatus = (currentUser: SupabaseAuthUser | null) => {
    if (currentUser) {
      const role = currentUser.user_metadata?.role as 'admin' | 'user' | undefined;
      setUserRole(role || 'user'); // Default to 'user' if role is not set or invalid
      setIsAdmin(role === 'admin');
      setUser(currentUser as User); // Cast to our extended User type
    } else {
      setUserRole(null);
      setIsAdmin(false);
      setUser(null);
    }
  };

  useEffect(() => {
    setLoading(true);
    const getSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        updateUserRoleAndAdminStatus(session?.user ?? null);
        setLoading(false);
    };
    getSession();


    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
          setSession(session);
          updateUserRoleAndAdminStatus(session?.user ?? null);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password_string: string): Promise<AuthResponse> => {
    setLoading(true);
    const response = await supabase.auth.signInWithPassword({ email, password: password_string });
    setLoading(false);
    return response;
  };

  const signup = async (email: string, password_string: string): Promise<AuthResponse> => {
    setLoading(true);
    const response = await supabase.auth.signUp({
      email,
      password: password_string,
    });
    setLoading(false);
    return response;
  };

  const logout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      // Error can be handled by a global error handler if needed
    }
    // Session, user, role, and isAdmin are set to null/false by the onAuthStateChange listener
    setLoading(false);
  };

  const value = {
    session,
    user,
    loading,
    isAdmin,
    userRole,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};