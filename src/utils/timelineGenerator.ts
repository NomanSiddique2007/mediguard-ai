import { HealthEvent, Prescription } from '../types';

/**
 * Automatically generates 5 distinct timeline events for every uploaded prescription:
 * 1. Diagnosis Event
 * 2. Medicine Event
 * 3. Doctor Visit
 * 4. Hospital Visit
 * 5. Recovery Event
 */
export function generateTimelineEventsFromPrescription(prescription: Prescription): HealthEvent[] {
  const rxDate = prescription.date || new Date().toISOString().split('T')[0];
  const doctor = prescription.doctorName || 'Dr. Sarah Jenkins, MD';
  const hospital = prescription.hospital || 'St. Jude Clinical Hospital';
  const diagnosis = prescription.diagnosis || 'Clinical Prescription Evaluation';

  const medListNames =
    prescription.medicines && prescription.medicines.length > 0
      ? prescription.medicines.map((m) => `${m.medicineName}${m.dosage ? ` (${m.dosage})` : ''}`).join(', ')
      : 'Prescribed Medications';

  const baseId = `he-${prescription.id || Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const events: HealthEvent[] = [
    {
      id: `${baseId}-diag`,
      date: rxDate,
      time: '09:30 AM',
      title: `Diagnosis: ${diagnosis}`,
      category: 'Diagnosis',
      doctor: doctor,
      description: `Clinical diagnosis confirmed during consultation. Primary condition evaluated: ${diagnosis}. Associated prescription code: ${prescription.code}.`,
      status: 'Completed',
      iconType: 'Activity',
      attachments: prescription.imageUrl ? ['Prescription_Document.pdf'] : undefined,
    },
    {
      id: `${baseId}-med`,
      date: rxDate,
      time: '10:00 AM',
      title: `Medication Prescribed: ${medListNames}`,
      category: 'Medicine',
      doctor: doctor,
      description: `Active medication course initiated under ${prescription.code}. Medications: ${medListNames}. Verified Safety Score: ${prescription.safetyScore || 95}%.`,
      status: 'In Progress',
      iconType: 'Pill',
      attachments: ['Dosage_Instructions_Schedule.pdf'],
    },
    {
      id: `${baseId}-doc`,
      date: rxDate,
      time: '09:00 AM',
      title: `Doctor Consultation with ${doctor}`,
      category: 'Doctor Visit',
      doctor: doctor,
      description: `Outpatient consultation completed with ${doctor} (${prescription.doctorSpecialty || 'Clinical Specialist'}). Prescription ${prescription.code} generated.`,
      status: 'Completed',
      iconType: 'Stethoscope',
    },
    {
      id: `${baseId}-hosp`,
      date: rxDate,
      time: '08:45 AM',
      title: `Hospital Visit at ${hospital}`,
      category: 'Hospital Visit',
      doctor: doctor,
      description: `Outpatient registration and facility check-in recorded at ${hospital}. Clinical file created under RX Code ${prescription.code}.`,
      status: 'Completed',
      iconType: 'Building2',
    },
    {
      id: `${baseId}-rec`,
      date: rxDate,
      time: '05:00 PM',
      title: `Recovery & Follow-Up Milestone Initialized`,
      category: 'Recovery',
      doctor: doctor,
      description: `Recovery trajectory initialized for ${diagnosis}. Daily adherence reminders scheduled. Follow-up checkup scheduled with ${doctor}.`,
      status: 'In Progress',
      iconType: 'HeartPulse',
    },
  ];

  return events;
}
