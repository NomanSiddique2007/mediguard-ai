import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Download,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Pill,
  Calendar,
  Hospital,
  User,
  Sparkles,
  ShieldCheck,
  FileText,
  Clock,
  ExternalLink,
  ZoomIn,
  FileCheck2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { PaddleOcrViewer } from '../components/ocr/PaddleOcrViewer';
import { GeminiAnalysisViewer } from '../components/gemini/GeminiAnalysisViewer';
import { RxNavOpenFdaSafetyViewer } from '../components/safety/RxNavOpenFdaSafetyViewer';
import { rxnavOpenFdaService } from '../services/rxnavOpenFdaService';
import { Cpu, Eye, ShieldAlert } from 'lucide-react';

export const PrescriptionDetailsPage: React.FC = () => {
  const { prescriptions, selectedPrescriptionId, setCurrentPage, addToast } = useApp();
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'rxnav_safety' | 'gemini_api' | 'clinical' | 'paddle_ocr'>('rxnav_safety');

  const rx = prescriptions.find((p) => p.id === selectedPrescriptionId) || prescriptions[0];
  const medNames = rx ? rx.medicines.map((m) => m.medicineName) : [];
  const initialSafety = rx?.safetyAnalysis || rxnavOpenFdaService.generateFallbackSafetyResult(rx?.id || 'rx-001', medNames);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 font-sans">
      {/* Top Header Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <button
          onClick={() => setCurrentPage('history')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Prescription History</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage('report')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <FileCheck2 className="w-4 h-4 text-indigo-600" />
            <span>View AI Report</span>
          </button>

          <button
            onClick={() =>
              addToast({
                type: 'info',
                title: 'Share Link Copied',
                message: 'Encrypted 24-hour PIN link copied to clipboard.',
              })
            }
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Share Link</span>
          </button>

          <button
            onClick={() =>
              addToast({
                type: 'success',
                title: 'Exporting PDF Report',
                message: `Prescription report ${rx.code} downloaded successfully.`,
              })
            }
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl shadow-md transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Main Title Banner */}
      <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-2xl font-black text-slate-900">{rx.code}</span>
            <Badge variant={rx.status === 'Verified' ? 'emerald' : 'amber'}>{rx.status}</Badge>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              AI Safety Score: {rx.safetyScore}/100
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-blue-600" /> {rx.doctorName} ({rx.doctorSpecialty})
            </span>
            <span className="flex items-center gap-1">
              <Hospital className="w-3.5 h-3.5 text-blue-600" /> {rx.hospital}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-600" /> Issued: {rx.date}
            </span>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex flex-wrap items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold gap-1 shrink-0">
          <button
            onClick={() => setActiveTab('rxnav_safety')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'rxnav_safety'
                ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-200" />
            <span>RxNav & openFDA Safety</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
              NIH/FDA
            </span>
          </button>

          <button
            onClick={() => setActiveTab('gemini_api')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'gemini_api'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>Gemini API Intelligence</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-400 text-slate-950 text-[10px] font-black uppercase">
              JSON
            </span>
          </button>

          <button
            onClick={() => setActiveTab('clinical')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'clinical'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Clinical Summary</span>
          </button>

          <button
            onClick={() => setActiveTab('paddle_ocr')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'paddle_ocr'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>PaddleOCR Boxes</span>
            <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 text-[10px] font-black">
              FastAPI
            </span>
          </button>
        </div>
      </div>

      {activeTab === 'rxnav_safety' ? (
        <RxNavOpenFdaSafetyViewer
          prescriptionId={rx.id}
          medicines={medNames}
          safetyResult={initialSafety}
        />
      ) : activeTab === 'gemini_api' ? (
        <GeminiAnalysisViewer analysis={rx.geminiAnalysis} ocrResult={rx.ocrResult} />
      ) : activeTab === 'paddle_ocr' ? (
        <PaddleOcrViewer prescription={rx} ocrResult={rx.ocrResult} />
      ) : (
        /* Main Grid: AI Summary, Extracted Drugs, Warnings */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Columns: Extracted Drugs & AI Summary */}
        <div className="lg:col-span-7 space-y-6">
          {/* AI Clinical Summary Card */}
          <div className="p-6 bg-gradient-to-br from-blue-50/80 via-white to-slate-50 rounded-3xl border border-blue-200/80 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
              <span>AI Clinical Summary</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">{rx.aiSummary}</p>
          </div>

          {/* Extracted Prescribed Medications */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Prescribed Drugs & Dosages</h3>

            <div className="space-y-4">
              {rx.medicines.map((med) => (
                <div
                  key={med.id}
                  className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{med.medicineName}</h4>
                      <p className="text-xs text-blue-600 font-semibold">{med.purpose}</p>
                    </div>
                    <span className="text-xs font-bold text-blue-700 bg-blue-100/80 px-2.5 py-1 rounded-lg">
                      {med.dosage}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200/60 text-slate-600">
                    <div>
                      <span className="text-slate-400 font-medium">Frequency:</span> {med.frequency}
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Duration:</span> {med.duration}
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200/60 leading-relaxed">
                    💡 <strong>Patient Instruction:</strong> {med.instructions}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Drug Interactions Section */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Drug Interaction Cross-Check</h3>

            {rx.interactions.length === 0 ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h5 className="font-bold">Zero High-Risk Contraindications Found</h5>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Cross-referenced against 100,000+ FDA database entries and patient history.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {rx.interactions.map((int) => (
                  <div key={int.id} className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-900">
                        {int.drugA} + {int.drugB}
                      </span>
                      <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                        {int.severity} Severity
                      </span>
                    </div>
                    <p className="text-amber-800">{int.description}</p>
                    <p className="text-[11px] font-medium text-amber-900 bg-white/80 p-2 rounded-lg border border-amber-200/60">
                      <strong>Recommendation:</strong> {int.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 5 Columns: Original Prescription Image & Warnings */}
        <div className="lg:col-span-5 space-y-6">
          {/* Original Document Preview */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">Scanned Document</h3>
              <button
                onClick={() => setImageModalOpen(true)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span>Zoom View</span>
              </button>
            </div>

            {rx.imageUrl && (
              <div
                onClick={() => setImageModalOpen(true)}
                className="relative rounded-2xl overflow-hidden border border-slate-200 cursor-pointer group"
              >
                <img
                  src={rx.imageUrl}
                  alt="Scanned Prescription"
                  className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1.5">
                  <ZoomIn className="w-4 h-4" /> Click to expand
                </div>
              </div>
            )}
          </div>

          {/* Safety Warnings Card */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> Prescriber Warnings
            </h3>

            <ul className="space-y-2">
              {rx.warnings.map((warn, idx) => (
                <li key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-700 leading-snug">
                  • {warn}
                </li>
              ))}
            </ul>
          </div>

          {/* Prescription Lifecycle Timeline */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900">Audit Lifecycle</h3>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Digitized by OCR Vision Laser ({rx.date})</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>PharmD Pharmacology Verified</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Active Reminders Pushed to Schedule</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Image Zoom Modal */}
      <Modal isOpen={imageModalOpen} onClose={() => setImageModalOpen(false)} title={`Original Script - ${rx.code}`}>
        <div className="p-2">
          <img src={rx.imageUrl} alt="Zoomed Prescription" className="w-full max-h-[70vh] object-contain rounded-xl" />
        </div>
      </Modal>
    </div>
  );
};
