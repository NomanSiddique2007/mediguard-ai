import React, { useEffect } from 'react';
import { Shield, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useApp } from '../../context/AppContext';
import { GoogleSignInButton } from '../auth/GoogleSignInButton';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, signInWithGoogle, error } = useAuth();
  const { setCurrentPage, addToast } = useApp();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect unauthenticated users to landing or login
      addToast({
        type: 'warning',
        title: 'Authentication Required',
        message: 'Please sign in with Google to access the MediGuard patient safety portal.',
      });
      setCurrentPage('landing');
    }
  }, [isAuthenticated, isLoading, setCurrentPage, addToast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-600/20">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Verifying Security Session</h3>
            <p className="text-xs text-slate-500 mt-1">Restoring Google OAuth session & profile details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="text-center space-y-5 max-w-sm w-full bg-white p-8 rounded-3xl border border-slate-200/90 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Access Restricted</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              You must be authenticated via Google to access patient health records & AI safety tools.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs text-left">
              {error}
            </div>
          )}

          <GoogleSignInButton
            onClick={async () => {
              try {
                await signInWithGoogle();
              } catch (e) {
                // error handled in useAuth
              }
            }}
          />

          <button
            onClick={() => setCurrentPage('landing')}
            className="w-full text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors pt-2"
          >
            ← Return to Landing Page
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
