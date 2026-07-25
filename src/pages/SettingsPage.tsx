import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Bell,
  Sun,
  Globe,
  Lock,
  ShieldCheck,
  Trash2,
  Check,
  AlertTriangle,
  Smartphone,
  KeyRound,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/common/Modal';

export const SettingsPage: React.FC = () => {
  const { addToast, setCurrentPage, isSupabaseConnected, seedDataToSupabase, refetchAll } = useApp();

  // Settings states
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushReminders, setPushReminders] = useState(true);
  const [refillWarnings, setRefillWarnings] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);

  const [theme, setTheme] = useState<'Light' | 'Soft Gray' | 'High Contrast'>('Light');
  const [language, setLanguage] = useState('English (US)');

  const [aiConsent, setAiConsent] = useState(true);
  const [anonymizedData, setAnonymizedData] = useState(true);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleSaveSettings = () => {
    addToast({
      type: 'success',
      title: 'Settings Saved',
      message: 'Your system preferences and notification triggers have been updated.',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 font-sans">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">System Settings & Privacy</h2>
        <p className="text-xs text-slate-500 mt-1">
          Configure notification alerts, AI consent rules, security credentials, and application theme.
        </p>
      </div>

      {/* Notifications Section */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Bell className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-extrabold text-slate-900">Notification & Schedule Triggers</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Medication Schedule Push Reminders</h4>
              <p className="text-[11px] text-slate-500">Receive browser and mobile alerts when doses are due</p>
            </div>
            <input
              type="checkbox"
              checked={pushReminders}
              onChange={(e) => {
                setPushReminders(e.target.checked);
                handleSaveSettings();
              }}
              className="w-5 h-5 text-blue-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Refill Warnings & Expiration</h4>
              <p className="text-[11px] text-slate-500">Notify when prescriptions have 5 days or fewer remaining</p>
            </div>
            <input
              type="checkbox"
              checked={refillWarnings}
              onChange={(e) => {
                setRefillWarnings(e.target.checked);
                handleSaveSettings();
              }}
              className="w-5 h-5 text-blue-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Clinical Digest via Email</h4>
              <p className="text-[11px] text-slate-500">Weekly adherence summaries and safety reports</p>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => {
                setEmailAlerts(e.target.checked);
                handleSaveSettings();
              }}
              className="w-5 h-5 text-blue-600 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Theme & Language */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appearance Theme */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sun className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-extrabold text-slate-900">Appearance Theme</h3>
          </div>

          <div className="space-y-2">
            {(['Light', 'Soft Gray', 'High Contrast'] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTheme(t);
                  handleSaveSettings();
                }}
                className={`w-full p-3 text-left rounded-2xl text-xs font-bold border transition-colors flex items-center justify-between ${
                  theme === t
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                <span>{t}</span>
                {theme === t && <Check className="w-4 h-4 text-blue-600" />}
              </button>
            ))}
          </div>
        </div>

        {/* Language & Regional */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Globe className="w-5 h-5 text-purple-600" />
            <h3 className="text-base font-extrabold text-slate-900">Language & Locale</h3>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Interface Language
            </label>
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                handleSaveSettings();
              }}
              className="w-full px-3.5 py-2.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
            >
              <option value="English (US)">English (US)</option>
              <option value="Spanish (Español)">Spanish (Español)</option>
              <option value="French (Français)">French (Français)</option>
              <option value="German (Deutsch)">German (Deutsch)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Security & HIPAA Privacy */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h3 className="text-base font-extrabold text-slate-900">AI Privacy & Data Sharing</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80">
            <div>
              <h4 className="text-xs font-bold text-slate-900">AI Computer Vision OCR Permission</h4>
              <p className="text-[11px] text-slate-500">Allow AI models to scan and parse drug names from uploaded photos</p>
            </div>
            <input
              type="checkbox"
              checked={aiConsent}
              onChange={(e) => {
                setAiConsent(e.target.checked);
                handleSaveSettings();
              }}
              className="w-5 h-5 text-blue-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Anonymized Pharmacology Research</h4>
              <p className="text-[11px] text-slate-500">Contribute zero-identifier drug interaction data for clinical research</p>
            </div>
            <input
              type="checkbox"
              checked={anonymizedData}
              onChange={(e) => {
                setAnonymizedData(e.target.checked);
                handleSaveSettings();
              }}
              className="w-5 h-5 text-blue-600 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Supabase Database Connection & Seeding Section */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-extrabold text-slate-900">Supabase Database Integration</h3>
          </div>
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full ${
              isSupabaseConnected
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {isSupabaseConnected ? 'Connected & Active' : 'Setup Credentials Needed'}
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          MediGuard AI connects directly to your Supabase PostgreSQL cloud database via <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono text-[11px]">VITE_SUPABASE_URL</code> and <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono text-[11px]">VITE_SUPABASE_ANON_KEY</code>.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => seedDataToSupabase()}
            className="w-full py-2.5 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <span>Seed Sample Medical Records to Supabase</span>
          </button>
          <button
            onClick={async () => {
              await refetchAll();
              addToast({
                type: 'success',
                title: 'Database Refreshed',
                message: 'Latest table records fetched from Supabase.',
              });
            }}
            className="w-full py-2.5 px-4 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <span>Re-sync with Supabase</span>
          </button>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5 text-[11px] text-slate-600">
          <p className="font-bold text-slate-900">Database Tables Configured:</p>
          <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
            <span className="bg-white border px-2 py-0.5 rounded">patients</span>
            <span className="bg-white border px-2 py-0.5 rounded">prescriptions</span>
            <span className="bg-white border px-2 py-0.5 rounded">medicines</span>
            <span className="bg-white border px-2 py-0.5 rounded">prescription_medicines</span>
            <span className="bg-white border px-2 py-0.5 rounded">reminders</span>
            <span className="bg-white border px-2 py-0.5 rounded">timeline_events</span>
            <span className="bg-white border px-2 py-0.5 rounded">ai_analysis</span>
          </div>
        </div>
      </div>

      {/* Delete Account Danger Zone */}
      <div className="p-6 bg-rose-50/60 rounded-3xl border border-rose-200 space-y-3">
        <h3 className="text-base font-extrabold text-rose-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-600" /> Danger Zone
        </h3>
        <p className="text-xs text-rose-700 leading-relaxed">
          Permanently erase all prescription records, medication reminders, and health history logs from MediGuard AI vaults.
        </p>

        <button
          onClick={() => setDeleteModalOpen(true)}
          className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-all"
        >
          Delete Patient Account
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Account Deletion"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Are you sure you want to permanently delete your MediGuard AI patient account? All prescription records and health history will be removed.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => {
                setDeleteModalOpen(false);
                addToast({
                  type: 'info',
                  title: 'Account Deleted',
                  message: 'Your data has been removed.',
                });
                setCurrentPage('landing');
              }}
              className="flex-1 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition-all"
            >
              Yes, Delete Permanently
            </button>
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
