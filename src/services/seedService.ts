import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import { MOCK_USER, MOCK_PRESCRIPTIONS, MOCK_MEDICINES, MOCK_HEALTH_EVENTS, MOCK_REMINDERS } from '../data/mockData';
import { patientsService } from './patientsService';
import { medicinesService } from './medicinesService';
import { prescriptionsService } from './prescriptionsService';
import { remindersService } from './remindersService';
import { timelineEventsService } from './timelineEventsService';
import { aiAnalysisService } from './aiAnalysisService';

export const seedService = {
  async seedAllData() {
    if (!isSupabaseConfigured()) {
      return { success: false, message: 'Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.' };
    }

    try {
      // 1. Seed Patient Profile
      await patientsService.createPatient(MOCK_USER);

      // 2. Seed Medicines
      for (const med of MOCK_MEDICINES) {
        await medicinesService.create(med);
      }

      // 3. Seed Prescriptions and Prescription Medicines
      for (const rx of MOCK_PRESCRIPTIONS) {
        await prescriptionsService.create(rx, MOCK_USER.id);

        // Also add AI Analysis entry for prescription
        await aiAnalysisService.create({
          prescriptionId: rx.id,
          extractedText: `${rx.code} - ${rx.doctorName} - ${rx.diagnosis}. ${rx.aiSummary}`,
          confidenceScore: rx.safetyScore,
          flaggedInteractions: rx.interactions,
          dosageCheckPassed: rx.safetyScore > 80,
        });
      }

      // 4. Seed Reminders
      for (const rem of MOCK_REMINDERS) {
        await remindersService.create({
          medicineName: rem.medicineName,
          dosage: rem.dosage,
          timeSlot: rem.timeSlot,
          exactTime: rem.exactTime,
          instructions: rem.instructions,
          status: rem.status,
        }, MOCK_USER.id);
      }

      // 5. Seed Timeline Events
      for (const evt of MOCK_HEALTH_EVENTS) {
        await timelineEventsService.create(evt, MOCK_USER.id);
      }

      return { success: true, message: 'All initial medical datasets successfully seeded to Supabase!' };
    } catch (err: any) {
      return { success: false, message: `Seeding error: ${err.message}` };
    }
  },
};
