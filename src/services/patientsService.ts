import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import { Database } from '../types/database';
import { UserProfile } from '../types';

type PatientRow = Database['public']['Tables']['patients']['Row'];

export const mapPatientRowToUserProfile = (row: PatientRow): UserProfile => ({
  id: row.id,
  fullName: row.full_name,
  email: row.email,
  phone: row.phone || '',
  role: (row.role as 'Patient' | 'Doctor') || 'Patient',
  avatarUrl: row.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  patientId: row.patient_id_code || 'PAT-000000',
  memberSince: row.member_since || '2026',
  medicalInfo: {
    bloodGroup: row.blood_group || 'O+',
    age: row.age || 38,
    weight: row.weight || '68 kg',
    height: row.height || '172 cm',
    allergies: row.allergies || [],
    chronicDiseases: row.chronic_diseases || [],
    emergencyContact: {
      name: row.emergency_contact_name || 'Emergency Contact',
      relation: row.emergency_contact_relation || 'Spouse',
      phone: row.emergency_contact_phone || '911',
    },
  },
});

export const patientsService = {
  async getPatient(id: string = 'p-001') {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };
    try {
      const { data, error } = await supabase.from('patients').select('*').eq('id', id).single();
      if (error) return { data: null, error };
      return { data: mapPatientRowToUserProfile(data), error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },

  async updatePatient(id: string, updated: Partial<UserProfile>) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };
    try {
      const payload: Partial<Database['public']['Tables']['patients']['Update']> = {};
      if (updated.fullName) payload.full_name = updated.fullName;
      if (updated.email) payload.email = updated.email;
      if (updated.phone) payload.phone = updated.phone;
      if (updated.role) payload.role = updated.role;
      if (updated.avatarUrl) payload.avatar_url = updated.avatarUrl;
      if (updated.medicalInfo) {
        if (updated.medicalInfo.bloodGroup) payload.blood_group = updated.medicalInfo.bloodGroup;
        if (updated.medicalInfo.age) payload.age = updated.medicalInfo.age;
        if (updated.medicalInfo.weight) payload.weight = updated.medicalInfo.weight;
        if (updated.medicalInfo.height) payload.height = updated.medicalInfo.height;
        if (updated.medicalInfo.allergies) payload.allergies = updated.medicalInfo.allergies;
        if (updated.medicalInfo.chronicDiseases) payload.chronic_diseases = updated.medicalInfo.chronicDiseases;
        if (updated.medicalInfo.emergencyContact) {
          payload.emergency_contact_name = updated.medicalInfo.emergencyContact.name;
          payload.emergency_contact_relation = updated.medicalInfo.emergencyContact.relation;
          payload.emergency_contact_phone = updated.medicalInfo.emergencyContact.phone;
        }
      }

      const { data, error } = await supabase.from('patients').update(payload).eq('id', id).select().single();
      if (error) return { data: null, error };
      return { data: mapPatientRowToUserProfile(data), error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },

  async createPatient(patient: UserProfile) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };
    try {
      const { data, error } = await supabase.from('patients').insert({
        id: patient.id,
        full_name: patient.fullName,
        email: patient.email,
        phone: patient.phone,
        role: patient.role,
        avatar_url: patient.avatarUrl,
        patient_id_code: patient.patientId,
        member_since: patient.memberSince,
        blood_group: patient.medicalInfo.bloodGroup,
        age: patient.medicalInfo.age,
        weight: patient.medicalInfo.weight,
        height: patient.medicalInfo.height,
        allergies: patient.medicalInfo.allergies,
        chronic_diseases: patient.medicalInfo.chronicDiseases,
        emergency_contact_name: patient.medicalInfo.emergencyContact.name,
        emergency_contact_relation: patient.medicalInfo.emergencyContact.relation,
        emergency_contact_phone: patient.medicalInfo.emergencyContact.phone,
      }).select().single();
      if (error) return { data: null, error };
      return { data: mapPatientRowToUserProfile(data), error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },
};
