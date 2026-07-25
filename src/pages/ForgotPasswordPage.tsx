import React, { useState } from 'react';
import { Shield, Mail, ArrowLeft, Send, CheckCircle2, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ForgotPasswordPage: React.FC = () => {
  const { setCurrentPage, addToast, forgotPassword } = useApp();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    const { error } = await forgotPassword(email);
    setLoading(false);

    if (error) {
      addToast({
        type: 'error',
        title: 'Reset Failed',
        message: error.message || 'Failed to send password reset email.',
      });
    } else {
      setSubmitted(true);
      addToast({
        type: 'success',
        title: 'Instructions Sent',
        message: `Password reset instructions have been sent to ${email}.`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-8 sm:p-10 space-y-6">
        {/* Brand */}
        <div className="text-center">
          <div
            onClick={() => setCurrentPage('landing')}
            className="inline-flex items-center gap-2.5 cursor-pointer mb-2"
          >
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20">
              <Shield className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">MediGuard AI</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-2">Reset Password</h2>
          <p className="text-xs text-slate-500 mt-1">
            Enter your email address and we'll send you a password reset link.
          </p>
        </div>

        {submitted ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-emerald-900">Check Your Inbox</h4>
            <p className="text-xs text-emerald-700 leading-relaxed">
              Password reset link sent to <strong>{email}</strong>. Please follow the link to set a new security password.
            </p>
            <button
              onClick={() => setCurrentPage('login')}
              className="w-full py-2.5 text-xs font-bold text-emerald-800 bg-emerald-200/60 hover:bg-emerald-200 rounded-xl transition-colors mt-2"
            >
              Return to Login
            </button>
          </div>
        ) : (
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
                  placeholder="alexander.vance@mediguard.ai"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Sending Reset Link...</span>
              ) : (
                <>
                  <span>Send Reset Instructions</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-slate-100 text-center">
          <button
            onClick={() => setCurrentPage('login')}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </button>
        </div>
      </div>
    </div>
  );
};
