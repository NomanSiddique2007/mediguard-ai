import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  Filter,
  Eye,
  Trash2,
  Download,
  Calendar,
  FileText,
  Plus,
  Hospital,
  AlertCircle,
  Upload,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { SearchBar } from '../components/common/SearchBar';
import { EmptyState } from '../components/common/EmptyState';

export const PrescriptionHistoryPage: React.FC = () => {
  const { prescriptions, deletePrescription, viewPrescriptionDetails, setCurrentPage, addToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Verified' | 'Action Required' | 'Archived'>('All');

  const filteredPrescriptions = prescriptions.filter((rx) => {
    const matchesSearch =
      rx.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rx.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rx.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rx.hospital.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || rx.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Prescription History</h2>
          <p className="text-xs text-slate-500 mt-1">
            Centralized searchable repository of all scanned doctor prescriptions and AI verification scores.
          </p>
        </div>

        <button
          onClick={() => setCurrentPage('upload')}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all active:scale-95 shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>Scan New Script</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:max-w-md">
          <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Filter by Rx code, doctor, hospital..." />
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {(['All', 'Verified', 'Action Required', 'Archived'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                statusFilter === tab
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content Table / Cards */}
      {filteredPrescriptions.length === 0 ? (
        <EmptyState
          title="No Prescriptions Found"
          description="No prescriptions matched your search parameters. Try clearing filters or uploading a new scan."
          actionText="Upload Prescription"
          onAction={() => setCurrentPage('upload')}
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3.5 pl-6">Rx Code & Date</th>
                  <th className="py-3.5">Doctor & Specialty</th>
                  <th className="py-3.5">Hospital</th>
                  <th className="py-3.5">Diagnosis</th>
                  <th className="py-3.5">Safety Score</th>
                  <th className="py-3.5">Status</th>
                  <th className="py-3.5 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredPrescriptions.map((rx) => (
                  <tr key={rx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 pl-6">
                      <span className="font-extrabold text-blue-600 block">{rx.code}</span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" /> {rx.date}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="font-bold text-slate-900">{rx.doctorName}</div>
                      <div className="text-[10px] text-slate-500">{rx.doctorSpecialty}</div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Hospital className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[140px]">{rx.hospital}</span>
                      </div>
                    </td>
                    <td className="py-4 max-w-xs">
                      <p className="line-clamp-2 text-slate-800">{rx.diagnosis}</p>
                    </td>
                    <td className="py-4">
                      <span
                        className={`font-bold px-2.5 py-1 rounded-full text-[11px] ${
                          rx.safetyScore >= 95
                            ? 'bg-emerald-50 text-emerald-700'
                            : rx.safetyScore >= 80
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {rx.safetyScore}/100
                      </span>
                    </td>
                    <td className="py-4">
                      <Badge
                        variant={
                          rx.status === 'Verified'
                            ? 'emerald'
                            : rx.status === 'Action Required'
                            ? 'amber'
                            : 'slate'
                        }
                      >
                        {rx.status}
                      </Badge>
                    </td>
                    <td className="py-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => viewPrescriptionDetails(rx.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors font-semibold"
                          title="View Full Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            addToast({
                              type: 'success',
                              title: 'PDF Report Exported',
                              message: `Prescription ${rx.code} summary downloaded.`,
                            })
                          }
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deletePrescription(rx.id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Grid View */}
          <div className="md:hidden space-y-4">
            {filteredPrescriptions.map((rx) => (
              <div key={rx.id} className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-blue-600 text-sm">{rx.code}</span>
                    <span className="text-[11px] text-slate-400 block">{rx.date}</span>
                  </div>
                  <Badge
                    variant={
                      rx.status === 'Verified'
                        ? 'emerald'
                        : rx.status === 'Action Required'
                        ? 'amber'
                        : 'slate'
                    }
                  >
                    {rx.status}
                  </Badge>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                  <p className="font-bold text-slate-900">{rx.doctorName}</p>
                  <p className="text-slate-500">{rx.hospital}</p>
                  <p className="text-slate-700 font-medium mt-1">{rx.diagnosis}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Score: {rx.safetyScore}/100
                  </span>

                  <button
                    onClick={() => viewPrescriptionDetails(rx.id)}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-xl shadow-xs"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
