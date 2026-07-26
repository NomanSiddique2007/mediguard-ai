import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { PageRoute, Prescription, MedicationReminder, HealthEvent, UserProfile, ToastMessage, Medicine, AIReport, NotificationRecord } from '../types';
import { MOCK_PRESCRIPTIONS, MOCK_REMINDERS, MOCK_HEALTH_EVENTS, MOCK_MEDICINES } from '../data/mockData';
import { isSupabaseConfigured } from '../lib/supabase/client';
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
import { useAuth } from './AuthContext';

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

  // Authentication & Session States (Driven by AuthContext / Google OAuth)
  authUser: any | null;
  authEmail: string;
  isAuthenticated: boolean;
  userRole: 'Patient' | 'Doctor' | 'Admin';
  isEmailVerified: boolean;
  authLoading: boolean;
  
  // Auth Actions
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  loginDemo: (role: 'Patient' | 'Doctor' | 'Admin') => void;
}

const getRouteFromPathname = (pathname: string): PageRoute => {
  const cleanPath = pathname.replace(/\/$/, '').toLowerCase();
  switch (cleanPath) {
    case '':
    case '/':
      return 'landing';
    case '/login':
      return 'login';
    case '/auth/callback':
    case '/auth-callback':
      return 'auth-callback';
    case '/dashboard':
      return 'dashboard';
    case '/upload':
      return 'upload';
    case '/history':
      return 'history';
    case '/details':
      return 'details';
    case '/library':
      return 'library';
    case '/timeline':
      return 'timeline';
    case '/reminders':
      return 'reminders';
    case '/report':
      return 'report';
    case '/profile':
      return 'profile';
    case '/settings':
      return 'settings';
    case '/admin':
      return 'admin';
    default:
      return 'landing';
  }
};

