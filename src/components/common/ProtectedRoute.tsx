import React, { useEffect } from 'react';
import { Shield, Lock, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, authLoading, setCurrentPage, addToast, currentPage } = useApp();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      addToast({
        type: 'warning',
        title: 'Authentication Required',
        message: 'Please sign in to access the MediGuard patient portal.',
      });
      setCurrentPage('login');
    }
  }, [isAuthenticated, authLoading, setCurrentPage, addToast, currentPage]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-600/20">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Verifying Security Session</h3>
            <p className="text-xs text-slate-500 mt-1">Checking Supabase Auth token & role permissions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Access Restricted</h3>
            <p className="text-xs text-slate-500 mt-1">You must be logged in to view patient health records.</p>
          </div>
          <button
            onClick={() => setCurrentPage('login')}
            className="w-full py-2.5 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
          >
            Go to Sign In Page
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
