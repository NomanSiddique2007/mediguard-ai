import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  AlertTriangle,
  Copy,
  Baby,
  Utensils,
  Wine,
  RefreshCw,
  Database,
  CheckCircle2,
  Filter,
  Info,
  Pill,
  ExternalLink,
  Zap,
} from 'lucide-react';
import {
  RxNavOpenFdaSafetyResult,
  SafetySeverity,
} from '../../types';
import { rxnavOpenFdaService } from '../../services/rxnavOpenFdaService';

interface RxNavOpenFdaSafetyViewerProps {
  prescriptionId?: string;
  medicines?: string[];
  safetyResult?: RxNavOpenFdaSafetyResult;
  onUpdated?: (updated: RxNavOpenFdaSafetyResult) => void;
}

export const RxNavOpenFdaSafetyViewer: React.FC<RxNavOpenFdaSafetyViewerProps> = ({
  prescriptionId,
  medicines = [],
  safetyResult: initialResult,
  onUpdated,
}) => {
  const [safety, setSafety] = useState<RxNavOpenFdaSafetyResult | undefined>(initialResult);
  const [activeCategory, setActiveCategory] = useState<
    'all' | 'interactions' | 'duplicates' | 'contraindications' | 'pregnancy' | 'food' | 'alcohol'
  >('all');
  const [selectedSeverity, setSelectedSeverity] = useState<'All' | SafetySeverity>('All');
  const [isChecking, setIsChecking] = useState(false);

  const handleRunSafetyCheck = async () => {
    const medList = medicines.length > 0 ? medicines : safety?.analyzedMedicines || [];
    setIsChecking(true);
    try {
      const res = await rxnavOpenFdaService.performSafetyCheck(
        prescriptionId || safety?.prescriptionId || 'rx-demo',
        medList
      );
      setSafety(res);
      if (onUpdated) onUpdated(res);
    } catch (err) {
      console.error('Safety check failed:', err);
    } finally {
      setIsChecking(false);
    }
  };

  if (!safety) {
    return (
      <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-xl text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
          <ShieldAlert className="w-6 h-6 text-white" />
        </div>
        <h4 className="text-xl font-bold">RxNav & openFDA Safety Analysis Pending</h4>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Run automated safety cross-checks for drug interactions, duplicate ingredients, contraindications, pregnancy, food & alcohol warnings.
        </p>
        <button
          onClick={handleRunSafetyCheck}
          disabled={isChecking}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 text-white font-bold text-sm shadow-md hover:brightness-110 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
          <span>{isChecking ? 'Running RxNav & openFDA APIs...' : 'Run Automated Safety Check'}</span>
        </button>
      </div>
    );
  }

  // Helper filter for items
  const filterBySeverity = (severity: SafetySeverity) => {
    if (selectedSeverity === 'All') return true;
    return severity === selectedSeverity;
  };

  const filteredInteractions = safety.drugInteractions.filter((i) => filterBySeverity(i.severity));
  const filteredDuplicates = safety.duplicateIngredients.filter((d) => filterBySeverity(d.severity));
  const filteredContraindications = safety.contraindications.filter((c) => filterBySeverity(c.severity));
  const filteredPregnancy = safety.pregnancyWarnings.filter((p) => filterBySeverity(p.severity));
  const filteredFood = safety.foodInteractions.filter((f) => filterBySeverity(f.severity));
  const filteredAlcohol = safety.alcoholWarnings.filter((a) => filterBySeverity(a.severity));

  const totalMajorCount =
    safety.drugInteractions.filter((i) => i.severity === 'Major').length +
    safety.duplicateIngredients.filter((d) => d.severity === 'Major').length +
    safety.contraindications.filter((c) => c.severity === 'Major').length +
    safety.pregnancyWarnings.filter((p) => p.severity === 'Major').length +
    safety.alcoholWarnings.filter((a) => a.severity === 'Major').length;

  const totalModerateCount =
    safety.drugInteractions.filter((i) => i.severity === 'Moderate').length +
    safety.duplicateIngredients.filter((d) => d.severity === 'Moderate').length +
    safety.contraindications.filter((c) => c.severity === 'Moderate').length +
    safety.pregnancyWarnings.filter((p) => p.severity === 'Moderate').length +
    safety.foodInteractions.filter((f) => f.severity === 'Moderate').length +
    safety.alcoholWarnings.filter((a) => a.severity === 'Moderate').length;

  const totalMinorCount =
    safety.drugInteractions.filter((i) => i.severity === 'Minor').length +
    safety.duplicateIngredients.filter((d) => d.severity === 'Minor').length +
    safety.contraindications.filter((c) => c.severity === 'Minor').length +
    safety.pregnancyWarnings.filter((p) => p.severity === 'Minor').length +
    safety.foodInteractions.filter((f) => f.severity === 'Minor').length +
    safety.alcoholWarnings.filter((a) => a.severity === 'Minor').length;

  return (
    <div className="space-y-6">
      {/* Top Banner: RxNav & openFDA Status + Severity Totals */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                NIH RxNav API
              </span>
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-bold flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                openFDA API
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                Saved to ai_analysis table
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Clinical Safety & Interaction Audit
            </h3>
            <p className="text-slate-300 text-sm max-w-2xl">
              Automated multi-database cross-check for {safety.analyzedMedicines.join(', ')}: Drug interactions, duplicate ingredients, contraindications, pregnancy warnings, food & alcohol guidelines.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800/80 backdrop-blur-md">
            <div className="text-right">
              <div className="text-xs text-slate-400 font-medium">Safety Score</div>
              <div
                className={`text-2xl font-black flex items-center gap-1.5 ${
                  safety.safetyScore >= 90
                    ? 'text-emerald-400'
                    : safety.safetyScore >= 75
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                <span>{safety.safetyScore}/100</span>
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>

            <button
              onClick={handleRunSafetyCheck}
              disabled={isChecking}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Analyzing...' : 'Re-Run APIs'}</span>
            </button>
          </div>
        </div>

        {/* Severity Summary Pills */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-3">
          <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-2xl flex items-center justify-between">
            <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Major Alerts
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-xs font-black">
              {totalMajorCount}
            </span>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-2xl flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Moderate Alerts
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-xs font-black">
              {totalModerateCount}
            </span>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-2xl flex items-center justify-between">
            <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-400" />
              Minor Alerts
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500 text-white text-xs font-black">
              {totalMinorCount}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar: Severity Filter + Category Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 rounded-3xl border border-slate-200/90 shadow-xs">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              activeCategory === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-slate-50'
            }`}
          >
            All Safety Signals
          </button>

          <button
            onClick={() => setActiveCategory('interactions')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeCategory === 'interactions'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-slate-50'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Drug Interactions</span>
          </button>

          <button
            onClick={() => setActiveCategory('duplicates')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeCategory === 'duplicates'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-slate-50'
            }`}
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Duplicates</span>
          </button>

          <button
            onClick={() => setActiveCategory('contraindications')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeCategory === 'contraindications'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-slate-50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Contraindications</span>
          </button>

          <button
            onClick={() => setActiveCategory('pregnancy')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeCategory === 'pregnancy'
                ? 'bg-pink-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-slate-50'
            }`}
          >
            <Baby className="w-3.5 h-3.5" />
            <span>Pregnancy</span>
          </button>

          <button
            onClick={() => setActiveCategory('food')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeCategory === 'food'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-slate-50'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Food</span>
          </button>

          <button
            onClick={() => setActiveCategory('alcohol')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeCategory === 'alcohol'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-slate-50'
            }`}
          >
            <Wine className="w-3.5 h-3.5" />
            <span>Alcohol</span>
          </button>
        </div>

        {/* Severity Filter Dropdown */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <Filter className="w-3.5 h-3.5 text-slate-500 ml-2" />
          <span className="text-[11px] font-bold text-slate-500">Severity:</span>
          {(['All', 'Major', 'Moderate', 'Minor'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                selectedSeverity === sev
                  ? sev === 'Major'
                    ? 'bg-rose-600 text-white'
                    : sev === 'Moderate'
                    ? 'bg-amber-500 text-white'
                    : sev === 'Minor'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Warning Cards Display Grid */}
      <div className="space-y-6">
        {/* 1. Drug Interactions Cards */}
        {(activeCategory === 'all' || activeCategory === 'interactions') && filteredInteractions.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-rose-600" />
              <span>RxNav Drug-Drug Interactions ({filteredInteractions.length})</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredInteractions.map((item) => (
                <WarningCard
                  key={item.id}
                  title={`${item.drugA} ↔ ${item.drugB}`}
                  severity={item.severity}
                  description={item.description}
                  badgeText={`Source: ${item.source}`}
                  icon={<Zap className="w-5 h-5" />}
                />
              ))}
            </div>
          </div>
        )}

        {/* 2. Duplicate Ingredients Cards */}
        {(activeCategory === 'all' || activeCategory === 'duplicates') && filteredDuplicates.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Copy className="w-5 h-5 text-indigo-600" />
              <span>Duplicate Active Ingredients ({filteredDuplicates.length})</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDuplicates.map((item) => (
                <WarningCard
                  key={item.id}
                  title={`Active Ingredient: ${item.ingredient}`}
                  severity={item.severity}
                  description={item.description}
                  recommendation={item.recommendation}
                  badgeText={`Involved: ${item.medicinesInvolved.join(', ')}`}
                  icon={<Copy className="w-5 h-5" />}
                />
              ))}
            </div>
          </div>
        )}

        {/* 3. Contraindications Cards */}
        {(activeCategory === 'all' || activeCategory === 'contraindications') && filteredContraindications.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>openFDA Clinical Contraindications ({filteredContraindications.length})</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredContraindications.map((item) => (
                <WarningCard
                  key={item.id}
                  title={`${item.medicineName} - ${item.condition}`}
                  severity={item.severity}
                  description={item.description}
                  badgeText={`Source: ${item.source}`}
                  icon={<AlertTriangle className="w-5 h-5" />}
                />
              ))}
            </div>
          </div>
        )}

        {/* 4. Pregnancy Warnings Cards */}
        {(activeCategory === 'all' || activeCategory === 'pregnancy') && filteredPregnancy.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Baby className="w-5 h-5 text-pink-600" />
              <span>Pregnancy & Lactation Warnings ({filteredPregnancy.length})</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPregnancy.map((item) => (
                <WarningCard
                  key={item.id}
                  title={`${item.medicineName} (${item.categoryOrTrimester || 'FDA Category'})`}
                  severity={item.severity}
                  description={item.warningText}
                  recommendation={item.recommendation}
                  icon={<Baby className="w-5 h-5" />}
                />
              ))}
            </div>
          </div>
        )}

        {/* 5. Food Interactions Cards */}
        {(activeCategory === 'all' || activeCategory === 'food') && filteredFood.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-emerald-600" />
              <span>Food & Dietary Interactions ({filteredFood.length})</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFood.map((item) => (
                <WarningCard
                  key={item.id}
                  title={`${item.medicineName} + ${item.foodOrDiet}`}
                  severity={item.severity}
                  description={item.instruction}
                  icon={<Utensils className="w-5 h-5" />}
                />
              ))}
            </div>
          </div>
        )}

        {/* 6. Alcohol Warnings Cards */}
        {(activeCategory === 'all' || activeCategory === 'alcohol') && filteredAlcohol.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Wine className="w-5 h-5 text-purple-600" />
              <span>Alcohol Warnings & Precautions ({filteredAlcohol.length})</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAlcohol.map((item) => (
                <WarningCard
                  key={item.id}
                  title={`${item.medicineName} + Alcohol`}
                  severity={item.severity}
                  description={item.riskDescription}
                  recommendation={item.precaution}
                  icon={<Wine className="w-5 h-5" />}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface WarningCardProps {
  title: string;
  severity: SafetySeverity;
  description: string;
  recommendation?: string;
  badgeText?: string;
  icon: React.ReactNode;
}

const WarningCard: React.FC<WarningCardProps> = ({
  title,
  severity,
  description,
  recommendation,
  badgeText,
  icon,
}) => {
  const getSeverityStyles = () => {
    switch (severity) {
      case 'Major':
        return {
          bg: 'bg-rose-50/90 border-rose-200/90 text-rose-950',
          badge: 'bg-rose-600 text-white',
          iconBg: 'bg-rose-100 text-rose-700',
        };
      case 'Moderate':
        return {
          bg: 'bg-amber-50/90 border-amber-200/90 text-amber-950',
          badge: 'bg-amber-500 text-white',
          iconBg: 'bg-amber-100 text-amber-700',
        };
      case 'Minor':
      default:
        return {
          bg: 'bg-blue-50/80 border-blue-200/80 text-blue-950',
          badge: 'bg-blue-600 text-white',
          iconBg: 'bg-blue-100 text-blue-700',
        };
    }
  };

  const styles = getSeverityStyles();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-5 rounded-3xl border shadow-2xs space-y-3 relative transition-all ${styles.bg}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-2xl ${styles.iconBg}`}>{icon}</div>
          <div>
            <h5 className="font-extrabold text-sm text-slate-900 leading-snug">{title}</h5>
            {badgeText && <p className="text-[11px] text-slate-500 font-medium">{badgeText}</p>}
          </div>
        </div>

        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${styles.badge}`}>
          {severity}
        </span>
      </div>

      <p className="text-xs font-medium leading-relaxed text-slate-800">{description}</p>

      {recommendation && (
        <div className="pt-2.5 border-t border-slate-200/60 text-xs font-semibold text-slate-900 flex items-start gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            <strong className="text-slate-900">Clinical Recommendation: </strong>
            {recommendation}
          </span>
        </div>
      )}
    </motion.div>
  );
};
