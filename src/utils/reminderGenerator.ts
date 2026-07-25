import { MedicationReminder, Prescription } from '../types';

export interface FrequencyScheduleSlot {
  timeSlot: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  exactTime: string;
  label: string;
}

/**
 * Parses medical frequency codes or strings like "OD", "BD", "BID", "TDS", "TID", "QDS", "QID", "SOS", "PRN", "1-0-1", "1-1-1", etc.
 */
export function parseFrequencyToSchedule(frequencyInput: string): FrequencyScheduleSlot[] {
  const normalized = (frequencyInput || '').toUpperCase().trim();

  // 1. OD (Once Daily) / QD / 1 time daily / 1-0-0 / Once a day
  if (
    normalized === 'OD' ||
    normalized === 'QD' ||
    normalized.includes('ONCE') ||
    normalized === '1-0-0' ||
    normalized === '0-1-0' ||
    normalized === '0-0-1' ||
    (normalized.includes('DAILY') &&
      !normalized.includes('TWICE') &&
      !normalized.includes('THRICE') &&
      !normalized.includes('FOUR'))
  ) {
    if (normalized === '0-0-1' || normalized.includes('NIGHT') || normalized.includes('BEDTIME')) {
      return [{ timeSlot: 'Night', exactTime: '09:00 PM', label: 'Night Dose (OD)' }];
    }
    if (normalized === '0-1-0' || normalized.includes('AFTERNOON')) {
      return [{ timeSlot: 'Afternoon', exactTime: '02:00 PM', label: 'Afternoon Dose (OD)' }];
    }
    return [{ timeSlot: 'Morning', exactTime: '08:00 AM', label: 'Morning Dose (OD)' }];
  }

  // 2. BD / BID (Twice Daily / 1-0-1 / Twice a day / Every 12 hours)
  if (
    normalized === 'BD' ||
    normalized === 'BID' ||
    normalized.includes('TWICE') ||
    normalized === '1-0-1' ||
    normalized === '1-1-0' ||
    normalized === '0-1-1' ||
    normalized.includes('12 HOURS') ||
    normalized.includes('2 TIMES')
  ) {
    return [
      { timeSlot: 'Morning', exactTime: '08:00 AM', label: 'Dose 1 (BD Morning)' },
      { timeSlot: 'Night', exactTime: '08:00 PM', label: 'Dose 2 (BD Evening/Night)' },
    ];
  }

  // 3. TDS / TID (Thrice Daily / Three times daily / 1-1-1 / Every 8 hours)
  if (
    normalized === 'TDS' ||
    normalized === 'TID' ||
    normalized.includes('THRICE') ||
    normalized.includes('THREE TIMES') ||
    normalized === '1-1-1' ||
    normalized.includes('8 HOURS') ||
    normalized.includes('3 TIMES')
  ) {
    return [
      { timeSlot: 'Morning', exactTime: '08:00 AM', label: 'Dose 1 (TDS Morning)' },
      { timeSlot: 'Afternoon', exactTime: '02:00 PM', label: 'Dose 2 (TDS Afternoon)' },
      { timeSlot: 'Night', exactTime: '09:00 PM', label: 'Dose 3 (TDS Night)' },
    ];
  }

  // 4. QDS / QID (Four times daily / 4 times daily / Every 6 hours)
  if (
    normalized === 'QDS' ||
    normalized === 'QID' ||
    normalized.includes('FOUR TIMES') ||
    normalized.includes('4 TIMES') ||
    normalized.includes('6 HOURS')
  ) {
    return [
      { timeSlot: 'Morning', exactTime: '07:00 AM', label: 'Dose 1 (QDS Morning)' },
      { timeSlot: 'Afternoon', exactTime: '12:00 PM', label: 'Dose 2 (QDS Midday)' },
      { timeSlot: 'Evening', exactTime: '05:00 PM', label: 'Dose 3 (QDS Evening)' },
      { timeSlot: 'Night', exactTime: '10:00 PM', label: 'Dose 4 (QDS Night)' },
    ];
  }

  // 5. SOS / PRN (As needed / On demand)
  if (
    normalized === 'SOS' ||
    normalized === 'PRN' ||
    normalized.includes('AS NEEDED') ||
    normalized.includes('WHEN NEEDED') ||
    normalized.includes('ON DEMAND')
  ) {
    return [
      { timeSlot: 'Afternoon', exactTime: 'As Needed (SOS)', label: 'Emergency/As Needed (SOS)' },
    ];
  }

  // Fallback default: 1 morning dose
  return [
    {
      timeSlot: 'Morning',
      exactTime: '08:00 AM',
      label: `Daily Dose (${frequencyInput || 'Scheduled'})`,
    },
  ];
}

/**
 * Automatically converts all prescribed medicines in a Prescription into MedicationReminder schedules.
 */
export function generateRemindersFromPrescription(prescription: Prescription): MedicationReminder[] {
  const reminders: MedicationReminder[] = [];
  const rxId = prescription.id || `rx-${Date.now()}`;

  if (!prescription.medicines || prescription.medicines.length === 0) {
    return reminders;
  }

  prescription.medicines.forEach((med, medIdx) => {
    const medName = med.medicineName || `Medication #${medIdx + 1}`;
    const dosage = med.dosage || '1 Tablet';
    const frequencyStr = med.frequency || 'OD';
    const slots = parseFrequencyToSchedule(frequencyStr);

    slots.forEach((slot, slotIdx) => {
      const instructions =
        med.instructions ||
        med.warnings ||
        `Take ${dosage} as prescribed under code ${prescription.code || rxId}.`;

      reminders.push({
        id: `rem-${rxId}-${medIdx}-${slotIdx}-${Math.floor(100 + Math.random() * 900)}`,
        medicineName: medName,
        dosage: dosage,
        timeSlot: slot.timeSlot,
        exactTime: slot.exactTime,
        instructions: `${instructions} (${slot.label})`,
        status: 'Pending',
        streakDays: 1,
        frequencyCode: frequencyStr.toUpperCase(),
        prescriptionId: rxId,
      });
    });
  });

  return reminders;
}
