import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { PageRoute, Prescription, MedicationReminder, HealthEvent, UserProfile, ToastMessage, Medicine, AIReport, NotificationRecord } from '../types';
import { MOCK_PRESCRIPTIONS, MOCK_REMINDERS, MOCK_HEALTH_EVENTS, MOCK_USER, MOCK_MEDICINES } from '../data/mockData';
import { supabase, isSupabaseConfigured, authService } from '../lib/supabase/client';
import { prescriptionsService } from '../services/prescriptionsService';
import { remindersService } from '../services/remindersService';
import { timelineEventsService } from '../services/timelineEventsService';
import { patientsService } from '../services/patientsService';
import { medicinesService } from '../services/medicinesService';
import { reportsService } from '../services/reportsService';
import { notificationsService } from '../services/notificationsService';
import { seedService } from '../services/seedService';
import { generateTimelineEventsFromPrescription } from '../utils/timelineGenerator';
import { generateRemindersFromPrescription } from '../utils/reminderGenerator';

interface AppContextType {
  currentPage: PageRoute;
  setCurrentPage: (page: PageRoute) => void;
  selectedPrescriptionId: string | null;
  setSelectedPrescriptionId: (id: string | null) => void;
  viewPrescriptionDetails: (id: string) => void;
  
  prescriptions: Prescription[];
  addPrescription: (newRx: Prescription) => Promise<void>;
  deletePrescription: (id: string) => Promise<void>;
  
