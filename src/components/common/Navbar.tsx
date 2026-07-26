import React, { useState } from 'react';
import { Shield, Upload, Menu, X, UserCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../hooks/useAuth';

export const Navbar: React.FC = () => {
  const { currentPage, setCurrentPage } = useApp();
  const { isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', page: 'landing' as const },
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'FAQ', href: '#faq' },
  ];

  const handleNavClick = (link: (typeof navLinks)[0]) => {
    setMobileMenuOpen(false);
    if (link.page) {
      setCurrentPage(link.page);
    } else if (link.href) {
      if (currentPage !== 'landing') {
        setCurrentPage('landing');
        setTimeout(() => {
          const el = document.querySelector(link.href!);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const el = document.querySelector(link.href);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 border-b border-slate-200/80 transition-all duration-200 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => setCurrentPage('landing')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Shield className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-extrabold text-slate-900 tracking-tight">MediGuard</span>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200/60 px-1.5 py-0.5 rounded-md">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">CLINICAL PRESCRIPTION SAFETY</p>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link, idx) => (
            <button
              key={idx}
              onClick={() => handleNavClick(link)}
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 px-3.5 py-2 rounded-xl transition-all"
              >
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>Patient Portal</span>
              </button>

              <button
                onClick={() => logout()}
                className="text-xs font-semibold text-slate-600 hover:text-red-600 px-3 py-2 rounded-xl transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => setCurrentPage('login')}
              className="text-sm font-semibold text-slate-700 hover:text-blue-600 px-3.5 py-2 rounded-xl transition-colors border border-slate-200/80 hover:border-blue-300"
            >
              Sign In with Google
            </button>
          )}

          <button
            onClick={() => setCurrentPage('upload')}
            className="inline-flex items-center gap-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/20 hover:shadow-blue-600/30 transition-all duration-150 active:scale-95"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Prescription</span>
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link, idx) => (
              <button
                key={idx}
                onClick={() => handleNavClick(link)}
                className="text-left py-2 text-sm font-medium text-slate-700 hover:text-blue-600"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setCurrentPage('upload');
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl shadow-md"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Prescription</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setCurrentPage('dashboard');
              }}
              className="w-full py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl"
            >
              Dashboard Portal
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setCurrentPage('login');
              }}
              className="w-full py-2 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl"
            >
              Continue with Google
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
