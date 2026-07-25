import { useState, useEffect, useCallback } from 'react';
import { MedicationReminder } from '../types';
import { remindersService } from '../services/remindersService';
import { isSupabaseConfigured } from '../lib/supabase/client';

export function useReminders(patientId?: string, initialData?: MedicationReminder[]) {
  const [reminders, setReminders] = useState<MedicationReminder[]>(initialData || []);
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured());
  const [error, setError] = useState<string | null>(null);

  const fetchReminders = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: err } = await remindersService.getAll(patientId);
    if (err) {
      setError(err.message || 'Failed to fetch reminders');
    } else {
      setReminders(data || []);
    }
    setLoading(false);
  }, [patientId]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const toggleReminderStatus = async (id: string, newStatus?: MedicationReminder['status']) => {
    const target = reminders.find((r) => r.id === id);
    if (!target) return;

    const status = newStatus || (target.status === 'Taken' ? 'Pending' : 'Taken');
    const isTaking = status === 'Taken';
    const streakDays = isTaking ? target.streakDays + 1 : Math.max(0, target.streakDays - 1);

    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status, streakDays } : r))
    );

    if (isSupabaseConfigured()) {
      await remindersService.updateStatus(id, status, streakDays);
    }
  };

  const addReminder = async (reminder: Omit<MedicationReminder, 'id' | 'streakDays'>) => {
    setLoading(true);
    if (isSupabaseConfigured()) {
      const { data, error: err } = await remindersService.create(reminder, patientId || 'p-001');
      if (err) {
        setError(err.message || 'Failed to create reminder');
      } else if (data) {
        setReminders((prev) => [...prev, data]);
      } else {
        const localRem: MedicationReminder = { ...reminder, id: `rem-${Date.now()}`, streakDays: 1 };
        setReminders((prev) => [...prev, localRem]);
      }
    } else {
      const localRem: MedicationReminder = { ...reminder, id: `rem-${Date.now()}`, streakDays: 1 };
      setReminders((prev) => [...prev, localRem]);
    }
    setLoading(false);
  };

  return { reminders, setReminders, loading, error, refetch: fetchReminders, toggleReminderStatus, addReminder };
}
