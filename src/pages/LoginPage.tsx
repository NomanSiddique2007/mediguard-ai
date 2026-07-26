import React, { useState } from 'react';
import { Shield, CheckCircle2, AlertCircle, Mail, Lock, User as UserIcon, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const { setCurrentPage, addToast } = useApp();
  const { signInWithEmail, signUpWithEmail, loginAsDemo, isLoading, error, isAuthenticated } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect to dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      setCurrentPage('dashboard');
    }
  }, [isAuthenticated, setCurrentPage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please enter both your email address and password.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'signup') {
        await signUpWithEmail(email, password, fullName);
        addToast({
          type: 'success',
          title: 'Account Created',
          message: 'Welcome to MediGuard AI! Redirecting to your clinical portal...',
        });
      } else {
        await signInWithEmail(email, password);
        addToast({
          type: 'success',
          title: 'Signed In',
          message: 'Secure session restored. Welcome back to MediGuard AI.',
        });
      }
      setCurrentPage('dashboard');
    } catch (err: any) {
      console.error('Auth Error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = (role: 'Patient' | 'Doctor' | 'Admin') => {
    loginAsDemo(role);
    addToast({
      type: 'info',
      title: 'Demo Session Active',
      message: `Signed in to MediGuard AI as ${role}.`,
    });
    setCurrentPage('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
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
              <p className="text-[10px] text-blue-200 font-medium tracking-wider">CLINICAL SAFETY PORTAL</p>
            </div>
          </div>

          {/* Middle Pitch */}
          <div className="space-y-5 my-8 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>Encrypted Patient Vault & AI Engine</span>
            </div>

            <h2 className="text-2xl font-black leading-snug">
              Instant AI Cross-Checks For Every Prescription You Scan.
            </h2>

            <p className="text-xs text-blue-100/90 leading-relaxed">
              Sign in to view active medication reminders, check drug interaction warnings, and access your clinical history.
            </p>
          </div>

          {/* Security Badge */}
          <div className="pt-4 border-t border-white/15 z-10 text-[11px] text-blue-200 font-medium">
            🔒 Protected by 256-bit SSL encryption & HIPAA-compliant data security.
          </div>
        </div>

        {/* Right Panel: Authentication Form */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div className="max-w-md w-full mx-auto space-y-5">
            {/* Header & Tabs */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
                  Secure Access
                </span>
                <div className="flex gap-1 p-1 bg-slate-100 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setMode('signin')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      mode === 'signin' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      mode === 'signup' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Create Account
                  </button>
                </div>
              </div>

              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {mode === 'signin' ? 'Welcome Back' : 'Create MediGuard Account'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {mode === 'signin'
                  ? 'Enter your credentials to access your medication portal.'
                  : 'Register a new patient profile to enable AI prescription scanning.'}
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

            {/* Form Inputs */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Dr. Alexander Vance"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="patient@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 hover:shadow-blue-600/30 transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmitting || isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <span>{mode === 'signin' ? 'Sign In to Portal' : 'Create Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Access Divider */}
            <div className="relative pt-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                <span className="bg-white px-3 text-slate-400">Or Instant Demo Access</span>
              </div>
            </div>

            {/* Quick Portal Demo Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('Patient')}
                className="py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-700 text-center transition-colors flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Patient Portal</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('Doctor')}
                className="py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-700 text-center transition-colors flex items-center justify-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                <span>Clinician Portal</span>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs mt-4">
            <button
              onClick={() => setCurrentPage('landing')}
              className="font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              ← Back to Home
            </button>
            <span className="text-[11px] text-slate-400 font-medium">Supabase Auth Integrated</span>
          </div>
        </div>
      </div>
    </div>
  );
};

