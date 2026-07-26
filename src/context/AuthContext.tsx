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
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, fullName?: string) => Promise<void>;
  loginAsDemo: (role?: 'Patient' | 'Doctor' | 'Admin') => void;
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

        if (sessionErr) {
          throw sessionErr;
        }

        if (currentSession && currentSession.user) {
          if (mounted) {
            setSession(currentSession);
            setUser(currentSession.user);
            setIsAuthenticated(true);
            handleAuthUserSync(currentSession.user).catch((err) =>
              console.error('Non-blocking user sync error:', err)
            );
            setLoading(false);
          }
        } else {
          // Check if URL has OAuth redirect parameters (?code= or #access_token=)
          const hasOAuthCallbackParams =
            typeof window !== 'undefined' &&
            (window.location.search.includes('code=') || window.location.hash.includes('access_token='));

          if (hasOAuthCallbackParams) {
            // Keep loading = true to give onAuthStateChange time to process the OAuth callback
            // Failsafe timer in case OAuth processing fails
            setTimeout(() => {
              if (mounted) setLoading(false);
            }, 3500);
          } else {
            if (mounted) {
              setSession(null);
              setUser(null);
              setIsAuthenticated(false);
              setLoading(false);
            }
          }
        }
      } catch (err: any) {
        console.error('Session restoration error:', err);
        if (mounted) {
          setError(err.message || 'Network error restoring session.');
          setLoading(false);
        }
      }
    };

    initSession();

    if (isSupabaseConfigured()) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') && currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          setIsAuthenticated(true);
          handleAuthUserSync(currentSession.user).catch((err) =>
            console.error('Non-blocking user sync error on auth state change:', err)
          );
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

  // Email & Password Sign In
  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    setError(null);

    try {
      if (!isSupabaseConfigured()) {
        localStorage.setItem('mediguard_demo_session', 'true');
        setIsAuthenticated(true);
        setUserProfile({
          ...MOCK_USER,
          fullName: email.split('@')[0] || 'Patient User',
          email: email,
        });
        setLoading(false);
        return;
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (authError) {
        throw authError;
      }

      if (data.session && data.user) {
        setSession(data.session);
        setUser(data.user);
        setIsAuthenticated(true);
        await handleAuthUserSync(data.user);
      }
    } catch (err: any) {
      console.error('Email Sign-In Error:', err);
      const msg = err.message || 'Invalid email or password. Please try again.';
      setError(msg);
      setIsAuthenticated(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Email Sign Up
  const signUpWithEmail = async (email: string, pass: string, fullName?: string) => {
    setLoading(true);
    setError(null);

    try {
      if (!isSupabaseConfigured()) {
        localStorage.setItem('mediguard_demo_session', 'true');
        setIsAuthenticated(true);
        setUserProfile({
          ...MOCK_USER,
          fullName: fullName || email.split('@')[0] || 'Patient User',
          email: email,
        });
        setLoading(false);
        return;
      }

      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            full_name: fullName || email.split('@')[0],
          },
        },
      });

      if (authError) {
        throw authError;
      }

      if (data.session && data.user) {
        setSession(data.session);
        setUser(data.user);
        setIsAuthenticated(true);
        await handleAuthUserSync(data.user);
      } else if (data.user) {
        // Confirmation email sent or pending
        localStorage.setItem('mediguard_demo_session', 'true');
        setIsAuthenticated(true);
      }
    } catch (err: any) {
      console.error('Email Sign-Up Error:', err);
      const msg = err.message || 'Unable to register account. Please check inputs.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Instant Demo Portal Sign In
  const loginAsDemo = (role: 'Patient' | 'Doctor' | 'Admin' = 'Patient') => {
    setLoading(true);
    setError(null);
    localStorage.setItem('mediguard_demo_session', 'true');
    setIsAuthenticated(true);

    if (role === 'Doctor') {
      setUserProfile({
        ...MOCK_USER,
        fullName: 'Dr. Sarah Jenkins, MD',
        email: 's.jenkins@mediguard.org',
        role: 'Doctor',
      });
    } else if (role === 'Admin') {
      setUserProfile({
        ...MOCK_USER,
        fullName: 'Admin Chief Compliance Officer',
        email: 'admin@mediguard.org',
        role: 'Admin',
      });
    } else {
      setUserProfile({
        ...MOCK_USER,
        fullName: 'Alexander Vance',
        email: 'alex.vance@example.com',
        role: 'Patient',
      });
    }
    setLoading(false);
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
        signInWithEmail,
        signUpWithEmail,
        loginAsDemo,
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
