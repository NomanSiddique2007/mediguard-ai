export type PageRoute =
  | 'landing'
  | 'login'
  | 'register'
  | 'email-verification'
  | 'forgot-password'
  | 'dashboard'
  | 'upload'
  | 'history'
  | 'details'
  | 'library'
  | 'timeline'
  | 'reminders'
  | 'report'
  | 'profile'
  | 'settings'
  | 'admin'
  | '404';

export interface Doctor {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  specialty: string;
  licenseNumber: string;
  hospital: string;
  avatarUrl: string;
  createdAt?: string;
}

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  purpose: string;
  dosage: string;
  frequency: string;
  sideEffects: string[];
  foodInstructions: string;
  category: 'Antibiotics' | 'Cardiovascular' | 'Pain Relief' | 'Vitamins' | 'Diabetes' | 'Respiratory' | 'Gastrointestinal';
  safetyRating: 'A+' | 'A' | 'B' | 'Caution';
  image?: string;
}

export interface DrugInteraction {
  id: string;
  drugA: string;
  drugB: string;
  severity: 'High' | 'Moderate' | 'Low';
  description: string;
  recommendation: string;
}

export interface PrescriptionItem {
  id: string;
  prescriptionId?: string;
  medicineId?: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  purpose: string;
  warnings?: string;
  instructions: string;
  category?: string;
}

export interface OcrBoundingBox {
  id: string;
  text: string;
  confidence: number; // 0 - 100 percentage
  isHandwritten: boolean;
  isUncertain: boolean; // confidence < 70%
  type: 'doctor_name' | 'hospital' | 'patient_name' | 'date' | 'medicine' | 'dosage' | 'frequency' | 'duration' | 'notes' | 'other';
  box: {
    x: number; // percentage left
    y: number; // percentage top
    width: number; // percentage width
    height: number; // percentage height
  };
}

export interface ExtractedMedicineOcr {
  id: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  purpose?: string;
  instructions?: string;
  confidence: number;
  isUncertain: boolean;
}

export interface PaddleOcrResult {
  prescriptionId?: string;
  doctorName: string;
  doctorNameConfidence: number;
  hospital: string;
  hospitalConfidence: number;
  patientName: string;
  patientNameConfidence: number;
  date: string;
  dateConfidence: number;
  medicines: ExtractedMedicineOcr[];
  notes: string;
  notesConfidence: number;
  overallConfidence: number;
  hasUncertainWords: boolean;
  uncertainWordCount: number;
  boundingBoxes: OcrBoundingBox[];
  processingTimeMs: number;
  engine: string;
}

export interface GeminiMedicineExplanation {
  medicineName: string;
  purpose: string;
  dosage: string;
  sideEffects: string[];
  foodInstructions: string;
  confidenceScore: number; // 0-100
}

export interface GeminiDrugWarning {
  warning: string;
  severity: 'High' | 'Moderate' | 'Low';
  confidenceScore: number; // 0-100
}

export interface GeminiDuplicateMedicine {
  hasDuplicate: boolean;
  medicineA: string;
  medicineB: string;
  reason: string;
  recommendation: string;
  confidenceScore: number; // 0-100
}

export interface GeminiPrescriptionAnalysis {
  medicineExplanation: GeminiMedicineExplanation[];
  drugWarnings: GeminiDrugWarning[];
  duplicateMedicines: GeminiDuplicateMedicine[];
  summary: string;
  patientFriendlyExplanation: string;
  overallConfidenceScore: number; // 0-100
  generatedAt: string;
}

export type SafetySeverity = 'Major' | 'Moderate' | 'Minor';

export interface DrugInteractionAlert {
  id: string;
  drugA: string;
  drugB: string;
  severity: SafetySeverity;
  description: string;
  source: 'RxNav' | 'openFDA' | 'Clinical AI';
}

export interface DuplicateIngredientAlert {
  id: string;
  ingredient: string;
  medicinesInvolved: string[];
  severity: SafetySeverity;
  description: string;
  recommendation: string;
}

export interface ContraindicationAlert {
  id: string;
  medicineName: string;
  severity: SafetySeverity;
  condition: string;
  description: string;
  source: 'openFDA' | 'Clinical Label';
}

export interface PregnancyWarningAlert {
  id: string;
  medicineName: string;
  severity: SafetySeverity;
  categoryOrTrimester?: string;
  warningText: string;
  recommendation: string;
}

export interface FoodInteractionAlert {
  id: string;
  medicineName: string;
  severity: SafetySeverity;
  foodOrDiet: string;
  instruction: string;
}

export interface AlcoholWarningAlert {
  id: string;
  medicineName: string;
  severity: SafetySeverity;
  riskDescription: string;
  precaution: string;
}

