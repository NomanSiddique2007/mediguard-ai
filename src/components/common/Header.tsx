import React, { useState } from 'react';
import {
  Menu,
  Bell,
  Search,
  Shield,
  Upload,
  ChevronDown,
  Check,
  AlertCircle,
  Clock,
  Sparkles,
  AlertTriangle,
  User,
  Trash2,
  CheckCheck,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SearchBar } from './SearchBar';
import { NotificationRecord } from '../../types';

export const Header: React.FC<{ title?: string; subtitle?: string }> = ({
  title,
  subtitle,
}) => {
  const {
    toggleSidebar,
    userProfile,
    globalSearch,
    setGlobalSearch,
    setCurrentPage,
    addToast,
    userRole,
    logout,
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    notifyMedicineReminder,
    notifyPrescriptionUploaded,
    notifyAIAnalysisComplete,
    notifyInteractionWarning,
    notifyProfileUpdated,
  } = useApp();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Filtered notifications list
  const filteredNotifications = notifications.filter((n) => {
    if (filterCategory === 'unread') return !n.isRead;
    if (filterCategory === 'all') return true;
    return n.category === filterCategory;
  });

  // Helper icon selector for notification category
  const getCategoryIcon = (category: NotificationRecord['category'], type: NotificationRecord['type']) => {
    switch (category) {
      case 'reminder':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'upload':
        return <Upload className="w-4 h-4 text-blue-600" />;
      case 'ai_analysis':
        return <Sparkles className="w-4 h-4 text-emerald-600" />;
      case 'interaction':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'profile':
        return <User className="w-4 h-4 text-purple-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-600" />;
    }
  };

  const formatTimestamp = (isoString?: string) => {
    if (!isoString) return 'Just now';
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${Math.floor(diffHours / 24)}d ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between gap-4 font-sans">
      {/* Left: Mobile Menu Trigger + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-none">
            {title || 'Patient Portal'}
          </h1>
          {subtitle && <p className="text-xs text-slate-500 mt-1 hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      {/* Middle Search Bar */}
      <div className="hidden md:block max-w-md w-full">
        <SearchBar
          value={globalSearch}
          onChange={setGlobalSearch}
          placeholder="Search drugs, prescriptions, doctors..."
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 relative">
        <button
          onClick={() => setCurrentPage('upload')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Scan</span>
        </button>

        {/* NOTIFICATION SYSTEM POPOVER WITH UNREAD BADGE */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2.5 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/80 transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[18px] text-[10px] font-black text-white bg-rose-600 rounded-full ring-2 ring-white flex items-center justify-center animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200/90 shadow-2xl z-50 p-4 space-y-3">
              {/* Popover Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Notifications
                  </h4>
                  {unreadNotificationsCount > 0 ? (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                      {unreadNotificationsCount} Unread
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      All Read
                    </span>
                  )}
                </div>

                {unreadNotificationsCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              {/* Category Filters */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px] font-bold no-scrollbar">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'unread', label: `Unread (${unreadNotificationsCount})` },
                  { id: 'reminder', label: 'Reminders' },
                  { id: 'upload', label: 'Uploads' },
                  { id: 'ai_analysis', label: 'AI Analysis' },
                  { id: 'interaction', label: 'Warnings' },
                  { id: 'profile', label: 'Profile' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setFilterCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors cursor-pointer ${
                      filterCategory === cat.id
                        ? 'bg-slate-900 text-white font-black'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Quick Simulator Bar (To quickly generate required notify types) */}
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Simulate Trigger Event:
                </span>
                <div className="flex flex-wrap items-center gap-1">
                  <button
                    onClick={() => notifyMedicineReminder('Metformin 500mg', '08:00 AM', '1 tablet')}
                    className="px-2 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-800 text-[10px] font-bold cursor-pointer"
                  >
                    + Reminder
                  </button>
                  <button
                    onClick={() => notifyPrescriptionUploaded('RX-9921', 'Dr. Sarah Jenkins')}
                    className="px-2 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-800 text-[10px] font-bold cursor-pointer"
                  >
                    + Upload
                  </button>
                  <button
                    onClick={() => notifyAIAnalysisComplete('RX-9921', 96)}
                    className="px-2 py-1 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold cursor-pointer"
                  >
                    + AI Done
                  </button>
                  <button
                    onClick={() => notifyInteractionWarning('Lisinopril', 'Potassium Supplement', 'High')}
                    className="px-2 py-1 rounded bg-rose-100 hover:bg-rose-200 text-rose-800 text-[10px] font-bold cursor-pointer"
                  >
                    + Warning
                  </button>
                  <button
                    onClick={() => notifyProfileUpdated('Allergies list updated.')}
                    className="px-2 py-1 rounded bg-purple-100 hover:bg-purple-200 text-purple-800 text-[10px] font-bold cursor-pointer"
                  >
                    + Profile
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1 space-y-1">
                {filteredNotifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 space-y-1">
                    <Bell className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs font-bold">No notifications found</p>
                    <p className="text-[10px]">Select a different category or generate a new alert.</p>
                  </div>
                ) : (
                  filteredNotifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (!n.isRead) markNotificationAsRead(n.id);
                        if (n.page) {
                          setCurrentPage(n.page);
                          setNotificationsOpen(false);
                        }
                      }}
                      className={`py-3 px-2 rounded-xl flex items-start gap-3 transition-colors cursor-pointer group ${
                        n.isRead ? 'bg-white hover:bg-slate-50' : 'bg-blue-50/50 hover:bg-blue-50/80 border border-blue-100/80'
                      }`}
                    >
                      {/* Icon */}
                      <div className="p-2 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                        {getCategoryIcon(n.category, n.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h5 className="text-xs font-extrabold text-slate-900 truncate">
                            {n.title}
                          </h5>
                          <span className="text-[10px] font-medium text-slate-400 shrink-0">
                            {formatTimestamp(n.createdAt)}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600 mt-0.5 leading-snug font-normal line-clamp-2">
                          {n.message}
                        </p>

                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100/80 text-[10px]">
                          <span className="font-bold text-blue-600 group-hover:underline flex items-center gap-0.5">
                            View details <ExternalLink className="w-2.5 h-2.5" />
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(n.id);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Delete notification"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-colors cursor-pointer"
          >
            <img
              src={userProfile.avatarUrl}
              alt={userProfile.fullName}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover"
            />
            <span className="text-xs font-bold text-slate-900 hidden sm:block">{userProfile.fullName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200/80 shadow-xl z-50 p-2 space-y-1">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{userProfile.fullName}</p>
                <p className="text-[10px] text-slate-500 truncate">{userProfile.email}</p>
                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-md">
                    Role: {userRole}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                    ID: {userProfile.patientId}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  setCurrentPage('profile');
                }}
                className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                View Profile
              </button>
              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  setCurrentPage('settings');
                }}
                className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Account Settings
              </button>
              <button
                onClick={async () => {
                  setProfileDropdownOpen(false);
                  await logout();
                }}
                className="w-full text-left px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
