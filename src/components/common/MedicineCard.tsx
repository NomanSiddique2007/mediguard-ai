import React from 'react';
import { motion } from 'motion/react';
import { Pill, Utensils, AlertCircle, Plus } from 'lucide-react';
import { Medicine } from '../../types';
import { Badge } from './Badge';

interface MedicineCardProps {
  medicine: Medicine;
  onAddReminder?: (medicine: Medicine) => void;
}

export const MedicineCard: React.FC<MedicineCardProps> = ({ medicine, onAddReminder }) => {
  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {medicine.genericName}
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">{medicine.name}</h3>
          </div>
          <Badge
            variant={
              medicine.category === 'Antibiotics'
                ? 'amber'
                : medicine.category === 'Cardiovascular'
                ? 'blue'
                : medicine.category === 'Diabetes'
                ? 'purple'
                : 'emerald'
            }
          >
            {medicine.category}
          </Badge>
        </div>

        <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">{medicine.purpose}</p>

        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <Pill className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-semibold">{medicine.dosage}</span> • <span>{medicine.frequency}</span>
          </div>

          <div className="flex items-start gap-2 text-slate-600">
            <Utensils className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="text-[11px] leading-tight">{medicine.foodInstructions}</span>
          </div>
        </div>

        {/* Side Effects Tags */}
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {medicine.sideEffects.map((effect, idx) => (
            <span
              key={idx}
              className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60 font-medium"
            >
              {effect}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs font-semibold text-slate-700">
          <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
          <span>Safety Rating: <strong className="text-blue-600">{medicine.safetyRating}</strong></span>
        </div>

        {onAddReminder && (
          <button
            onClick={() => onAddReminder(medicine)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Set Reminder</span>
          </button>
        )}
      </div>
    </motion.div>
  );
};
