import React, { useState } from 'react';
import { Shield, Mail, Lock, ArrowRight, CheckCircle2, UserCheck, Stethoscope, UserCog, Loader2, KeyRound } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LoginPage: React.FC = () => {
  const { setCurrentPage, login, loginDemo, authLoading } = useApp();
  const [email, setEmail] = useState('alexander.vance@mediguard.ai');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await login(email, password);
    setIsSubmitting(false);
  };

  const handleQuickDemo = (role: 'Patient' | 'Doctor' | 'Admin') => {
    loginDemo(role);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-5xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        {/* Left Side: Healthcare Illustration & Branding */}
        <div className="lg:col-span-5 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          {/* Brand */}
          <div
            onClick={() => setCurrentPage('landing')}
            className="flex items-center gap-2.5 cursor-pointer z-10"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Shield className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight">MediGuard AI</span>
              <p className="text-[10px] text-blue-200 font-medium">PATIENT SAFETY PORTAL</p>
            </div>
          </div>

          {/* Middle Graphic / Hero Quote */}
          <div className="space-y-6 my-8 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>Supabase Auth & 256-Bit SSL Vault</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black leading-snug">
              Instant AI Cross-Checks For Every Prescription You Scan.
            </h2>

            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              Log in to view active medication reminders, check drug interaction warnings, and access your health timeline securely.
            </p>
          </div>

          {/* Quick Demo Login Triggers */}
          <div className="pt-6 border-t border-white/15 z-10 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-blue-200">1-Click Role Switcher</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('Patient')}
                className="flex items-center justify-center gap-1 py-2 px-2 text-[11px] font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl transition-colors shadow-sm"
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Patient</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('Doctor')}
                className="flex items-center justify-center gap-1 py-2 px-2 text-[11px] font-bold text-white bg-white/20 hover:bg-white/30 rounded-xl transition-colors backdrop-blur-md"
              >
                <Stethoscope className="w-3.5 h-3.5 text-emerald-300" />
                <span>Doctor</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('Admin')}
                className="flex items-center justify-center gap-1 py-2 px-2 text-[11px] font-bold text-white bg-indigo-900/60 hover:bg-indigo-900/80 rounded-xl transition-colors border border-indigo-400/30"
              >
                <UserCog className="w-3.5 h-3.5 text-amber-300" />
                <span>Admin</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-6">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Sign In to MediGuard</h3>
              <p className="text-xs text-slate-500 mt-1">Enter your email credentials or test with 1-click role mode.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all"
                    placeholder="name@mediguard.ai"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-slate-600 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span>Remember session</span>
                </label>

                <button
                  type="button"
                  onClick={() => setCurrentPage('forgot-password')}
                  className="font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>Forgot password?</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || authLoading}
                className="w-full py-3 px-4 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition-all duration-150 flex items-center justify-center gap-2"
              >
                {isSubmitting || authLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
              Don't have an account yet?{' '}
              <button
                onClick={() => setCurrentPage('register')}
                className="font-bold text-blue-600 hover:text-blue-700"
              >
                Register as Patient, Doctor or Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
