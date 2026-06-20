-- ============================================================================
-- AgricGrant AI — Full Database Schema Migration
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. farmer_profiles — stores farmer intake form data
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS farmer_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    farmer_name VARCHAR(200) NOT NULL,
    state_of_residence VARCHAR(50) NOT NULL,
    lga VARCHAR(100) DEFAULT '',
    farm_address TEXT DEFAULT '',
    farm_type VARCHAR(50) NOT NULL,
    crop_or_livestock_types JSONB DEFAULT '[]'::jsonb,
    farm_size_hectares NUMERIC,
    annual_revenue_ngn NUMERIC,
    farming_experience_years NUMERIC,
    funding_purpose TEXT NOT NULL,
    is_smallholder_farmer BOOLEAN DEFAULT FALSE,
    is_youth_farmer BOOLEAN DEFAULT FALSE,
    is_woman_farmer BOOLEAN DEFAULT FALSE,
    has_cac_registration BOOLEAN DEFAULT FALSE,
    has_land_document BOOLEAN DEFAULT FALSE,
    is_member_of_cooperative BOOLEAN DEFAULT FALSE,
    has_bvn BOOLEAN DEFAULT FALSE,
    has_existing_loan_default BOOLEAN DEFAULT FALSE,
    additional_notes TEXT DEFAULT '',
    nin_document_path TEXT,
    cac_document_path TEXT,
    bank_statement_path TEXT,
    land_document_path TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for farmer_profiles
ALTER TABLE farmer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profiles" ON farmer_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profiles" ON farmer_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profiles" ON farmer_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to profiles" ON farmer_profiles
    FOR ALL USING (auth.role() = 'service_role');

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. chat_sessions
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_sessions (
    session_id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    farmer_name VARCHAR(200) NOT NULL,
    farmer_profile JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    last_active TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to sessions" ON chat_sessions
    FOR ALL USING (auth.role() = 'service_role');

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. chat_messages
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
    id BIGSERIAL PRIMARY KEY,
    session_id UUID REFERENCES chat_sessions(session_id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT now(),
    suggested_actions JSONB DEFAULT '[]'::jsonb
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to messages" ON chat_messages
    FOR ALL USING (auth.role() = 'service_role');

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. pipeline_jobs
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pipeline_jobs (
    job_id VARCHAR(100) PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    application_reference VARCHAR(50) UNIQUE NOT NULL,
    farmer_name VARCHAR(200) NOT NULL,
    state_of_residence VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PROCESSING', 'COMPLETED', 'FAILED', 'DISQUALIFIED')),
    farmer_profile JSONB NOT NULL,
    result JSONB,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE pipeline_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own jobs" ON pipeline_jobs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to jobs" ON pipeline_jobs
    FOR ALL USING (auth.role() = 'service_role');

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Storage bucket for farmer documents
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'farmer-documents',
    'farmer-documents',
    FALSE,
    5242880,
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY "Auth users upload to own folder" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'farmer-documents'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Auth users read own files" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'farmer-documents'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Auth users delete own files" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'farmer-documents'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Service role full storage access" ON storage.objects
    FOR ALL TO service_role
    USING (bucket_id = 'farmer-documents');

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Auto-update trigger for updated_at
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_farmer_profiles_updated_at
    BEFORE UPDATE ON farmer_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
