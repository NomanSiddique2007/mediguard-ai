import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Pill, Filter, Plus, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MOCK_MEDICINES } from '../data/mockData';
import { MedicineCard } from '../components/common/MedicineCard';
import { SearchBar } from '../components/common/SearchBar';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';

export const MedicineLibraryPage: React.FC = () => {
  const { addReminder, addToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [selectedMedForReminder, setSelectedMedForReminder] = useState<typeof MOCK_MEDICINES[0] | null>(null);

  const [reminderTime, setReminderTime] = useState('08:00 AM');
  const [reminderSlot, setReminderSlot] = useState<'Morning' | 'Afternoon' | 'Evening' | 'Night'>('Morning');

  const categories = [
    'All',
    'Cardiovascular',
    'Antibiotics',
    'Diabetes',
    'Respiratory',
    'Gastrointestinal',
    'Pain Relief',
    'Vitamins',
  ];

  const filteredMedicines = MOCK_MEDICINES.filter((med) => {
    const matchesSearch =
      med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.purpose.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || med.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleOpenReminderModal = (med: typeof MOCK_MEDICINES[0]) => {
    setSelectedMedForReminder(med);
    setReminderModalOpen(true);
  };

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedForReminder) return;

    addReminder({
      medicineName: selectedMedForReminder.name,
      dosage: selectedMedForReminder.dosage,
      timeSlot: reminderSlot,
      exactTime: reminderTime,
      instructions: selectedMedForReminder.foodInstructions,
      status: 'Pending',
    });

    setReminderModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Medicine Library</h2>
        <p className="text-xs text-slate-500 mt-1">
          Comprehensive clinical database of prescribed and over-the-counter medications, side effects, and food instructions.
        </p>
      </div>

      {/* Search and Category Filter Controls */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by drug name (e.g. Lisinopril, Amoxicillin), generic term, or usage..."
        />

        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Medicines */}
      {filteredMedicines.length === 0 ? (
        <EmptyState
          title="No Medications Found"
          description="No drugs matched your query. Try clearing the search term or category filter."
          actionText="Reset Search"
          onAction={() => {
            setSearchTerm('');
            setSelectedCategory('All');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedicines.map((med) => (
            <MedicineCard key={med.id} medicine={med} onAddReminder={handleOpenReminderModal} />
          ))}
        </div>
      )}

      {/* Add Reminder Modal */}
      <Modal
        isOpen={reminderModalOpen}
        onClose={() => setReminderModalOpen(false)}
        title={`Add Reminder: ${selectedMedForReminder?.name}`}
        subtitle="Configure daily smart alert schedule"
      >
        <form onSubmit={handleCreateReminder} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Time Slot
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['Morning', 'Afternoon', 'Evening', 'Night'] as const).map((slot) => (
                <button
                  type="button"
                  key={slot}
                  onClick={() => setReminderSlot(slot)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-colors ${
                    reminderSlot === slot
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Exact Dose Time
            </label>
            <input
              type="text"
              required
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none"
              placeholder="08:00 AM"
            />
          </div>

          <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
            💡 <strong>Note:</strong> {selectedMedForReminder?.foodInstructions}
          </p>

          <button
            type="submit"
            className="w-full py-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all"
          >
            Create Schedule Reminder
          </button>
        </form>
      </Modal>
    </div>
  );
};
