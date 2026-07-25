import React from 'react';
import { motion } from 'motion/react';
import {
  FileText,
  Pill,
  BellRing,
  ShieldAlert,
  Upload,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  ArrowUpRight,
  Eye,
  Activity,
  FileCheck2,
  ChevronRight,
  AlertTriangle,
  Layers,
  Sparkles,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useDashboardData } from '../hooks/useDashboardData';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { AdherenceChart, DosageBreakdownChart } from '../components/charts/HealthCharts';

export const DashboardPage: React.FC = () => {
  const {
    prescriptions,
    reminders,
    toggleReminderStatus,
    setCurrentPage,
    viewPrescriptionDetails,
    addToast,
    userProfile,
    userRole,
  } = useApp();

  // Fetch / calculate all dashboard stats via React Query
  const { stats, isLoading, isFetching, refetch } = useDashboardData();

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold text-blue-100">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>AI Safety Engine Active</span>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-500/40 border border-blue-300/40 text-xs font-extrabold text-white">
              Role: {userRole}
            </span>
            {isFetching && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 text-[11px] font-bold">
                <RefreshCw className="w-3 h-3 animate-spin" /> Recalculating Stats...
              </span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome, {userProfile.fullName || 'Patient'}
          </h2>
          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
            You have <strong className="text-white font-bold">{stats.pendingRemindersCount} medication doses</strong> pending for today. Total calculated adherence is{' '}
            <strong className="text-emerald-300 font-bold">{stats.averageAdherence}%</strong>.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-3">
          <button
            onClick={() => setCurrentPage('upload')}
            className="inline-flex items-center gap-2 px-5 py-3 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-blue-600" />
            <span>Upload New Prescription</span>
          </button>
          <button
            onClick={() => setCurrentPage('reminders')}
            className="inline-flex items-center gap-2 px-5 py-3 text-xs font-bold text-white bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>View Today Schedule</span>
          </button>
        </div>
      </div>

      {/* Primary Statistics Grid - Dynamic Calculations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Prescriptions"
          value={stats.totalPrescriptions}
          subtitle={`${stats.activePrescriptionsCount} Active / ${stats.historicalPrescriptionsCount} Archived`}
          change={`+${stats.monthlyUploadsCount} this month`}
          icon={FileText}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
          onClick={() => setCurrentPage('history')}
        />

        <StatCard
          title="Active Medicines"
          value={stats.activeMedicinesCount}
          subtitle="Verified Dosage Regimens"
          change={`${stats.medicineCategories.length} Categories`}
          icon={Pill}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
          onClick={() => setCurrentPage('library')}
        />

        <StatCard
          title="Today's Medicines"
          value={stats.todaysMedicinesCount}
          subtitle={`${stats.takenRemindersCount}/${stats.todaysMedicinesCount} Doses Completed`}
          change={`${stats.pendingRemindersCount} Pending`}
          icon={BellRing}
          iconBgColor="bg-amber-50"
          iconColor="text-amber-600"
          onClick={() => setCurrentPage('reminders')}
        />

        <StatCard
          title="Average Adherence"
          value={`${stats.averageAdherence}%`}
          subtitle={
            stats.averageAdherence >= 80
              ? 'Excellent Compliance'
              : stats.averageAdherence >= 50
              ? 'Moderate Adherence'
              : 'Attention Required'
          }
          change={stats.averageAdherence >= 80 ? 'High' : 'Needs Review'}
          changeType={stats.averageAdherence >= 80 ? 'positive' : 'negative'}
          icon={TrendingUp}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-600"
          onClick={() => setCurrentPage('reminders')}
        />
      </div>

      {/* Secondary Metrics Bar (AI Alerts, Drug Interactions, Monthly Uploads, Categories) */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-4 text-center divide-x divide-slate-100">
        <div className="p-2 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            AI Safety Alerts
          </span>
          <div className="text-xl font-black text-slate-900 flex items-center justify-center gap-1.5">
            <ShieldAlert className={`w-4 h-4 ${stats.aiAlertsCount > 0 ? 'text-rose-500' : 'text-emerald-500'}`} />
            <span>{stats.aiAlertsCount}</span>
          </div>
          <span className="text-[10px] text-slate-500 font-medium block">
            {stats.aiAlertsCount > 0 ? 'Requires clinical review' : 'No safety hazards'}
          </span>
        </div>

        <div className="p-2 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Drug Interactions
          </span>
          <div className="text-xl font-black text-slate-900 flex items-center justify-center gap-1.5">
            <AlertTriangle className={`w-4 h-4 ${stats.drugInteractionsCount > 0 ? 'text-amber-500' : 'text-emerald-500'}`} />
            <span>{stats.drugInteractionsCount}</span>
          </div>
          <span className="text-[10px] text-slate-500 font-medium block">
            {stats.drugInteractionsCount > 0 ? 'Flagged contraindications' : 'Clear compatibility'}
          </span>
        </div>

        <div className="p-2 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Monthly Uploads
          </span>
          <div className="text-xl font-black text-slate-900 flex items-center justify-center gap-1.5">
            <Upload className="w-4 h-4 text-blue-600" />
            <span>{stats.monthlyUploadsCount}</span>
          </div>
          <span className="text-[10px] text-slate-500 font-medium block">Scanned in current month</span>
        </div>

        <div className="p-2 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Medicine Categories
          </span>
          <div className="text-xl font-black text-slate-900 flex items-center justify-center gap-1.5">
            <Layers className="w-4 h-4 text-purple-600" />
            <span>{stats.medicineCategories.length}</span>
          </div>
          <span className="text-[10px] text-slate-500 font-medium block">Active therapeutic classes</span>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Adherence Chart */}
        <div className="lg:col-span-8 p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">7-Day Medication Adherence Trend</h3>
              <p className="text-xs text-slate-500">Calculated from patient daily dose completions</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full">
              {stats.averageAdherence}% Current Adherence
            </span>
          </div>
          <AdherenceChart currentAdherence={stats.averageAdherence} />
        </div>

        {/* Category Breakdown Chart */}
        <div className="lg:col-span-4 p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Medicine Categories</h3>
            <p className="text-xs text-slate-500">Distribution of active prescribed drug classes</p>
          </div>
          <DosageBreakdownChart categories={stats.medicineCategories} />
        </div>
      </div>

      {/* Middle Grid: Today's Schedule & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Schedule Widget */}
        <div className="lg:col-span-7 p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Today's Dose Schedule</h3>
                <p className="text-[11px] font-semibold text-slate-500">
                  Adherence: <strong className="text-blue-600">{stats.averageAdherence}%</strong> ({stats.takenRemindersCount} of {stats.todaysMedicinesCount} Doses Taken)
                </p>
              </div>
            </div>
            <button
              onClick={() => setCurrentPage('reminders')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Manage Reminders →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {reminders.map((rem) => {
              const isTaken = rem.status === 'Taken';
              return (
                <div key={rem.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => toggleReminderStatus(rem.id)}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                        isTaken
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 hover:border-blue-500 text-transparent'
                      }`}
                      title={isTaken ? 'Mark as Pending' : 'Mark as Complete'}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4
                          className={`text-sm font-extrabold truncate ${
                            isTaken ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {rem.medicineName}
                        </h4>
                        {rem.frequencyCode && (
                          <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60">
                            {rem.frequencyCode}
                          </span>
                        )}
                        <Badge size="sm" variant={rem.timeSlot === 'Morning' ? 'blue' : 'amber'}>
                          {rem.exactTime}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{rem.dosage} • {rem.instructions}</p>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${
                      isTaken ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {rem.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Recent Activity Feed */}
        <div className="lg:col-span-5 p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <h3 className="text-base font-extrabold text-slate-900">Recent Activity</h3>
            </div>
            <button
              onClick={() => setCurrentPage('timeline')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Full Feed →
            </button>
          </div>

          <div className="space-y-3">
            {stats.recentActivity.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No recent activity recorded.</p>
            ) : (
              stats.recentActivity.map((act) => (
                <div
                  key={act.id}
                  className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/60 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="font-extrabold text-slate-900 truncate">{act.title}</div>
                    <div className="text-slate-500 text-[11px] truncate">{act.subtitle}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{act.timestamp}</div>
                  </div>

                  {act.statusBadge && (
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase shrink-0 ${
                        act.statusBadge.variant === 'emerald'
                          ? 'bg-emerald-100 text-emerald-800'
                          : act.statusBadge.variant === 'amber'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {act.statusBadge.label}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Scanned Prescriptions Table */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Recent Scanned Prescriptions</h3>
            <p className="text-xs text-slate-500">Verified by MediGuard AI vision parser</p>
          </div>
          <button
            onClick={() => setCurrentPage('history')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({prescriptions.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3 pl-2">Rx Code</th>
                <th className="pb-3">Doctor / Hospital</th>
                <th className="pb-3">Diagnosis</th>
                <th className="pb-3">Prescribed Drugs</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {prescriptions.map((rx) => (
                <tr key={rx.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 pl-2 font-bold text-blue-600">{rx.code}</td>
                  <td className="py-3.5">
                    <div className="font-bold text-slate-900">{rx.doctorName}</div>
                    <div className="text-[10px] text-slate-400">{rx.hospital}</div>
                  </td>
                  <td className="py-3.5 max-w-xs truncate">{rx.diagnosis}</td>
                  <td className="py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {rx.medicines.map((m, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 font-semibold">
                          {m.medicineName}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5">
                    <Badge
                      variant={
                        rx.status === 'Verified'
                          ? 'emerald'
                          : rx.status === 'Action Required'
                          ? 'amber'
                          : 'slate'
                      }
                    >
                      {rx.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 text-right pr-2">
                    <button
                      onClick={() => viewPrescriptionDetails(rx.id)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
