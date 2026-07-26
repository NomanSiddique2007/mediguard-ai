import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { ToastContainer } from './components/common/ToastContainer';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { ProtectedRoute } from './components/common/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { UploadPrescriptionPage } from './pages/UploadPrescriptionPage';
import { PrescriptionHistoryPage } from './pages/PrescriptionHistoryPage';
import { PrescriptionDetailsPage } from './pages/PrescriptionDetailsPage';
import { MedicineLibraryPage } from './pages/MedicineLibraryPage';
import { HealthTimelinePage } from './pages/HealthTimelinePage';
import { MedicationReminderPage } from './pages/MedicationReminderPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { AIReportPage } from './pages/AIReportPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { NotFoundPage } from './pages/NotFoundPage';

const AppContent: React.FC = () => {
  const { currentPage, userRole } = useApp();

  // Public Fullscreen Pages (No Dashboard Sidebar/Header)
  if (currentPage === 'landing') return <LandingPage />;
  if (currentPage === 'login') return <LoginPage />;
  if (currentPage === '404') return <NotFoundPage />;

  // Page title mapping for Dashboard Header
  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard':
        return { title: `${userRole} Portal`, subtitle: 'Overview & Medication Safety' };
      case 'upload':
        return { title: 'Upload Prescription', subtitle: 'AI Vision OCR Laser Scan' };
      case 'history':
        return { title: 'Prescription History', subtitle: 'Scanned Scripts & FDA Verification' };
      case 'details':
        return { title: 'Prescription Details', subtitle: 'Scanned Document & Drug Breakdown' };
      case 'library':
        return { title: 'Medicine Library', subtitle: 'Pharmacology Database & Side Effects' };
      case 'timeline':
        return { title: 'Health Timeline', subtitle: 'Interactive Clinical History Chronicle' };
      case 'reminders':
        return { title: 'Medication Reminders', subtitle: 'Daily Dose Schedule & Adherence' };
      case 'report':
        return { title: 'AI Health Report', subtitle: 'Comprehensive Pharmacology, Safety Analysis & PDF Export' };
      case 'profile':
        return { title: 'User Profile', subtitle: 'Medical History & Patient Metrics' };
      case 'settings':
        return { title: 'Settings', subtitle: 'Notifications, AI Consent & Privacy' };
      case 'admin':
        return { title: 'Admin & Operations Control', subtitle: 'System Infrastructure, Directories, AI Logs & Permissions' };
      default:
        return { title: `${userRole} Portal`, subtitle: 'MediGuard AI Safety' };
    }
  };

  const pageHeader = getPageTitle();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50/60 font-sans text-slate-900 flex">
        {/* Dashboard Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-200">
          <Header title={pageHeader.title} subtitle={pageHeader.subtitle} />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {currentPage === 'dashboard' && <DashboardPage />}
            {currentPage === 'admin' && <AdminDashboardPage />}
            {currentPage === 'upload' && <UploadPrescriptionPage />}
            {currentPage === 'history' && <PrescriptionHistoryPage />}
            {currentPage === 'details' && <PrescriptionDetailsPage />}
            {currentPage === 'library' && <MedicineLibraryPage />}
            {currentPage === 'timeline' && <HealthTimelinePage />}
            {currentPage === 'reminders' && <MedicationReminderPage />}
            {currentPage === 'report' && <AIReportPage />}
            {currentPage === 'profile' && <UserProfilePage />}
            {currentPage === 'settings' && <SettingsPage />}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <AppContent />
          <ToastContainer />
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
