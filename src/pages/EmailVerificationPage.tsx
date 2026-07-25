import React, { useState } from 'react';
import { Shield, Mail, CheckCircle2, RefreshCw, ArrowRight, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const EmailVerificationPage: React.FC = () => {
  const { setCurrentPage, addToast, authEmail, resendVerification, isEmailVerified, refetchSession } = useApp();
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    if (!authEmail) {
      addToast({
        type: 'warning',
        title: 'Email Missing',
        message: 'Please enter your email address on the sign in page first.',
      });
      return;
    }
    setLoading(true);
    const { error } = await resendVerification(authEmail);
    setLoading(false);
    if (error) {
      addToast({
        type: 'error',
        title: 'Resend Failed',
        message: error.message || 'Unable to send verification email.',
      });
    } else {
      addToast({
        type: 'success',
        title: 'Verification Sent',
        message: `A new confirmation link has been sent to ${authEmail}.`,
      });
    }
  };

  const handleCheckStatus = async () => {
    setLoading(true);
    await refetchSession();
    setLoading(false);
    if (isEmailVerified) {
      addToast({
        type: 'success',
        title: 'Email Confirmed!',
        message: 'Your email address has been verified. Welcome to MediGuard AI.',
      });
      setCurrentPage('dashboard');
    } else {
      addToast({
        type: 'info',
        title: 'Awaiting Verification',
        message: 'We could not detect email confirmation yet. Please click the link in your inbox or check spam.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-8 sm:p-10 space-y-6 text-center">
        {/* Brand */}
        <div
          onClick={() => setCurrentPage('landing')}
          className="inline-flex items-center gap-2.5 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20">
            <Shield className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight">MediGuard AI</span>
        </div>

        {/* Icon */}
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto border border-blue-100/80 shadow-xs">
          <Mail className="w-8 h-8 stroke-[1.8]" />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Verify Your Email Address</h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            We sent a verification link to{' '}
            <strong className="text-slate-900 font-bold">{authEmail || 'your registered email'}</strong>. Please click the link in the message to activate your medical portal access.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleCheckStatus}
            disabled={loading}
            className="w-full py-3 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>I've Verified My Email</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <button
            onClick={handleResend}
            disabled={loading}
            className="w-full py-2.5 px-4 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Resend Verification Link</span>
          </button>
        </div>

        {/* Footnote */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <button
            onClick={() => setCurrentPage('login')}
            className="font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </button>

          <button
            onClick={() => setCurrentPage('dashboard')}
            className="font-bold text-blue-600 hover:text-blue-700"
          >
            Continue to Demo Dashboard →
          </button>
        </div>
      </div>
    </div>
  );
};
