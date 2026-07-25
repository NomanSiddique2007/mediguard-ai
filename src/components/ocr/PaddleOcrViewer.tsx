import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Pill,
  Trash2,
  Plus,
  Save,
  Eye,
  ZoomIn,
  RefreshCw,
  Cpu,
  Check,
  ShieldAlert,
  Info,
  Type,
  PenTool,
} from 'lucide-react';
import { PaddleOcrResult, OcrBoundingBox, ExtractedMedicineOcr, Prescription } from '../../types';
import { useApp } from '../../context/AppContext';

interface PaddleOcrViewerProps {
  prescription: Prescription;
  ocrResult?: PaddleOcrResult;
  onSaved?: (updatedPrescription: Prescription) => void;
}

export const PaddleOcrViewer: React.FC<PaddleOcrViewerProps> = ({
  prescription,
  ocrResult: initialOcrResult,
  onSaved,
}) => {
  const { addToast, updatePrescription } = useApp();

  // If initialOcrResult is missing, derive default from prescription
  const defaultResult: PaddleOcrResult = initialOcrResult || {
    doctorName: prescription.doctorName || 'Dr. Sarah Jenkins, MD',
    doctorNameConfidence: 96,
    hospital: prescription.hospital || 'St. Jude Clinical Hospital',
    hospitalConfidence: 98,
    patientName: prescription.patientName || 'Alexander Wright',
    patientNameConfidence: 94,
    date: prescription.date || '2026-07-24',
    dateConfidence: 92,
    medicines: prescription.medicines.map((m, idx) => ({
      id: m.id,
      medicineName: m.medicineName,
      dosage: m.dosage,
      frequency: m.frequency,
      duration: m.duration,
      purpose: m.purpose,
      instructions: m.instructions,
      confidence: idx === 1 ? 64 : 91, // Make 2nd item uncertain for demo
      isUncertain: idx === 1,
    })),
    notes: prescription.notes || 'Drink plenty of warm fluids. Follow up in 7 days.',
    notesConfidence: 62,
    overallConfidence: 78,
    hasUncertainWords: true,
    uncertainWordCount: 2,
    processingTimeMs: 420,
    engine: 'PaddleOCR v2.7 (DBNet + CRNN) via FastAPI',
    boundingBoxes: [
      {
        id: 'box-hosp',
        text: prescription.hospital || 'St. Jude Clinical Hospital',
        confidence: 98,
        isHandwritten: false,
        isUncertain: false,
        type: 'hospital',
        box: { x: 10, y: 6, width: 80, height: 6 },
      },
      {
        id: 'box-doc',
        text: prescription.doctorName || 'Dr. Sarah Jenkins, MD',
        confidence: 96,
        isHandwritten: false,
        isUncertain: false,
        type: 'doctor_name',
        box: { x: 10, y: 14, width: 80, height: 5 },
      },
      {
        id: 'box-pat',
        text: `Patient: ${prescription.patientName || 'Alexander Wright'}`,
        confidence: 94,
        isHandwritten: false,
        isUncertain: false,
        type: 'patient_name',
        box: { x: 10, y: 21, width: 45, height: 5 },
      },
      {
        id: 'box-date',
        text: `Date: ${prescription.date}`,
        confidence: 92,
        isHandwritten: false,
        isUncertain: false,
        type: 'date',
        box: { x: 60, y: 21, width: 30, height: 5 },
      },
      {
        id: 'box-med-1',
        text: prescription.medicines[0]?.medicineName || 'Amoxicillin 500mg',
        confidence: 91,
        isHandwritten: true,
        isUncertain: false,
        type: 'medicine',
        box: { x: 10, y: 32, width: 75, height: 6 },
      },
      {
        id: 'box-med-2',
        text: prescription.medicines[1]?.medicineName || 'Salbutamol Inhaler 100mcg',
        confidence: 64, // UNCERTAIN
        isHandwritten: true,
        isUncertain: true,
        type: 'medicine',
        box: { x: 10, y: 46, width: 75, height: 6 },
      },
      {
        id: 'box-notes',
        text: prescription.notes || 'Drink warm fluids, rest well.',
        confidence: 62, // UNCERTAIN
        isHandwritten: true,
        isUncertain: true,
        type: 'notes',
        box: { x: 10, y: 72, width: 80, height: 8 },
      },
    ],
  };

  // Editable Form State
  const [ocrData, setOcrData] = useState<PaddleOcrResult>(defaultResult);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'uncertain' | 'handwritten' | 'printed'>('all');
  const [showBoxes, setShowBoxes] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Active Bounding Boxes based on filter
  const filteredBoxes = ocrData.boundingBoxes.filter((box) => {
    if (filterMode === 'uncertain') return box.isUncertain || box.confidence < 70;
    if (filterMode === 'handwritten') return box.isHandwritten;
    if (filterMode === 'printed') return !box.isHandwritten;
    return true;
  });

  // Handle updates to medicines
  const handleMedicineChange = (id: string, field: keyof ExtractedMedicineOcr, value: any) => {
    setOcrData((prev) => {
      const updatedMeds = prev.medicines.map((m) => {
        if (m.id === id) {
          const updated = { ...m, [field]: value };
          // If edited, clear uncertainty flag
          if (field === 'medicineName' || field === 'dosage') {
            updated.isUncertain = false;
            updated.confidence = 99;
          }
          return updated;
        }
        return m;
      });

      const hasUncertain = updatedMeds.some((m) => m.isUncertain) || prev.notesConfidence < 70;
      return {
        ...prev,
        medicines: updatedMeds,
        hasUncertainWords: hasUncertain,
      };
    });
  };

  // Add new medicine row
  const handleAddMedicine = () => {
    const newMed: ExtractedMedicineOcr = {
      id: `med-${Date.now()}`,
      medicineName: '',
      dosage: '',
      frequency: 'Once daily',
      duration: '7 Days',
      purpose: 'Prescribed Medication',
      instructions: 'Take after meals with water',
      confidence: 100,
      isUncertain: false,
    };

    setOcrData((prev) => ({
      ...prev,
      medicines: [...prev.medicines, newMed],
    }));
  };

  // Remove medicine row
  const handleRemoveMedicine = (id: string) => {
    setOcrData((prev) => ({
      ...prev,
      medicines: prev.medicines.filter((m) => m.id !== id),
    }));
  };

  // Save changes & update prescription in state
  const handleSaveChanges = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const updatedPrescriptionItems = ocrData.medicines.map((m) => ({
      id: m.id,
      medicineName: m.medicineName || 'Unspecified Medicine',
      dosage: m.dosage || 'Standard Dosage',
      frequency: m.frequency || 'As directed',
      duration: m.duration || '7 Days',
      purpose: m.purpose || 'Prescribed Therapy',
      instructions: m.instructions || 'Follow doctor instructions',
    }));

    const updatedRx: Prescription = {
      ...prescription,
      doctorName: ocrData.doctorName,
      hospital: ocrData.hospital,
      patientName: ocrData.patientName,
      date: ocrData.date,
      notes: ocrData.notes,
      medicines: updatedPrescriptionItems,
      status: 'Verified',
      safetyScore: Math.min(100, Math.max(90, ocrData.overallConfidence + 10)),
      ocrResult: {
        ...ocrData,
        hasUncertainWords: false,
        uncertainWordCount: 0,
        overallConfidence: 98,
      },
    };

    updatePrescription(updatedRx);
    if (onSaved) onSaved(updatedRx);

    setIsSaving(false);
    addToast({
      type: 'success',
      title: 'OCR Data Confirmed & Saved',
      message: 'Prescription details verified and synced across health vault records.',
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden font-sans space-y-6">
      {/* 1. FastAPI + PaddleOCR Control Panel Bar */}
      <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-400/30">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-tight text-white">{ocrData.engine}</h3>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Extracted in <strong>{ocrData.processingTimeMs}ms</strong> • Precision: Bounding Box Coordinate Mapping
            </p>
          </div>
        </div>

        {/* Confidence Badge */}
        <div className="flex items-center gap-3 flex-wrap">
          <div
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
              ocrData.overallConfidence >= 80
                ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300'
                : 'bg-amber-500/15 border-amber-400/40 text-amber-300'
            }`}
          >
            {ocrData.overallConfidence >= 80 ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            )}
            <span>Confidence Score: {ocrData.overallConfidence}%</span>
          </div>

          <button
            onClick={() => setShowBoxes(!showBoxes)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              showBoxes
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            {showBoxes ? 'Hide Bounding Boxes' : 'Show Bounding Boxes'}
          </button>
        </div>
      </div>

      {/* 2. Uncertain Words Warning Banner (<70% Confidence Flag) */}
      {ocrData.hasUncertainWords && (
        <div className="mx-6 p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-amber-200/60 text-amber-800 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-amber-900">
                Low Confidence Detected ({ocrData.uncertainWordCount} items &lt; 70%)
              </h4>
              <p className="text-amber-800 mt-0.5">
                Handwritten text detected with uncertainty. Please review the highlighted amber fields in the form below before confirming.
              </p>
            </div>
          </div>

          <button
            onClick={() => setFilterMode('uncertain')}
            className="px-3.5 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold rounded-xl transition-colors shrink-0"
          >
            Filter Uncertain Items
          </button>
        </div>
      )}

      {/* 3. Main Split View: Bounding Box Image Overlay (Left) & Editable Form (Right) */}
      <div className="px-6 pb-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 5 Cols: Prescription Image with Bounding Box Overlay */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-blue-600" /> Image Bounding Boxes ({filteredBoxes.length})
            </h4>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 text-[11px]">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-2 py-0.5 rounded-md font-semibold transition-colors ${
                  filterMode === 'all' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterMode('uncertain')}
                className={`px-2 py-0.5 rounded-md font-semibold transition-colors ${
                  filterMode === 'uncertain'
                    ? 'bg-amber-600 text-white font-bold'
                    : 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                }`}
              >
                Uncertain (&lt;70%)
              </button>
              <button
                onClick={() => setFilterMode('handwritten')}
                className={`px-2 py-0.5 rounded-md font-semibold transition-colors ${
                  filterMode === 'handwritten' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                Handwritten
              </button>
            </div>
          </div>

          {/* Interactive Bounding Box Canvas Container */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-inner group min-h-[380px] flex items-center justify-center">
            <img
              src={prescription.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800'}
              alt="Prescription Document"
              className="w-full h-auto object-contain max-h-[500px]"
            />

            {/* Bounding Boxes Layer */}
            {showBoxes &&
              filteredBoxes.map((box) => {
                const isSelected = selectedBoxId === box.id;
                const isUncertain = box.isUncertain || box.confidence < 70;

                return (
                  <div
                    key={box.id}
                    onClick={() => setSelectedBoxId(box.id)}
                    style={{
                      left: `${box.box.x}%`,
                      top: `${box.box.y}%`,
                      width: `${box.box.width}%`,
                      height: `${box.box.height}%`,
                    }}
                    className={`absolute rounded-lg transition-all cursor-pointer border-2 z-10 flex items-center justify-between px-1.5 ${
                      isUncertain
                        ? 'border-amber-400 bg-amber-500/30 text-white font-bold animate-pulse shadow-md'
                        : box.isHandwritten
                        ? 'border-blue-400 bg-blue-500/20 text-white font-semibold hover:bg-blue-500/40'
                        : 'border-emerald-400 bg-emerald-500/20 text-white font-semibold hover:bg-emerald-500/40'
                    } ${isSelected ? 'ring-4 ring-blue-500 scale-[1.02] z-20 shadow-xl' : ''}`}
                    title={`Click to focus: ${box.text} (${box.confidence}% confidence)`}
                  >
                    <span className="text-[9px] truncate font-mono drop-shadow-md">
                      {box.text}
                    </span>

                    <span
                      className={`text-[8px] font-black px-1 rounded shrink-0 ${
                        isUncertain ? 'bg-amber-500 text-slate-950' : 'bg-slate-900/80 text-white'
                      }`}
                    >
                      {box.confidence}%
                    </span>
                  </div>
                );
              })}
          </div>

          {/* Legend */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-between text-[11px] text-slate-600 gap-2">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Printed (&ge;70%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span> Handwritten (&ge;70%)
            </span>
            <span className="flex items-center gap-1 font-bold text-amber-800">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block animate-pulse"></span> Uncertain (&lt;70%)
            </span>
          </div>
        </div>

        {/* Right 7 Cols: Editable Frontend Fields */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <Edit3 className="w-4 h-4 text-blue-600" /> Frontend Editable Structured Fields
            </h4>
            <span className="text-xs text-slate-400 font-medium">Click any field or bounding box to edit</span>
          </div>

          {/* General Metadata Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Doctor Name */}
            <div className="space-y-1">
              <label className="text-slate-600 font-bold flex items-center justify-between">
                <span>Doctor Name</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">
                  {ocrData.doctorNameConfidence}%
                </span>
              </label>
              <input
                type="text"
                value={ocrData.doctorName}
                onChange={(e) => setOcrData({ ...ocrData, doctorName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 font-medium text-slate-900 transition-all outline-hidden"
              />
            </div>

            {/* Hospital */}
            <div className="space-y-1">
              <label className="text-slate-600 font-bold flex items-center justify-between">
                <span>Hospital / Clinic</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">
                  {ocrData.hospitalConfidence}%
                </span>
              </label>
              <input
                type="text"
                value={ocrData.hospital}
                onChange={(e) => setOcrData({ ...ocrData, hospital: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 font-medium text-slate-900 transition-all outline-hidden"
              />
            </div>

            {/* Patient Name */}
            <div className="space-y-1">
              <label className="text-slate-600 font-bold flex items-center justify-between">
                <span>Patient Name</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">
                  {ocrData.patientNameConfidence}%
                </span>
              </label>
              <input
                type="text"
                value={ocrData.patientName}
                onChange={(e) => setOcrData({ ...ocrData, patientName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 font-medium text-slate-900 transition-all outline-hidden"
              />
            </div>

            {/* Date */}
            <div className="space-y-1">
              <label className="text-slate-600 font-bold flex items-center justify-between">
                <span>Prescription Date</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">
                  {ocrData.dateConfidence}%
                </span>
              </label>
              <input
                type="text"
                value={ocrData.date}
                onChange={(e) => setOcrData({ ...ocrData, date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 font-medium text-slate-900 transition-all outline-hidden"
              />
            </div>
          </div>

          {/* Medicines Array */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Prescribed Medicines ({ocrData.medicines.length})
              </h5>

              <button
                onClick={handleAddMedicine}
                className="px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Medicine Row</span>
              </button>
            </div>

            <div className="space-y-3">
              {ocrData.medicines.map((med, index) => {
                const isUncertain = med.isUncertain || med.confidence < 70;

                return (
                  <div
                    key={med.id}
                    className={`p-4 rounded-2xl border transition-all space-y-3 ${
                      isUncertain
                        ? 'bg-amber-50/60 border-amber-300 ring-2 ring-amber-400/30'
                        : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Pill className={`w-4 h-4 ${isUncertain ? 'text-amber-600' : 'text-blue-600'}`} />
                        <span className="text-xs font-bold text-slate-900">Medicine #{index + 1}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            isUncertain
                              ? 'bg-amber-200 text-amber-900 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isUncertain ? `⚠️ ${med.confidence}% (Uncertain)` : `${med.confidence}% Confidence`}
                        </span>

                        <button
                          onClick={() => handleRemoveMedicine(med.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                          title="Delete Medicine Row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* Name */}
                      <div className="space-y-1">
                        <label className="text-slate-500 font-semibold">Medicine Name</label>
                        <input
                          type="text"
                          value={med.medicineName}
                          onChange={(e) => handleMedicineChange(med.id, 'medicineName', e.target.value)}
                          placeholder="e.g. Amoxicillin 500mg"
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:border-blue-500 outline-hidden"
                        />
                      </div>

                      {/* Dosage */}
                      <div className="space-y-1">
                        <label className="text-slate-500 font-semibold">Dosage</label>
                        <input
                          type="text"
                          value={med.dosage}
                          onChange={(e) => handleMedicineChange(med.id, 'dosage', e.target.value)}
                          placeholder="e.g. 500 mg"
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:border-blue-500 outline-hidden"
                        />
                      </div>

                      {/* Frequency */}
                      <div className="space-y-1">
                        <label className="text-slate-500 font-semibold">Frequency</label>
                        <input
                          type="text"
                          value={med.frequency}
                          onChange={(e) => handleMedicineChange(med.id, 'frequency', e.target.value)}
                          placeholder="e.g. 3 times daily"
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:border-blue-500 outline-hidden"
                        />
                      </div>

                      {/* Duration */}
                      <div className="space-y-1">
                        <label className="text-slate-500 font-semibold">Duration</label>
                        <input
                          type="text"
                          value={med.duration}
                          onChange={(e) => handleMedicineChange(med.id, 'duration', e.target.value)}
                          placeholder="e.g. 7 Days"
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:border-blue-500 outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1 text-xs pt-1">
            <label className="text-slate-600 font-bold flex items-center justify-between">
              <span>Prescription Doctor Notes</span>
              <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-mono">
                {ocrData.notesConfidence}% Confidence
              </span>
            </label>
            <textarea
              rows={2}
              value={ocrData.notes}
              onChange={(e) => setOcrData({ ...ocrData, notes: e.target.value, notesConfidence: 99 })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 font-medium text-slate-900 transition-all outline-hidden resize-none"
            />
          </div>

          {/* Action Button: Save & Confirm */}
          <div className="pt-3">
            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="w-full py-3.5 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-2xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Syncing and Saving Changes...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Confirm OCR Data & Save Prescription</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
