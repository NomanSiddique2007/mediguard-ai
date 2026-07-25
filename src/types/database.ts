export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string;
          role: string;
          avatar_url: string;
          patient_id_code: string;
          member_since: string;
          blood_group: string;
          age: number;
          weight: string;
          height: string;
          allergies: string[];
          chronic_diseases: string[];
          emergency_contact_name: string;
          emergency_contact_relation: string;
          emergency_contact_phone: string;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          email: string;
          phone?: string;
          role?: string;
          avatar_url?: string;
          patient_id_code?: string;
          member_since?: string;
          blood_group?: string;
          age?: number;
          weight?: string;
          height?: string;
          allergies?: string[];
          chronic_diseases?: string[];
          emergency_contact_name?: string;
          emergency_contact_relation?: string;
          emergency_contact_phone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          phone?: string;
          role?: string;
          avatar_url?: string;
          patient_id_code?: string;
          member_since?: string;
          blood_group?: string;
          age?: number;
          weight?: string;
          height?: string;
          allergies?: string[];
          chronic_diseases?: string[];
          emergency_contact_name?: string;
          emergency_contact_relation?: string;
          emergency_contact_phone?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      doctors: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string;
          specialty: string;
          license_number: string;
          hospital: string;
          avatar_url: string;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          email: string;
          phone?: string;
          specialty: string;
          license_number: string;
          hospital?: string;
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          phone?: string;
          specialty?: string;
          license_number?: string;
          hospital?: string;
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      prescriptions: {
        Row: {
          id: string;
          patient_id: string;
          doctor_id?: string;
          code: string;
          date: string;
          doctor_name: string;
          doctor_specialty: string;
          hospital: string;
          diagnosis: string;
          status: string;
          image_url?: string;
          ai_summary: string;
          safety_score: number;
          warnings: string[];
          interactions: Json;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          doctor_id?: string;
          code: string;
          date: string;
          doctor_name: string;
          doctor_specialty: string;
          hospital: string;
          diagnosis: string;
          status?: string;
          image_url?: string;
          ai_summary?: string;
          safety_score?: number;
          warnings?: string[];
          interactions?: Json;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          doctor_id?: string;
          code?: string;
          date?: string;
          doctor_name?: string;
          doctor_specialty?: string;
          hospital?: string;
          diagnosis?: string;
          status?: string;
          image_url?: string;
          ai_summary?: string;
          safety_score?: number;
          warnings?: string[];
          interactions?: Json;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      medicines: {
        Row: {
          id: string;
          name: string;
          generic_name: string;
          purpose: string;
          dosage: string;
          frequency: string;
          side_effects: string[];
          food_instructions: string;
          category: string;
          safety_rating: string;
          image?: string;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          name: string;
          generic_name: string;
          purpose: string;
          dosage: string;
          frequency: string;
          side_effects?: string[];
          food_instructions?: string;
          category: string;
          safety_rating: string;
          image?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          generic_name?: string;
          purpose?: string;
          dosage?: string;
          frequency?: string;
          side_effects?: string[];
          food_instructions?: string;
          category?: string;
          safety_rating?: string;
          image?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      prescription_medicines: {
        Row: {
          id: string;
          prescription_id: string;
          medicine_id?: string;
          medicine_name: string;
          dosage: string;
          frequency: string;
          duration: string;
          purpose: string;
          instructions: string;
          warnings?: string;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          prescription_id: string;
          medicine_id?: string;
          medicine_name: string;
          dosage: string;
          frequency: string;
          duration: string;
          purpose: string;
          instructions: string;
          warnings?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          prescription_id?: string;
          medicine_id?: string;
          medicine_name?: string;
          dosage?: string;
          frequency?: string;
          duration?: string;
          purpose?: string;
          instructions?: string;
          warnings?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      ai_analysis: {
        Row: {
          id: string;
          prescription_id: string;
          extracted_text: string;
          confidence_score: number;
          flagged_interactions: Json;
          dosage_check_passed: boolean;
          analysis_timestamp: string;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          prescription_id: string;
          extracted_text: string;
          confidence_score?: number;
          flagged_interactions?: Json;
          dosage_check_passed?: boolean;
          analysis_timestamp?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          prescription_id?: string;
          extracted_text?: string;
          confidence_score?: number;
          flagged_interactions?: Json;
          dosage_check_passed?: boolean;
          analysis_timestamp?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      timeline_events: {
        Row: {
          id: string;
          patient_id: string;
          date: string;
          time?: string;
          title: string;
          category: string;
          doctor?: string;
          description: string;
          status: string;
          icon_type: string;
          attachments?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          date: string;
          time?: string;
          title: string;
          category: string;
          doctor?: string;
          description: string;
          status?: string;
          icon_type?: string;
          attachments?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          date?: string;
          time?: string;
          title?: string;
          category?: string;
          doctor?: string;
          description?: string;
          status?: string;
          icon_type?: string;
          attachments?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      reminders: {
        Row: {
          id: string;
          patient_id: string;
          medicine_name: string;
          dosage: string;
          time_slot: string;
          exact_time: string;
          instructions: string;
          status: string;
          streak_days: number;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          medicine_name: string;
          dosage: string;
          time_slot: string;
          exact_time: string;
          instructions?: string;
          status?: string;
          streak_days?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          medicine_name?: string;
          dosage?: string;
          time_slot?: string;
          exact_time?: string;
          instructions?: string;
          status?: string;
          streak_days?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          is_read: boolean;
          action_url?: string;
          created_at?: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type?: string;
          is_read?: boolean;
          action_url?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: string;
          is_read?: boolean;
          action_url?: string;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id?: string;
          action: string;
          entity_type: string;
          entity_id?: string;
          details: Json;
          ip_address?: string;
          created_at?: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          action: string;
          entity_type: string;
          entity_id?: string;
          details?: Json;
          ip_address?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: string;
          entity_type?: string;
          entity_id?: string;
          details?: Json;
          ip_address?: string;
          created_at?: string;
        };
      };
    };
  };
}
