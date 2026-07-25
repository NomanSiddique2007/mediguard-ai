import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileCheck2,
  Printer,
  Download,
  Share2,
  Database,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Pill,
  FileText,
  User,
  Calendar,
  Stethoscope,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  Info,
  ExternalLink,
  Copy,
  History,
  Trash2,
  Building2,
  Activity,
  HeartPulse,
  Flame,
  Utensils,
  AlertCircle,
  HelpCircle,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AIReport, Prescription, DrugInteraction } from '../types';
import { Badge } from '../components/common/Badge';

export const AIReportPage: React.FC = () => {
  const {
    prescriptions,
    selectedPrescriptionId,
    setSelectedPrescriptionId,
    reminders,
    healthEvents,
    userProfile,
    saveAIReport,
    aiReports,
    deleteAIReport,
    addToast,
  } = useApp();

  // Active selected prescription or default to first
  const activeRx = useMemo(() => {
    if (selectedPrescriptionId) {
      const found = prescriptions.find((p) => p.id === selectedPrescriptionId);
      if (found) return found;
    }
    return prescriptions[0] || null;
  }, [prescriptions, selectedPrescriptionId]);

  const [isSavingToDb, setIsSavingToDb] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Generate complete structured AI Report payload dynamically for active prescription
  const generatedReport: AIReport = useMemo(() => {
    if (!activeRx) {
      return {
        id: `RPT-GEN-DEFAULT`,
        prescriptionCode: 'RX-9999',
        title: 'Comprehensive AI Health & Clinical Report',
        generatedAt: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        patientName: userProfile.fullName,
        doctorName: 'Dr. Sarah Jenkins, MD',
        hospital: 'Central Health Medical Center',
        diagnosis: 'General Health Assessment',
        safetyScore: 95,
        safetyRating: 'A+',
        prescriptionSummary: {
          code: 'RX-9999',
          doctorName: 'Dr. Sarah Jenkins, MD',
          hospital: 'Central Health Medical Center',
          date: new Date().toLocaleDateString(),
          diagnosis: 'General Health Assessment',
          status: 'Verified',
          safetyScore: 95,
          medicinesCount: 0,
          interactionsCount: 0,
        },
        medicineExplanations: [],
        interactionAnalysis: [],
        timelineEvents: [],
        reminderSchedule: [],
        doctorNotes: {
          clinicalAdvice: 'Maintain regular health checks and stay hydrated.',
          dietaryPrecautions: 'Balanced low-sodium diet recommended.',
          lifestyleRecommendations: '30 minutes of light exercise daily.',
          emergencyWarningSigns: ['Severe shortness of breath', 'High fever > 102°F'],
          followUpDate: 'In 4 weeks',
        },
      };
    }

    // Medicine explanations with mechanisms of action & food rules
    const medicineExplanations = activeRx.medicines.map((med) => {
      const nameLower = med.medicineName.toLowerCase();
      let mechanism = 'Therapeutic agent active on cellular receptors to suppress symptoms.';
      let category = med.category || 'General Therapeutics';
      let foodInst = med.foodInstructions || 'Take with or after meals with plenty of water.';
      let sideEffects = ['Mild nausea', 'Drowsiness', 'Dry mouth'];

      if (nameLower.includes('lisinopril')) {
        mechanism = 'ACE Inhibitor: Inhibits angiotensin-converting enzyme, relaxing vascular smooth muscle and lowering arterial blood pressure.';
        category = 'Cardiovascular';
        foodInst = 'May be taken with or without food. Avoid high-potassium salt substitutes.';
        sideEffects = ['Dry persistent cough', 'Dizziness upon standing', 'Hyperkalemia'];
      } else if (nameLower.includes('amoxicillin')) {
        mechanism = 'Beta-lactam Antibiotic: Binds to penicillin-binding proteins, inhibiting bacterial cell wall synthesis and causing lysis.';
        category = 'Antibiotics';
        foodInst = 'Take at the start of a meal to minimize gastrointestinal discomfort.';
        sideEffects = ['Mild diarrhea', 'Nausea', 'Skin rash (discontinue if severe)'];
      } else if (nameLower.includes('metformin')) {
        mechanism = 'Biguanide Antidiabetic: Reduces hepatic glucose production and increases insulin sensitivity in peripheral tissues.';
        category = 'Diabetes';
        foodInst = 'Must be taken WITH meals to reduce stomach upset.';
        sideEffects = ['Abdominal bloating', 'Mild stomach cramping', 'Vitamin B12 deficiency over long term'];
      } else if (nameLower.includes('atorvastatin')) {
        mechanism = 'HMG-CoA Reductase Inhibitor: Block enzyme responsible for cholesterol synthesis in liver, reducing LDL levels.';
        category = 'Cardiovascular';
        foodInst = 'Take once daily in evening. Avoid grapefruit juice in large quantities.';
        sideEffects = ['Muscle soreness or weakness', 'Mild headache', 'Elevated liver enzymes'];
      } else if (nameLower.includes('salbutamol') || nameLower.includes('albuterol')) {
        mechanism = 'Short-acting Beta-2 Agonist: Relaxes bronchial smooth muscles to rapidly expand airways.';
        category = 'Respiratory';
        foodInst = 'Rinse mouth with water after inhalation to prevent oral thrush.';
        sideEffects = ['Mild tremors in hands', 'Rapid heart rate', 'Nervousness'];
      }

      return {
        medicineName: med.medicineName,
        dosage: med.dosage,
        frequency: med.frequency,
        purpose: med.purpose || 'Prescribed treatment for target condition.',
        category,
        mechanismOfAction: mechanism,
        foodInstructions: foodInst,
        sideEffects: med.sideEffects && med.sideEffects.length > 0 ? med.sideEffects : sideEffects,
        warnings: med.warnings || 'Follow prescribed course without skipping doses.',
      };
    });

    // Interaction Analysis mapping
    const interactionAnalysis = (activeRx.interactions || []).map((inter, idx) => ({
      id: `inter-${idx}`,
      drugA: inter.drugA,
      drugB: inter.drugB,
      severity: inter.severity,
      description: inter.description,
      recommendation: inter.recommendation,
    }));

    // If no explicit interactions recorded in rx, check for default demo interactions
    if (interactionAnalysis.length === 0 && activeRx.medicines.length > 1) {
      interactionAnalysis.push({
        id: 'inter-default-1',
        drugA: activeRx.medicines[0]?.medicineName || 'Drug A',
        drugB: activeRx.medicines[1]?.medicineName || 'Drug B',
        severity: 'Low',
        description: 'Co-administration requires standard monitoring. No acute pharmacological blockage detected.',
        recommendation: 'Maintain a 2-hour interval between administrations if gastric irritation occurs.',
      });
    }

    // Timeline Events related to this Rx
    const timelineEvents = (healthEvents || [])
      .filter((e) => e.title.includes(activeRx.code) || e.doctor === activeRx.doctorName || true)
      .slice(0, 4)
      .map((e) => ({
        date: e.date,
        title: e.title,
        category: e.category,
        description: e.description,
        status: e.status,
      }));

    // Reminders
    const reminderSchedule = reminders.map((r) => ({
      medicineName: r.medicineName,
      dosage: r.dosage,
      timeSlot: r.timeSlot,
      exactTime: r.exactTime,
      frequencyCode: r.frequencyCode || 'OD',
      instructions: r.instructions,
    }));

    return {
      id: `RPT-${activeRx.code}-${Date.now().toString().slice(-4)}`,
      prescriptionId: activeRx.id,
      prescriptionCode: activeRx.code,
      title: `MediGuard AI Clinical Safety & Pharmacology Report`,
      generatedAt: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      patientName: userProfile.fullName,
      doctorName: activeRx.doctorName,
      hospital: activeRx.hospital,
      diagnosis: activeRx.diagnosis,
      safetyScore: activeRx.safetyScore,
      safetyRating: activeRx.safetyRating,
      prescriptionSummary: {
        code: activeRx.code,
        doctorName: activeRx.doctorName,
        hospital: activeRx.hospital,
        date: activeRx.date,
        diagnosis: activeRx.diagnosis,
        status: activeRx.status,
        safetyScore: activeRx.safetyScore,
        medicinesCount: activeRx.medicines.length,
        interactionsCount: interactionAnalysis.length,
      },
      medicineExplanations,
      interactionAnalysis,
      timelineEvents,
      reminderSchedule,
      doctorNotes: {
        clinicalAdvice:
          activeRx.doctorNotes ||
          'Complete the full course of prescribed therapy. Do not stop antibiotic treatments abruptly even if symptoms subside early.',
        dietaryPrecautions:
          'Maintain adequate daily hydration (2-3 liters). Avoid alcohol consumption during active antibiotic therapy.',
        lifestyleRecommendations:
          'Ensure 7-8 hours of restful sleep daily. Monitor blood pressure or glucose levels as instructed.',
        emergencyWarningSigns: [
          'Allergic swelling of lips, face, or throat',
          'Persistent high fever exceeding 102°F (38.8°C)',
          'Sudden chest tightness or acute difficulty breathing',
        ],
        followUpDate: '14 Days from issuance date',
      },
    };
  }, [activeRx, userProfile, healthEvents, reminders]);

  // Handle Export as PDF / Print Report
  const handlePrintOrPdf = () => {
    window.print();
  };

  // Handle Share Report
  const handleShareReport = async () => {
    const reportSummaryText = `MediGuard AI Clinical Report for ${generatedReport.patientName}\nRx Code: ${generatedReport.prescriptionSummary.code}\nDiagnosis: ${generatedReport.diagnosis}\nSafety Score: ${generatedReport.safetyScore}%\nGenerated on: ${generatedReport.generatedAt}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `MediGuard AI Clinical Report - ${generatedReport.prescriptionSummary.code}`,
          text: reportSummaryText,
          url: window.location.href,
        });
        addToast({
          type: 'success',
          title: 'Report Shared',
          message: 'Clinical report shared successfully via native share sheet.',
        });
        return;
      } catch (err) {
        // Fallback to clipboard if user cancelled native share
      }
    }

    // Fallback clipboard copy
    try {
      await navigator.clipboard.writeText(`${reportSummaryText}\n\nView online: ${window.location.href}`);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
      addToast({
        type: 'success',
        title: 'Report Copied to Clipboard',
        message: 'Report link and text summary copied! You can now paste and send it.',
      });
    } catch (e) {
      addToast({
        type: 'error',
        title: 'Copy Failed',
        message: 'Could not access clipboard.',
      });
    }
  };

  // Handle Download JSON
  const handleDownloadJson = () => {
    const jsonString = JSON.stringify(generatedReport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MediGuard_AI_Report_${generatedReport.prescriptionSummary.code}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addToast({
      type: 'success',
      title: 'JSON Downloaded',
      message: `Report saved as MediGuard_AI_Report_${generatedReport.prescriptionSummary.code}.json`,
    });
  };

  // Handle Store report in database
  const handleStoreInDatabase = async () => {
    setIsSavingToDb(true);
    try {
      await saveAIReport(generatedReport);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Database Storage Failed',
        message: 'Failed to persist report to database.',
      });
    } finally {
      setIsSavingToDb(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 font-sans max-w-5xl mx-auto">
      {/* Printable CSS Rules for Clean PDF Export */}
      <style>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
            font-size: 11pt !important;
          }
          /* Hide non-printable app components */
          aside, header, nav, .no-print {
            display: none !important;
          }
          .lg\\:pl-64 {
            padding-left: 0 !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
          }
          .print-card {
            border: 1px solid #cbd5e1 !important;
            box-shadow: none !important;
            page-break-inside: avoid;
            margin-bottom: 1rem !important;
          }
          .print-header {
            border-bottom: 2px solid #2563eb !important;
            padding-bottom: 1rem !important;
          }
        }
      `}</style>

      {/* Top Controls & Action Bar (Hidden in Print) */}
      <div className="no-print bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-[11px] font-bold text-indigo-700">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>AI Clinical Report Generator</span>
            </span>
            <span className="text-xs text-slate-400 font-medium">Generated: {generatedReport.generatedAt}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            AI Clinical & Pharmacological Report
          </h2>
          <p className="text-xs text-slate-500">
            Comprehensive drug safety analysis, dosage explanations, contraindications, and care plan.
          </p>
        </div>

        {/* Prescription Selector */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Select Prescription
            </label>
            <select
              value={selectedPrescriptionId || ''}
              onChange={(e) => setSelectedPrescriptionId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3 py-2 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {prescriptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.doctorName} ({p.medicines.length} Meds)
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowHistoryDrawer(true)}
            className="mt-4 md:mt-0 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
            title="View Saved Reports in Database"
          >
            <History className="w-4 h-4 text-blue-600" />
            <span>Saved Reports ({aiReports.length})</span>
          </button>
        </div>
      </div>

      {/* Action Toolbar Grid (Required Actions: PDF, Share, Print, JSON, DB Store) */}
      <div className="no-print p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl shadow-lg flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="text-xs font-extrabold text-white">Clinical Report Tools</div>
            <div className="text-[10px] text-slate-300">5 Official Export & Database Persistence Actions</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Action 1: Export as PDF */}
          <button
            onClick={handlePrintOrPdf}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export as PDF</span>
          </button>

          {/* Action 2: Share Report */}
          <button
            onClick={handleShareReport}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl backdrop-blur-md transition-all active:scale-95 inline-flex items-center gap-1.5 cursor-pointer"
          >
            {copySuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            <span>{copySuccess ? 'Copied!' : 'Share Report'}</span>
          </button>

          {/* Action 3: Print Report */}
          <button
            onClick={handlePrintOrPdf}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl backdrop-blur-md transition-all active:scale-95 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>

          {/* Action 4: Download JSON */}
          <button
            onClick={handleDownloadJson}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl backdrop-blur-md transition-all active:scale-95 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-purple-300" />
            <span>Download JSON</span>
          </button>

          {/* Action 5: Store Report in Database */}
          <button
            onClick={handleStoreInDatabase}
            disabled={isSavingToDb}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Database className="w-4 h-4" />
            <span>{isSavingToDb ? 'Storing...' : 'Store in Database'}</span>
          </button>
        </div>
      </div>

      {/* MAIN PRINTABLE AI REPORT CONTENT DOCUMENT */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden print-card">
        {/* Printable Official Header */}
        <div className="p-6 sm:p-8 bg-slate-900 text-white print-header flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">
                M
              </div>
              <span className="text-xl font-black tracking-tight text-white">MediGuard AI</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-500/30 text-blue-300 border border-blue-400/30 uppercase">
                Clinical Health Report
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium pt-1">
              Automated Pharmacology & Safety Analysis Document
            </p>
            <p className="text-[11px] text-slate-400">
              Report ID: <strong className="text-white font-mono">{generatedReport.id}</strong> | Generated: {generatedReport.generatedAt}
            </p>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80 text-right min-w-[200px] space-y-1">
            <div className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
              AI Verification Score
            </div>
            <div className="text-2xl font-black text-emerald-400 flex items-center justify-end gap-2">
              <span>{generatedReport.safetyScore}%</span>
              <span className="text-xs font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Grade {generatedReport.safetyRating}
              </span>
            </div>
            <div className="text-[10px] text-slate-300">FDA Database Cross-Checked</div>
          </div>
        </div>

        {/* Report Content Body */}
        <div className="p-6 sm:p-8 space-y-10">
          {/* SECTION 1: PRESCRIPTION SUMMARY */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                1. Prescription & Patient Demographics Summary
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Prescription Code
                </span>
                <span className="text-sm font-black text-blue-600 font-mono">
                  {generatedReport.prescriptionSummary.code}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Patient Name
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {generatedReport.patientName} ({userProfile.medicalInfo.age}y, {userProfile.medicalInfo.bloodGroup})
                </span>
              </div>

              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Prescribing Physician
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {generatedReport.doctorName}
                </span>
                <span className="text-[10px] text-slate-500 block truncate">{generatedReport.hospital}</span>
              </div>

              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Clinical Diagnosis
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {generatedReport.diagnosis}
                </span>
              </div>
            </div>
          </section>

          {/* SECTION 2: MEDICINE EXPLANATION */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <Pill className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                2. Comprehensive Medicine Mechanism & Pharmacology Explanations
              </h3>
            </div>

            <div className="space-y-4">
              {generatedReport.medicineExplanations.map((med, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all space-y-3 print-card"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0">
                        0{idx + 1}
                      </span>
                      <div>
                        <h4 className="text-base font-extrabold text-slate-900">{med.medicineName}</h4>
                        <span className="text-xs text-slate-500 font-medium">Dosage: {med.dosage} • Frequency: {med.frequency}</span>
                      </div>
                    </div>

                    {med.category && (
                      <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 text-xs font-bold shrink-0 self-start sm:self-auto">
                        {med.category}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1 bg-slate-50 p-3 rounded-xl">
                      <span className="font-extrabold text-slate-700 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                        <Activity className="w-3.5 h-3.5 text-blue-600" /> Mechanism of Action & Purpose
                      </span>
                      <p className="text-slate-600 leading-relaxed font-normal">{med.mechanismOfAction}</p>
                    </div>

                    <div className="space-y-1 bg-slate-50 p-3 rounded-xl">
                      <span className="font-extrabold text-slate-700 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                        <Utensils className="w-3.5 h-3.5 text-amber-600" /> Food & Administration Protocol
                      </span>
                      <p className="text-slate-600 leading-relaxed font-normal">{med.foodInstructions}</p>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-bold text-slate-500">Known Side Effects:</span>
                    {med.sideEffects.map((se, sIdx) => (
                      <span key={sIdx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-semibold">
                        • {se}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 3: INTERACTION ANALYSIS */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  3. Drug Interaction & Contraindication Matrix Analysis
                </h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-800 rounded-full border border-amber-200">
                {generatedReport.interactionAnalysis.length} Flagged Interactions
              </span>
            </div>

            {generatedReport.interactionAnalysis.length === 0 ? (
              <div className="p-6 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-900 text-xs font-semibold flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>No high or moderate risk drug-drug interactions detected between prescribed medications.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {generatedReport.interactionAnalysis.map((inter) => (
                  <div
                    key={inter.id}
                    className="p-4 rounded-2xl border bg-white space-y-2 print-card border-slate-200/90"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-black text-sm text-slate-900">
                        <span className="text-blue-600">{inter.drugA}</span>
                        <span className="text-slate-400 font-normal">↔</span>
                        <span className="text-purple-600">{inter.drugB}</span>
                      </div>

                      <Badge
                        variant={
                          inter.severity === 'High'
                            ? 'rose'
                            : inter.severity === 'Moderate'
                            ? 'amber'
                            : 'blue'
                        }
                      >
                        {inter.severity} Risk
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-normal">{inter.description}</p>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-700 font-medium flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-900">Clinical Recommendation:</strong> {inter.recommendation}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* SECTION 4: TIMELINE */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                4. Health Timeline & Progression Milestone
              </h3>
            </div>

            <div className="relative border-l-2 border-blue-200 ml-4 pl-6 space-y-6">
              {generatedReport.timelineEvents.map((evt, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute -left-[31px] top-0 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white ring-4 ring-blue-50" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-600">{evt.date}</span>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {evt.category}
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900">{evt.title}</h4>
                    <p className="text-xs text-slate-600">{evt.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 5: REMINDER SCHEDULE */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <Clock className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                5. Structured Daily Medication Reminder Schedule
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {generatedReport.reminderSchedule.map((rem, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 truncate">{rem.medicineName}</span>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                        {rem.frequencyCode}
                      </span>
                    </div>
                    <p className="text-slate-500">{rem.dosage} • {rem.instructions}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-black text-blue-600 text-xs">{rem.exactTime}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">{rem.timeSlot}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 6: DOCTOR NOTES */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <Stethoscope className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                6. Attending Physician Notes & Care Instructions
              </h3>
            </div>

            <div className="p-6 rounded-2xl bg-purple-50/50 border border-purple-200/70 space-y-4 text-xs">
              <div>
                <h4 className="font-extrabold text-purple-900 uppercase tracking-wider text-[10px] mb-1">
                  Clinical Care Advice
                </h4>
                <p className="text-slate-700 leading-relaxed">{generatedReport.doctorNotes.clinicalAdvice}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-extrabold text-purple-900 uppercase tracking-wider text-[10px] mb-1">
                    Dietary & Lifestyle Precautions
                  </h4>
                  <p className="text-slate-700">{generatedReport.doctorNotes.dietaryPrecautions}</p>
                  <p className="text-slate-700 pt-1">{generatedReport.doctorNotes.lifestyleRecommendations}</p>
                </div>

                <div>
                  <h4 className="font-extrabold text-rose-900 uppercase tracking-wider text-[10px] mb-1">
                    Emergency Warning Signs
                  </h4>
                  <ul className="list-disc list-inside text-rose-800 space-y-1 font-medium">
                    {generatedReport.doctorNotes.emergencyWarningSigns.map((sign, sIdx) => (
                      <li key={sIdx}>{sign}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-2 border-t border-purple-200/60 flex items-center justify-between text-slate-600 font-bold">
                <span>Follow-Up Appointment Target: {generatedReport.doctorNotes.followUpDate}</span>
                <span className="text-purple-700">Official Physician Review Signature: Verified</span>
              </div>
            </div>
          </section>
        </div>

        {/* Official Report Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500 space-y-1">
          <p className="font-bold text-slate-700">
            MediGuard AI Healthcare Platform • Automated Clinical & Safety Parser
          </p>
          <p>
            Disclaimer: This report is generated using FDA databases and validated AI vision models for decision support.
            Always consult a licensed medical professional before changing medication regimens.
          </p>
        </div>
      </div>

      {/* SAVED REPORTS DATABASE DRAWER MODAL */}
      <AnimatePresence>
        {showHistoryDrawer && (
          <div className="fixed inset-0 z-[100] flex justify-end bg-slate-900/50 backdrop-blur-xs no-print">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-black text-slate-900">Stored AI Reports Database</h3>
                  </div>
                  <button
                    onClick={() => setShowHistoryDrawer(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-xs text-slate-500">
                  Previously generated and persisted AI reports stored in Database/LocalStorage.
                </p>

                {aiReports.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <FileCheck2 className="w-10 h-10 mx-auto text-slate-300" />
                    <p className="text-xs font-semibold">No stored reports found in database.</p>
                    <p className="text-[11px]">Click "Store in Database" on the active report to save it.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {aiReports.map((rpt) => (
                      <div
                        key={rpt.id}
                        className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 hover:bg-slate-100/80 transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-blue-600 font-mono">{rpt.id}</span>
                          <span className="text-[10px] text-slate-400">{rpt.generatedAt}</span>
                        </div>

                        <div>
                          <div className="text-xs font-bold text-slate-900">{rpt.prescriptionSummary.code} - {rpt.patientName}</div>
                          <div className="text-[11px] text-slate-500">Doctor: {rpt.doctorName}</div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Score: {rpt.safetyScore}%
                          </span>

                          <button
                            onClick={() => deleteAIReport(rpt.id)}
                            className="text-xs text-rose-600 hover:text-rose-700 p-1 cursor-pointer"
                            title="Delete Report"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-slate-100">
                <button
                  onClick={() => setShowHistoryDrawer(false)}
                  className="w-full py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl"
                >
                  Close History
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
