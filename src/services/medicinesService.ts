import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import { Database } from '../types/database';
import { Medicine } from '../types';

type MedicineRow = Database['public']['Tables']['medicines']['Row'];

export const mapRowToMedicine = (row: MedicineRow): Medicine => ({
  id: row.id,
  name: row.name,
  genericName: row.generic_name,
  purpose: row.purpose,
  dosage: row.dosage,
  frequency: row.frequency,
  sideEffects: row.side_effects || [],
  foodInstructions: row.food_instructions || '',
  category: (row.category as any) || 'General',
  safetyRating: (row.safety_rating as any) || 'A',
  image: row.image || undefined,
});

export const medicinesService = {
  async getAll() {
    if (!isSupabaseConfigured()) return { data: [], error: new Error('Supabase not configured') };
    try {
      const { data, error } = await supabase.from('medicines').select('*').order('name', { ascending: true });
      if (error) return { data: [], error };
      return { data: (data || []).map(mapRowToMedicine), error: null };
    } catch (err: any) {
      return { data: [], error: err };
    }
  },

  async getById(id: string) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };
    try {
      const { data, error } = await supabase.from('medicines').select('*').eq('id', id).single();
      if (error || !data) return { data: null, error };
      return { data: mapRowToMedicine(data), error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },

  async create(med: Medicine) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };
    try {
      const { data, error } = await supabase.from('medicines').insert({
        id: med.id,
        name: med.name,
        generic_name: med.genericName,
        purpose: med.purpose,
        dosage: med.dosage,
        frequency: med.frequency,
        side_effects: med.sideEffects,
        food_instructions: med.foodInstructions,
        category: med.category,
        safety_rating: med.safetyRating,
        image: med.image,
      }).select().single();
      if (error) return { data: null, error };
      return { data: mapRowToMedicine(data), error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },
};
