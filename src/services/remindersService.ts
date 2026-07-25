import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import { Database } from '../types/database';
import { MedicationReminder } from '../types';

type ReminderRow = Database['public']['Tables']['reminders']['Row'];

export const mapRowToReminder = (row: ReminderRow): MedicationReminder => ({
  id: row.id,
  medicineName: row.medicine_name,
  dosage: row.dosage,
  timeSlot: (row.time_slot as any) || 'Morning',
  exactTime: row.exact_time,
  instructions: row.instructions || '',
  status: (row.status as any) || 'Pending',
  streakDays: row.streak_days ?? 0,
});

export const remindersService = {
  async getAll(patientId?: string) {
    if (!isSupabaseConfigured()) return { data: [], error: new Error('Supabase not configured') };
    try {
      let query = supabase.from('reminders').select('*').order('exact_time', { ascending: true });
      if (patientId) query = query.eq('patient_id', patientId);

      const { data, error } = await query;
      if (error) return { data: [], error };
      return { data: (data || []).map(mapRowToReminder), error: null };
    } catch (err: any) {
      return { data: [], error: err };
    }
  },

  async create(reminder: Omit<MedicationReminder, 'id' | 'streakDays'> & { id?: string; streakDays?: number }, patientId: string = 'p-001') {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };
    try {
      const id = reminder.id || `rem-${Date.now()}`;
      const streakDays = reminder.streakDays ?? 1;

      const { data, error } = await supabase.from('reminders').insert({
        id,
        patient_id: patientId,
        medicine_name: reminder.medicineName,
        dosage: reminder.dosage,
        time_slot: reminder.timeSlot,
        exact_time: reminder.exactTime,
        instructions: reminder.instructions,
        status: reminder.status || 'Pending',
        streak_days: streakDays,
      }).select().single();

      if (error) return { data: null, error };
      return { data: mapRowToReminder(data), error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },

  async updateStatus(id: string, status: MedicationReminder['status'], streakDays?: number) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };
    try {
      const updateData: Partial<Database['public']['Tables']['reminders']['Update']> = { status };
      if (typeof streakDays === 'number') updateData.streak_days = streakDays;

      const { data, error } = await supabase.from('reminders').update(updateData).eq('id', id).select().single();
      if (error) return { data: null, error };
      return { data: mapRowToReminder(data), error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },

  async delete(id: string) {
    if (!isSupabaseConfigured()) return { error: new Error('Supabase not configured') };
    try {
      const { error } = await supabase.from('reminders').delete().eq('id', id);
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  },
};