const getPathFromRoute = (route: PageRoute): string => {
  switch (route) {
    case 'landing':
      return '/';
    case 'login':
      return '/login';
    case 'auth-callback':
      return '/auth/callback';
    case 'dashboard':
      return '/dashboard';
    case 'upload':
      return '/upload';
    case 'history':
      return '/history';
    case 'details':
      return '/details';
    case 'library':
      return '/library';
    case 'timeline':
      return '/timeline';
    case 'reminders':
      return '/reminders';
    case 'report':
      return '/report';
    case 'profile':
      return '/profile';
    case 'settings':
      return '/settings';
    case 'admin':
      return '/admin';
    case '404':
    default:
      return '/404';
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const [currentPage, setCurrentPageState] = useState<PageRoute>(() => {
    if (typeof window !== 'undefined') {
      return getRouteFromPathname(window.location.pathname);
    }
    return 'landing';
  });
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string | null>('rx-001');
  
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [reminders, setReminders] = useState<MedicationReminder[]>([]);
  const [healthEvents, setHealthEvents] = useState<HealthEvent[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [aiReports, setAiReports] = useState<AIReport[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);

  const userProfile = auth.userProfile;
  const setUserProfile = auth.setUserProfile;

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);
  
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isSupabaseConnected = isSupabaseConfigured();

  const loadDataFromSupabase = useCallback(async () => {
    setIsLoading(true);
    const userId = auth.user?.id;
    const [storedReports, storedNotifs] = await Promise.all([
      reportsService.getAll(userId),
      notificationsService.getAll(userId),
    ]);

    if (storedReports.length > 0) setAiReports(storedReports);
    if (storedNotifs.length > 0) setNotifications(storedNotifs);

    if (!isSupabaseConnected) {
      setPrescriptions(MOCK_PRESCRIPTIONS);
      setReminders(MOCK_REMINDERS);
      setHealthEvents(MOCK_HEALTH_EVENTS);
      setMedicines(MOCK_MEDICINES);
      setIsLoading(false);
      return;
    }

    try {
      const [rxRes, remRes, eventRes, medRes] = await Promise.all([
        prescriptionsService.getAll(userId),
        remindersService.getAll(userId),
        timelineEventsService.getAll(userId),
        medicinesService.getAll(),
      ]);

      const rxData = rxRes.data || [];
      const remData = remRes.data || [];
      const eventData = eventRes.data || [];
      const medData = medRes.data || [];

      setPrescriptions(rxData.length > 0 ? rxData : MOCK_PRESCRIPTIONS);
      setReminders(remData.length > 0 ? remData : MOCK_REMINDERS);
      setHealthEvents(eventData.length > 0 ? eventData : MOCK_HEALTH_EVENTS);
      setMedicines(medData.length > 0 ? medData : MOCK_MEDICINES);
    } catch (err) {
      console.error('Failed to load data from Supabase, using mock fallback:', err);
      setPrescriptions(MOCK_PRESCRIPTIONS);
      setReminders(MOCK_REMINDERS);
      setHealthEvents(MOCK_HEALTH_EVENTS);
      setMedicines(MOCK_MEDICINES);
    } finally {
      setIsLoading(false);
    }
  }, [isSupabaseConnected, auth.user?.id]);

  useEffect(() => {
    loadDataFromSupabase();
  }, [loadDataFromSupabase]);

  const seedDataToSupabase = async () => {
    setIsLoading(true);
    try {
      await seedService.seedAllData();
      await loadDataFromSupabase();
      addToast({
        type: 'success',
        title: 'Database Seeded',
        message: 'Initial prescriptions, medicines, reminders & timeline events synchronized.',
      });
    } catch (err) {
      console.error('Seeding error:', err);
      addToast({
        type: 'error',
        title: 'Seeding Failed',
        message: 'Could not write initial seed records to Supabase.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPageState(getRouteFromPathname(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const setCurrentPage = (page: PageRoute) => {
    setCurrentPageState(page);
    if (typeof window !== 'undefined') {
      const targetPath = getPathFromRoute(page);
      if (window.location.pathname !== targetPath) {
        window.history.pushState({}, '', targetPath);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newToast: ToastMessage = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const viewPrescriptionDetails = (id: string) => {
    setSelectedPrescriptionId(id);
    setCurrentPage('details');
  };

  // Prescription Actions
  const addPrescription = async (newRx: Prescription) => {
    setPrescriptions((prev) => [newRx, ...prev]);

    const generatedEvents = generateTimelineEventsFromPrescription(newRx);
    const generatedReminders = generateRemindersFromPrescription(newRx);

    setHealthEvents((prev) => [...generatedEvents, ...prev]);
    setReminders((prev) => [...generatedReminders, ...prev]);

    if (isSupabaseConnected) {
      const { data: savedRx } = await prescriptionsService.create(newRx, auth.user?.id || userProfile.id);
      if (savedRx) {
        for (const evt of generatedEvents) {
          await timelineEventsService.create(evt, auth.user?.id || userProfile.id);
        }
        for (const rem of generatedReminders) {
          await remindersService.create(rem, auth.user?.id || userProfile.id);
        }
      }
    }

    await notifyPrescriptionUploaded(newRx.code, newRx.doctorName);
    await notifyAIAnalysisComplete(newRx.code, newRx.safetyScore);

    addToast({
      type: 'success',
      title: 'Prescription Analyzed & Created',
      message: `${newRx.code} registered. Generated ${generatedEvents.length} timeline events and ${generatedReminders.length} medication reminders.`,
    });
  };

  const deletePrescription = async (id: string) => {
    setPrescriptions((prev) => prev.filter((p) => p.id !== id));
    if (isSupabaseConnected) {
      await prescriptionsService.delete(id);
    }
    addToast({
      type: 'info',
      title: 'Prescription Removed',
      message: 'The selected prescription record was removed from your vault.',
    });
  };

  // Reminder Actions
  const toggleReminderStatus = async (id: string, newStatus?: MedicationReminder['status']) => {
    let targetStatus: MedicationReminder['status'] = 'Taken';
    let newStreak = 0;

    setReminders((prev) =>
      prev.map((rem) => {
        if (rem.id === id) {
          targetStatus = newStatus || (rem.status === 'Taken' ? 'Pending' : 'Taken');
          newStreak = targetStatus === 'Taken' ? rem.streakDays + 1 : Math.max(0, rem.streakDays - 1);
          return {
            ...rem,
            status: targetStatus,
            streakDays: newStreak,
          };
        }
        return rem;
      })
    );

    if (isSupabaseConnected) {
      await remindersService.updateStatus(id, targetStatus, newStreak);
    }

    addToast({
      type: targetStatus === 'Taken' ? 'success' : 'info',
      title: targetStatus === 'Taken' ? 'Dose Marked Taken' : 'Dose Reset',
      message: `Medication schedule updated to [${targetStatus}].`,
    });
  };

  const addReminder = async (reminderData: Omit<MedicationReminder, 'id' | 'streakDays'>) => {
    const id = `rem-${Date.now()}`;
    const newRem: MedicationReminder = {
      ...reminderData,
      id,
      streakDays: 0,
    };
    setReminders((prev) => [newRem, ...prev]);

    if (isSupabaseConnected) {
      await remindersService.create(newRem, auth.user?.id || userProfile.id);
    }

    addToast({
      type: 'success',
      title: 'Reminder Schedule Created',
      message: `Daily reminder configured for ${newRem.medicineName} at ${newRem.exactTime}.`,
    });
  };

  const updateReminder = async (id: string, updated: Partial<MedicationReminder>) => {
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated } : r)));
    if (isSupabaseConnected && updated.status) {
      await remindersService.updateStatus(id, updated.status, updated.streakDays);
    }
  };

  const deleteReminder = async (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    if (isSupabaseConnected) {
      await remindersService.delete(id);
    }
  };

  // Timeline Event Actions
  const addHealthEvent = async (eventData: Omit<HealthEvent, 'id'>) => {
    const id = `evt-${Date.now()}`;
    const newEvt: HealthEvent = {
      ...eventData,
      id,
    };
    setHealthEvents((prev) => [newEvt, ...prev]);

    if (isSupabaseConnected) {
      await timelineEventsService.create(newEvt, auth.user?.id || userProfile.id);
    }

    addToast({
      type: 'success',
      title: 'Health Event Logged',
      message: `Added "${newEvt.title}" to your health timeline.`,
    });
  };

  // AI Report Actions
  const saveAIReport = async (report: AIReport) => {
    setAiReports((prev) => [report, ...prev]);
    if (isSupabaseConnected) {
      await reportsService.save(report);
    }
    addToast({
      type: 'success',
      title: 'AI Health Report Saved',
      message: `Comprehensive PDF analysis "${report.title}" generated and archived.`,
    });
  };

  const deleteAIReport = async (id: string) => {
    setAiReports((prev) => prev.filter((r) => r.id !== id));
    if (isSupabaseConnected) {
      await reportsService.delete(id);
    }
  };

  // Notifications Logic
  const addNotification = async (notifData: Omit<NotificationRecord, 'id' | 'createdAt' | 'isRead'>) => {
    const notif: NotificationRecord = {
      ...notifData,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    setNotifications((prev) => [notif, ...prev]);

    if (isSupabaseConnected) {
      await notificationsService.addNotification({
        ...notifData,
        userId: auth.user?.id || 'demo-user',
      });
    }
  };

  const markNotificationAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    if (isSupabaseConnected) {
      await notificationsService.markAsRead(id);
    }
  };

  const markAllNotificationsAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    if (isSupabaseConnected) {
      await notificationsService.markAllAsRead();
    }
    addToast({
      type: 'info',
      title: 'Notifications Cleared',
      message: 'All notifications marked as read.',
    });
  };

  const deleteNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (isSupabaseConnected) {
      await notificationsService.deleteNotification(id);
    }
  };

  const notifyMedicineReminder = async (medicineName: string, time: string, dosage: string) => {
    await addNotification({
      type: 'warning',
      category: 'reminder',
      title: `Medication Due: ${medicineName}`,
      message: `It is time to take ${dosage} of ${medicineName} (${time}).`,
      page: 'reminders',
    });
  };

  const notifyPrescriptionUploaded = async (code: string, doctorName: string) => {
    await addNotification({
      type: 'info',
      category: 'upload',
      title: `Prescription Uploaded: ${code}`,
      message: `Script from ${doctorName} was received and queued for AI vision parsing.`,
      page: 'history',
    });
  };

  const notifyAIAnalysisComplete = async (code: string, safetyScore: number) => {
    await addNotification({
      type: 'success',
      category: 'ai_analysis',
      title: `AI Analysis Complete (${code})`,
      message: `Cross-checks completed with a Clinical Safety Score of ${safetyScore}%.`,
      page: 'details',
    });
  };

  const notifyInteractionWarning = async (drugA: string, drugB: string, severity: 'High' | 'Moderate' | 'Low') => {
    await addNotification({
      type: 'error',
      category: 'interaction',
      title: `Drug Interaction Warning [${severity}]`,
      message: `Potential interaction detected between ${drugA} and ${drugB}. Check details.`,
      page: 'report',
    });
  };

  const notifyProfileUpdated = async (details = 'Your patient profile metrics were updated.') => {
    await addNotification({
      type: 'info',
      category: 'profile',
      title: 'Profile Info Updated',
      message: details,
      page: 'profile',
    });
  };

  // User Profile Updating
  const updateUserProfile = async (updated: Partial<UserProfile>) => {
    const newProf = { ...userProfile, ...updated };
    setUserProfile(newProf);
    if (isSupabaseConnected) {
      await patientsService.updatePatient(newProf.id, newProf);
    }
    addToast({
      type: 'success',
      title: 'Profile Updated',
      message: 'Your personal health metrics & emergency contact settings were saved.',
    });
  };

  const loginDemo = (role: 'Patient' | 'Doctor' | 'Admin') => {
    const demoProfile: UserProfile = {
      ...userProfile,
      fullName: role === 'Doctor' ? 'Dr. Sarah Jenkins, MD' : role === 'Admin' ? 'System Administrator' : 'Alexander Vance',
      role: role,
    };
    setUserProfile(demoProfile);
    addToast({
      type: 'success',
      title: `${role} Portal Active`,
      message: `Switched to ${demoProfile.fullName} [${role} Privileges].`,
    });
    setCurrentPage('dashboard');
  };

  const handleLogout = async () => {
    await auth.logout();
    setCurrentPage('landing');
    addToast({
      type: 'info',
      title: 'Signed Out',
      message: 'You have been safely signed out of MediGuard AI.',
    });
  };

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

        authUser: auth.user,
        authEmail: auth.user?.email || userProfile.email,
        isAuthenticated: auth.isAuthenticated,
        userRole: (userProfile.role as any) || 'Patient',
        isEmailVerified: true,
        authLoading: auth.isLoading,
        signInWithGoogle: auth.signInWithGoogle,
        logout: handleLogout,
        loginDemo,
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
