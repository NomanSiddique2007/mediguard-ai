import React from 'react';
import { motion } from 'motion/react';
import {
  Stethoscope,
  Activity,
  FileText,
  UserCheck,
  CheckCircle2,
  Syringe,
  Pill,
  Building2,
  HeartPulse,
  Paperclip,
  Calendar,
  Clock,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { HealthEvent } from '../../types';
import { Badge } from './Badge';

interface TimelineCardProps {
  event: HealthEvent;
  isLast?: boolean;
}

export const TimelineCard: React.FC<TimelineCardProps> = ({ event, isLast = false }) => {
  const getIcon = () => {
    const iconType = event.iconType || '';
    const cat = event.category;

    if (iconType === 'Pill' || cat === 'Medicine') {
      return <Pill className="w-4 h-4 text-amber-600" />;
    }
    if (iconType === 'Building2' || cat === 'Hospital Visit') {
      return <Building2 className="w-4 h-4 text-cyan-600" />;
    }
    if (iconType === 'HeartPulse' || cat === 'Recovery') {
      return <HeartPulse className="w-4 h-4 text-emerald-600" />;
    }
    if (iconType === 'Activity' || cat === 'Diagnosis') {
      return <Activity className="w-4 h-4 text-rose-600" />;
    }
    if (iconType === 'Stethoscope' || cat === 'Doctor Visit') {
      return <Stethoscope className="w-4 h-4 text-blue-600" />;
    }
    if (iconType === 'FileText' || cat === 'Lab Result') {
      return <FileText className="w-4 h-4 text-purple-600" />;
    }
    if (iconType === 'Syringe' || cat === 'Vaccination') {
      return <Syringe className="w-4 h-4 text-indigo-600" />;
    }
    if (iconType === 'UserCheck') {
      return <UserCheck className="w-4 h-4 text-indigo-600" />;
    }
    return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
  };

  const getBadgeVariant = (cat: string) => {
    switch (cat) {
      case 'Doctor Visit':
        return 'blue';
      case 'Diagnosis':
        return 'rose';
      case 'Lab Result':
        return 'purple';
      case 'Medicine':
        return 'amber';
      case 'Hospital Visit':
        return 'indigo';
      case 'Vaccination':
        return 'sky';
      case 'Recovery':
        return 'emerald';
      default:
        return 'slate';
    }
  };

  const getNodeBorderColor = (cat: string) => {
    switch (cat) {
      case 'Doctor Visit':
        return 'border-blue-500/80 bg-blue-50/80 shadow-blue-100';
      case 'Diagnosis':
        return 'border-rose-500/80 bg-rose-50/80 shadow-rose-100';
      case 'Medicine':
        return 'border-amber-500/80 bg-amber-50/80 shadow-amber-100';
      case 'Hospital Visit':
        return 'border-cyan-500/80 bg-cyan-50/80 shadow-cyan-100';
      case 'Recovery':
        return 'border-emerald-500/80 bg-emerald-50/80 shadow-emerald-100';
      default:
        return 'border-slate-300 bg-slate-50 shadow-slate-100';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -16, y: 8 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="relative pl-7 sm:pl-10 pb-6 group"
    >
      {/* Node Icon Circle */}
      <div
        className={`absolute left-0 top-1 w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white border-2 shadow-sm flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:shadow-md z-10 ${getNodeBorderColor(
          event.category
        )}`}
      >
        {getIcon()}
      </div>

      {/* Connecting Line */}
      {!isLast && (
        <div className="absolute left-3.5 sm:left-4 top-9 bottom-0 w-0.5 bg-gradient-to-b from-slate-200 via-slate-200/80 to-transparent group-last:hidden" />
      )}

      {/* Card Content */}
      <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 group-hover:translate-x-1">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Badge variant={getBadgeVariant(event.category)} size="sm">
              {event.category}
            </Badge>

            <span
              className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                event.status === 'Completed'
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200/70'
                  : event.status === 'In Progress'
                  ? 'text-amber-700 bg-amber-50 border-amber-200/70'
                  : 'text-blue-700 bg-blue-50 border-blue-200/70'
              }`}
            >
              {event.status}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {event.date}
            </span>
            {event.time && (
              <span className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3 h-3" />
                {event.time}
              </span>
            )}
          </div>
        </div>

        <h4 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
          {event.title}
        </h4>

        {event.doctor && (
          <p className="text-xs font-bold text-blue-600 mt-1 flex items-center gap-1">
            <Stethoscope className="w-3 h-3 shrink-0" />
            <span>{event.doctor}</span>
          </p>
        )}

        <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed font-normal">
          {event.description}
        </p>

        {event.attachments && event.attachments.length > 0 && (
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
            {event.attachments.map((att, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <Paperclip className="w-3 h-3 text-slate-400" />
                {att}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
