import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApp } from '../context/AppContext';
import { Prescription, MedicationReminder, HealthEvent } from '../types';

export interface DashboardStats {
  totalPrescriptions: number;
  activePrescriptionsCount: number;
  historicalPrescriptionsCount: number;
  activeMedicinesCount: number;
  todaysMedicinesCount: number;
  takenRemindersCount: number;
  pendingRemindersCount: number;
  averageAdherence: number;
  aiAlertsCount: number;
  drugInteractionsCount: number;
  monthlyUploadsCount: number;
  monthlyBreakdown: { month: string; count: number }[];
  medicineCategories: { name: string; value: number; count: number; color: string }[];
  recentActivity: {
    id: string;
    type: 'upload' | 'reminder' | 'event';
    title: string;
    subtitle: string;
    timestamp: string;
    statusBadge?: { label: string; variant: 'emerald' | 'amber' | 'blue' | 'rose' | 'slate' };
  }[];
}

const CATEGORY_COLORS = [
  '#2563eb', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#6366f1', // Indigo
];

export function calculateDashboardStats(
  prescriptions: Prescription[],
  reminders: MedicationReminder[],
  healthEvents: HealthEvent[]
): DashboardStats {
  // 1. Total Prescriptions
  const totalPrescriptions = prescriptions.length;
  const activePrescriptionsCount = prescriptions.filter(
    (p) => p.status === 'Verified' || p.status === 'Action Required' || p.status === 'Pending Review'
  ).length;
  const historicalPrescriptionsCount = prescriptions.filter(
    (p) => p.status === 'Archived'
  ).length;

  // 2. Active Medicines
  const activeMedicinesCount = prescriptions.reduce((sum, rx) => {
    return sum + (rx.medicines ? rx.medicines.length : 0);
  }, 0);

  // 3. Today's Medicines
  const todaysMedicinesCount = reminders.length;
  const takenRemindersCount = reminders.filter((r) => r.status === 'Taken').length;
  const pendingRemindersCount = reminders.filter((r) => r.status === 'Pending').length;

  // 4. Average Adherence
  const averageAdherence = Math.round(
    (takenRemindersCount / Math.max(1, todaysMedicinesCount)) * 100
  );

  // 5. AI Alerts (Prescriptions with safety score < 90 or warnings/interactions)
  const aiAlertsCount = prescriptions.filter((rx) => {
    const lowScore = rx.safetyScore < 90;
    const hasWarnings = rx.warnings && rx.warnings.length > 0;
    const hasInteractions = rx.interactions && rx.interactions.length > 0;
    return lowScore || hasWarnings || hasInteractions;
  }).length;

  // 6. Drug Interactions Count
  const drugInteractionsCount = prescriptions.reduce((sum, rx) => {
    return sum + (rx.interactions ? rx.interactions.length : 0);
  }, 0);

  // 7. Monthly Uploads
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyUploadsCount = prescriptions.filter((rx) => {
    if (!rx.date) return false;
    const d = new Date(rx.date);
    return !isNaN(d.getTime()) && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  // Monthly distribution list
  const monthlyMap = new Map<string, number>();
  prescriptions.forEach((rx) => {
    if (!rx.date) return;
    const d = new Date(rx.date);
    if (isNaN(d.getTime())) return;
    const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    monthlyMap.set(label, (monthlyMap.get(label) || 0) + 1);
  });
  const monthlyBreakdown = Array.from(monthlyMap.entries()).map(([month, count]) => ({
    month,
    count,
  }));

  // 8. Medicine Categories Distribution
  const catMap = new Map<string, number>();
  prescriptions.forEach((rx) => {
    if (!rx.medicines) return;
    rx.medicines.forEach((med) => {
      // Map medicine names or explicit category to clinical category
      let cat = med.category || 'General Therapeutics';
      if (!med.category) {
        const name = med.medicineName.toLowerCase();
        if (name.includes('amoxicillin') || name.includes('cipro') || name.includes('azithromycin')) {
          cat = 'Antibiotics';
        } else if (name.includes('lisinopril') || name.includes('atorvastatin') || name.includes('amlodipine')) {
          cat = 'Cardiovascular';
        } else if (name.includes('metformin') || name.includes('insulin')) {
          cat = 'Diabetes';
        } else if (name.includes('salbutamol') || name.includes('ventolin') || name.includes('inhaler')) {
          cat = 'Respiratory';
        } else if (name.includes('paracetamol') || name.includes('ibuprofen')) {
          cat = 'Pain Relief';
        }
      }
      catMap.set(cat, (catMap.get(cat) || 0) + 1);
    });
  });

  const totalCatMeds = Array.from(catMap.values()).reduce((a, b) => a + b, 0) || 1;
  let colorIdx = 0;
  const medicineCategories = Array.from(catMap.entries()).map(([name, count]) => {
    const value = Math.round((count / totalCatMeds) * 100);
    const color = CATEGORY_COLORS[colorIdx % CATEGORY_COLORS.length];
    colorIdx++;
    return { name, value, count, color };
  });

  // Default fallback if no medicines
  if (medicineCategories.length === 0) {
    medicineCategories.push({
      name: 'General Therapeutics',
      value: 100,
      count: 0,
      color: '#2563eb',
    });
  }

  // 9. Recent Activity Stream
  const activityUploads = prescriptions.map((rx) => ({
    id: `act-rx-${rx.id}`,
    type: 'upload' as const,
    title: `Prescription Uploaded: ${rx.code}`,
    subtitle: `${rx.doctorName} • ${rx.medicines.length} Medicines Prescribed`,
    timestamp: rx.date || 'Today',
    statusBadge: {
      label: rx.status,
      variant: (rx.status === 'Verified' ? 'emerald' : rx.status === 'Action Required' ? 'amber' : 'slate') as 'emerald' | 'amber' | 'slate',
    },
  }));

  const activityEvents = healthEvents.slice(0, 4).map((evt) => ({
    id: `act-evt-${evt.id}`,
    type: 'event' as const,
    title: `${evt.category}: ${evt.title}`,
    subtitle: evt.description || (evt.doctor ? `Doctor: ${evt.doctor}` : 'Clinical Record'),
    timestamp: evt.date,
    statusBadge: {
      label: evt.status,
      variant: 'blue' as const,
    },
  }));

  const activityReminders = reminders.slice(0, 4).map((rem) => ({
    id: `act-rem-${rem.id}`,
    type: 'reminder' as const,
    title: `Medication Dose: ${rem.medicineName}`,
    subtitle: `${rem.dosage} • ${rem.exactTime} (${rem.frequencyCode || rem.timeSlot})`,
    timestamp: rem.status === 'Taken' ? 'Completed Today' : 'Scheduled Today',
    statusBadge: {
      label: rem.status,
      variant: rem.status === 'Taken' ? ('emerald' as const) : ('amber' as const),
    },
  }));

  const combinedActivity = [...activityUploads, ...activityEvents, ...activityReminders].slice(0, 6);

  return {
    totalPrescriptions,
    activePrescriptionsCount,
    historicalPrescriptionsCount,
    activeMedicinesCount,
    todaysMedicinesCount,
    takenRemindersCount,
    pendingRemindersCount,
    averageAdherence,
    aiAlertsCount,
    drugInteractionsCount,
    monthlyUploadsCount,
    monthlyBreakdown,
    medicineCategories,
    recentActivity: combinedActivity,
  };
}

/**
 * Custom React Query Hook for Dashboard Stats with invalidation capabilities.
 */
export function useDashboardData() {
  const { prescriptions, reminders, healthEvents } = useApp();
  const queryClient = useQueryClient();

  const queryKey = [
    'dashboardStats',
    prescriptions.length,
    reminders.map((r) => `${r.id}-${r.status}`).join('|'),
    healthEvents.length,
  ];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      return calculateDashboardStats(prescriptions, reminders, healthEvents);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  const invalidateDashboard = () => {
    queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
  };

  return {
    ...query,
    stats: query.data || calculateDashboardStats(prescriptions, reminders, healthEvents),
    invalidateDashboard,
  };
}
