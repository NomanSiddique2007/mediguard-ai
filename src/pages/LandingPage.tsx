import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Shield,
  Upload,
  ArrowRight,
  Scan,
  ShieldAlert,
  Layers,
  BellRing,
  Sparkles,
  Activity,
  FileText,
  Lock,
  UploadCloud,
  Cpu,
  ShieldCheck,
  LayoutDashboard,
  Star,
  ChevronDown,
  CheckCircle2,
  Play,
  Heart,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Navbar } from '../components/common/Navbar';
import {
  LANDING_STATS,
  LANDING_FEATURES,
  HOW_IT_WORKS_STEPS,
  TESTIMONIALS,
  FAQS,
} from '../data/mockData';

export const LandingPage: React.FC = () => {
  const { setCurrentPage } = useApp();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const getFeatureIcon = (name: string) => {
    switch (name) {
      case 'Scan':
        return <Scan className="w-6 h-6 text-blue-600" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-6 h-6 text-rose-600" />;
      case 'Layers':
        return <Layers className="w-6 h-6 text-amber-600" />;
      case 'BellRing':
        return <BellRing className="w-6 h-6 text-indigo-600" />;
      case 'Sparkles':
        return <Sparkles className="w-6 h-6 text-purple-600" />;
      case 'Activity':
        return <Activity className="w-6 h-6 text-emerald-600" />;
      case 'FileText':
        return <FileText className="w-6 h-6 text-blue-600" />;
      default:
        return <Lock className="w-6 h-6 text-teal-600" />;
    }
  };

  const getStepIcon = (name: string) => {
    switch (name) {
      case 'UploadCloud':
        return <UploadCloud className="w-6 h-6 text-blue-600" />;
      case 'Cpu':
        return <Cpu className="w-6 h-6 text-purple-600" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-6 h-6 text-emerald-600" />;
      default:
        return <LayoutDashboard className="w-6 h-6 text-indigo-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-28 overflow-hidden bg-gradient-to-b from-blue-50/60 via-slate-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200/80 text-blue-700 text-xs font-bold tracking-wide shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                <span>Next-Gen Healthcare AI • FDA Drug Safety Cross-Check</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Smart Healthcare & <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
                  Prescription Safety
                </span>{' '}
                Powered by AI
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                MediGuard AI scans handwritten prescriptions, cross-checks 100,000+ drug interactions, detects duplicate medications, and translates clinical jargon into clear patient guidance.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
                <button
                  onClick={() => setCurrentPage('upload')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-lg shadow-blue-600/25 hover:shadow-blue-600/35 transition-all duration-150 active:scale-95"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Prescription</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setCurrentPage('dashboard')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200/90 rounded-2xl shadow-sm transition-all duration-150 active:scale-95"
                >
                  <Play className="w-4 h-4 text-blue-600 fill-blue-600" />
                  <span>View Patient Demo</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-slate-200/60 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-semibold">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>HIPAA Compliant</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>256-Bit Encrypted</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>99.8% Vision Accuracy</span>
                </div>
              </div>
            </motion.div>

            {/* Right Hero Interactive Graphic / Floating Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative mx-auto max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 space-y-5">
                {/* Simulated Rx Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Scan className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">Dr. Sarah Jenkins</h4>
                      <p className="text-[11px] text-slate-500">St. Jude Hospital • RX-88492</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Verified Safe
                  </span>
                </div>

                {/* Scanned Image Preview */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 group">
                  <img
                    src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=600"
                    alt="Prescription Scan"
                    className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex items-end p-4">
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" /> AI OCR Laser Extracted 2 Drugs
                    </span>
                  </div>
                </div>

                {/* AI Extracted Cards */}
                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                    <div>
                      <h5 className="font-bold text-slate-900">Lisinopril (10mg)</h5>
                      <p className="text-slate-500 text-[11px]">Once daily in morning</p>
                    </div>
                    <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Blood Pressure</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                    <div>
                      <h5 className="font-bold text-slate-900">Atorvastatin (20mg)</h5>
                      <p className="text-slate-500 text-[11px]">Once daily at bedtime</p>
                    </div>
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Cholesterol</span>
                  </div>
                </div>

                <button
                  onClick={() => setCurrentPage('upload')}
                  className="w-full py-3 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200/80 transition-colors"
                >
                  Test Your Prescription Scan →
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-12 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {LANDING_STATS.map((stat, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 text-center">
                <h3 className="text-3xl sm:text-4xl font-extrabold text-blue-600 tracking-tight">{stat.value}</h3>
                <p className="text-xs sm:text-sm font-bold text-slate-800 mt-1">{stat.label}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{stat.change}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
              Clinical Grade Engine
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Complete Prescription Protection Built for Modern Patients
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              MediGuard combines computer vision, real-time pharmacology cross-checks, and intuitive timelines to make managing medications stress-free.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {LANDING_FEATURES.map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                      {getFeatureIcon(feature.icon)}
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                      {feature.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{feature.title}</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{feature.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setCurrentPage('dashboard')}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                  >
                    <span>Learn more</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
              4-Step Simplicity
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              From Paper Script to Protected Health Schedule
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {HOW_IT_WORKS_STEPS.map((step, idx) => (
              <div key={idx} className="relative p-6 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black text-blue-600">{step.step}</span>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                    {getStepIcon(step.icon)}
                  </div>
                </div>
                <h3 className="text-base font-bold text-slate-900">{step.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200/60">
              Trusted by Thousands
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Loved by Patients & Recommended by Doctors
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    {[...Array(t.stars)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">"{t.quote}"</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                  <img src={t.avatar} alt={t.author} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{t.author}</h4>
                    <p className="text-[11px] text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-sm text-slate-600">Everything you need to know about MediGuard AI safety and features.</p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200/80 bg-slate-50/50 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-sm sm:text-base hover:bg-slate-100/60"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-blue-600' : ''}`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/60">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
            <div className="space-y-4 md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                  <Shield className="w-5 h-5" />
                </div>
                <span className="text-lg font-black text-white">MediGuard AI</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Next-generation prescription digitization, interaction alerts, and healthcare timelines.
              </p>
            </div>

            <div>
              <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Product</h5>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li className="hover:text-white cursor-pointer" onClick={() => setCurrentPage('upload')}>
                  Prescription Scanner
                </li>
                <li className="hover:text-white cursor-pointer" onClick={() => setCurrentPage('history')}>
                  Interaction Checker
                </li>
                <li className="hover:text-white cursor-pointer" onClick={() => setCurrentPage('library')}>
                  Medicine Database
                </li>
                <li className="hover:text-white cursor-pointer" onClick={() => setCurrentPage('timeline')}>
                  Health Timeline
                </li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Portals</h5>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li className="hover:text-white cursor-pointer" onClick={() => setCurrentPage('login')}>
                  Patient Login
                </li>
                <li className="hover:text-white cursor-pointer" onClick={() => setCurrentPage('register')}>
                  Doctor Registration
                </li>
                <li className="hover:text-white cursor-pointer" onClick={() => setCurrentPage('dashboard')}>
                  Clinical Dashboard
                </li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Security</h5>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Full HIPAA, GDPR, and ISO 27001 healthcare data security compliance.
              </p>
              <span className="inline-block text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2.5 py-1 rounded">
                HIPAA Certified • 256-Bit SSL
              </span>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} MediGuard AI Technologies Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
              <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
              <span className="hover:text-slate-300 cursor-pointer">Clinical Disclaimer</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
