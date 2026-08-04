import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { UserProfile, AuthState } from '../types/auth';

interface AuthContextType extends AuthState {
  signIn: (email: string, password?: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password?: string, fullName?: string, company?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isDemoMode: boolean;
}

const DEMO_USER: UserProfile = {
  id: 'demo-user-001',
  email: 'alex.engineer@industrial-solutions.com',
  full_name: 'Alex Vance',
  company: 'Industrial Automation Systems',
  role: 'Lead Intelligence Engineer',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isDemo = !isSupabaseConfigured();

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (supabase && isSupabaseConfigured()) {
        try {
          const { data } = await supabase.auth.getSession();
          if (mounted) {
            setSession(data.session);
            if (data.session?.user) {
              setUser({
                id: data.session.user.id,
                email: data.session.user.email || '',
                full_name: data.session.user.user_metadata?.full_name || 'Industrial User',
                company: data.session.user.user_metadata?.company || 'Enterprise',
                role: 'Analyst',
              });
            } else {
              setUser(null);
            }
          }
        } catch (e) {
          console.error('Error fetching Supabase auth session:', e);
        }

        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (_event, newSession) => {
            if (mounted) {
              setSession(newSession);
              if (newSession?.user) {
                setUser({
                  id: newSession.user.id,
                  email: newSession.user.email || '',
                  full_name: newSession.user.user_metadata?.full_name || 'Industrial User',
                  company: newSession.user.user_metadata?.company || 'Enterprise',
                  role: 'Analyst',
                });
              } else {
                setUser(null);
              }
            }
          }
        );

        if (mounted) setLoading(false);
        return () => {
          authListener?.subscription?.unsubscribe();
        };
      } else {
        // Unauthenticated initial state
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async (email: string, password?: string) => {
    if (supabase && isSupabaseConfigured() && password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    }
    // Demo fallback login simulation
    setUser({
      id: 'demo-user-001',
      email: email || 'alex.engineer@industrial-solutions.com',
      full_name: 'Alex Vance',
      company: 'Industrial Automation Systems',
      role: 'Lead Intelligence Engineer',
    });
    return { error: null };
  };

  const signUp = async (email: string, password?: string, fullName?: string, company?: string) => {
    if (supabase && isSupabaseConfigured() && password) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            company: company,
          },
        },
      });
      return { error };
    }
    // Demo fallback signup simulation
    setUser({
      id: crypto.randomUUID(),
      email,
      full_name: fullName || 'New Engineer',
      company: company || 'Enterprise Co.',
      role: 'Analyst',
    });
    return { error: null };
  };

  const signOut = async () => {
    if (supabase && isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAuthenticated: Boolean(user),
        signIn,
        signUp,
        signOut,
        isDemoMode: isDemo,
      }}
    >
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
