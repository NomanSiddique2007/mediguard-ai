import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BellRing,
  CheckCircle2,
  Clock,
  Plus,
  Flame,
  Calendar as CalendarIcon,
  RotateCcw,
  Sun,
  Sunset,
  Moon,
  Sparkles,
  Pencil,
  Trash2,
  Filter,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { MedicationReminder } from '../types';
import { parseFrequencyToSchedule } from '../utils/reminderGenerator';

export const MedicationReminderPage: React.FC = () => {
  const {
    reminders,
    toggleReminderStatus,
    addReminder,
    updateReminder,
    deleteReminder,
    addToast,
  } = useApp();

  const [selectedSlot, setSelectedSlot] = useState<string>('All');
  const [selectedFreqFilter, setSelectedFreqFilter] = useState<string>('All');

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<MedicationReminder | null>(null);

  // Form states for adding custom / frequency reminder
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('1 Tablet');
  const [frequencyCode, setFrequencyCode] = useState<'OD' | 'BD' | 'TDS' | 'QDS' | 'SOS' | 'Custom'>('BD');
  const [slot, setSlot] = useState<'Morning' | 'Afternoon' | 'Evening' | 'Night'>('Morning');
  const [exactTime, setExactTime] = useState('08:00 AM');
  const [instructions, setInstructions] = useState('');

  // Form states for editing
  const [editMedName, setEditMedName] = useState('');
  const [editDosage, setEditDosage] = useState('');
  const [editFreqCode, setEditFreqCode] = useState<string>('OD');
  const [editSlot, setEditSlot] = useState<'Morning' | 'Afternoon' | 'Evening' | 'Night'>('Morning');
  const [editExactTime, setEditExactTime] = useState('08:00 AM');
  const [editInstructions, setEditInstructions] = useState('');

  const slots = ['All', 'Morning', 'Afternoon', 'Evening', 'Night'];
  const frequencies = ['All', 'OD', 'BD', 'TDS', 'QDS', 'SOS'];

  const filteredReminders = reminders.filter((rem) => {
    const matchesSlot = selectedSlot === 'All' || rem.timeSlot === selectedSlot;
    const matchesFreq =
      selectedFreqFilter === 'All' ||
      (rem.frequencyCode && rem.frequencyCode.toUpperCase().includes(selectedFreqFilter.toUpperCase())) ||
      (rem.instructions && rem.instructions.toUpperCase().includes(selectedFreqFilter.toUpperCase()));

    return matchesSlot && matchesFreq;
  });

  const takenCount = reminders.filter((r) => r.status === 'Taken').length;
  const totalCount = reminders.length;
  const adherencePercentage = Math.round((takenCount / Math.max(1, totalCount)) * 100);

  const getAdherenceColor = (pct: number) => {
    if (pct >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (pct >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  // Handle auto-generating or manual creation of reminders
  const handleCreateReminders = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName) return;

    if (frequencyCode === 'Custom') {
      addReminder({
        medicineName: medName,
        dosage: dosage || '1 Tablet',
        timeSlot: slot,
        exactTime: exactTime || '08:00 AM',
        instructions: instructions || 'Take with water',
        status: 'Pending',
        frequencyCode: 'Custom',
      });
    } else {
      // Automatically generate multiple slots for BD, TDS, QDS, SOS, OD
      const scheduleSlots = parseFrequencyToSchedule(frequencyCode);
      scheduleSlots.forEach((sch) => {
        addReminder({
          medicineName: medName,
          dosage: dosage || '1 Tablet',
          timeSlot: sch.timeSlot,
          exactTime: sch.exactTime,
          instructions: instructions
            ? `${instructions} (${sch.label})`
            : `Take according to ${frequencyCode} regimen (${sch.label})`,
          status: 'Pending',
          frequencyCode: frequencyCode,
        });
      });
    }

    setAddModalOpen(false);
    setMedName('');
    setDosage('1 Tablet');
    setInstructions('');
  };

  const startEditing = (rem: MedicationReminder) => {
    setEditingReminder(rem);
    setEditMedName(rem.medicineName);
    setEditDosage(rem.dosage);
    setEditFreqCode(rem.frequencyCode || 'OD');
    setEditSlot(rem.timeSlot);
    setEditExactTime(rem.exactTime);
    setEditInstructions(rem.instructions);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReminder) return;

    updateReminder(editingReminder.id, {
      medicineName: editMedName,
      dosage: editDosage,
      frequencyCode: editFreqCode,
      timeSlot: editSlot,
      exactTime: editExactTime,
      instructions: editInstructions,
    });

    setEditingReminder(null);
  };

  const getSlotIcon = (s: string) => {
    switch (s) {
      case 'Morning':
        return <Sun className="w-4 h-4 text-amber-500" />;
      case 'Afternoon':
        return <Sun className="w-4 h-4 text-amber-600" />;
      case 'Evening':
        return <Sunset className="w-4 h-4 text-indigo-500" />;
      default:
        return <Moon className="w-4 h-4 text-purple-600" />;
    }
  };

  const getFreqBadgeColor = (code?: string) => {
    switch (code?.toUpperCase()) {
      case 'OD':
        return 'emerald';
      case 'BD':
        return 'blue';
      case 'TDS':
        return 'purple';
      case 'QDS':
        return 'indigo';
      case 'SOS':
        return 'rose';
      default:
        return 'slate';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 font-sans">
      {/* Top Banner & Adherence Percentage Engine */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
      >
        <div className="space-y-2 max-w-lg">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60">
              <Flame className="w-5 h-5 fill-amber-500" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Medication Reminders & Frequency Schedules
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Auto-generated from prescription frequency codes (<strong className="text-slate-900">OD, BD, TDS, QDS, SOS</strong>). Every dose log dynamically recalculates compliance metrics.
          </p>
        </div>

        {/* Adherence Percentage Display */}
        <div className="w-full md:w-auto p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-5 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                Overall Adherence
              </span>
            </div>
            <div className="text-3xl font-black text-slate-900 flex items-baseline gap-1">
              <span>{adherencePercentage}%</span>
              <span className="text-xs font-semibold text-slate-400">
                ({takenCount}/{totalCount} Doses)
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="w-28 h-3 bg-slate-200 rounded-full overflow-hidden p-0.5 border border-slate-300/60">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  adherencePercentage >= 80
                    ? 'bg-emerald-500'
                    : adherencePercentage >= 50
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${adherencePercentage}%` }}
              />
            </div>
            <span
              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${getAdherenceColor(
                adherencePercentage
              )}`}
            >
              {adherencePercentage >= 80
                ? 'Excellent Adherence'
                : adherencePercentage >= 50
                ? 'Moderate Adherence'
                : 'Attention Needed'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Action & Filter Controls */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Time Slot Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1 shrink-0">
              <Clock className="w-3.5 h-3.5" /> Slot:
            </span>
            {slots.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSlot(s)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer ${
                  selectedSlot === s
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Reminders</span>
          </button>
        </div>

        {/* Frequency Filters */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 overflow-x-auto">
          <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Frequency:
          </span>
          {frequencies.map((f) => (
            <button
              key={f}
              onClick={() => setSelectedFreqFilter(f)}
              className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg transition-all shrink-0 cursor-pointer ${
                selectedFreqFilter === f
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              {f === 'All' ? 'All Frequencies' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Reminder Cards List */}
      <div className="space-y-3.5">
        {filteredReminders.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-2">
            <BellRing className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No Reminders Found</h3>
            <p className="text-xs text-slate-400">
              No active medication schedules matching slot "{selectedSlot}" or frequency "{selectedFreqFilter}".
            </p>
          </div>
        ) : (
          filteredReminders.map((rem) => {
            const isTaken = rem.status === 'Taken';
            return (
              <motion.div
                key={rem.id}
                whileHover={{ y: -2 }}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isTaken
                    ? 'bg-slate-50/80 border-slate-200/70 text-slate-500'
                    : 'bg-white border-slate-200/90 shadow-xs hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 shrink-0 mt-0.5">
                    {getSlotIcon(rem.timeSlot)}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className={`text-sm sm:text-base font-extrabold ${
                          isTaken ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {rem.medicineName}
                      </h3>

                      {rem.frequencyCode && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide bg-blue-50 text-blue-700 border border-blue-200/80">
                          {rem.frequencyCode}
                        </span>
                      )}

                      <Badge variant={isTaken ? 'slate' : 'blue'} size="sm">
                        {rem.exactTime}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      <strong className="text-slate-800">{rem.dosage}</strong> • {rem.instructions}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] font-semibold pt-0.5">
                      <span className="flex items-center gap-1 text-amber-600">
                        <Flame className="w-3.5 h-3.5 fill-amber-500" />
                        <span>{rem.streakDays} Day Dose Streak</span>
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          isTaken
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {rem.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions: Mark Complete, Edit, Delete */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <button
                    onClick={() => toggleReminderStatus(rem.id, isTaken ? 'Pending' : 'Taken')}
                    className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                      isTaken
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isTaken ? 'Mark Pending' : 'Mark Complete'}</span>
                  </button>

                  <button
                    onClick={() => startEditing(rem)}
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                    title="Edit Reminder"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => deleteReminder(rem.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Delete Reminder"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Add Custom / Frequency Reminder Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Automatically Generate Reminders"
        subtitle="Select medicine frequency code (OD, BD, TDS, QDS, SOS) to create scheduled dose alerts"
      >
        <form onSubmit={handleCreateReminders} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Medication Name *
            </label>
            <input
              type="text"
              required
              value={medName}
              onChange={(e) => setMedName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none"
              placeholder="e.g. Amoxicillin 500mg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Dosage
              </label>
              <input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none"
                placeholder="1 Tablet"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Frequency Code *
              </label>
              <select
                value={frequencyCode}
                onChange={(e) => setFrequencyCode(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none"
              >
                <option value="OD">OD - Once Daily (1 Dose/Day)</option>
                <option value="BD">BD - Twice Daily (2 Doses/Day)</option>
                <option value="TDS">TDS - Thrice Daily (3 Doses/Day)</option>
                <option value="QDS">QDS - Four Times Daily (4 Doses/Day)</option>
                <option value="SOS">SOS - As Needed / Emergency</option>
                <option value="Custom">Custom Time Slot</option>
              </select>
            </div>
          </div>

          {frequencyCode === 'Custom' && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Time Slot
                </label>
                <select
                  value={slot}
                  onChange={(e) => setSlot(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl outline-none"
                >
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                  <option value="Night">Night</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Exact Time
                </label>
                <input
                  type="text"
                  value={exactTime}
                  onChange={(e) => setExactTime(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl outline-none"
                  placeholder="08:00 AM"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Food & Administration Instructions
            </label>
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none"
              placeholder="e.g. Take after meals with plenty of water"
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
              Generate Reminders
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Reminder Modal */}
      <Modal
        isOpen={Boolean(editingReminder)}
        onClose={() => setEditingReminder(null)}
        title="Edit Medication Reminder"
        subtitle="Update timing, dosage, frequency, or instructions"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Medication Name
            </label>
            <input
              type="text"
              required
              value={editMedName}
              onChange={(e) => setEditMedName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Dosage
              </label>
              <input
                type="text"
                value={editDosage}
                onChange={(e) => setEditDosage(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Frequency Code
              </label>
              <input
                type="text"
                value={editFreqCode}
                onChange={(e) => setEditFreqCode(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none"
                placeholder="OD / BD / TDS / SOS"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Time Slot
              </label>
              <select
                value={editSlot}
                onChange={(e) => setEditSlot(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none"
              >
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Evening">Evening</option>
                <option value="Night">Night</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Exact Time
              </label>
              <input
                type="text"
                value={editExactTime}
                onChange={(e) => setEditExactTime(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Food & Administration Instructions
            </label>
            <textarea
              rows={2}
              value={editInstructions}
              onChange={(e) => setEditInstructions(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditingReminder(null)}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
