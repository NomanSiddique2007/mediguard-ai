import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import { Database } from '../types/database';
import { PrescriptionItem } from '../types';

type PrescriptionMedicineRow = Database['public']['Tables']['prescription_medicines']['Row'];

export const mapRowToPrescriptionItem = (row: PrescriptionMedicineRow): PrescriptionItem => ({
  id: row.id,
  medicineName: row.medicine_name,
  dosage: row.dosage,
  frequency: row.frequency,
  duration: row.duration,
  purpose: row.purpose,
  warnings: row.warnings || undefined,
  instructions: row.instructions,
});

export const prescriptionMedicinesService = {
  async getByPrescriptionId(prescriptionId: string) {
    if (!isSupabaseConfigured()) return { data: [], error: new Error('Supabase not configured') };
    try {
      const { data, error } = await supabase
        .from('prescription_medicines')
        .select('*')
        .eq('prescription_id', prescriptionId);
      if (error) return { data: [], error };
      return { data: (data || []).map(mapRowToPrescriptionItem), error: null };
    } catch (err: any) {
      return { data: [], error: err };
    }
  },

  async createForPrescription(prescriptionId: string, items: PrescriptionItem[]) {
    if (!isSupabaseConfigured() || items.length === 0) return { data: [], error: null };
    try {
      const rowsToInsert = items.map((item) => ({
        id: item.id.startsWith('med-') || item.id.startsWith('pm-') ? item.id : `pm-${Date.now()}-${Math.random()}`,
        prescription_id: prescriptionId,
        medicine_name: item.medicineName,
        dosage: item.dosage,
        frequency: item.frequency,
        duration: item.duration,
        purpose: item.purpose,
        instructions: item.instructions,
        warnings: item.warnings,
      }));

      const { data, error } = await supabase.from('prescription_medicines').insert(rowsToInsert).select();
      if (error) return { data: [], error };
      return { data: (data || []).map(mapRowToPrescriptionItem), error: null };
    } catch (err: any) {
      return { data: [], error: err };
    }
  },

  async deleteByPrescriptionId(prescriptionId: string) {
    if (!isSupabaseConfigured()) return { error: new Error('Supabase not configured') };
    try {
      const { error } = await supabase
        .from('prescription_medicines')
        .delete()
        .eq('prescription_id', prescriptionId);
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  },
};
