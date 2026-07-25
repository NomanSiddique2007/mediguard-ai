import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import { Database } from '../types/database';

type AiAnalysisRow = Database['public']['Tables']['ai_analysis']['Row'];

export interface AiAnalysisRecord {
  id: string;
  prescriptionId: string;
  extractedText: string;
  confidenceScore: number;
  flaggedInteractions: any[];
  dosageCheckPassed: boolean;
  analysisTimestamp: string;
}

export const mapRowToAiAnalysis = (row: AiAnalysisRow): AiAnalysisRecord => ({
  id: row.id,
  prescriptionId: row.prescription_id,
  extractedText: row.extracted_text,
  confidenceScore: row.confidence_score,
  flaggedInteractions: (Array.isArray(row.flagged_interactions) ? row.flagged_interactions : []) as any[],
  dosageCheckPassed: row.dosage_check_passed,
  analysisTimestamp: row.analysis_timestamp,
});

export const aiAnalysisService = {
  async getByPrescriptionId(prescriptionId: string) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };
    try {
      const { data, error } = await supabase
        .from('ai_analysis')
        .select('*')
        .eq('prescription_id', prescriptionId)
        .single();
      if (error || !data) return { data: null, error };
      return { data: mapRowToAiAnalysis(data), error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },

  async create(record: Omit<AiAnalysisRecord, 'id' | 'analysisTimestamp'> & { id?: string }) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };
    try {
      const id = record.id || `ai-${Date.now()}`;
      const analysisTimestamp = new Date().toISOString();

      const { data, error } = await supabase.from('ai_analysis').insert({
        id,
        prescription_id: record.prescriptionId,
        extracted_text: record.extractedText,
        confidence_score: record.confidenceScore,
        flagged_interactions: record.flaggedInteractions,
        dosage_check_passed: record.dosageCheckPassed,
        analysis_timestamp: analysisTimestamp,
      }).select().single();

      if (error) return { data: null, error };
      return { data: mapRowToAiAnalysis(data), error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },
};
