import React from 'react';
import {
  LayoutDashboard,
  Upload,
  FileText,
  Pill,
  Activity,
  BellRing,
  User,
  Settings,
  LogOut,
  Shield,
  X,
  Sparkles,
  FileCheck2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PageRoute } from '../../types';

export const Sidebar: React.FC = () => {
  const { currentPage, setCurrentPage, sidebarOpen, setSidebarOpen, userRole, logout } = useApp();

  const menuItems: { label: string; page: PageRoute; icon: React.ReactNode; badge?: string }[] = [
    { label: 'Dashboard', page: 'dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Admin Panel', page: 'admin', icon: <Shield className="w-4 h-4 text-purple-600" />, badge: 'ADMIN' },
    { label: 'Upload Prescription', page: 'upload', icon: <Upload className="w-4 h-4" />, badge: 'AI' },
    { label: 'Prescription History', page: 'history', icon: <FileText className="w-4 h-4" /> },
    { label: 'AI Health Report', page: 'report', icon: <FileCheck2 className="w-4 h-4 text-indigo-500" />, badge: 'PDF' },
    { label: 'Medicine Library', page: 'library', icon: <Pill className="w-4 h-4" /> },
    { label: 'Health Timeline', page: 'timeline', icon: <Activity className="w-4 h-4" /> },
    { label: 'Medication Reminders', page: 'reminders', icon: <BellRing className="w-4 h-4" /> },
    { label: 'User Profile', page: 'profile', icon: <User className="w-4 h-4" /> },
    { label: 'Settings', page: 'settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Mobile Sidebar Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[60]"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-[70] w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Sidebar Top Header / Brand */}
          <div className="h-16 sm:h-20 px-6 border-b border-slate-100 flex items-center justify-between">
            <div
              onClick={() => setCurrentPage('landing')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-base font-extrabold text-slate-900 tracking-tight">MediGuard</span>
                <span className="ml-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-1 py-0.5 rounded">AI</span>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Items */}
          <div className="px-3 py-4 space-y-1">
            <div className="px-3 py-1.5 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {userRole} Workspace
              </span>
              <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-full">
                {userRole}
              </span>
            </div>

            {menuItems.map((item) => {
              const isActive = currentPage === item.page;
              return (
                <button
                  key={item.page}
                  onClick={() => {
                    setCurrentPage(item.page);
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-white' : 'text-slate-500'}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-blue-50 text-blue-600 border border-blue-200/60'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Bottom Banner & User Card */}
        <div className="p-3 border-t border-slate-100 space-y-3">
          {/* AI Banner Box */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100/80 text-emerald-700 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h5 className="text-xs font-bold text-slate-900 truncate">Safety Shield Active</h5>
              <p className="text-[10px] text-slate-500 truncate">12 Prescriptions Monitored</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
