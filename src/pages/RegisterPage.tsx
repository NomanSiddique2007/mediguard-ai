import React, { useState } from 'react';
import { Shield, Mail, Lock, User, Phone, Stethoscope, UserCheck, UserCog, ArrowRight, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const RegisterPage: React.FC = () => {
  const { setCurrentPage, register, addToast, authLoading } = useApp();
  const [role, setRole] = useState<'Patient' | 'Doctor' | 'Admin'>('Patient');
  const [fullName, setFullName] = useState('Alexander Vance');
  const [email, setEmail] = useState('alexander.vance@mediguard.ai');
  const [phone, setPhone] = useState('+1 (555) 234-5678');
  const [password, setPassword] = useState('P@ssword2026');
  const [confirmPassword, setConfirmPassword] = useState('P@ssword2026');
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      addToast({
        type: 'error',
        title: 'Password Mismatch',
        message: 'Password and confirm password fields do not match.',
      });
      return;
    }

    if (!acceptTerms) {
      addToast({
        type: 'warning',
        title: 'Terms Required',
        message: 'Please accept the clinical privacy and HIPAA terms to create an account.',
      });
      return;
    }

    setIsSubmitting(true);
    await register({
      email,
      password,
      fullName,
      phone,
      role,
    });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-10 my-8">
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          <div
            onClick={() => setCurrentPage('landing')}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-extrabold text-slate-900 tracking-tight">MediGuard</span>
              <span className="ml-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-1 py-0.5 rounded">AI</span>
            </div>
          </div>

          <button
            onClick={() => setCurrentPage('login')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            Already registered? Sign In →
          </button>
        </div>

        {/* Title */}
        <div className="mt-6 mb-8 text-center max-w-md mx-auto">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create Your MediGuard Account</h2>
          <p className="text-xs text-slate-500 mt-1">Select your account role and enter registration details.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selector Cards */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider text-center">
              Select Account Role
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto">
              {/* Patient */}
              <div
                onClick={() => setRole('Patient')}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-2.5 ${
                  role === 'Patient'
                    ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
                }`}
              >
                <div
                  className={`p-2 rounded-xl shrink-0 ${
                    role === 'Patient' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Patient</h4>
                  <p className="text-[10px] text-slate-500 leading-tight">Prescriptions & Reminders</p>
                </div>
              </div>

              {/* Doctor */}
              <div
                onClick={() => setRole('Doctor')}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-2.5 ${
                  role === 'Doctor'
                    ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
                }`}
              >
                <div
                  className={`p-2 rounded-xl shrink-0 ${
                    role === 'Doctor' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Doctor / Clinician</h4>
                  <p className="text-[10px] text-slate-500 leading-tight">Patient Safety & Audits</p>
                </div>
              </div>

              {/* Admin */}
              <div
                onClick={() => setRole('Admin')}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-2.5 ${
                  role === 'Admin'
                    ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
                }`}
              >
                <div
                  className={`p-2 rounded-xl shrink-0 ${
                    role === 'Admin' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  <UserCog className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Administrator</h4>
                  <p className="text-[10px] text-slate-500 leading-tight">System Controls & Logs</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none"
                  placeholder="Alexander Vance"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none"
                  placeholder="name@mediguard.ai"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none"
                  placeholder="+1 (555) 234-5678"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="terms"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="terms" className="text-xs text-slate-600 cursor-pointer">
              I agree to the <span className="font-semibold text-blue-600">Terms of Service</span>,{' '}
              <span className="font-semibold text-blue-600">HIPAA Privacy Disclosures</span>, and automatic creation of patient records.
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || authLoading}
            className="w-full py-3.5 px-4 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition-all duration-150 flex items-center justify-center gap-2"
          >
            {isSubmitting || authLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating {role} Account...</span>
              </>
            ) : (
              <>
                <span>Register as {role}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
