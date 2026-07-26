import React, { useState } from 'react';
import { Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import { GoogleSignInButton } from '../components/auth/GoogleSignInButton';

export const LoginPage: React.FC = () => {
  const { setCurrentPage, addToast } = useApp();
  const { signInWithGoogle, isLoading, error, isAuthenticated } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);

  // If already authenticated, redirect to dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      setCurrentPage('dashboard');
    }
  }, [isAuthenticated, setCurrentPage]);

  const handleGoogleSignIn = async () => {
    setIsConnecting(true);
    try {
      await signInWithGoogle();
      addToast({
        type: 'info',
        title: 'Redirecting to Google Sign-In',
        message: 'Connecting securely via Supabase Google OAuth...',
      });
    } catch (err: any) {
      console.error('Google Auth Failed:', err);
      addToast({
        type: 'error',
        title: 'Authentication Error',
        message: err.message || 'Unable to complete Google Sign-In. Please check your connection.',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[540px]">
        {/* Left Panel: Healthcare Branding */}
        <div className="md:col-span-5 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          {/* Brand Header */}
          <div
            onClick={() => setCurrentPage('landing')}
            className="flex items-center gap-2.5 cursor-pointer z-10"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Shield className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight">MediGuard AI</span>
              <p className="text-[10px] text-blue-200 font-medium">CLINICAL SAFETY PORTAL</p>
            </div>
          </div>

          {/* Middle Pitch */}
          <div className="space-y-5 my-8 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>Google OAuth & Supabase Vault</span>
            </div>

            <h2 className="text-2xl font-black leading-snug">
              Instant AI Cross-Checks For Every Prescription You Scan.
            </h2>

            <p className="text-xs text-blue-100/90 leading-relaxed">
              Sign in with Google to view active medication reminders, check drug interaction warnings, and access your clinical history.
            </p>
          </div>

          {/* Security Badge */}
          <div className="pt-4 border-t border-white/15 z-10 text-[11px] text-blue-200 font-medium">
            🔒 Protected by 256-bit SSL encryption & HIPAA-compliant OAuth token architecture.
          </div>
        </div>

        {/* Right Panel: Single Authentication Option - Continue with Google */}
        <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold mb-3">
                <span>Single Sign-On</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Sign In to MediGuard</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                MediGuard uses Google OAuth for passwordless, medical-grade authentication.
              </p>
            </div>

            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold">Authentication Issue</p>
                  <p className="text-[11px] text-red-600/90">{error}</p>
                </div>
              </div>
            )}

            {/* Single Authentication Button: Continue with Google */}
            <div className="space-y-4 pt-2">
              <GoogleSignInButton
                onClick={handleGoogleSignIn}
                isLoading={isConnecting || isLoading}
                label="Continue with Google"
              />

              <p className="text-[11px] text-center text-slate-400 leading-normal">
                By continuing with Google, you agree to MediGuard's AI Clinical Safety Terms of Service & Privacy Policy.
              </p>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                onClick={() => setCurrentPage('landing')}
                className="font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                ← Back to Home
              </button>
              <span className="text-[11px] text-slate-400 font-medium">Supabase Auth Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
