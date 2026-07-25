import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import { Database } from '../types/database';
import { HealthEvent } from '../types';

type TimelineEventRow = Database['public']['Tables']['timeline_events']['Row'];

export const mapRowToHealthEvent = (row: TimelineEventRow): HealthEvent => ({
  id: row.id,
  date: row.date,
  time: row.time || undefined,
  title: row.title,
  category: (row.category as any) || 'Doctor Visit',
  doctor: row.doctor || undefined,
  description: row.description,
  status: (row.status as any) || 'Completed',
  iconType: row.icon_type || 'Stethoscope',
  attachments: row.attachments || [],
});

export const timelineEventsService = {
  async getAll(patientId?: string) {
    if (!isSupabaseConfigured()) return { data: [], error: new Error('Supabase not configured') };
    try {
      let query = supabase.from('timeline_events').select('*').order('date', { ascending: false });
      if (patientId) query = query.eq('patient_id', patientId);

      const { data, error } = await query;
      if (error) return { data: [], error };
      return { data: (data || []).map(mapRowToHealthEvent), error: null };
    } catch (err: any) {
      return { data: [], error: err };
    }
  },

  async create(event: Omit<HealthEvent, 'id'> & { id?: string }, patientId: string = 'p-001') {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };
    try {
      const id = event.id || `he-${Date.now()}`;
      const { data, error } = await supabase.from('timeline_events').insert({
        id,
        patient_id: patientId,
        date: event.date,
        time: event.time,
        title: event.title,
        category: event.category,
        doctor: event.doctor,
        description: event.description,
        status: event.status || 'Completed',
        icon_type: event.iconType,
        attachments: event.attachments,
      }).select().single();

      if (error) return { data: null, error };
      return { data: mapRowToHealthEvent(data), error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },

  async delete(id: string) {
    if (!isSupabaseConfigured()) return { error: new Error('Supabase not configured') };
    try {
      const { error } = await supabase.from('timeline_events').delete().eq('id', id);
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  },
};
