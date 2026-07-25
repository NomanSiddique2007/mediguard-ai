-- Migration File: 20260725_complete_schema.sql
-- Description: Complete 10-table schema for MediGuard AI with PKs, FKs, Indexes, Cascades, Triggers & RLS Policies.

-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Patients Table
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT DEFAULT '',
    role TEXT NOT NULL DEFAULT 'Patient' CHECK (role IN ('Patient', 'Doctor', 'Admin')),
    avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    patient_id_code TEXT UNIQUE DEFAULT ('PAT-' || floor(random() * 899999 + 100000)::text),
    member_since TEXT DEFAULT '2026',
    blood_group TEXT DEFAULT 'O+',
    age INTEGER DEFAULT 30 CHECK (age >= 0 AND age <= 150),
    weight TEXT DEFAULT '70 kg',
    height TEXT DEFAULT '170 cm',
    allergies TEXT[] DEFAULT '{}',
    chronic_diseases TEXT[] DEFAULT '{}',
    emergency_contact_name TEXT DEFAULT '',
    emergency_contact_relation TEXT DEFAULT '',
    emergency_contact_phone TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Doctors Table
CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT DEFAULT '',
    specialty TEXT NOT NULL DEFAULT 'General Practitioner',
    license_number TEXT UNIQUE NOT NULL,
    hospital TEXT DEFAULT 'MediGuard Clinical Network',
    avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prescriptions Table
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
    code TEXT NOT NULL UNIQUE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    doctor_name TEXT NOT NULL,
    doctor_specialty TEXT NOT NULL DEFAULT 'General Medicine',
    hospital TEXT NOT NULL DEFAULT 'St. Jude Medical Center',
    diagnosis TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Verified' CHECK (status IN ('Verified', 'Action Required', 'Pending Review', 'Archived')),
    image_url TEXT DEFAULT '',
    ai_summary TEXT DEFAULT '',
    safety_score INTEGER DEFAULT 95 CHECK (safety_score BETWEEN 0 AND 100),
    warnings TEXT[] DEFAULT '{}',
    interactions JSONB DEFAULT '[]'::jsonb,
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medicines Table
CREATE TABLE IF NOT EXISTS public.medicines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    generic_name TEXT NOT NULL,
    purpose TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    side_effects TEXT[] DEFAULT '{}',
    food_instructions TEXT DEFAULT 'Take after meals with water',
    category TEXT NOT NULL CHECK (category IN ('Antibiotics', 'Cardiovascular', 'Pain Relief', 'Vitamins', 'Diabetes', 'Respiratory', 'Gastrointestinal')),
    safety_rating TEXT NOT NULL DEFAULT 'A+' CHECK (safety_rating IN ('A+', 'A', 'B', 'Caution')),
    image TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prescription Medicines Table
CREATE TABLE IF NOT EXISTS public.prescription_medicines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID NOT NULL REFERENCES public.prescriptions(id) ON DELETE CASCADE,
    medicine_id UUID REFERENCES public.medicines(id) ON DELETE SET NULL,
    medicine_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    duration TEXT NOT NULL,
    purpose TEXT NOT NULL,
    instructions TEXT NOT NULL,
    warnings TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Analysis Table
CREATE TABLE IF NOT EXISTS public.ai_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID NOT NULL REFERENCES public.prescriptions(id) ON DELETE CASCADE,
    extracted_text TEXT NOT NULL,
    confidence_score NUMERIC(5,2) DEFAULT 98.50,
    flagged_interactions JSONB DEFAULT '[]'::jsonb,
    dosage_check_passed BOOLEAN DEFAULT true,
    analysis_timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Timeline Events Table
CREATE TABLE IF NOT EXISTS public.timeline_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    time TEXT DEFAULT '09:00 AM',
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Doctor Visit', 'Diagnosis', 'Medicine', 'Recovery', 'Vaccination', 'Lab Result')),
    doctor TEXT DEFAULT '',
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Completed' CHECK (status IN ('Completed', 'Upcoming', 'In Progress')),
    icon_type TEXT DEFAULT 'Prescription',
    attachments TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reminders Table
CREATE TABLE IF NOT EXISTS public.reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    medicine_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    time_slot TEXT NOT NULL CHECK (time_slot IN ('Morning', 'Afternoon', 'Evening', 'Night')),
    exact_time TEXT NOT NULL,
    instructions TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Taken', 'Pending', 'Skipped', 'Snoozed')),
    streak_days INTEGER DEFAULT 0 CHECK (streak_days >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
    is_read BOOLEAN DEFAULT false,
    action_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT DEFAULT '',
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_patients_email ON public.patients(email);
CREATE INDEX IF NOT EXISTS idx_doctors_email ON public.doctors(email);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON public.prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor_id ON public.prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescription_medicines_prescription_id ON public.prescription_medicines(prescription_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_prescription_id ON public.ai_analysis(prescription_id);
CREATE INDEX IF NOT EXISTS idx_timeline_events_patient_id ON public.timeline_events(patient_id);
CREATE INDEX IF NOT EXISTS idx_reminders_patient_id ON public.reminders(patient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);

-- Updated At Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_patients_modtime BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_doctors_modtime BEFORE UPDATE ON public.doctors FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_prescriptions_modtime BEFORE UPDATE ON public.prescriptions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_medicines_modtime BEFORE UPDATE ON public.medicines FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_prescription_medicines_modtime BEFORE UPDATE ON public.prescription_medicines FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_ai_analysis_modtime BEFORE UPDATE ON public.ai_analysis FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_timeline_events_modtime BEFORE UPDATE ON public.timeline_events FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_reminders_modtime BEFORE UPDATE ON public.reminders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- RLS & Policies
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Patients full access') THEN
        CREATE POLICY "Patients full access" ON public.patients FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Doctors full access') THEN
        CREATE POLICY "Doctors full access" ON public.doctors FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Prescriptions full access') THEN
        CREATE POLICY "Prescriptions full access" ON public.prescriptions FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Medicines full access') THEN
        CREATE POLICY "Medicines full access" ON public.medicines FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Prescription Medicines full access') THEN
        CREATE POLICY "Prescription Medicines full access" ON public.prescription_medicines FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'AI Analysis full access') THEN
        CREATE POLICY "AI Analysis full access" ON public.ai_analysis FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Timeline Events full access') THEN
        CREATE POLICY "Timeline Events full access" ON public.timeline_events FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Reminders full access') THEN
        CREATE POLICY "Reminders full access" ON public.reminders FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Notifications full access') THEN
        CREATE POLICY "Notifications full access" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Audit Logs full access') THEN
        CREATE POLICY "Audit Logs full access" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;
