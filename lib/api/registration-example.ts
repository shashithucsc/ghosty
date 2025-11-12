'use client';

// Example: How to integrate the backend API with your existing registration flow
// This file demonstrates best practices for calling the Ghosty backend API

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type {
  RegisterRequest,
  RegisterResponse,
  CreateProfileRequest,
  CreateProfileResponse,
  LoginRequest,
  LoginResponse,
  APIError,
} from '@/types/api.types';

// =====================================================
// API SERVICE LAYER
// Centralized API calls with error handling
// =====================================================

class GhostyAPIService {
  private baseURL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Helper method for fetch requests
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error: APIError = await response.json();
      throw new Error(error.error || 'An error occurred');
    }

    return response.json();
  }

  // Register new user
  async register(email: string, password: string): Promise<RegisterResponse> {
    return this.request<RegisterResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password } as RegisterRequest),
    });
  }

  // Login user
  async login(email: string, password: string): Promise<LoginResponse> {
    return this.request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password } as LoginRequest),
    });
  }

  // Create profile
  async createProfile(
    profileData: CreateProfileRequest
  ): Promise<CreateProfileResponse> {
    return this.request<CreateProfileResponse>('/api/profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  // Upload verification file
  async uploadVerification(
    userId: string,
    fileType: 'facebook_screenshot' | 'student_id' | 'academic_document',
    file: File
  ) {
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('fileType', fileType);
    formData.append('file', file);

    const response = await fetch(`${this.baseURL}/api/verification`, {
      method: 'POST',
      body: formData, // Don't set Content-Type for FormData
    });

    if (!response.ok) {
      const error: APIError = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  }
}

export const ghostyAPI = new GhostyAPIService();

// =====================================================
// EXAMPLE USAGE IN REGISTRATION PAGE
// Replace your existing mock implementation with these
// =====================================================

export function useRegistration() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Email Registration
  const handleEmailRegistration = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await ghostyAPI.register(email, password);
      
      // Success! Show message to check email
      console.log('Registration successful:', response);
      
      // Store userId temporarily (for profile creation later)
      sessionStorage.setItem('pendingUserId', response.userId);
      
      // Show success message
      alert('Registration successful! Please check your email to activate your account.');
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Profile Creation (after email activation)
  const handleProfileCreation = async (profileData: Omit<CreateProfileRequest, 'userId'>) => {
    setLoading(true);
    setError(null);

    try {
      // Get userId from URL params (passed from activation link)
      const urlParams = new URLSearchParams(window.location.search);
      const userId = urlParams.get('userId');

      if (!userId) {
        throw new Error('User ID not found. Please register again.');
      }

      // Create profile
      const response = await ghostyAPI.createProfile({
        ...profileData,
        userId,
      });

      console.log('Profile created:', response);
      
      // Clear pending userId
      sessionStorage.removeItem('pendingUserId');
      
      // Redirect to dashboard
      router.push('/dashboard');
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Profile creation failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    handleEmailRegistration,
    handleProfileCreation,
    loading,
    error,
  };
}

// =====================================================
// EXAMPLE USAGE IN YOUR COMPONENT
// =====================================================

/*
// In your app/register/page.tsx

'use client';

import { useState } from 'react';
import { useRegistration } from '@/lib/api/registration-example';

export default function RegisterPage() {
  const { handleEmailRegistration, loading, error } = useRegistration();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await handleEmailRegistration(email, password);
      // Show success message or redirect
    } catch (err) {
      // Error is already set in state
      console.error('Registration error:', err);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      
      {error && <div className="error">{error}</div>}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}
*/

// =====================================================
// EXAMPLE: Profile Creation Component
// =====================================================

/*
// In your profile creation page (after email verification)

'use client';

import { useState } from 'react';
import { useRegistration } from '@/lib/api/registration-example';

export default function ProfileCreationPage() {
  const { handleProfileCreation, loading, error } = useRegistration();
  
  const [formData, setFormData] = useState({
    realName: '',
    dateOfBirth: '',
    gender: 'Male' as const,
    university: '',
    faculty: '',
    bio: '',
    interests: [] as string[],
    preferencesAgeMin: 18,
    preferencesAgeMax: 35,
    preferencesGender: [] as string[],
    preferencesInterests: [] as string[],
    preferencesHopes: '',
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await handleProfileCreation(formData);
      // Will redirect to dashboard automatically
    } catch (err) {
      console.error('Profile creation error:', err);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <input
        type="text"
        value={formData.realName}
        onChange={(e) => setFormData({ ...formData, realName: e.target.value })}
        placeholder="Real Name"
        required
      />
      
      <input
        type="date"
        value={formData.dateOfBirth}
        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
        required
      />
      
      <select
        value={formData.gender}
        onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
        required
      >
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Non-binary">Non-binary</option>
        <option value="Other">Other</option>
      </select>
      
      <input
        type="text"
        value={formData.university}
        onChange={(e) => setFormData({ ...formData, university: e.target.value })}
        placeholder="University"
        required
      />
      
      <input
        type="text"
        value={formData.faculty}
        onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
        placeholder="Faculty"
        required
      />
      
      <textarea
        value={formData.bio}
        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
        placeholder="Bio (20-500 characters)"
        minLength={20}
        maxLength={500}
        required
      />
      
      {error && <div className="error">{error}</div>}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Creating Profile...' : 'Create Profile'}
      </button>
    </form>
  );
}
*/

// =====================================================
// EXAMPLE: Verification Upload Component
// =====================================================

/*
'use client';

import { useState } from 'react';
import { ghostyAPI } from '@/lib/api/registration-example';

export default function VerificationUpload({ userId }: { userId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'facebook_screenshot' | 'student_id' | 'academic_document'>('student_id');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const response = await ghostyAPI.uploadVerification(userId, fileType, file);
      console.log('Upload successful:', response);
      alert('Verification document uploaded! Your request is pending review.');
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="verification-upload">
      <h3>Upload Verification Document</h3>
      
      <select
        value={fileType}
        onChange={(e) => setFileType(e.target.value as any)}
      >
        <option value="student_id">Student ID</option>
        <option value="facebook_screenshot">Facebook Screenshot</option>
        <option value="academic_document">Academic Document</option>
      </select>
      
      <input
        type="file"
        accept="image/jpeg,image/png,image/jpg,application/pdf"
        onChange={handleFileChange}
      />
      
      {file && <p>Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>}
      
      {error && <div className="error">{error}</div>}
      
      <button onClick={handleUpload} disabled={uploading || !file}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
}
*/

// =====================================================
// VALIDATION HELPERS
// Use these on the frontend for instant feedback
// =====================================================

export const validators = {
  email: (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  password: (password: string): { valid: boolean; message?: string } => {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'Password must contain an uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'Password must contain a lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'Password must contain a number' };
    }
    return { valid: true };
  },

  age: (dateOfBirth: string): { valid: boolean; message?: string } => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) {
      return { valid: false, message: 'You must be 18 or older' };
    }
    if (age > 100) {
      return { valid: false, message: 'Invalid date of birth' };
    }
    return { valid: true };
  },

  bio: (bio: string): { valid: boolean; message?: string } => {
    if (bio.length < 20) {
      return { valid: false, message: 'Bio must be at least 20 characters' };
    }
    if (bio.length > 500) {
      return { valid: false, message: 'Bio must not exceed 500 characters' };
    }
    return { valid: true };
  },
};
