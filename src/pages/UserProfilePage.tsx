import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  User,
  Heart,
  Phone,
  ShieldAlert,
  Edit,
  Mail,
  Calendar,
  Activity,
  CheckCircle2,
  Droplet,
  Scale,
  Ruler,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

export const UserProfilePage: React.FC = () => {
  const { userProfile, updateUserProfile, addToast } = useApp();
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Form states for profile editing
  const [fullName, setFullName] = useState(userProfile.fullName);
  const [phone, setPhone] = useState(userProfile.phone);
  const [bloodGroup, setBloodGroup] = useState(userProfile.medicalInfo.bloodGroup);
  const [age, setAge] = useState(userProfile.medicalInfo.age);
  const [weight, setWeight] = useState(userProfile.medicalInfo.weight);
  const [height, setHeight] = useState(userProfile.medicalInfo.height);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      fullName,
      phone,
      medicalInfo: {
        ...userProfile.medicalInfo,
        bloodGroup,
        age,
        weight,
        height,
      },
    });
    setEditModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 font-sans">
      {/* Profile Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5 min-w-0">
          <img
            src={userProfile.avatarUrl}
            alt={userProfile.fullName}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-blue-500 shadow-md shrink-0"
          />
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{userProfile.fullName}</h2>
              <Badge variant="emerald" size="sm">
                Verified {userProfile.role}
              </Badge>
            </div>

            <p className="text-xs text-slate-500 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-blue-600" /> {userProfile.email}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1 font-medium">
              <span>Patient ID: <strong className="text-slate-900">{userProfile.patientId}</strong></span>
              <span>•</span>
              <span>Member Since: <strong className="text-slate-900">{userProfile.memberSince}</strong></span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setEditModalOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shrink-0"
        >
          <Edit className="w-4 h-4 text-blue-600" />
          <span>Edit Medical Profile</span>
        </button>
      </div>

      {/* Medical Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center">
          <Droplet className="w-5 h-5 text-rose-500 mx-auto mb-1" />
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Blood Group</span>
          <h4 className="text-xl font-black text-slate-900 mt-0.5">{userProfile.medicalInfo.bloodGroup}</h4>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center">
          <Calendar className="w-5 h-5 text-blue-500 mx-auto mb-1" />
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Age</span>
          <h4 className="text-xl font-black text-slate-900 mt-0.5">{userProfile.medicalInfo.age} Yrs</h4>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center">
          <Scale className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Weight</span>
          <h4 className="text-xl font-black text-slate-900 mt-0.5">{userProfile.medicalInfo.weight}</h4>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center">
          <Ruler className="w-5 h-5 text-purple-500 mx-auto mb-1" />
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Height</span>
          <h4 className="text-xl font-black text-slate-900 mt-0.5">{userProfile.medicalInfo.height}</h4>
        </div>
      </div>

      {/* Detailed Clinical Information Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Allergies & Sensitivities */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <h3 className="text-base font-extrabold text-slate-900">Documented Allergies</h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {userProfile.medicalInfo.allergies.map((allergy, idx) => (
              <span
                key={idx}
                className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-xl"
              >
                ⚠️ {allergy}
              </span>
            ))}
          </div>

          <p className="text-xs text-slate-500 leading-relaxed pt-2">
            AI scanner checks all prescriptions against these flagged allergy compounds in real-time.
          </p>
        </div>

        {/* Chronic Diseases & Conditions */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-extrabold text-slate-900">Chronic Conditions</h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {userProfile.medicalInfo.chronicDiseases.map((disease, idx) => (
              <span
                key={idx}
                className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl"
              >
                {disease}
              </span>
            ))}
          </div>

          <p className="text-xs text-slate-500 leading-relaxed pt-2">
            Monitored by primary physician Dr. Sarah Jenkins. Last updated July 2026.
          </p>
        </div>
      </div>

      {/* Emergency Contact Card */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-extrabold text-slate-900">Emergency Contact</h3>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">{userProfile.medicalInfo.emergencyContact.name}</h4>
            <p className="text-slate-500">
              Relationship: {userProfile.medicalInfo.emergencyContact.relation}
            </p>
          </div>

          <a
            href={`tel:${userProfile.medicalInfo.emergencyContact.phone}`}
            className="px-4 py-2 font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
          >
            Call {userProfile.medicalInfo.emergencyContact.phone}
          </a>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Medical Profile"
        subtitle="Update patient record and physical metrics"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Phone
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Blood Group
              </label>
              <input
                type="text"
                required
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Age
              </label>
              <input
                type="number"
                required
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Weight
              </label>
              <input
                type="text"
                required
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Height
              </label>
              <input
                type="text"
                required
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all"
          >
            Save Updated Medical Info
          </button>
        </form>
      </Modal>
    </div>
  );
};
