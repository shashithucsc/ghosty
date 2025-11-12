-- Ghosty Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
-- Stores authentication data
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  activation_token UUID,
  activation_token_expires TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_activation_token ON users(activation_token);

-- =====================================================
-- PROFILES TABLE
-- Stores user profile information
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  anonymous_name VARCHAR(100) UNIQUE NOT NULL,
  avatar VARCHAR(10) NOT NULL,
  real_name VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  age INTEGER NOT NULL,
  gender VARCHAR(20) NOT NULL CHECK (gender IN ('Male', 'Female', 'Non-binary', 'Other')),
  university VARCHAR(255) NOT NULL,
  faculty VARCHAR(255) NOT NULL,
  bio TEXT NOT NULL CHECK (char_length(bio) >= 20 AND char_length(bio) <= 500),
  interests TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT FALSE,
  preferences_age_min INTEGER DEFAULT 18 CHECK (preferences_age_min >= 18),
  preferences_age_max INTEGER DEFAULT 35 CHECK (preferences_age_max <= 100),
  preferences_gender TEXT[] DEFAULT '{}',
  preferences_interests TEXT[] DEFAULT '{}',
  preferences_hopes TEXT,
  profile_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_anonymous_name ON profiles(anonymous_name);
CREATE INDEX IF NOT EXISTS idx_profiles_university ON profiles(university);
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON profiles(gender);
CREATE INDEX IF NOT EXISTS idx_profiles_age ON profiles(age);
CREATE INDEX IF NOT EXISTS idx_profiles_is_verified ON profiles(is_verified);

-- =====================================================
-- VERIFICATION FILES TABLE
-- Stores verification document requests
-- =====================================================
CREATE TABLE IF NOT EXISTS verification_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_type VARCHAR(50) NOT NULL CHECK (file_type IN ('facebook_screenshot', 'student_id', 'academic_document')),
  file_path TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_verification_files_user_id ON verification_files(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_files_status ON verification_files(status);
CREATE INDEX IF NOT EXISTS idx_verification_files_file_type ON verification_files(file_type);

-- =====================================================
-- STORAGE BUCKETS
-- Run these in Supabase Storage settings or via API
-- =====================================================
-- Create private storage bucket for verification files
-- Bucket name: verification-files
-- Public: false (only admins can access)

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_files ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Users can only read their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Profiles table policies
-- Users can view all profiles (for matching)
CREATE POLICY "Anyone can view profiles" ON profiles
  FOR SELECT USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Verification files policies
-- Users can only view their own verification files
CREATE POLICY "Users can view own verifications" ON verification_files
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own verification files
CREATE POLICY "Users can upload own verifications" ON verification_files
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for profiles table
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Note: Do not use this in production
-- This is only for local testing

-- INSERT INTO users (email, password_hash, email_verified) VALUES
-- ('test@example.com', '$2a$12$examplehashedpassword', true);

-- =====================================================
-- STORAGE POLICIES
-- =====================================================

-- Create storage bucket policy
-- Only authenticated users can upload to their own folder
-- Only admins can view files

-- Run this in Supabase Storage Policies:
/*
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'verification-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Only admins can view verification files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'verification-files' AND
  auth.role() = 'admin'
);
*/