export interface RxNavOpenFdaSafetyResult {
  prescriptionId?: string;
  analyzedMedicines: string[];
  drugInteractions: DrugInteractionAlert[];
  duplicateIngredients: DuplicateIngredientAlert[];
  contraindications: ContraindicationAlert[];
  pregnancyWarnings: PregnancyWarningAlert[];
  foodInteractions: FoodInteractionAlert[];
  alcoholWarnings: AlcoholWarningAlert[];
  overallRiskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  safetyScore: number; // 0-100
  rxnavFetched: boolean;
  openfdaFetched: boolean;
  analysisTimestamp: string;
}

export interface Prescription {
  id: string;
  code: string;
  date: string;
  doctorName: string;
  doctorSpecialty: string;
  hospital: string;
  diagnosis: string;
  status: 'Verified' | 'Action Required' | 'Pending Review' | 'Archived';
  imageUrl?: string;
  medicines: PrescriptionItem[];
  aiSummary: string;
  safetyScore: number; // 0 - 100
  warnings: string[];
  interactions: DrugInteraction[];
  notes?: string;
  patientName?: string;
  ocrResult?: PaddleOcrResult;
  geminiAnalysis?: GeminiPrescriptionAnalysis;
  safetyAnalysis?: RxNavOpenFdaSafetyResult;
}

export interface AIAnalysisRecord {
  id: string;
  prescriptionId: string;
  extractedText: string;
  confidenceScore: number;
  flaggedInteractions: DrugInteraction[];
  dosageCheckPassed: boolean;
  analysisTimestamp: string;
}

export interface HealthEvent {
  id: string;
  date: string;
  time?: string;
  title: string;
  category: 'Doctor Visit' | 'Diagnosis' | 'Medicine' | 'Recovery' | 'Vaccination' | 'Lab Result' | 'Hospital Visit';
  doctor?: string;
  description: string;
  status: 'Completed' | 'Upcoming' | 'In Progress';
  iconType: string;
  attachments?: string[];
}

export interface MedicationReminder {
  id: string;
  medicineName: string;
  dosage: string;
  timeSlot: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  exactTime: string; // e.g. "08:00 AM"
  instructions: string;
  status: 'Taken' | 'Pending' | 'Skipped' | 'Snoozed';
  streakDays: number;
  frequencyCode?: string; // e.g. "OD", "BD", "TDS", "QDS", "SOS"
  prescriptionId?: string;
  completedAt?: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'Patient' | 'Doctor' | 'Admin';
  avatarUrl: string;
  patientId: string;
  memberSince: string;
  medicalInfo: {
    bloodGroup: string;
    age: number;
    weight: string;
    height: string;
    allergies: string[];
    chronicDiseases: string[];
    emergencyContact: {
      name: string;
      relation: string;
      phone: string;
    };
  };
}

export interface NotificationRecord {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  category: 'reminder' | 'upload' | 'ai_analysis' | 'interaction' | 'profile' | 'system';
  isRead: boolean;
  page?: PageRoute;
  actionUrl?: string;
  createdAt?: string;
}

export interface AuditLogRecord {
  id: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

export interface AIReport {
  id: string;
  prescriptionId?: string;
  prescriptionCode?: string;
  title: string;
  generatedAt: string;
  patientName: string;
  doctorName: string;
  hospital: string;
  diagnosis: string;
  safetyScore: number;
  safetyRating: string;
  prescriptionSummary: {
    code: string;
    doctorName: string;
    hospital: string;
    date: string;
    diagnosis: string;
    status: string;
    safetyScore: number;
    medicinesCount: number;
    interactionsCount: number;
  };
  medicineExplanations: {
    medicineName: string;
    dosage: string;
    frequency: string;
    purpose: string;
    category?: string;
    mechanismOfAction: string;
    foodInstructions: string;
    sideEffects: string[];
    warnings: string;
  }[];
  interactionAnalysis: {
    id: string;
    drugA: string;
    drugB: string;
    severity: 'High' | 'Moderate' | 'Low';
    description: string;
    recommendation: string;
  }[];
  timelineEvents: {
    date: string;
    title: string;
    category: string;
    description: string;
    status: string;
  }[];
  reminderSchedule: {
    medicineName: string;
    dosage: string;
    timeSlot: string;
    exactTime: string;
    frequencyCode?: string;
    instructions: string;
  }[];
  doctorNotes: {
    clinicalAdvice: string;
    dietaryPrecautions: string;
    lifestyleRecommendations: string;
    emergencyWarningSigns: string[];
    followUpDate: string;
  };
}
