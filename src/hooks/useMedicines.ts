import { useState, useEffect, useCallback } from 'react';
import { Medicine } from '../types';
import { medicinesService } from '../services/medicinesService';
import { isSupabaseConfigured } from '../lib/supabase/client';

export function useMedicines(initialData?: Medicine[]) {
  const [medicines, setMedicines] = useState<Medicine[]>(initialData || []);
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured());
  const [error, setError] = useState<string | null>(null);

  const fetchMedicines = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: err } = await medicinesService.getAll();
    if (err) {
      setError(err.message || 'Failed to fetch medicines');
    } else {
      setMedicines(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  return { medicines, setMedicines, loading, error, refetch: fetchMedicines };
}
