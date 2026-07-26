import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    supabaseUrl !== 'https://your-supabase-project.supabase.co' &&
    supabaseAnonKey !== 'your-anon-key'
  );
};

// Create client if configured, otherwise placeholder client
export const supabase: SupabaseClient<any> = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : createClient(
      'https://placeholder-project.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'
    );

// Helper Auth Methods
export const authService = {
  async signUp(email: string, password: string, fullName?: string, role: 'Patient' | 'Doctor' | 'Admin' = 'Patient', phone?: string) {
    if (!isSupabaseConfigured()) {
      return { data: { user: null, session: null }, error: new Error('Supabase is not configured') };
    }
    const redirectUrl = typeof window !== 'undefined' ? window.location.origin : undefined;
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          role: role,
          phone: phone,
        },
      },
    });
  },

  async signIn(email: string, password: string) {
    if (!isSupabaseConfigured()) {
      return { data: { user: null, session: null }, error: new Error('Supabase is not configured') };
    }
    return await supabase.auth.signInWithPassword({ email, password });
  },

  async signInWithGoogle() {
    if (!isSupabaseConfigured()) {
      return { data: null, error: new Error('Supabase is not configured') };
    }
    const redirectUrl = typeof window !== 'undefined' ? window.location.origin : undefined;
    return await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });
  },

  async signOut() {
    if (!isSupabaseConfigured()) return { error: null };
    return await supabase.auth.signOut();
  },

  async resetPasswordForEmail(email: string) {
    if (!isSupabaseConfigured()) {
      return { data: null, error: new Error('Supabase is not configured') };
    }
    const redirectUrl = typeof window !== 'undefined' ? window.location.origin : undefined;
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
  },

  async updatePassword(newPassword: string) {
    if (!isSupabaseConfigured()) {
      return { data: null, error: new Error('Supabase is not configured') };
    }
    return await supabase.auth.updateUser({ password: newPassword });
  },

  async resendVerificationEmail(email: string) {
    if (!isSupabaseConfigured()) {
      return { data: null, error: new Error('Supabase is not configured') };
    }
    return await supabase.auth.resend({
      type: 'signup',
      email,
    });
  },

  async getCurrentUser() {
    if (!isSupabaseConfigured()) return null;
    const { data } = await supabase.auth.getUser();
    return data.user;
  },

  async getSession() {
    if (!isSupabaseConfigured()) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
  },
};
