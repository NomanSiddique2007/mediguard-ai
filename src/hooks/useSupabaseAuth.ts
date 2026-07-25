import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, authService } from '../lib/supabase/client';

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured());
  const [configured] = useState<boolean>(isSupabaseConfigured());

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    // Check current active session user
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, pass: string, name?: string) => {
    return await authService.signUp(email, pass, name);
  };

  const signIn = async (email: string, pass: string) => {
    return await authService.signIn(email, pass);
  };

  const signOut = async () => {
    return await authService.signOut();
  };

  return { user, loading, configured, signUp, signIn, signOut };
}
