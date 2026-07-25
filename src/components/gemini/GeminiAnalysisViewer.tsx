import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Pill,
  AlertTriangle,
  Copy,
  CheckCircle2,
  HelpCircle,
  Utensils,
  ShieldAlert,
  FileText,
  UserCheck,
  RefreshCw,
  Cpu,
  Zap,
  Info,
} from 'lucide-react';
import { GeminiPrescriptionAnalysis, PaddleOcrResult } from '../../types';
import { geminiAnalysisService } from '../../services/geminiAnalysisService';

interface GeminiAnalysisViewerProps {
  analysis?: GeminiPrescriptionAnalysis;
  ocrResult?: PaddleOcrResult;
  onAnalysisUpdated?: (updated: GeminiPrescriptionAnalysis) => void;
}

export const GeminiAnalysisViewer: React.FC<GeminiAnalysisViewerProps> = ({
  analysis: initialAnalysis,
  ocrResult,
  onAnalysisUpdated,
}) => {
  const [analysis, setAnalysis] = useState<GeminiPrescriptionAnalysis | undefined>(initialAnalysis);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [customContext, setCustomContext] = useState('');
  const [showContextInput, setShowContextInput] = useState(false);

  const handleCopy = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleReanalyze = async () => {
    if (!ocrResult) return;
    setIsReanalyzing(true);
    try {
      const updated = await geminiAnalysisService.analyzeOcrOutput(ocrResult, customContext);
      setAnalysis(updated);
      if (onAnalysisUpdated) {
        onAnalysisUpdated(updated);
      }
    } catch (err) {
      console.error('Failed re-analyzing with Gemini API:', err);
    } finally {
      setIsReanalyzing(false);
    }
  };

  if (!analysis) {
    return (
      <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-xl text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <h4 className="text-xl font-bold">Google Gemini API Analysis Pending</h4>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          No structured Gemini analysis recorded for this prescription yet. Run analysis to extract medicine explanations, drug warnings, and duplicate checks.
        </p>
        {ocrResult && (
          <button
            onClick={handleReanalyze}
            disabled={isReanalyzing}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-md hover:brightness-110 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isReanalyzing ? 'animate-spin' : ''}`} />
            <span>{isReanalyzing ? 'Analyzing with Gemini API...' : 'Run Gemini Clinical Analysis'}</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner: Gemini AI Header & Confidence Meter */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold tracking-wide uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Google Gemini API
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
                Model: gemini-3.6-flash
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Clinical Prescription Intelligence
            </h3>
            <p className="text-slate-300 text-sm max-w-2xl">
              Real-time structured extraction from OCR text: Medicine explanations, purpose, dosage, side effects, food instructions, drug warnings, duplicate checks & confidence scores.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800/80 backdrop-blur-md">
            <div className="text-right">
              <div className="text-xs text-slate-400 font-medium">Overall AI Confidence</div>
              <div className="text-2xl font-black text-emerald-400 flex items-center gap-1">
                <span>{analysis.overallConfidenceScore}%</span>
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
              </div>
            </div>

            {ocrResult && (
              <button
                onClick={() => setShowContextInput(!showContextInput)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all flex items-center gap-1.5 shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                <span>Re-Analyze</span>
              </button>
            )}
          </div>
        </div>

        {/* Optional Custom Context Drawer */}
        {showContextInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 pt-6 border-t border-slate-800 space-y-3"
          >
            <label className="block text-xs font-bold text-slate-300">
              Provide Additional Patient Context or Specific Symptoms (Optional):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customContext}
                onChange={(e) => setCustomContext(e.target.value)}
                placeholder="e.g. Patient has mild renal impairment or penicillin sensitivity history..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleReanalyze}
                disabled={isReanalyzing}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <Zap className={`w-3.5 h-3.5 ${isReanalyzing ? 'animate-spin' : ''}`} />
                <span>{isReanalyzing ? 'Processing...' : 'Run Gemini'}</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* 1. Clinical Summary & Patient-Friendly Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clinical Summary */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">Clinical Summary</h4>
                <p className="text-xs text-slate-500">Professional overview for medical personnel</p>
              </div>
            </div>
            <button
              onClick={() => handleCopy(analysis.summary, 'summary')}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              title="Copy Summary"
            >
              {copiedSection === 'summary' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-sm text-slate-700 leading-relaxed font-medium">
            {analysis.summary}
          </div>
        </div>

        {/* Patient Friendly Explanation */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">Patient Friendly Explanation</h4>
                <p className="text-xs text-slate-500">Simple, non-technical instructions</p>
              </div>
            </div>
            <button
              onClick={() => handleCopy(analysis.patientFriendlyExplanation, 'patient')}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              title="Copy Patient Explanation"
            >
              {copiedSection === 'patient' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100/60 text-sm text-slate-800 leading-relaxed font-medium">
            {analysis.patientFriendlyExplanation}
          </div>
        </div>
      </div>

      {/* 2. Structured Medicine Explanation Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Pill className="w-5 h-5 text-blue-600" />
            <span>Prescribed Medicine Explanations</span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-extrabold">
              {analysis.medicineExplanation.length} Drugs Extracted
            </span>
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {analysis.medicineExplanation.map((med, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-all space-y-5 relative"
            >
              {/* Header: Medicine Name & Confidence */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Medicine Name</div>
                  <h5 className="text-xl font-black text-slate-900">{med.medicineName}</h5>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[11px] font-bold text-slate-400">Confidence</span>
                  <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 text-xs font-black border border-blue-100">
                    {med.confidenceScore}%
                  </span>
                </div>
              </div>

              {/* Grid: Purpose & Dosage */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                  <div className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-blue-500" />
                    <span>Purpose / Indication</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 leading-snug">{med.purpose}</p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                  <div className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <Pill className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Dosage & Frequency</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 leading-snug">{med.dosage}</p>
                </div>
              </div>

              {/* Food Instructions */}
              <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/60 space-y-1">
                <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-amber-600" />
                  <span>Food Instructions</span>
                </div>
                <p className="text-xs font-medium text-amber-950 leading-relaxed">{med.foodInstructions}</p>
              </div>

              {/* Side Effects */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />
                  <span>Common Side Effects</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {med.sideEffects.map((se, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200/60"
                    >
                      {se}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Drug Warnings & Duplicate Medicines Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Drug Warnings */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            <span>Drug Warnings & Contraindications</span>
          </h4>

          {analysis.drugWarnings.length === 0 ? (
            <div className="p-4 rounded-2xl bg-slate-50 text-slate-500 text-xs font-medium text-center">
              No specific drug warnings flagged.
            </div>
          ) : (
            <div className="space-y-3">
              {analysis.drugWarnings.map((w, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border space-y-2 ${
                    w.severity === 'High'
                      ? 'bg-rose-50 border-rose-200 text-rose-950'
                      : w.severity === 'Moderate'
                      ? 'bg-amber-50 border-amber-200 text-amber-950'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        w.severity === 'High'
                          ? 'bg-rose-600 text-white'
                          : w.severity === 'Moderate'
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-600 text-white'
                      }`}
                    >
                      {w.severity} Severity
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      Confidence: {w.confidenceScore}%
                    </span>
                  </div>
                  <p className="text-xs font-semibold leading-relaxed">{w.warning}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Duplicate Medicines Check */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Copy className="w-5 h-5 text-indigo-600" />
            <span>Duplicate Medicines & Therapeutic Overlap</span>
          </h4>

          {analysis.duplicateMedicines.map((dup, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border space-y-2 ${
                dup.hasDuplicate
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-950'
                  : 'bg-emerald-50/60 border-emerald-200/60 text-emerald-950'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    dup.hasDuplicate ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
                  }`}
                >
                  {dup.hasDuplicate ? 'Duplicate Detected' : 'No Duplicates'}
                </span>
                <span className="text-[11px] font-bold text-slate-500">
                  Confidence: {dup.confidenceScore}%
                </span>
              </div>

              {dup.hasDuplicate && (
                <div className="text-xs font-bold text-indigo-900">
                  {dup.medicineA} ↔ {dup.medicineB}
                </div>
              )}

              <p className="text-xs font-medium leading-relaxed">{dup.reason}</p>

              {dup.recommendation && (
                <div className="text-xs font-semibold pt-1 border-t border-slate-200/60">
                  <span className="font-bold">Recommendation: </span>
                  {dup.recommendation}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
