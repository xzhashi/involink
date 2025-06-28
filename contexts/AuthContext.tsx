import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import type { Session, User as SupabaseAuthUser, AuthError } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';
import type { User } from '../types'; // Import extended User type

interface WeakPasswordDetails {
  reasons: string[];
  message: string;
}

interface LoginSignUpResponse {
  user: SupabaseAuthUser | null; // Use SupabaseAuthUser here from Supabase lib
  session: Session | null;
  error: AuthError | null;
  weakPassword?: WeakPasswordDetails | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null; // Use our extended User type here
  loading: boolean;
  isAdmin: boolean;
  userRole: 'admin' | 'user' | null;
  login: (email: string, password_string: string) => Promise<LoginSignUpResponse>;
  signup: (email: string, password_string: string) => Promise<LoginSignUpResponse>;
  logout: () => Promise<void>;
  refreshAuthStatus: () => Promise<void>; // Added to refresh user state
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

  const refreshAuthStatus = async () => {
    const { data: { user: refreshedUser }, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Error refreshing user status:", error);
    } else {
      updateUserRoleAndAdminStatus(refreshedUser);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const getSession = async () => {
      if (isMounted) setLoading(true);
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("AuthContext: Error getting session:", error);
        }
        if (isMounted) {
          setSession(currentSession);
          updateUserRoleAndAdminStatus(currentSession?.user ?? null);
        }
      } catch (e) {
        console.error("AuthContext: Critical error in getSession:", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        if (isMounted) {
          setSession(currentSession);
          updateUserRoleAndAdminStatus(currentSession?.user ?? null);
          if (_event !== 'INITIAL_SESSION') { // INITIAL_SESSION is handled by getSession
             setLoading(false);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password_string: string): Promise<LoginSignUpResponse> => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: password_string });
    // User state, role, and isAdmin will be updated by onAuthStateChange
    setLoading(false);
    if (error) {
      console.error('Login error:', error.message);
      return { user: null, session: null, error, weakPassword: null };
    }
    return { user: data.user, session: data.session, error: null, weakPassword: null };
  };

  const signup = async (email: string, password_string: string): Promise<LoginSignUpResponse> => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password: password_string,
      // Default role is 'user', set by Edge function 'admin-invite-user' if invited
      // or by default Supabase settings if public sign-up is enabled.
      // If you want to set a default role here during public sign-up, it's typically done
      // via a trigger on the auth.users table in Supabase to populate user_metadata.
    });
    setLoading(false);
    if (error) {
      console.error('Signup error:', error.message);
      const weakPasswordInfo = (error as any).data?.weak_password as WeakPasswordDetails | undefined;
      return { user: null, session: null, error, weakPassword: weakPasswordInfo || null };
    }
    // If signup needs email confirmation, user and session might be non-null but session might not be active.
    // onAuthStateChange will handle the final state after confirmation.
    return { user: data.user, session: data.session, error: null, weakPassword: null };
  };

  const logout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error.message);
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
    refreshAuthStatus,
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