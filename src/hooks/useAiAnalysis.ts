import { useState, useEffect, useCallback } from 'react';
import { aiAnalysisService, AiAnalysisRecord } from '../services/aiAnalysisService';
import { isSupabaseConfigured } from '../lib/supabase/client';

export function useAiAnalysis(prescriptionId?: string | null) {
  const [analysis, setAnalysis] = useState<AiAnalysisRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured() && Boolean(prescriptionId));
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = useCallback(async () => {
    if (!prescriptionId || !isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: err } = await aiAnalysisService.getByPrescriptionId(prescriptionId);
    if (err) {
      setError(err.message || 'Failed to fetch AI analysis record');
    } else {
      setAnalysis(data);
    }
    setLoading(false);
  }, [prescriptionId]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  return { analysis, loading, error, refetch: fetchAnalysis };
}
