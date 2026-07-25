import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Stethoscope,
  Pill,
  Sparkles,
  Upload,
  FileCheck2,
  BarChart3,
  Activity,
  Database,
  UserCheck,
  ShieldAlert,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  HardDrive,
  Cpu,
  Server,
  Layers,
  FileText,
  Trash2,
  Edit,
  Eye,
  RefreshCw,
  Download,
  Settings,
  ChevronRight,
  X,
  Lock,
  Unlock,
  Building,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Medicine, Doctor, Prescription, UserProfile } from '../types';
import { Badge } from '../components/common/Badge';

export const AdminDashboardPage: React.FC = () => {
  const {
    prescriptions,
    medicines,
    aiReports,
    userProfile,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'analytics' | 'patients' | 'doctors' | 'medicines' | 'ailogs' | 'uploads' | 'reports' | 'roles'
  >('analytics');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock Admin Patients state
  const [adminPatients, setAdminPatients] = useState([
    {
      id: 'usr-90210',
      fullName: 'Alexander Vance',
      email: 'alexander.vance@mediguard.ai',
      patientId: 'MG-8849-2026',
      age: 34,
      bloodGroup: 'O+',
      prescriptionsCount: 3,
      status: 'Active',
      joinedDate: '2024-03-15',
    },
    {
      id: 'usr-90211',
      fullName: 'Sophia Martinez',
      email: 'sophia.m@example.com',
      patientId: 'MG-9102-2026',
      age: 29,
      bloodGroup: 'A+',
      prescriptionsCount: 2,
      status: 'Active',
      joinedDate: '2024-05-20',
    },
    {
      id: 'usr-90212',
      fullName: 'David Chen',
      email: 'david.chen@healthmail.com',
      patientId: 'MG-4412-2026',
      age: 52,
      bloodGroup: 'B-',
      prescriptionsCount: 5,
      status: 'Active',
      joinedDate: '2024-01-10',
    },
    {
      id: 'usr-90213',
      fullName: 'Emma Watson',
      email: 'e.watson@medicalnet.org',
      patientId: 'MG-3301-2026',
      age: 41,
      bloodGroup: 'AB+',
      prescriptionsCount: 1,
      status: 'Suspended',
      joinedDate: '2024-06-11',
    },
  ]);

  // Mock Admin Doctors state
  const [adminDoctors, setAdminDoctors] = useState<Doctor[]>([
    {
      id: 'doc-001',
      fullName: 'Dr. Sarah Jenkins, MD',
      specialty: 'Cardiologist',
      hospital: 'St. Jude General Hospital',
      licenseNumber: 'MD-NY-884910',
      phone: '+1 (555) 321-7654',
      email: 's.jenkins@stjudehospital.org',
      avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=250',
    },
    {
      id: 'doc-002',
      fullName: 'Dr. Michael Chang, MD',
      specialty: 'Pulmonologist & Internal Med',
      hospital: 'Central Health Medical Center',
      licenseNumber: 'MD-CA-992104',
      phone: '+1 (555) 432-8765',
      email: 'm.chang@centralhealth.org',
      avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=250',
    },
    {
      id: 'doc-003',
      fullName: 'Dr. Robert Miller, PharmD',
      specialty: 'Clinical Pharmacologist',
      hospital: 'Metropolitan Medical Center',
      licenseNumber: 'PH-TX-102938',
      phone: '+1 (555) 876-5432',
      email: 'r.miller@metromedical.org',
      avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=250',
    },
  ]);

  // Mock AI OCR & Vision Logs
  const [aiLogs, setAiLogs] = useState([
    {
      id: 'log-8801',
      timestamp: '2026-07-25 04:45:12',
      model: 'Gemini 2.5 Flash Vision',
      prescriptionCode: 'RX-88492',
      patientName: 'Alexander Vance',
      tokensUsed: 1420,
      confidenceScore: 98.4,
      latencyMs: 840,
      status: 'Success',
      warningsCount: 0,
    },
    {
      id: 'log-8802',
      timestamp: '2026-07-25 02:10:05',
      model: 'Gemini 2.5 Flash Vision',
      prescriptionCode: 'RX-99201',
      patientName: 'Sophia Martinez',
      tokensUsed: 1890,
      confidenceScore: 94.1,
      latencyMs: 1120,
      status: 'Success',
      warningsCount: 1,
    },
    {
      id: 'log-8803',
      timestamp: '2026-07-24 21:15:40',
      model: 'Gemini 2.5 Flash Vision',
      prescriptionCode: 'RX-44129',
      patientName: 'David Chen',
      tokensUsed: 980,
      confidenceScore: 89.6,
      latencyMs: 950,
      status: 'Flagged',
      warningsCount: 2,
    },
    {
      id: 'log-8804',
      timestamp: '2026-07-24 18:30:22',
      model: 'Gemini 2.5 Flash Vision',
      prescriptionCode: 'RX-33018',
      patientName: 'Emma Watson',
      tokensUsed: 2100,
      confidenceScore: 97.8,
      latencyMs: 780,
      status: 'Success',
      warningsCount: 0,
    },
  ]);

  // Storage & System Health Metrics
  const systemMetrics = {
    cpuUsage: 18.4, // %
    ramUsage: 42.1, // %
    apiLatency: 124, // ms
    uptime: '99.98%',
    activeConnections: 14,
    dbConnectionStatus: 'Healthy (Supabase PostgreSQL)',
    storageUsedGB: 4.28,
    storageLimitGB: 20.0,
    totalUploads: 148,
  };

  // DAU Activity Data
  const dauChart = [
    { day: 'Mon', activeUsers: 342, uploads: 28 },
    { day: 'Tue', activeUsers: 412, uploads: 35 },
    { day: 'Wed', activeUsers: 389, uploads: 31 },
    { day: 'Thu', activeUsers: 495, uploads: 42 },
    { day: 'Fri', activeUsers: 530, uploads: 49 },
    { day: 'Sat', activeUsers: 280, uploads: 19 },
    { day: 'Sun', activeUsers: 310, uploads: 22 },
  ];

  // Role Management State
  const [usersRoles, setUsersRoles] = useState([
    { id: 'u1', name: 'Alexander Vance', email: 'alexander.vance@mediguard.ai', role: 'Patient', canUpload: true, canViewReports: true, isAdmin: false },
    { id: 'u2', name: 'Dr. Sarah Jenkins', email: 's.jenkins@stjudehospital.org', role: 'Doctor', canUpload: true, canViewReports: true, isAdmin: true },
    { id: 'u3', name: 'Dr. Robert Miller', email: 'r.miller@metromedical.org', role: 'Pharmacist', canUpload: true, canViewReports: true, isAdmin: false },
    { id: 'u4', name: 'System Admin Root', email: 'admin@mediguard.ai', role: 'Admin', canUpload: true, canViewReports: true, isAdmin: true },
  ]);

  // Modal / Form States
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [showAddMedicineModal, setShowAddMedicineModal] = useState(false);
  const [selectedLogJson, setSelectedLogJson] = useState<any | null>(null);

  // New Doctor Form State
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    specialty: 'Cardiology',
    hospital: '',
    licenseNumber: '',
    phone: '',
    email: '',
    availability: 'Mon - Fri (09:00 AM - 05:00 PM)',
  });

  // New Medicine Form State
  const [newMed, setNewMed] = useState({
    medicineName: '',
    dosage: '',
    category: 'General Therapeutics',
    purpose: '',
    sideEffects: '',
    warnings: '',
  });

  // Handle Add Doctor
  const handleAddDoctorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoctor.name || !newDoctor.licenseNumber) {
      addToast({ type: 'error', title: 'Incomplete Form', message: 'Doctor name and license number are required.' });
      return;
    }
    const created: Doctor = {
      id: `doc-${Date.now()}`,
      fullName: newDoctor.name,
      specialty: newDoctor.specialty,
      hospital: newDoctor.hospital,
      licenseNumber: newDoctor.licenseNumber,
      phone: newDoctor.phone || '+1 (555) 000-0000',
      email: newDoctor.email || 'doctor@mediguard.ai',
      avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=250',
    };
    setAdminDoctors([created, ...adminDoctors]);
    setShowAddDoctorModal(false);
    setNewDoctor({ name: '', specialty: 'Cardiology', hospital: '', licenseNumber: '', phone: '', email: '', availability: 'Mon - Fri (09:00 AM - 05:00 PM)' });
    addToast({ type: 'success', title: 'Doctor Added', message: `${created.fullName} added to provider database.` });
  };

  // Handle Add Medicine
  const handleAddMedicineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMed.medicineName || !newMed.dosage) {
      addToast({ type: 'error', title: 'Incomplete Form', message: 'Medicine name and dosage are required.' });
      return;
    }
    const created: Medicine = {
      id: `m-${Date.now()}`,
      name: newMed.medicineName,
      genericName: newMed.medicineName,
      dosage: newMed.dosage,
      frequency: 'Once daily',
      category: (newMed.category as any) || 'General Therapeutics',
      purpose: newMed.purpose || 'Prescribed therapy',
      sideEffects: newMed.sideEffects ? newMed.sideEffects.split(',').map((s) => s.trim()) : ['Mild nausea'],
      foodInstructions: 'Take with water',
      safetyRating: 'A',
    };
    setShowAddMedicineModal(false);
    setNewMed({ medicineName: '', dosage: '', category: 'General Therapeutics', purpose: '', sideEffects: '', warnings: '' });
    addToast({ type: 'success', title: 'Medicine Created', message: `${created.name} added to pharmaceutical catalog.` });
  };

  // Filtered lists
  const filteredPatients = useMemo(() => {
    return adminPatients.filter((p) => {
      const matchSearch = p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || p.patientId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'all' || p.status.toLowerCase() === statusFilter.toLowerCase();
      return matchSearch && matchStatus;
    });
  }, [adminPatients, searchTerm, statusFilter]);

  const filteredDoctors = useMemo(() => {
    return adminDoctors.filter((d) => d.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || d.specialty.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [adminDoctors, searchTerm]);

  const filteredMedicines = useMemo(() => {
    return medicines.filter((m) => m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.category.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [medicines, searchTerm]);

  return (
    <div className="space-y-8 pb-16 font-sans max-w-7xl mx-auto">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold mb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
            <span>Master System Administration</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            MediGuard Admin & Operations Control
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Real-time infrastructure diagnostics, patient/doctor directories, AI OCR vision logs, storage analytics, and role permissions matrix.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              addToast({ type: 'info', title: 'Cache Refreshed', message: 'System metrics and logs updated.' });
            }}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl backdrop-blur-md border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-purple-300" />
            <span>Refresh Diagnostics</span>
          </button>
        </div>
      </div>

      {/* KEY METRIC CARDS (System Health, Storage, DAU, Uploads) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: System Health & Latency */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">System Uptime</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Server className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">{systemMetrics.uptime}</div>
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-1">
            <span>API Latency: <strong className="text-emerald-600 font-bold">{systemMetrics.apiLatency}ms</strong></span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">Online</span>
          </div>
        </div>

        {/* KPI 2: Storage Usage */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Storage Usage</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <HardDrive className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {systemMetrics.storageUsedGB} GB <span className="text-xs font-normal text-slate-400">/ {systemMetrics.storageLimitGB} GB</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1">
            <div
              className="bg-blue-600 h-full rounded-full"
              style={{ width: `${(systemMetrics.storageUsedGB / systemMetrics.storageLimitGB) * 100}%` }}
            />
          </div>
        </div>

        {/* KPI 3: Daily Active Users */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Daily Active Users</span>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">530 DAU</div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.2% vs last week</span>
          </div>
        </div>

        {/* KPI 4: Total Prescriptions Processed */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Prescription Scans</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">{prescriptions.length + 140}</div>
          <div className="text-xs text-slate-500 font-medium">
            AI Parsing Accuracy Rate: <strong className="text-slate-900 font-bold">98.2%</strong>
          </div>
        </div>
      </div>

      {/* MAIN ADMIN NAVIGATION TABS */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 min-w-max">
          {[
            { id: 'analytics', label: 'Analytics & System Health', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'patients', label: `Patients (${adminPatients.length})`, icon: <Users className="w-4 h-4" /> },
            { id: 'doctors', label: `Doctors (${adminDoctors.length})`, icon: <Stethoscope className="w-4 h-4" /> },
            { id: 'medicines', label: `Medicines (${medicines.length})`, icon: <Pill className="w-4 h-4" /> },
            { id: 'ailogs', label: `AI Vision Logs (${aiLogs.length})`, icon: <Sparkles className="w-4 h-4" /> },
            { id: 'uploads', label: 'Recent Uploads', icon: <Upload className="w-4 h-4" /> },
            { id: 'reports', label: `Reports (${aiReports.length})`, icon: <FileCheck2 className="w-4 h-4" /> },
            { id: 'roles', label: 'Role Management', icon: <UserCheck className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: ANALYTICS & SYSTEM HEALTH */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* System Health & Hardware Diagnostics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Health Diagnostic Box */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-purple-600" />
                  <h3 className="text-base font-black text-slate-900">System Health & Resource Monitor</h3>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                  Operational
                </span>
              </div>

              <div className="space-y-4">
                {/* CPU Utilization */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600">Container CPU Utilization</span>
                    <span className="text-slate-900">{systemMetrics.cpuUsage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-purple-600 h-full rounded-full" style={{ width: `${systemMetrics.cpuUsage}%` }} />
                  </div>
                </div>

                {/* RAM Allocation */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600">RAM Memory Allocation</span>
                    <span className="text-slate-900">{systemMetrics.ramUsage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${systemMetrics.ramUsage}%` }} />
                  </div>
                </div>

                {/* Database Connection */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-bold text-slate-900">Database Cluster</div>
                      <div className="text-[11px] text-slate-500">{systemMetrics.dbConnectionStatus}</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded">
                    Latency 12ms
                  </span>
                </div>
              </div>
            </div>

            {/* DAU Chart Visualizer */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-black text-slate-900">Daily Active Users (DAU) & Uploads</h3>
                </div>
                <span className="text-xs text-slate-400 font-bold">Past 7 Days</span>
              </div>

              {/* Bar Graph Simulation */}
              <div className="pt-4 flex items-end justify-between gap-3 h-48 border-b border-slate-200/80 pb-2">
                {dauChart.map((d, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div className="w-full flex justify-center items-end gap-1 h-36">
                      <div
                        className="w-1/2 bg-blue-600 rounded-t-md hover:bg-blue-500 transition-all"
                        style={{ height: `${(d.activeUsers / 600) * 100}%` }}
                        title={`${d.activeUsers} Active Users`}
                      />
                      <div
                        className="w-1/2 bg-purple-500 rounded-t-md hover:bg-purple-400 transition-all"
                        style={{ height: `${(d.uploads / 60) * 100}%` }}
                        title={`${d.uploads} Uploads`}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-slate-600">{d.day}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-6 text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-blue-600 inline-block" />
                  <span className="text-slate-600">Active Users (DAU)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-purple-500 inline-block" />
                  <span className="text-slate-600">Prescription Uploads</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PATIENTS MANAGEMENT */}
      {activeTab === 'patients' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search patient name or ID..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 text-slate-700"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase text-[10px] tracking-wider">
                  <th className="p-4">Patient Name</th>
                  <th className="p-4">Medical ID</th>
                  <th className="p-4">Age / Blood</th>
                  <th className="p-4">Prescriptions</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="font-extrabold text-slate-900">{patient.fullName}</div>
                      <div className="text-[11px] text-slate-400">{patient.email}</div>
                    </td>
                    <td className="p-4 font-mono font-bold text-blue-600">{patient.patientId}</td>
                    <td className="p-4">{patient.age}y • {patient.bloodGroup}</td>
                    <td className="p-4 font-bold">{patient.prescriptionsCount} Rx records</td>
                    <td className="p-4 text-slate-500">{patient.joinedDate}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                          patient.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {patient.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setAdminPatients((prev) =>
                            prev.map((p) =>
                              p.id === patient.id
                                ? { ...p, status: p.status === 'Active' ? 'Suspended' : 'Active' }
                                : p
                            )
                          );
                          addToast({
                            type: 'info',
                            title: 'Status Updated',
                            message: `${patient.fullName} status updated.`,
                          });
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        Toggle Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DOCTORS MANAGEMENT */}
      {activeTab === 'doctors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="relative w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search doctors or specialties..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-none"
              />
            </div>

            <button
              onClick={() => setShowAddDoctorModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Doctor</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDoctors.map((doc) => (
              <div key={doc.id} className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{doc.fullName}</h4>
                    <span className="text-xs font-bold text-blue-600">{doc.specialty}</span>
                  </div>
                  <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    <Stethoscope className="w-4 h-4" />
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-600 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{doc.hospital}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono text-[11px] text-slate-700">License: {doc.licenseNumber}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px] text-slate-500 font-medium">
                  Email: {doc.email} • Phone: {doc.phone}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: MEDICINES CATALOG */}
      {activeTab === 'medicines' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="relative w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search medicine catalog..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-none"
              />
            </div>

            <button
              onClick={() => setShowAddMedicineModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Medicine to Catalog</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase text-[10px] tracking-wider">
                  <th className="p-4">Medicine Name</th>
                  <th className="p-4">Dosage Form</th>
                  <th className="p-4">Therapeutic Category</th>
                  <th className="p-4">Clinical Purpose</th>
                  <th className="p-4">Primary Side Effects</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredMedicines.map((med) => (
                  <tr key={med.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-black text-slate-900">{med.name}</td>
                    <td className="p-4 font-bold text-blue-600">{med.dosage}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {med.category}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 max-w-xs truncate">{med.purpose}</td>
                    <td className="p-4 text-slate-500">{med.sideEffects.slice(0, 2).join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: AI VISION LOGS */}
      {activeTab === 'ailogs' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-sm font-black text-slate-900">Vision AI OCR Execution Stream</h4>
              <span className="text-xs text-slate-400 font-bold">Model: Gemini 2.5 Flash</span>
            </div>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase text-[10px] tracking-wider">
                  <th className="p-4">Log ID & Time</th>
                  <th className="p-4">Prescription</th>
                  <th className="p-4">Tokens Used</th>
                  <th className="p-4">Confidence %</th>
                  <th className="p-4">Latency</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Raw Output</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {aiLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="font-mono font-bold text-slate-900">{log.id}</div>
                      <div className="text-[10px] text-slate-400">{log.timestamp}</div>
                    </td>
                    <td className="p-4 font-bold text-blue-600">{log.prescriptionCode}</td>
                    <td className="p-4 font-mono">{log.tokensUsed} tokens</td>
                    <td className="p-4">
                      <span className="font-black text-emerald-600">{log.confidenceScore}%</span>
                    </td>
                    <td className="p-4 text-slate-600">{log.latencyMs}ms</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          log.status === 'Success'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedLogJson(log)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> View JSON
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: UPLOADS */}
      {activeTab === 'uploads' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <h3 className="text-base font-black text-slate-900">Recent Prescription Image Uploads</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {prescriptions.map((rx) => (
              <div key={rx.id} className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50 space-y-3">
                <img src={rx.imageUrl} alt={rx.code} className="w-full h-32 object-cover rounded-xl border border-slate-200" />
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-blue-600">{rx.code}</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    OCR Parsed
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Doctor: {rx.doctorName} • Date: {rx.date}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: REPORTS */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <h3 className="text-base font-black text-slate-900">Generated AI Health Reports Repository</h3>
          {aiReports.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <FileCheck2 className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs font-semibold">No AI reports generated in database yet.</p>
              <p className="text-[11px]">Reports created on the AI Health Report page will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {aiReports.map((rpt) => (
                <div key={rpt.id} className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-mono text-xs font-black text-blue-600">{rpt.id}</span>
                    <h4 className="text-xs font-bold text-slate-900">{rpt.title}</h4>
                    <p className="text-[10px] text-slate-500">Patient: {rpt.patientName} • Generated: {rpt.generatedAt}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-200">
                    Score: {rpt.safetyScore}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 8: ROLE MANAGEMENT */}
      {activeTab === 'roles' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900">User Roles & Access Control Matrix</h3>
              <p className="text-xs text-slate-500">Assign granular permissions for Administrators, Doctors, and Patients.</p>
            </div>
          </div>

          <div className="space-y-3">
            {usersRoles.map((user) => (
              <div key={user.id} className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-extrabold text-slate-900">{user.name}</div>
                  <div className="text-[11px] text-slate-500">{user.email}</div>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={user.role}
                    onChange={(e) => {
                      const newRole = e.target.value;
                      setUsersRoles((prev) =>
                        prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
                      );
                      addToast({
                        type: 'success',
                        title: 'Role Updated',
                        message: `${user.name} role changed to ${newRole}.`,
                      });
                    }}
                    className="bg-white border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-1.5 focus:outline-none"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Pharmacist">Pharmacist</option>
                    <option value="Patient">Patient</option>
                  </select>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                    user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD DOCTOR */}
      <AnimatePresence>
        {showAddDoctorModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900">Add Doctor Provider</h3>
                <button onClick={() => setShowAddDoctorModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddDoctorSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name & Title</label>
                  <input
                    type="text"
                    required
                    value={newDoctor.name}
                    onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                    placeholder="e.g. Dr. Sarah Jenkins, MD"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Specialty</label>
                    <input
                      type="text"
                      required
                      value={newDoctor.specialty}
                      onChange={(e) => setNewDoctor({ ...newDoctor, specialty: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Medical License #</label>
                    <input
                      type="text"
                      required
                      value={newDoctor.licenseNumber}
                      onChange={(e) => setNewDoctor({ ...newDoctor, licenseNumber: e.target.value })}
                      placeholder="e.g. MD-NY-99102"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hospital Affiliation</label>
                  <input
                    type="text"
                    required
                    value={newDoctor.hospital}
                    onChange={(e) => setNewDoctor({ ...newDoctor, hospital: e.target.value })}
                    placeholder="e.g. Central Health Medical Center"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddDoctorModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl">
                    Save Provider
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ADD MEDICINE */}
      <AnimatePresence>
        {showAddMedicineModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900">Add Medicine to Catalog</h3>
                <button onClick={() => setShowAddMedicineModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddMedicineSubmit} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Medicine Name</label>
                    <input
                      type="text"
                      required
                      value={newMed.medicineName}
                      onChange={(e) => setNewMed({ ...newMed, medicineName: e.target.value })}
                      placeholder="e.g. Amoxicillin"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Dosage Form</label>
                    <input
                      type="text"
                      required
                      value={newMed.dosage}
                      onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                      placeholder="e.g. 500mg Tablet"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Therapeutic Category</label>
                  <input
                    type="text"
                    required
                    value={newMed.category}
                    onChange={(e) => setNewMed({ ...newMed, category: e.target.value })}
                    placeholder="e.g. Antibiotics"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Clinical Purpose</label>
                  <input
                    type="text"
                    value={newMed.purpose}
                    onChange={(e) => setNewMed({ ...newMed, purpose: e.target.value })}
                    placeholder="e.g. Bacterial infection treatment"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddMedicineModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl">
                    Save to Catalog
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: VIEW RAW LOG JSON */}
      <AnimatePresence>
        {selectedLogJson && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 text-slate-100 rounded-3xl p-6 w-full max-w-xl shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-black text-white">AI Vision Execution Log: {selectedLogJson.id}</h3>
                <button onClick={() => setSelectedLogJson(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <pre className="p-4 bg-slate-950 rounded-2xl text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-80">
                {JSON.stringify(selectedLogJson, null, 2)}
              </pre>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedLogJson(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs"
                >
                  Close Viewer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