  reminders: MedicationReminder[];
  toggleReminderStatus: (id: string, newStatus?: MedicationReminder['status']) => Promise<void>;
  addReminder: (reminder: Omit<MedicationReminder, 'id' | 'streakDays'>) => Promise<void>;
  updateReminder: (id: string, updated: Partial<MedicationReminder>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  
  healthEvents: HealthEvent[];
  addHealthEvent: (event: Omit<HealthEvent, 'id'>) => Promise<void>;

  medicines: Medicine[];
  
  aiReports: AIReport[];
  saveAIReport: (report: AIReport) => Promise<void>;
  deleteAIReport: (id: string) => Promise<void>;

  // Notification System
  notifications: NotificationRecord[];
  unreadNotificationsCount: number;
  addNotification: (notif: Omit<NotificationRecord, 'id' | 'createdAt' | 'isRead'>) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;

  // Notification Triggers
  notifyMedicineReminder: (medicineName: string, time: string, dosage: string) => Promise<void>;
  notifyPrescriptionUploaded: (code: string, doctorName: string) => Promise<void>;
  notifyAIAnalysisComplete: (code: string, safetyScore: number) => Promise<void>;
  notifyInteractionWarning: (drugA: string, drugB: string, severity: 'High' | 'Moderate' | 'Low') => Promise<void>;
  notifyProfileUpdated: (details?: string) => Promise<void>;

  userProfile: UserProfile;
  updateUserProfile: (updated: Partial<UserProfile>) => Promise<void>;
  
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
  
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  isLoading: boolean;
  isSupabaseConnected: boolean;
  refetchAll: () => Promise<void>;
  seedDataToSupabase: () => Promise<void>;

  // Authentication & Session States
  authUser: any | null;
  authEmail: string;
  isAuthenticated: boolean;
  userRole: 'Patient' | 'Doctor' | 'Admin';
  isEmailVerified: boolean;
  authLoading: boolean;
  
  // Auth Actions
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role: 'Patient' | 'Doctor' | 'Admin';
  }) => Promise<{ success: boolean; error?: string; requireVerification?: boolean }>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPass: string) => Promise<{ error: any }>;
  resendVerification: (email: string) => Promise<{ error: any }>;
  loginDemo: (role: 'Patient' | 'Doctor' | 'Admin') => void;
  refetchSession: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPageState] = useState<PageRoute>('landing');
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string | null>('rx-001');
  
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [reminders, setReminders] = useState<MedicationReminder[]>([]);
  const [healthEvents, setHealthEvents] = useState<HealthEvent[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [aiReports, setAiReports] = useState<AIReport[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(MOCK_USER);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);
  
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Auth State
  const [authUser, setAuthUser] = useState<any | null>(null);
  const [authEmail, setAuthEmail] = useState<string>('alexander.vance@mediguard.ai');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // Default true for initial demo session, synced with Supabase session below
  const [userRole, setUserRole] = useState<'Patient' | 'Doctor' | 'Admin'>('Patient');
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(true);
  const [authLoading, setAuthLoading] = useState<boolean>(isSupabaseConfigured());

  const isSupabaseConnected = isSupabaseConfigured();

  // Handle Supabase Auth state changes and session persistence
  const initAuthSession = useCallback(async () => {
    if (!isSupabaseConnected) {
      setAuthLoading(false);
      return;
    }

    setAuthLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (session && session.user) {
        const u = session.user;
        setAuthUser(u);
        setAuthEmail(u.email || '');
        setIsAuthenticated(true);
        setIsEmailVerified(Boolean(u.email_confirmed_at));

        const role = (u.user_metadata?.role as 'Patient' | 'Doctor' | 'Admin') || 'Patient';
        setUserRole(role);

        // Fetch or sync profile for authenticated Supabase user
        const { data: patData } = await patientsService.getPatient(u.id);
        if (patData) {
          setUserProfile(patData);
        } else {
          // Sync profile with user metadata
          setUserProfile((prev) => ({
            ...prev,
            id: u.id,
            email: u.email || prev.email,
            fullName: u.user_metadata?.full_name || prev.fullName,
            phone: u.user_metadata?.phone || prev.phone,
            role: role,
          }));
        }
      } else {
        // No active Supabase session
        setAuthUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Error reading Supabase session:', err);
    } finally {
      setAuthLoading(false);
    }
  }, [isSupabaseConnected]);

  useEffect(() => {
    initAuthSession();

    if (isSupabaseConnected) {
      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session && session.user) {
          const u = session.user;
          setAuthUser(u);
          setAuthEmail(u.email || '');
          setIsAuthenticated(true);
          setIsEmailVerified(Boolean(u.email_confirmed_at));
          const role = (u.user_metadata?.role as 'Patient' | 'Doctor' | 'Admin') || 'Patient';
          setUserRole(role);
        } else if (_event === 'SIGNED_OUT') {
          setAuthUser(null);
          setIsAuthenticated(false);
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, [initAuthSession, isSupabaseConnected]);

  const loadDataFromSupabase = useCallback(async () => {
    setIsLoading(true);
    const [storedReports, storedNotifs] = await Promise.all([
      reportsService.getAll(authUser?.id),
      notificationsService.getAll(authUser?.id),
    ]);
    setAiReports(storedReports);
    setNotifications(storedNotifs);

    if (!isSupabaseConnected) {
      setPrescriptions(MOCK_PRESCRIPTIONS);
      setReminders(MOCK_REMINDERS);
      setHealthEvents(MOCK_HEALTH_EVENTS);
      setMedicines(MOCK_MEDICINES);
      setUserProfile(MOCK_USER);
      setIsLoading(false);
      return;
    }

    try {
      const [rxRes, remRes, heRes, medRes, patRes] = await Promise.all([
        prescriptionsService.getAll(),
        remindersService.getAll(),
        timelineEventsService.getAll(),
        medicinesService.getAll(),
        patientsService.getPatient(authUser?.id || 'p-001'),
      ]);

      setPrescriptions(rxRes.data || []);
      setReminders(remRes.data || []);
      setHealthEvents(heRes.data || []);
      setMedicines(medRes.data || []);

      if (patRes.data) {
        setUserProfile(patRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch data from Supabase:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isSupabaseConnected, authUser?.id]);

  useEffect(() => {
    loadDataFromSupabase();

    // Subscribe to Supabase Realtime notification updates
    const unsubscribeRealtime = notificationsService.subscribeToRealtime((newNotif) => {
      setNotifications((prev) => [newNotif, ...prev.filter((n) => n.id !== newNotif.id)]);
      addToast({
        type: newNotif.type,
        title: newNotif.title,
        message: newNotif.message,
      });
    });

    return () => {
      unsubscribeRealtime();
    };
  }, [loadDataFromSupabase]);

  // NOTIFICATION ACTIONS
  const addNotification = async (
    notif: Omit<NotificationRecord, 'id' | 'createdAt' | 'isRead'>
  ) => {
    const record = await notificationsService.addNotification({
      ...notif,
      userId: authUser?.id || 'demo-user',
    });
    setNotifications((prev) => [record, ...prev.filter((n) => n.id !== record.id)]);
    addToast({
      type: record.type,
      title: record.title,
      message: record.message,
    });
  };

  const markNotificationAsRead = async (id: string) => {
    await notificationsService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsAsRead = async () => {
    await notificationsService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    addToast({
      type: 'info',
      title: 'Notifications Read',
      message: 'All notifications marked as read.',
    });
  };

  const deleteNotification = async (id: string) => {
    await notificationsService.deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // SPECIFIC NOTIFICATION TRIGGER METHODS REQUIRED BY PROMPT
  const notifyMedicineReminder = async (medicineName: string, time: string, dosage: string) => {
    await addNotification({
      title: 'Medicine Reminder',
      message: `Time for ${medicineName} (${dosage}) scheduled for ${time}. Please log your dose.`,
      type: 'warning',
      category: 'reminder',
      page: 'reminders',
    });
  };

  const notifyPrescriptionUploaded = async (code: string, doctorName: string) => {
    await addNotification({
      title: 'Prescription Uploaded',
      message: `Prescription ${code} from ${doctorName} successfully uploaded and stored in database.`,
      type: 'info',
      category: 'upload',
      page: 'history',
    });
  };

  const notifyAIAnalysisComplete = async (code: string, safetyScore: number) => {
    await addNotification({
      title: 'AI Analysis Complete',
      message: `Clinical OCR parsing & FDA verification complete for ${code}. AI Safety Rating: ${safetyScore}%.`,
      type: 'success',
      category: 'ai_analysis',
      page: 'report',
    });
  };

  const notifyInteractionWarning = async (drugA: string, drugB: string, severity: 'High' | 'Moderate' | 'Low') => {
    await addNotification({
      title: 'Interaction Warning',
      message: `Potential ${severity} risk drug-drug interaction detected between ${drugA} and ${drugB}.`,
      type: 'warning',
      category: 'interaction',
      page: 'report',
    });
  };

  const notifyProfileUpdated = async (details?: string) => {
    await addNotification({
      title: 'Profile Updated',
      message: details || 'Patient profile and medical parameters updated successfully.',
      type: 'info',
      category: 'profile',
      page: 'profile',
    });
  };

  const setCurrentPage = (page: PageRoute) => {
    setCurrentPageState(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveAIReport = async (report: AIReport) => {
    await reportsService.save(report, authUser?.id);
    setAiReports((prev) => [report, ...prev.filter((r) => r.id !== report.id)]);
    addToast({
      type: 'success',
      title: 'Report Stored in Database',
      message: `AI Health Report ${report.id} securely saved to database.`,
    });
  };

  const deleteAIReport = async (id: string) => {
    await reportsService.delete(id);
    setAiReports((prev) => prev.filter((r) => r.id !== id));
    addToast({
      type: 'info',
      title: 'Report Removed',
      message: 'Report deleted from database storage.',
    });
  };

  const viewPrescriptionDetails = (id: string) => {
    setSelectedPrescriptionId(id);
    setCurrentPage('details');
  };

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth Operations
  const login = async (email: string, pass: string) => {
    setAuthLoading(true);
    if (!isSupabaseConnected) {
      // Local / Demo mode fallback login
      setAuthEmail(email);
      setIsAuthenticated(true);
      setIsEmailVerified(true);
      setAuthLoading(false);
      addToast({
        type: 'success',
        title: 'Sign In Successful',
        message: `Welcome back, ${email}`,
      });
      setCurrentPage('dashboard');
      return { success: true };
    }

    const { data, error } = await authService.signIn(email, pass);
    setAuthLoading(false);

    if (error) {
      addToast({
        type: 'error',
        title: 'Sign In Failed',
        message: error.message || 'Invalid email or password.',
      });
      return { success: false, error: error.message };
    }

    if (data.user) {
      const u = data.user;
      setAuthUser(u);
      setAuthEmail(u.email || email);
      setIsAuthenticated(true);
      const verified = Boolean(u.email_confirmed_at);
      setIsEmailVerified(verified);

      const role = (u.user_metadata?.role as 'Patient' | 'Doctor' | 'Admin') || 'Patient';
      setUserRole(role);

      addToast({
        type: 'success',
        title: 'Welcome Back!',
        message: `Logged in as ${u.user_metadata?.full_name || email}. Role: [${role}]`,
      });

      if (!verified) {
        setCurrentPage('email-verification');
      } else {
        setCurrentPage('dashboard');
      }
    }
    return { success: true };
  };

  const register = async ({
    email,
    password,
    fullName,
    phone = '',
    role = 'Patient',
  }: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role: 'Patient' | 'Doctor' | 'Admin';
  }) => {
    setAuthLoading(true);
    setAuthEmail(email);
    setUserRole(role);

    if (!isSupabaseConnected) {
      // Local fallback register
      const newPatientProfile: UserProfile = {
        id: `p-${Date.now()}`,
        fullName,
        email,
        phone,
        role,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        patientId: `PAT-${Math.floor(100000 + Math.random() * 900000)}`,
        memberSince: '2026',
        medicalInfo: {
          bloodGroup: 'O+',
          age: 32,
          weight: '70 kg',
          height: '175 cm',
          allergies: ['Penicillin'],
          chronicDiseases: [],
          emergencyContact: {
            name: 'Emergency Contact',
            relation: 'Family',
            phone: phone || '911',
          },
        },
      };
      setUserProfile(newPatientProfile);
      setIsAuthenticated(true);
      setIsEmailVerified(true);
      setAuthLoading(false);

      addToast({
        type: 'success',
        title: 'Account Registered',
        message: `Welcome, ${fullName}! Your ${role} profile is created.`,
      });
      setCurrentPage('email-verification');
      return { success: true };
    }

    // Supabase Registration
    const { data, error } = await authService.signUp(email, password, fullName, role, phone);
    setAuthLoading(false);

    if (error) {
      addToast({
        type: 'error',
        title: 'Registration Error',
        message: error.message || 'Unable to create account.',
      });
      return { success: false, error: error.message };
    }

    if (data.user) {
      const u = data.user;
      setAuthUser(u);
      setIsAuthenticated(true);
      const verified = Boolean(u.email_confirmed_at);
      setIsEmailVerified(verified);

      // AUTOMATIC PATIENT PROFILE CREATION IN DATABASE
      const newPatientProfile: UserProfile = {
        id: u.id,
        fullName,
        email,
        phone,
        role,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        patientId: `PAT-${Math.floor(100000 + Math.random() * 900000)}`,
        memberSince: '2026',
        medicalInfo: {
          bloodGroup: 'O+',
          age: 35,
          weight: '70 kg',
          height: '172 cm',
          allergies: [],
          chronicDiseases: [],
          emergencyContact: {
            name: 'Primary Contact',
            relation: 'Spouse',
            phone: phone || '911',
          },
        },
      };

      // Save to Supabase 'patients' table automatically
      await patientsService.createPatient(newPatientProfile);
      setUserProfile(newPatientProfile);

      addToast({
        type: 'success',
        title: 'Account Created & Profile Generated',
        message: `Patient record registered for ${fullName}. Please verify your email.`,
      });

      // Redirect flow: Landing -> Register -> Email Verification -> Dashboard
      setCurrentPage('email-verification');
      return { success: true, requireVerification: !verified };
    }

    return { success: true };
  };

  const logout = async () => {
    setAuthLoading(true);
    if (isSupabaseConnected) {
      await authService.signOut();
    }
    setAuthUser(null);
    setIsAuthenticated(false);
    setUserRole('Patient');
    setAuthLoading(false);

    addToast({
      type: 'info',
      title: 'Logged Out',
      message: 'You have been safely signed out of your MediGuard portal.',
    });
    setCurrentPage('login');
  };

  const forgotPassword = async (email: string) => {
    return await authService.resetPasswordForEmail(email);
  };

  const updatePassword = async (newPass: string) => {
    return await authService.updatePassword(newPass);
  };

  const resendVerification = async (email: string) => {
    return await authService.resendVerificationEmail(email);
  };

  const loginDemo = (role: 'Patient' | 'Doctor' | 'Admin') => {
    setUserRole(role);
    setIsAuthenticated(true);
    setIsEmailVerified(true);
    setAuthEmail(`demo.${role.toLowerCase()}@mediguard.ai`);

    const demoProfile: UserProfile = {
      ...MOCK_USER,
      fullName: role === 'Doctor' ? 'Dr. Sarah Jenkins, MD' : role === 'Admin' ? 'System Administrator' : 'Alexander Vance',
      role: role,
    };
    setUserProfile(demoProfile);

    addToast({
      type: 'success',
      title: `${role} Portal Active`,
      message: `Signed in as ${demoProfile.fullName} [${role} Privileges].`,
    });
    setCurrentPage('dashboard');
  };

  const addPrescription = async (newRx: Prescription) => {
    if (isSupabaseConnected) {
      const { data, error } = await prescriptionsService.create(newRx, userProfile.id);
      if (error) {
        addToast({
          type: 'error',
          title: 'Supabase Sync Warning',
          message: `Local record created. (${error.message})`,
        });
        setPrescriptions((prev) => [newRx, ...prev]);
      } else if (data) {
        setPrescriptions((prev) => [data, ...prev]);
      } else {
        setPrescriptions((prev) => [newRx, ...prev]);
      }
    } else {
      setPrescriptions((prev) => [newRx, ...prev]);
    }

    // Automatically generate 5 Health Timeline events: Diagnosis, Medicine, Doctor Visit, Hospital Visit, Recovery Event
    const autoTimelineEvents = generateTimelineEventsFromPrescription(newRx);
    const persistedEvents: HealthEvent[] = [];

    for (const evt of autoTimelineEvents) {
      if (isSupabaseConnected) {
        const { data } = await timelineEventsService.create(evt, userProfile.id);
        if (data) {
          persistedEvents.push(data);
        } else {
          persistedEvents.push(evt);
        }
      } else {
        persistedEvents.push(evt);
      }
    }

    setHealthEvents((prev) => [...persistedEvents, ...prev]);

    // Automatically generate Medication Reminders based on medicine frequency (OD, BD, TDS, QDS, SOS, etc.)
    const generatedReminders = generateRemindersFromPrescription(newRx);
    const persistedReminders: MedicationReminder[] = [];

    for (const rem of generatedReminders) {
      if (isSupabaseConnected) {
        const { data } = await remindersService.create(rem, userProfile.id);
        if (data) {
          persistedReminders.push(data);
        } else {
          persistedReminders.push(rem);
        }
      } else {
        persistedReminders.push(rem);
      }
    }

    if (persistedReminders.length > 0) {
      setReminders((prev) => [...persistedReminders, ...prev]);
    }

    // Trigger Notification System
    await notifyPrescriptionUploaded(newRx.code, newRx.doctorName);
    await notifyAIAnalysisComplete(newRx.code, newRx.safetyScore);

    if (newRx.interactions && newRx.interactions.length > 0) {
      for (const inter of newRx.interactions) {
        await notifyInteractionWarning(inter.drugA, inter.drugB, inter.severity);
      }
    }

    addToast({
      type: 'success',
      title: 'Prescription Saved, Timeline & Reminders Generated',
      message: `${newRx.code} registered. Generated 5 timeline events and ${persistedReminders.length} automated medication reminders based on prescribed frequencies.`,
    });
  };

  const deletePrescription = async (id: string) => {
    setPrescriptions((prev) => prev.filter((p) => p.id !== id));

    if (isSupabaseConnected) {
      const { error } = await prescriptionsService.delete(id);
      if (error) {
        console.error('Error deleting from Supabase:', error);
      }
    }

    addToast({
      type: 'info',
      title: 'Prescription Removed',
      message: 'The prescription record has been deleted.',
    });
  };

  const toggleReminderStatus = async (id: string, newStatus?: MedicationReminder['status']) => {
    const targetRem = reminders.find((r) => r.id === id);
    if (!targetRem) return;

    const status = newStatus || (targetRem.status === 'Taken' ? 'Pending' : 'Taken');
    const isTaking = status === 'Taken';
    const streakDays = isTaking ? targetRem.streakDays + 1 : Math.max(0, targetRem.streakDays - 1);

    setReminders((prev) =>
      prev.map((rem) => (rem.id === id ? { ...rem, status, streakDays } : rem))
    );

    if (isSupabaseConnected) {
      await remindersService.updateStatus(id, status, streakDays);
    }

    addToast({
      type: 'success',
      title: 'Medication Logged',
      message: `${targetRem.medicineName} marked as ${status}.`,
    });
  };

  const addReminder = async (reminder: Omit<MedicationReminder, 'id' | 'streakDays'>) => {
    if (isSupabaseConnected) {
      const { data, error } = await remindersService.create(reminder, userProfile.id);
      if (error) {
        const localRem: MedicationReminder = { ...reminder, id: `rem-${Date.now()}`, streakDays: 1 };
        setReminders((prev) => [...prev, localRem]);
      } else if (data) {
        setReminders((prev) => [...prev, data]);
      }
    } else {
      const localRem: MedicationReminder = { ...reminder, id: `rem-${Date.now()}`, streakDays: 1 };
      setReminders((prev) => [...prev, localRem]);
    }

    addToast({
      type: 'success',
      title: 'Reminder Created',
      message: `Daily reminder set for ${reminder.medicineName} at ${reminder.exactTime}.`,
    });

    await notifyMedicineReminder(reminder.medicineName, reminder.exactTime, reminder.dosage);
  };

  const updateReminder = async (id: string, updated: Partial<MedicationReminder>) => {
    setReminders((prev) =>
      prev.map((rem) => (rem.id === id ? { ...rem, ...updated } : rem))
    );

    if (isSupabaseConnected) {
      const { data, error } = await remindersService.updateStatus(
        id,
        updated.status || 'Pending',
        updated.streakDays
      );
      if (error) console.error('Error updating reminder in Supabase:', error);
    }

    addToast({
      type: 'success',
      title: 'Reminder Updated',
      message: `Updated schedule for ${updated.medicineName || 'Medication'}.`,
    });
  };

  const deleteReminder = async (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));

    if (isSupabaseConnected) {
      await remindersService.delete(id);
    }

    addToast({
      type: 'info',
      title: 'Reminder Removed',
      message: 'Medication reminder deleted from schedule.',
    });
  };

  const addHealthEvent = async (event: Omit<HealthEvent, 'id'>) => {
    if (isSupabaseConnected) {
      const { data, error } = await timelineEventsService.create(event, userProfile.id);
      if (error) {
        const localEvt: HealthEvent = { ...event, id: `he-${Date.now()}` };
        setHealthEvents((prev) => [localEvt, ...prev]);
      } else if (data) {
        setHealthEvents((prev) => [data, ...prev]);
      }
    } else {
      const localEvt: HealthEvent = { ...event, id: `he-${Date.now()}` };
      setHealthEvents((prev) => [localEvt, ...prev]);
    }

    addToast({
      type: 'success',
      title: 'Timeline Event Recorded',
      message: `${event.title} has been logged in your health history.`,
    });
  };

  const updateUserProfile = async (updated: Partial<UserProfile>) => {
    setUserProfile((prev) => ({
      ...prev,
      ...updated,
      medicalInfo: {
        ...prev.medicalInfo,
        ...(updated.medicalInfo || {}),
      },
    }));

    if (isSupabaseConnected) {
      await patientsService.updatePatient(userProfile.id, updated);
    }

    await notifyProfileUpdated(
      updated.fullName ? `Name updated to ${updated.fullName}.` : undefined
    );

    addToast({
      type: 'success',
      title: 'Profile Saved',
      message: 'Your medical details have been updated.',
    });
  };

  const seedDataToSupabase = async () => {
    setIsLoading(true);
    const res = await seedService.seedAllData();
    if (res.success) {
      addToast({
        type: 'success',
        title: 'Supabase Data Seeded',
        message: res.message,
      });
      await loadDataFromSupabase();
    } else {
      addToast({
        type: 'error',
        title: 'Seeding Result',
        message: res.message,
      });
      setIsLoading(false);
    }
  };

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        selectedPrescriptionId,
        setSelectedPrescriptionId,
        viewPrescriptionDetails,
        prescriptions,
        addPrescription,
        deletePrescription,
        reminders,
        toggleReminderStatus,
        addReminder,
        updateReminder,
        deleteReminder,
        healthEvents,
        addHealthEvent,
        medicines,
        aiReports,
        saveAIReport,
        deleteAIReport,

        notifications,
        unreadNotificationsCount,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,

        notifyMedicineReminder,
        notifyPrescriptionUploaded,
        notifyAIAnalysisComplete,
        notifyInteractionWarning,
        notifyProfileUpdated,

        userProfile,
        updateUserProfile,
        toasts,
        addToast,
        removeToast,
        globalSearch,
        setGlobalSearch,
        sidebarOpen,
        setSidebarOpen,
        toggleSidebar,
        isLoading,
        isSupabaseConnected,
        refetchAll: loadDataFromSupabase,
        seedDataToSupabase,

        authUser,
        authEmail,
        isAuthenticated,
        userRole,
        isEmailVerified,
        authLoading,
        login,
        register,
        logout,
        forgotPassword,
        updatePassword,
        resendVerification,
        loginDemo,
        refetchSession: initAuthSession,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
