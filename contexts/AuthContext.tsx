import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, userType: 'owner' | 'user', profileData?: { full_name?: string; phone_number?: string }) => Promise<{ data: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  updateProfile: (profileData: { full_name?: string; phone_number?: string }) => Promise<{ error: any }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string, retryCount = 0): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        
        // Retry logic for new users (profile might not be created yet)
        if (error.code === 'PGRST116' && retryCount < 3) {
          console.log(`Retrying user profile fetch... (${retryCount + 1}/3)`);
          setTimeout(() => {
            fetchUserProfile(userId, retryCount + 1);
          }, 1000 * (retryCount + 1)); // 1s, 2s, 3s delays
          return;
        }
      } else if (data) {
        setUser(data);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    } finally {
      if (retryCount === 0) { // Only set loading false on first attempt
        setLoading(false);
      }
    }
  };

  const refreshUser = async () => {
    if (user?.id) {
      await fetchUserProfile(user.id);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userType: 'owner' | 'user', profileData?: { full_name?: string; phone_number?: string }) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) {
        return { data: null, error: authError };
      }

      // ✅ Fixed: Check if authData.user exists before using it
      if (authData?.user) {
        // Store user type in profiles table with retry logic
        let retryCount = 0;
        const createUserProfile = async (): Promise<{ data: any; error: any }> => {
          try {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .insert({
                id: authData.user!.id,
                email,
                user_type: userType,
                full_name: profileData?.full_name,
                phone_number: profileData?.phone_number,
              })
              .select()
              .single();

            if (userError) {
              if (retryCount < 3) {
                retryCount++;
                console.log(`Retrying user profile creation... (${retryCount}/3)`);
                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
                return createUserProfile();
              }
              return { data: null, error: userError };
            }

            setUser(userData);
            return { data: userData, error: null };
          } catch (error: any) {
            return { data: null, error };
          }
        };

        return await createUserProfile();
      }

      return { data: null, error: new Error('Registration failed') };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data.user) {
        await fetchUserProfile(data.user.id);
      }

      return { data, error };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      setUser(null);
      return { error };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return { error };
    }
  };

  const updateProfile = async (profileData: { full_name?: string; phone_number?: string }) => {
    try {
      if (!user) {
        return { error: new Error('No user logged in') };
      }

      const { error } = await supabase
        .from('users')
        .update({
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        return { error };
      }

      // Update local state
      setUser(prev => prev ? { ...prev, ...profileData } : null);
      return { error: null };
    } catch (error: any) {
      console.error('Update profile error:', error);
      return { error };
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}