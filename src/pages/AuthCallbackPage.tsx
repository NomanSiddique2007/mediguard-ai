import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useApp } from '../context/AppContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase/client';

export const AuthCallbackPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { setCurrentPage, addToast } = useApp();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const processAuthCallback = async () => {
      try {
        if (!isSupabaseConfigured()) {
          const localSession = localStorage.getItem('mediguard_demo_session');
          if (localSession === 'true') {
            if (isMounted) {
              addToast({
                type: 'success',
                title: 'Authentication Successful',
                message: 'Welcome back to MediGuard AI.',
              });
              setCurrentPage('dashboard');
            }
          } else {
            if (isMounted) {
              setCurrentPage('login');
            }
          }
          return;
        }

        // Fetch session from Supabase
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (data?.session?.user) {
          if (isMounted) {
            addToast({
              type: 'success',
              title: 'Signed In with Google',
              message: `Authenticated as ${data.session.user.email || 'Google User'}.`,
            });
            setCurrentPage('dashboard');
          }
        } else {
          // Poll briefly for session completion if tokens are being processed
          let attempts = 0;
          const interval = setInterval(async () => {
            attempts++;
            const { data: pollData } = await supabase.auth.getSession();
            if (pollData?.session?.user) {
              clearInterval(interval);
              if (isMounted) {
                addToast({
                  type: 'success',
                  title: 'Signed In with Google',
                  message: `Authenticated as ${pollData.session.user.email || 'Google User'}.`,
                });
                setCurrentPage('dashboard');
              }
            } else if (attempts >= 10) {
              clearInterval(interval);
              if (isMounted) {
                addToast({
                  type: 'warning',
                  title: 'Sign-In Required',
                  message: 'Could not restore active OAuth session. Please sign in.',
                });
                setCurrentPage('login');
              }
            }
          }, 300);
        }
      } catch (err: any) {
        console.error('Auth Callback Error:', err);
        if (isMounted) {
          setErrorMsg(err.message || 'Authentication callback failed.');
          setTimeout(() => {
            setCurrentPage('login');
          }, 1500);
        }
      }
    };

    if (!isLoading) {
      if (isAuthenticated) {
        setCurrentPage('dashboard');
      } else {
        processAuthCallback();
      }
    }
  }, [isAuthenticated, isLoading, setCurrentPage, addToast]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="text-center space-y-5 max-w-sm w-full bg-white p-8 rounded-3xl border border-slate-200/90 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-600/20">
          <Loader2 className="w-7 h-7 animate-spin" />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-900">Completing Sign-In</h3>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Verifying your Google security token and syncing patient profile...
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs text-left flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
};
