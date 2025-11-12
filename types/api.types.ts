// API Request/Response Types for Ghosty Backend
// Use these types in your frontend to ensure type safety

// =====================================================
// AUTHENTICATION TYPES
// =====================================================

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  userId: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
    profile: ProfileResponse | null;
  };
}

// =====================================================
// PROFILE TYPES
// =====================================================

export interface CreateProfileRequest {
  userId: string;
  realName: string;
  dateOfBirth: string; // ISO format: "1995-05-15"
  gender: 'Male' | 'Female' | 'Non-binary' | 'Other';
  university: string;
  faculty: string;
  bio: string; // 20-500 characters
  interests: string[];
  preferencesAgeMin: number; // 18-100
  preferencesAgeMax: number; // 18-100
  preferencesGender: string[];
  preferencesInterests: string[];
  preferencesHopes?: string;
}

export interface ProfileResponse {
  id: string;
  anonymousName: string; // e.g., "CharmingSoul456"
  avatar: string; // emoji
  age: number;
  gender: 'Male' | 'Female' | 'Non-binary' | 'Other';
  university: string;
  faculty: string;
  bio: string;
  interests: string[];
  isVerified: boolean;
  preferences: {
    ageMin: number;
    ageMax: number;
    gender: string[];
    interests: string[];
    hopes: string;
  };
  profileCompleted: boolean;
  createdAt: string;
}

export interface CreateProfileResponse {
  message: string;
  profile: ProfileResponse;
}

// =====================================================
// VERIFICATION TYPES
// =====================================================

export type VerificationFileType = 'facebook_screenshot' | 'student_id' | 'academic_document';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export interface UploadVerificationRequest {
  userId: string;
  fileType: VerificationFileType;
  file: File;
}

export interface VerificationRecord {
  id: string;
  fileType: VerificationFileType;
  status: VerificationStatus;
  createdAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface UploadVerificationResponse {
  message: string;
  verification: {
    id: string;
    fileType: VerificationFileType;
    status: VerificationStatus;
    createdAt: string;
  };
}

export interface GetVerificationStatusResponse {
  verifications: VerificationRecord[];
  isVerified: boolean;
}

// =====================================================
// ERROR TYPES
// =====================================================

export interface APIError {
  error: string;
}

// =====================================================
// USAGE EXAMPLES
// =====================================================

/*
// 1. REGISTER USER
const registerUser = async (email: string, password: string) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password } as RegisterRequest),
  });
  
  if (!response.ok) {
    const error: APIError = await response.json();
    throw new Error(error.error);
  }
  
  const data: RegisterResponse = await response.json();
  return data;
};

// 2. LOGIN
const login = async (email: string, password: string) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password } as LoginRequest),
  });
  
  if (!response.ok) {
    const error: APIError = await response.json();
    throw new Error(error.error);
  }
  
  const data: LoginResponse = await response.json();
  
  // Store token
  localStorage.setItem('authToken', data.token);
  
  return data;
};

// 3. CREATE PROFILE
const createProfile = async (profileData: CreateProfileRequest) => {
  const response = await fetch('/api/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData),
  });
  
  if (!response.ok) {
    const error: APIError = await response.json();
    throw new Error(error.error);
  }
  
  const data: CreateProfileResponse = await response.json();
  return data;
};

// 4. GET PROFILE
const getProfile = async (userId: string) => {
  const response = await fetch(`/api/profile?userId=${userId}`);
  
  if (!response.ok) {
    const error: APIError = await response.json();
    throw new Error(error.error);
  }
  
  const data: { profile: ProfileResponse } = await response.json();
  return data.profile;
};

// 5. UPLOAD VERIFICATION
const uploadVerification = async (
  userId: string,
  fileType: VerificationFileType,
  file: File
) => {
  const formData = new FormData();
  formData.append('userId', userId);
  formData.append('fileType', fileType);
  formData.append('file', file);
  
  const response = await fetch('/api/verification', {
    method: 'POST',
    body: formData, // Don't set Content-Type, browser will set it with boundary
  });
  
  if (!response.ok) {
    const error: APIError = await response.json();
    throw new Error(error.error);
  }
  
  const data: UploadVerificationResponse = await response.json();
  return data;
};

// 6. GET VERIFICATION STATUS
const getVerificationStatus = async (userId: string) => {
  const response = await fetch(`/api/verification?userId=${userId}`);
  
  if (!response.ok) {
    const error: APIError = await response.json();
    throw new Error(error.error);
  }
  
  const data: GetVerificationStatusResponse = await response.json();
  return data;
};
*/
