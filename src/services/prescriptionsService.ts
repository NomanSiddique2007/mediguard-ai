import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import { Database } from '../types/database';
import { Prescription, DrugInteraction } from '../types';
import { prescriptionMedicinesService } from './prescriptionMedicinesService';

type PrescriptionRow = Database['public']['Tables']['prescriptions']['Row'];

export const mapRowToPrescription = (row: PrescriptionRow, items: any[] = []): Prescription => ({
  id: row.id,
  code: row.code,
  date: row.date,
  doctorName: row.doctor_name,
  doctorSpecialty: row.doctor_specialty,
  hospital: row.hospital,
  diagnosis: row.diagnosis,
  status: (row.status as any) || 'Verified',
  imageUrl: row.image_url,
  medicines: items,
  aiSummary: row.ai_summary || '',
  safetyScore: row.safety_score ?? 95,
  warnings: row.warnings || [],
  interactions: (Array.isArray(row.interactions) ? row.interactions : []) as unknown as DrugInteraction[],
  notes: row.notes || undefined,
});

export const prescriptionsService = {
  async getAll(patientId?: string) {
    if (!isSupabaseConfigured()) return { data: [], error: new Error('Supabase not configured') };
    try {
      let query = supabase.from('prescriptions').select('*').order('created_at', { ascending: false });
      if (patientId) {
        query = query.eq('patient_id', patientId);
      }

      const { data: rxRows, error } = await query;
      if (error) return { data: [], error };

      if (!rxRows || rxRows.length === 0) return { data: [], error: null };

      // Fetch medicine items for all fetched prescriptions
      const rxIds = rxRows.map((r) => r.id);
      const { data: pmRows } = await supabase
        .from('prescription_medicines')
        .select('*')
        .in('prescription_id', rxIds);

      const result: Prescription[] = rxRows.map((row) => {
        const items = (pmRows || [])
          .filter((pm) => pm.prescription_id === row.id)
          .map((pm) => ({
            id: pm.id,
            medicineName: pm.medicine_name,
            dosage: pm.dosage,
            frequency: pm.frequency,
            duration: pm.duration,
            purpose: pm.purpose,
            instructions: pm.instructions,
            warnings: pm.warnings || undefined,
          }));
        return mapRowToPrescription(row, items);
      });

      return { data: result, error: null };
    } catch (err: any) {
      return { data: [], error: err };
    }
  },

  async getById(id: string) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };
    try {
      const { data: row, error } = await supabase.from('prescriptions').select('*').eq('id', id).single();
      if (error || !row) return { data: null, error };

      const { data: items } = await prescriptionMedicinesService.getByPrescriptionId(id);
      return { data: mapRowToPrescription(row, items), error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },

  async create(prescription: Prescription, patientId: string = 'p-001') {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };
    try {
      const { data: row, error } = await supabase.from('prescriptions').insert({
        id: prescription.id,
        patient_id: patientId,
        code: prescription.code,
        date: prescription.date,
        doctor_name: prescription.doctorName,
        doctor_specialty: prescription.doctorSpecialty,
        hospital: prescription.hospital,
        diagnosis: prescription.diagnosis,
        status: prescription.status,
        image_url: prescription.imageUrl,
        ai_summary: prescription.aiSummary,
        safety_score: prescription.safetyScore,
        warnings: prescription.warnings,
        interactions: prescription.interactions as any,
        notes: prescription.notes,
      }).select().single();

      if (error) return { data: null, error };

      if (prescription.medicines && prescription.medicines.length > 0) {
        await prescriptionMedicinesService.createForPrescription(prescription.id, prescription.medicines);
      }

      return { data: mapRowToPrescription(row, prescription.medicines || []), error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },

  async updateStatus(id: string, status: Prescription['status']) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };
    try {
      const { data: row, error } = await supabase
        .from('prescriptions')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      if (error) return { data: null, error };
      return { data: row, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },

  async delete(id: string) {
    if (!isSupabaseConfigured()) return { error: new Error('Supabase not configured') };
    try {
      await prescriptionMedicinesService.deleteByPrescriptionId(id);
      const { error } = await supabase.from('prescriptions').delete().eq('id', id);
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  },
};
