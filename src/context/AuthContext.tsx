import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import { patientsService } from '../services/patientsService';
import { UserProfile } from '../types';
import { MOCK_USER } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile;
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>(MOCK_USER);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Sync / create patient profile upon successful Google authentication
  const handleAuthUserSync = useCallback(async (authUser: User) => {
    try {
      // 1. Try to fetch existing patient profile from Supabase database
      const { data: existingProfile } = await patientsService.getPatient(authUser.id);

      if (existingProfile) {
        setUserProfile(existingProfile);
      } else {
        // 2. Automatically create patient profile in database if not found
        const meta = authUser.user_metadata || {};
        const fullName = meta.full_name || meta.name || authUser.email?.split('@')[0] || 'Patient User';
        const avatarUrl =
          meta.avatar_url || meta.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';

        const newPatient: UserProfile = {
          id: authUser.id,
          fullName,
          email: authUser.email || '',
          phone: meta.phone || '',
          role: 'Patient',
          avatarUrl,
          patientId: `PAT-${Math.floor(100000 + Math.random() * 900000)}`,
          memberSince: new Date().getFullYear().toString(),
          medicalInfo: {
            bloodGroup: 'O+',
            age: 30,
            weight: '70 kg',
            height: '172 cm',
            allergies: [],
            chronicDiseases: [],
            emergencyContact: {
              name: 'Primary Emergency Contact',
              relation: 'Family',
              phone: '911',
            },
          },
        };

        if (isSupabaseConfigured()) {
          const { data: created } = await patientsService.createPatient(newPatient);
          if (created) {
            setUserProfile(created);
            return;
          }
        }
        setUserProfile(newPatient);
      }
    } catch (err: any) {
      console.error('Failed to sync patient profile:', err);
    }
  }, []);

  // Initialize and listen for Supabase auth state changes
  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      setLoading(true);
      try {
        if (!isSupabaseConfigured()) {
          // If Supabase credentials are not set, preserve local session state for dev preview
          const localSession = localStorage.getItem('mediguard_demo_session');
          if (localSession === 'true') {
            setIsAuthenticated(true);
            setUserProfile(MOCK_USER);
          } else {
            setIsAuthenticated(false);
          }
          if (mounted) setLoading(false);
          return;
        }

        const { data: { session: currentSession }, error: sessionErr } = await supabase.auth.getSession();
        console.log("Session:", currentSession);
        console.log("Current User:", currentSession?.user);

        if (sessionErr) {
          throw sessionErr;
        }

        if (currentSession && currentSession.user) {
          if (mounted) {
            setSession(currentSession);
            setUser(currentSession.user);
            setIsAuthenticated(true);
            await handleAuthUserSync(currentSession.user);
          }
        } else {
          if (mounted) {
            setSession(null);
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (err: any) {
        console.error('Session restoration error:', err);
        if (mounted) {
          setError(err.message || 'Network error restoring session.');
          setIsAuthenticated(false);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initSession();

    if (isSupabaseConfigured()) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
        console.log("Auth Event:", event);
        console.log("Session:", currentSession);
        console.log("Current User:", currentSession?.user);

        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') && currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          setIsAuthenticated(true);
          await handleAuthUserSync(currentSession.user);
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setIsAuthenticated(false);
          setUserProfile(MOCK_USER);
        }
        if (mounted) setLoading(false);
      });

      return () => {
        mounted = false;
        authListener.subscription.unsubscribe();
      };
    }
  }, [handleAuthUserSync]);

  // Google OAuth Sign In
  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!isSupabaseConfigured()) {
        // Fallback demo Google authentication if environment keys are placeholders
        localStorage.setItem('mediguard_demo_session', 'true');
        setIsAuthenticated(true);
        setUserProfile({
          ...MOCK_USER,
          fullName: 'Alexander Vance (Google)',
          email: 'alexander.vance@gmail.com',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        });
        setLoading(false);
        return;
      }

      const redirectUrl = window.location.origin;

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (oauthError) {
        throw oauthError;
      }
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      const msg = err.message || 'Google authentication was cancelled or failed due to network connectivity.';
      setError(msg);
      setLoading(false);
      throw err;
    }
  };

  // Sign Out
  const logout = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
      localStorage.removeItem('mediguard_demo_session');
      setSession(null);
      setUser(null);
      setIsAuthenticated(false);
      setUserProfile(MOCK_USER);
    } catch (err: any) {
      console.error('Sign out error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        userProfile,
        isAuthenticated,
        isLoading: loading,
        loading,
        error,
        signInWithGoogle,
        logout,
        clearError,
        setUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
