import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types';
import { patientsService } from '../services/patientsService';
import { isSupabaseConfigured } from '../lib/supabase/client';

export function usePatients(patientId: string = 'p-001', initialData?: UserProfile) {
  const [profile, setProfile] = useState<UserProfile | null>(initialData || null);
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured());
  const [error, setError] = useState<string | null>(null);

  const fetchPatient = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: err } = await patientsService.getPatient(patientId);
    if (err) {
      setError(err.message || 'Failed to fetch patient profile');
    } else if (data) {
      setProfile(data);
    }
    setLoading(false);
  }, [patientId]);

  useEffect(() => {
    fetchPatient();
  }, [fetchPatient]);

  const updateProfile = async (updated: Partial<UserProfile>) => {
    if (!profile) return;
    setLoading(true);
    const { data, error: err } = await patientsService.updatePatient(profile.id, updated);
    if (err) {
      setError(err.message || 'Failed to update profile');
    } else if (data) {
      setProfile(data);
    } else {
      setProfile((prev) => (prev ? { ...prev, ...updated } : null));
    }
    setLoading(false);
  };

  return { profile, setProfile, loading, error, refetch: fetchPatient, updateProfile };
}
