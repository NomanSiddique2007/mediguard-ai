import { useState, useEffect, useCallback } from 'react';
import { Prescription } from '../types';
import { prescriptionsService } from '../services/prescriptionsService';
import { isSupabaseConfigured } from '../lib/supabase/client';

export function usePrescriptions(patientId?: string, initialData?: Prescription[]) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(initialData || []);
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured());
  const [error, setError] = useState<string | null>(null);

  const fetchPrescriptions = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: err } = await prescriptionsService.getAll(patientId);
    if (err) {
      setError(err.message || 'Failed to fetch prescriptions');
    } else {
      setPrescriptions(data || []);
    }
    setLoading(false);
  }, [patientId]);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  const addPrescription = async (newRx: Prescription) => {
    setLoading(true);
    if (isSupabaseConfigured()) {
      const { data, error: err } = await prescriptionsService.create(newRx, patientId || 'p-001');
      if (err) {
        setError(err.message || 'Failed to save prescription');
      } else if (data) {
        setPrescriptions((prev) => [data, ...prev]);
      } else {
        setPrescriptions((prev) => [newRx, ...prev]);
      }
    } else {
      setPrescriptions((prev) => [newRx, ...prev]);
    }
    setLoading(false);
  };

  const deletePrescription = async (id: string) => {
    setLoading(true);
    if (isSupabaseConfigured()) {
      const { error: err } = await prescriptionsService.delete(id);
      if (err) {
        setError(err.message || 'Failed to delete prescription');
      } else {
        setPrescriptions((prev) => prev.filter((p) => p.id !== id));
      }
    } else {
      setPrescriptions((prev) => prev.filter((p) => p.id !== id));
    }
    setLoading(false);
  };

  return { prescriptions, setPrescriptions, loading, error, refetch: fetchPrescriptions, addPrescription, deletePrescription };
}
