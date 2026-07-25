import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import { AIReport } from '../types';

const STORAGE_KEY = 'mediguard_ai_reports_v1';

export const reportsService = {
  /**
   * Fetch all stored AI reports for user
   */
  async getAll(userId?: string): Promise<AIReport[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('ai_reports')
          .select('*')
          .order('generated_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((item) => ({
            id: item.id,
            prescriptionId: item.prescription_id,
            prescriptionCode: item.prescription_code,
            title: item.title,
            generatedAt: item.generated_at,
            patientName: item.patient_name,
            doctorName: item.doctor_name,
            hospital: item.hospital,
            diagnosis: item.diagnosis,
            safetyScore: item.safety_score,
            safetyRating: item.safety_rating,
            prescriptionSummary: item.prescription_summary || {},
            medicineExplanations: item.medicine_explanations || [],
            interactionAnalysis: item.interaction_analysis || [],
            timelineEvents: item.timeline_events || [],
            reminderSchedule: item.reminder_schedule || [],
            doctorNotes: item.doctor_notes || {},
          }));
        }
      } catch (err) {
        console.warn('Supabase fetch AI reports warning, falling back to LocalStorage:', err);
      }
    }

    // LocalStorage Fallback
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error reading reports from LocalStorage:', e);
    }
    return [];
  },

  /**
   * Save an AI report to Database / LocalStorage
   */
  async save(report: AIReport, userId?: string): Promise<{ data: AIReport; error?: string }> {
    // 1. Always update LocalStorage for instant reactivity
    try {
      const existing = await this.getAll();
      const updatedList = [report, ...existing.filter((r) => r.id !== report.id)];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    } catch (e) {
      console.error('Failed to save AI report to LocalStorage:', e);
    }

    // 2. Persist to Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        const payload = {
          id: report.id,
          user_id: userId || 'demo-user',
          prescription_id: report.prescriptionId,
          prescription_code: report.prescriptionCode,
          title: report.title,
          generated_at: report.generatedAt,
          patient_name: report.patientName,
          doctor_name: report.doctorName,
          hospital: report.hospital,
          diagnosis: report.diagnosis,
          safety_score: report.safetyScore,
          safety_rating: report.safetyRating,
          prescription_summary: report.prescriptionSummary,
          medicine_explanations: report.medicineExplanations,
          interaction_analysis: report.interactionAnalysis,
          timeline_events: report.timelineEvents,
          reminder_schedule: report.reminderSchedule,
          doctor_notes: report.doctorNotes,
        };

        const { data, error } = await supabase
          .from('ai_reports')
          .upsert(payload)
          .select()
          .single();

        if (error) {
          console.warn('Supabase upsert ai_reports error:', error.message);
        } else if (data) {
          return { data: report };
        }
      } catch (err: any) {
        console.error('Supabase save report exception:', err);
      }
    }

    return { data: report };
  },

  /**
   * Delete report by ID
   */
  async delete(id: string): Promise<void> {
    try {
      const existing = await this.getAll();
      const updated = existing.filter((r) => r.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error removing report from LocalStorage:', e);
    }

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('ai_reports').delete().eq('id', id);
      } catch (err) {
        console.error('Error deleting report from Supabase:', err);
      }
    }
  },
};
