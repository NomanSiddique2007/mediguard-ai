import React from 'react';
import { ShieldAlert, ArrowLeft, Home, LayoutDashboard, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const NotFoundPage: React.FC = () => {
  const { setCurrentPage } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-8 sm:p-12 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Error 404
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Page Not Found in Clinical Vault
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            The prescription route or patient page you are looking for does not exist or has been relocated to another record.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all active:scale-95"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Go to Patient Dashboard</span>
          </button>

          <button
            onClick={() => setCurrentPage('landing')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Return to Landing Page</span>
          </button>
        </div>
      </div>
    </div>
  );
};
