import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  Plus,
  Filter,
  Calendar,
  Stethoscope,
  FileText,
  CheckCircle2,
  Syringe,
  Pill,
  Building2,
  HeartPulse,
  Search,
  ArrowUpDown,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { HealthEvent } from '../types';
import { TimelineCard } from '../components/common/TimelineCard';
import { Modal } from '../components/common/Modal';

function formatMonthYear(dateString: string): string {
  if (!dateString) return 'Unscheduled';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export const HealthTimelinePage: React.FC = () => {
  const { healthEvents, addHealthEvent, addToast } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortAscending, setSortAscending] = useState(false); // Default newest first
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Form states for manually adding new event
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<HealthEvent['category']>('Doctor Visit');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00 AM');
  const [doctor, setDoctor] = useState('');
  const [description, setDescription] = useState('');

  const categories = [
    'All',
    'Diagnosis',
    'Medicine',
    'Doctor Visit',
    'Hospital Visit',
    'Recovery',
    'Lab Result',
    'Vaccination',
  ];

  // Quick stats summary
  const stats = useMemo(() => {
    return {
      total: healthEvents.length,
      diagnoses: healthEvents.filter((e) => e.category === 'Diagnosis').length,
      medicines: healthEvents.filter((e) => e.category === 'Medicine').length,
      doctorVisits: healthEvents.filter((e) => e.category === 'Doctor Visit').length,
      hospitalVisits: healthEvents.filter((e) => e.category === 'Hospital Visit').length,
      recoveries: healthEvents.filter((e) => e.category === 'Recovery').length,
    };
  }, [healthEvents]);

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    return healthEvents
      .filter((evt) => {
        const matchesCategory =
          selectedCategory === 'All' ||
          evt.category.toLowerCase().includes(selectedCategory.toLowerCase());

        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          evt.title.toLowerCase().includes(q) ||
          evt.description.toLowerCase().includes(q) ||
          (evt.doctor && evt.doctor.toLowerCase().includes(q)) ||
          evt.category.toLowerCase().includes(q);

        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortAscending ? dateA - dateB : dateB - dateA;
      });
  }, [healthEvents, selectedCategory, searchQuery, sortAscending]);

  // Group filtered events by month (e.g. "July 2026") preserving chronological order
  const monthGroups = useMemo(() => {
    const groups: { monthLabel: string; dateSortKey: number; events: HealthEvent[] }[] = [];
    const map = new Map<string, HealthEvent[]>();

    filteredEvents.forEach((evt) => {
      const label = formatMonthYear(evt.date);
      if (!map.has(label)) {
        map.set(label, []);
      }
      map.get(label)!.push(evt);
    });

    map.forEach((events, monthLabel) => {
      // Pick date of first event to represent month sorting key
      const dateSortKey = new Date(events[0].date).getTime();
      groups.push({ monthLabel, dateSortKey, events });
    });

    groups.sort((a, b) => (sortAscending ? a.dateSortKey - b.dateSortKey : b.dateSortKey - a.dateSortKey));

    return groups;
  }, [filteredEvents, sortAscending]);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    let iconType = 'CheckCircle2';
    if (category === 'Doctor Visit') iconType = 'Stethoscope';
    else if (category === 'Diagnosis') iconType = 'Activity';
    else if (category === 'Medicine') iconType = 'Pill';
    else if (category === 'Hospital Visit') iconType = 'Building2';
    else if (category === 'Recovery') iconType = 'HeartPulse';
    else if (category === 'Lab Result') iconType = 'FileText';
    else if (category === 'Vaccination') iconType = 'Syringe';

    addHealthEvent({
      date,
      time,
      title,
      category,
      doctor: doctor || undefined,
      description,
      status: 'Completed',
      iconType,
    });

    setAddModalOpen(false);
    setTitle('');
    setDescription('');
    setDoctor('');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 font-sans">
      {/* Top Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800"
      >
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Automated Health Timeline</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Clinical Health History & Events
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Every uploaded prescription automatically indexes <strong className="text-white">Diagnosis</strong>,{' '}
              <strong className="text-white">Medicine</strong>, <strong className="text-white">Doctor Visit</strong>,{' '}
              <strong className="text-white">Hospital Visit</strong>, and <strong className="text-white">Recovery Events</strong> chronologically.
            </p>
          </div>

          <button
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 rounded-2xl shadow-lg hover:shadow-xl transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Event</span>
          </button>
        </div>

        {/* Quick Category Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-6 pt-6 border-t border-slate-800 text-center">
          <div className="bg-slate-900/60 backdrop-blur-xs border border-slate-800 rounded-xl p-2.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Total Events</span>
            <span className="text-lg font-black text-white">{stats.total}</span>
          </div>
          <div className="bg-rose-950/30 border border-rose-900/50 rounded-xl p-2.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-300 block">Diagnoses</span>
            <span className="text-lg font-black text-rose-200">{stats.diagnoses}</span>
          </div>
          <div className="bg-amber-950/30 border border-amber-900/50 rounded-xl p-2.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 block">Medicines</span>
            <span className="text-lg font-black text-amber-200">{stats.medicines}</span>
          </div>
          <div className="bg-blue-950/30 border border-blue-900/50 rounded-xl p-2.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-300 block">Doctor Visits</span>
            <span className="text-lg font-black text-blue-200">{stats.doctorVisits}</span>
          </div>
          <div className="bg-cyan-950/30 border border-cyan-900/50 rounded-xl p-2.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-300 block">Hospital Visits</span>
            <span className="text-lg font-black text-cyan-200">{stats.hospitalVisits}</span>
          </div>
          <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-xl p-2.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 block">Recoveries</span>
            <span className="text-lg font-black text-emerald-200">{stats.recoveries}</span>
          </div>
        </div>
      </motion.div>

      {/* Filter Toolbar & Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by title, doctor, condition, medicine name..."
              className="w-full pl-10 pr-4 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort Direction Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setSortAscending(!sortAscending)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all border border-slate-200 cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-600" />
              <span>{sortAscending ? 'Oldest First' : 'Newest First'}</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-400 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`relative px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chronological Monthly Grouped Timeline */}
      <div className="space-y-8 pt-2">
        {monthGroups.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-800">No Health Events Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No matching events recorded for category "{selectedCategory}"{searchQuery ? ` and query "${searchQuery}"` : ''}. Upload a prescription to automatically generate events!
            </p>
          </motion.div>
        ) : (
          monthGroups.map((group) => (
            <motion.div
              key={group.monthLabel}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Month Group Header */}
              <div className="sticky top-16 z-20 flex items-center justify-between bg-slate-900/90 backdrop-blur-md text-white px-5 py-2.5 rounded-2xl border border-slate-800 shadow-md">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                    {group.monthLabel}
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-extrabold uppercase tracking-wide">
                  {group.events.length} {group.events.length === 1 ? 'Event' : 'Events'}
                </span>
              </div>

              {/* Monthly Events List */}
              <div className="pt-2 pl-2">
                {group.events.map((event, idx) => (
                  <TimelineCard
                    key={event.id}
                    event={event}
                    isLast={idx === group.events.length - 1}
                  />
                ))}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Manual Modal Form to Add Health Event */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Record New Health Event"
        subtitle="Add a doctor visit, lab test, diagnosis, hospital check-in, or recovery milestone"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none"
              placeholder="e.g. Annual Respiratory Evaluation"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as HealthEvent['category'])}
                className="w-full px-3.5 py-2.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none"
              >
                <option value="Doctor Visit">Doctor Visit</option>
                <option value="Diagnosis">Diagnosis Event</option>
                <option value="Medicine">Medicine Event</option>
                <option value="Hospital Visit">Hospital Visit</option>
                <option value="Recovery">Recovery Event</option>
                <option value="Lab Result">Lab Result</option>
                <option value="Vaccination">Vaccination</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Event Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Time
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none"
                placeholder="10:00 AM"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Attending Doctor
              </label>
              <input
                type="text"
                value={doctor}
                onChange={(e) => setDoctor(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none"
                placeholder="Dr. Sarah Jenkins"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Clinical Notes & Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none resize-none"
              placeholder="Record findings, prescription recommendations, or recovery instructions..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all cursor-pointer"
            >
              Save Health Event
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
