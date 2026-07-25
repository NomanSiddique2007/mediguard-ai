import { useState, useEffect, useCallback } from 'react';
import { HealthEvent } from '../types';
import { timelineEventsService } from '../services/timelineEventsService';
import { isSupabaseConfigured } from '../lib/supabase/client';

export function useTimelineEvents(patientId?: string, initialData?: HealthEvent[]) {
  const [healthEvents, setHealthEvents] = useState<HealthEvent[]>(initialData || []);
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured());
  const [error, setError] = useState<string | null>(null);

  const fetchTimelineEvents = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: err } = await timelineEventsService.getAll(patientId);
    if (err) {
      setError(err.message || 'Failed to fetch timeline events');
    } else {
      setHealthEvents(data || []);
    }
    setLoading(false);
  }, [patientId]);

  useEffect(() => {
    fetchTimelineEvents();
  }, [fetchTimelineEvents]);

  const addHealthEvent = async (event: Omit<HealthEvent, 'id'>) => {
    setLoading(true);
    if (isSupabaseConfigured()) {
      const { data, error: err } = await timelineEventsService.create(event, patientId || 'p-001');
      if (err) {
        setError(err.message || 'Failed to add health event');
      } else if (data) {
        setHealthEvents((prev) => [data, ...prev]);
      } else {
        const localEvt: HealthEvent = { ...event, id: `he-${Date.now()}` };
        setHealthEvents((prev) => [localEvt, ...prev]);
      }
    } else {
      const localEvt: HealthEvent = { ...event, id: `he-${Date.now()}` };
      setHealthEvents((prev) => [localEvt, ...prev]);
    }
    setLoading(false);
  };

  return { healthEvents, setHealthEvents, loading, error, refetch: fetchTimelineEvents, addHealthEvent };
}
