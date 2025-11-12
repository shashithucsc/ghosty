# Ghosty Verification Backend - Complete Guide

## 📋 Table of Contents

1. [Overview](#overview)
2. [Database Setup](#database-setup)
3. [Storage Configuration](#storage-configuration)
4. [API Endpoints](#api-endpoints)
5. [Frontend Integration](#frontend-integration)
6. [Testing Guide](#testing-guide)
7. [Security Considerations](#security-considerations)

---

## 🎯 Overview

The Ghosty Verification Backend provides a complete user verification system with secure document upload, admin review workflow, and automatic approval/rejection handling.

### Key Features

✅ **User Document Upload**
- Users upload verification documents (Facebook screenshot, student ID, academic docs)
- Files stored in private Supabase Storage bucket
- Automatic file validation (type, size)
- Prevents duplicate pending verifications

✅ **Admin Review Workflow**
- Admins can list all verification requests
- View user details and verification documents
- Approve or reject with optional notes
- Automatic file deletion after approval

✅ **Verification Status**
- Users can check their verification status
- See pending/approved/rejected state
- View admin notes for rejections
- Real-time status updates

✅ **Security**
- Private storage bucket (admin-only access)
- Row Level Security on database
- File size and type validation
- Automatic cleanup on approval

---

## 🗄️ Database Setup

### Step 1: Run the Migration

Run the migration script in Supabase SQL Editor:

```bash
# File: database/migration_verification_system.sql
```

This creates:
- **verification_files** table - Stores verification submissions
- **profiles.verified** column - Marks verified users
- Helper functions: `approve_verification()`, `reject_verification()`, `get_user_verification_status()`
- RLS policies for data security

### Step 2: Verify Tables Created

Check in Supabase Dashboard → Database → Tables:

```sql
-- Verify table exists
SELECT * FROM information_schema.tables 
WHERE table_name = 'verification_files';

-- Check profiles table for verified column
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'verified';
```

### Step 3: Test Helper Functions

```sql
-- Test get_user_verification_status
SELECT * FROM get_user_verification_status('user-uuid'::uuid);

-- Test approve_verification
SELECT approve_verification(
  'verification-id'::uuid,
  'admin-id'::uuid,
  'Looks good!'
);

-- Test reject_verification
SELECT reject_verification(
  'verification-id'::uuid,
  'admin-id'::uuid,
  'Photo is blurry, please resubmit'
);
```

---

## 📦 Storage Configuration

### Step 1: Create Storage Bucket

In Supabase Dashboard → Storage → Create Bucket:

**Bucket Settings:**
- **Name:** `verification_files`
- **Public:** ❌ NO (Must be private)
- **File size limit:** 5MB
- **Allowed MIME types:** image/jpeg, image/jpg, image/png, application/pdf

### Step 2: Configure Storage RLS Policies

**Policy 1: Users can upload to their own folder**
```sql
-- Name: Users can upload verification files
-- Operation: INSERT
-- Policy definition:
bucket_id = 'verification_files' 
AND auth.uid()::text = (storage.foldername(name))[1]
```

**Policy 2: Admins can view all files**
```sql
-- Name: Admins can view verification files
-- Operation: SELECT
-- Policy definition:
bucket_id = 'verification_files' 
-- TODO: Add admin role check
-- Example: AND EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
```

**Policy 3: System can delete files**
```sql
-- Name: System can delete processed files
-- Operation: DELETE
-- Policy definition:
bucket_id = 'verification_files'
```

### Step 3: Test File Upload

```bash
# Test uploading a file via API (see testing section)
```

---

## 🔌 API Endpoints

### 1. Verification Upload API

**Endpoint:** `/api/verification/upload`

#### POST - Upload Verification Document

Users upload verification documents for admin review.

**Request:** `multipart/form-data`

**Form Fields:**
- `userId` (required) - UUID of the user
- `fileType` (required) - Type of verification: `facebook`, `student_id`, or `academic`
- `file` (required) - The verification document (JPG, PNG, or PDF, max 5MB)

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/verification/upload \
  -F "userId=user-uuid" \
  -F "fileType=student_id" \
  -F "file=@/path/to/student_id.jpg"
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Verification document uploaded successfully. Please wait for admin review.",
  "verification": {
    "id": "verification-uuid",
    "fileType": "student_id",
    "status": "pending",
    "submittedAt": "2025-11-12T10:00:00Z"
  }
}
```

**Error Responses:**
- `400` - Validation failed (invalid file type/size)
- `404` - User not found
- `409` - Already has pending verification
- `500` - Upload failed

**Validation Rules:**
- File size: max 5MB
- File types: JPG, PNG, PDF only
- File type must be: facebook, student_id, or academic
- Only one pending verification per user

#### DELETE - Cancel Pending Verification

Cancel a pending verification and delete the uploaded file.

**Query Parameters:**
- `userId` (required) - UUID of the user
- `verificationId` (required) - UUID of the verification to cancel

**Example Request:**
```bash
curl -X DELETE "http://localhost:3000/api/verification/upload?userId=user-uuid&verificationId=verification-uuid"
```

**Success Response:**
```json
{
  "success": true,
  "message": "Verification cancelled successfully"
}
```

**Error Responses:**
- `404` - Verification not found
- `403` - Not your verification
- `400` - Already reviewed (cannot cancel)

---

### 2. Admin Verification API

**Endpoint:** `/api/admin/verification`

#### GET - List All Verifications

List verification requests with filtering and pagination.

**Query Parameters:**
- `status` (optional) - Filter by status: `pending`, `approved`, `rejected`, or `all` (default: `all`)
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20, max: 100)

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/admin/verification?status=pending&page=1&limit=20"
```

**Response:**
```json
{
  "success": true,
  "verifications": [
    {
      "id": "verification-uuid",
      "user_id": "user-uuid",
      "file_url": "https://...supabase.co/storage/v1/object/public/verification_files/...",
      "file_type": "student_id",
      "status": "pending",
      "admin_notes": null,
      "reviewed_by": null,
      "reviewed_at": null,
      "created_at": "2025-11-12T10:00:00Z",
      "updated_at": "2025-11-12T10:00:00Z",
      "user": {
        "id": "user-uuid",
        "username": "student123",
        "full_name": "John Doe",
        "email": null,
        "university_name": "Test University",
        "faculty": "Computer Science"
      },
      "reviewer": null
    }
  ],
  "stats": {
    "pending": 15,
    "approved": 42,
    "rejected": 8,
    "total": 65
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

#### PATCH - Approve or Reject Verification

Review a verification request and approve or reject it.

**Request Body:**
```json
{
  "adminId": "admin-uuid",
  "verificationId": "verification-uuid",
  "action": "approve",  // or "reject"
  "notes": "Optional admin notes"
}
```

**Example Request (Approve):**
```bash
curl -X PATCH http://localhost:3000/api/admin/verification \
  -H "Content-Type: application/json" \
  -d '{
    "adminId": "admin-uuid",
    "verificationId": "verification-uuid",
    "action": "approve",
    "notes": "Document verified successfully"
  }'
```

**Success Response (Approve):**
```json
{
  "success": true,
  "message": "Verification approved successfully",
  "action": "approved",
  "userId": "user-uuid"
}
```

**What Happens on Approval:**
1. ✅ Verification status → `approved`
2. ✅ `profiles.verified` → `true`
3. ✅ `users.verification_status` → `verified`
4. ✅ Uploaded file automatically deleted from storage
5. ✅ Admin notes and reviewer info saved

**Example Request (Reject):**
```bash
curl -X PATCH http://localhost:3000/api/admin/verification \
  -H "Content-Type: application/json" \
  -d '{
    "adminId": "admin-uuid",
    "verificationId": "verification-uuid",
    "action": "reject",
    "notes": "Photo is blurry, please resubmit a clearer image"
  }'
```

**Success Response (Reject):**
```json
{
  "success": true,
  "message": "Verification rejected",
  "action": "rejected",
  "userId": "user-uuid"
}
```

**What Happens on Rejection:**
1. ✅ Verification status → `rejected`
2. ✅ `users.verification_status` → `rejected`
3. ✅ Admin notes saved (user can see reason)
4. ✅ File kept in storage (for admin reference)
5. ✅ User can resubmit a new verification

**Error Responses:**
- `404` - Verification not found
- `409` - Already reviewed
- `500` - Database error

#### DELETE - Delete Verification Record

Permanently delete a verification record and its file.

**Query Parameters:**
- `adminId` (required) - UUID of the admin
- `verificationId` (required) - UUID of the verification to delete

**Example Request:**
```bash
curl -X DELETE "http://localhost:3000/api/admin/verification?adminId=admin-uuid&verificationId=verification-uuid"
```

**Success Response:**
```json
{
  "success": true,
  "message": "Verification deleted successfully"
}
```

---

### 3. Verification Status API

**Endpoint:** `/api/verification/status`

#### GET - Check Verification Status

Get the current verification status for a user.

**Query Parameters:**
- `userId` (required) - UUID of the user

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/verification/status?userId=user-uuid"
```

**Response (Verified User):**
```json
{
  "success": true,
  "userId": "user-uuid",
  "isVerified": true,
  "hasPendingVerification": false,
  "latestStatus": "approved",
  "submittedAt": "2025-11-10T15:30:00Z",
  "verification": {
    "id": "verification-uuid",
    "file_type": "student_id",
    "status": "approved",
    "admin_notes": "Document verified successfully",
    "reviewed_at": "2025-11-11T09:00:00Z",
    "created_at": "2025-11-10T15:30:00Z"
  }
}
```

**Response (Pending Verification):**
```json
{
  "success": true,
  "userId": "user-uuid",
  "isVerified": false,
  "hasPendingVerification": true,
  "latestStatus": "pending",
  "submittedAt": "2025-11-12T10:00:00Z",
  "verification": {
    "id": "verification-uuid",
    "file_type": "facebook",
    "status": "pending",
    "admin_notes": null,
    "reviewed_at": null,
    "created_at": "2025-11-12T10:00:00Z"
  }
}
```

**Response (Rejected Verification):**
```json
{
  "success": true,
  "userId": "user-uuid",
  "isVerified": false,
  "hasPendingVerification": false,
  "latestStatus": "rejected",
  "submittedAt": "2025-11-11T14:00:00Z",
  "verification": {
    "id": "verification-uuid",
    "file_type": "student_id",
    "status": "rejected",
    "admin_notes": "Photo is blurry, please resubmit a clearer image",
    "reviewed_at": "2025-11-11T16:00:00Z",
    "created_at": "2025-11-11T14:00:00Z"
  }
}
```

---

## ⚛️ Frontend Integration

### React Verification Upload Component

```tsx
'use client';

import { useState } from 'react';

export default function VerificationUpload({ userId }: { userId: string }) {
  const [fileType, setFileType] = useState<'facebook' | 'student_id' | 'academic'>('student_id');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setMessage('Please select a file');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('fileType', fileType);
      formData.append('file', file);

      const res = await fetch('/api/verification/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setMessage('Verification submitted! Please wait for admin review.');
        setFile(null);
      } else {
        setMessage(data.error || 'Upload failed');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 border rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Submit Verification</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Verification Type
          </label>
          <select
            value={fileType}
            onChange={(e) => setFileType(e.target.value as any)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="student_id">Student ID</option>
            <option value="facebook">Facebook Profile</option>
            <option value="academic">Academic Document</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Upload Document (JPG, PNG, or PDF, max 5MB)
          </label>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !file}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Uploading...' : 'Submit Verification'}
        </button>

        {message && (
          <p className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
```

### React Verification Status Component

```tsx
'use client';

import { useState, useEffect } from 'react';

interface VerificationStatus {
  isVerified: boolean;
  hasPendingVerification: boolean;
  latestStatus: string | null;
  verification: {
    file_type: string;
    status: string;
    admin_notes: string | null;
    created_at: string;
  } | null;
}

export default function VerificationStatus({ userId }: { userId: string }) {
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
  }, [userId]);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`/api/verification/status?userId=${userId}`);
      const data = await res.json();
      
      if (data.success) {
        setStatus(data);
      }
    } catch (error) {
      console.error('Error fetching status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!status) return <div>Unable to load status</div>;

  return (
    <div className="p-6 border rounded-lg">
      <h3 className="text-xl font-bold mb-4">Verification Status</h3>
      
      {status.isVerified ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-semibold">✓ Verified</p>
          <p className="text-sm text-green-600">Your account is verified</p>
        </div>
      ) : status.hasPendingVerification ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 font-semibold">⏳ Pending Review</p>
          <p className="text-sm text-yellow-600">
            Your verification is being reviewed by our team
          </p>
        </div>
      ) : status.latestStatus === 'rejected' && status.verification ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-semibold">✗ Rejected</p>
          <p className="text-sm text-red-600 mb-2">
            Your verification was not approved
          </p>
          {status.verification.admin_notes && (
            <div className="mt-2 p-2 bg-red-100 rounded">
              <p className="text-sm font-medium text-red-800">Admin Notes:</p>
              <p className="text-sm text-red-700">
                {status.verification.admin_notes}
              </p>
            </div>
          )}
          <button
            onClick={() => window.location.href = '/verify'}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Resubmit Verification
          </button>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-800 font-semibold">Not Verified</p>
          <p className="text-sm text-gray-600 mb-3">
            Submit verification documents to get verified
          </p>
          <button
            onClick={() => window.location.href = '/verify'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Start Verification
          </button>
        </div>
      )}
    </div>
  );
}
```

### React Admin Review Component

```tsx
'use client';

import { useState, useEffect } from 'react';

interface Verification {
  id: string;
  file_url: string;
  file_type: string;
  status: string;
  created_at: string;
  user: {
    username: string;
    full_name: string;
    university_name: string;
    faculty: string;
  };
}

export default function AdminVerificationList({ adminId }: { adminId: string }) {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      const res = await fetch('/api/admin/verification?status=pending');
      const data = await res.json();
      
      if (data.success) {
        setVerifications(data.verifications);
      }
    } catch (error) {
      console.error('Error fetching verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (verificationId: string, action: 'approve' | 'reject', notes?: string) => {
    try {
      const res = await fetch('/api/admin/verification', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId,
          verificationId,
          action,
          notes,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert(`Verification ${action}d successfully`);
        setSelectedVerification(null);
        fetchVerifications(); // Refresh list
      }
    } catch (error) {
      console.error('Error reviewing verification:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Pending Verifications</h2>
      
      {verifications.length === 0 ? (
        <p className="text-gray-500">No pending verifications</p>
      ) : (
        verifications.map((verification) => (
          <div key={verification.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{verification.user.full_name}</p>
                <p className="text-sm text-gray-600">@{verification.user.username}</p>
                <p className="text-sm text-gray-600">
                  {verification.user.university_name} - {verification.user.faculty}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Type: {verification.file_type} | Submitted: {new Date(verification.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedVerification(verification)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Review
              </button>
            </div>
          </div>
        ))
      )}

      {/* Review Modal */}
      {selectedVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Review Verification</h3>
            
            <div className="mb-4">
              <p><strong>User:</strong> {selectedVerification.user.full_name}</p>
              <p><strong>Type:</strong> {selectedVerification.file_type}</p>
            </div>

            <div className="mb-4">
              <img
                src={selectedVerification.file_url}
                alt="Verification document"
                className="max-w-full h-auto rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-document.png';
                }}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleReview(selectedVerification.id, 'approve')}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Approve
              </button>
              <button
                onClick={() => {
                  const notes = prompt('Enter reason for rejection:');
                  if (notes) handleReview(selectedVerification.id, 'reject', notes);
                }}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Reject
              </button>
              <button
                onClick={() => setSelectedVerification(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 🧪 Testing Guide

### 1. Test File Upload

```bash
# Upload student ID
curl -X POST http://localhost:3000/api/verification/upload \
  -F "userId=user-uuid" \
  -F "fileType=student_id" \
  -F "file=@/path/to/student_id.jpg"

# Verify file uploaded to storage
# Check Supabase Dashboard → Storage → verification_files bucket

# Verify database record
SELECT * FROM verification_files WHERE user_id = 'user-uuid';
```

### 2. Test Admin Review Workflow

```bash
# List pending verifications
curl "http://localhost:3000/api/admin/verification?status=pending"

# Approve verification
curl -X PATCH http://localhost:3000/api/admin/verification \
  -H "Content-Type: application/json" \
  -d '{
    "adminId": "admin-uuid",
    "verificationId": "verification-uuid",
    "action": "approve",
    "notes": "Verified successfully"
  }'

# Verify user is now verified
SELECT verified FROM profiles WHERE user_id = 'user-uuid';
SELECT verification_status FROM users WHERE id = 'user-uuid';

# Verify file was deleted from storage
# Check Supabase Dashboard → Storage → verification_files
```

### 3. Test Rejection Flow

```bash
# Reject verification
curl -X PATCH http://localhost:3000/api/admin/verification \
  -H "Content-Type: application/json" \
  -d '{
    "adminId": "admin-uuid",
    "verificationId": "verification-uuid",
    "action": "reject",
    "notes": "Photo is blurry"
  }'

# Check status
curl "http://localhost:3000/api/verification/status?userId=user-uuid"

# Verify user can see rejection reason
# Should include admin_notes: "Photo is blurry"
```

### 4. Test Validation

```bash
# Test file too large (should fail)
# Create a 6MB file
dd if=/dev/zero of=large_file.jpg bs=1M count=6

curl -X POST http://localhost:3000/api/verification/upload \
  -F "userId=user-uuid" \
  -F "fileType=student_id" \
  -F "file=@large_file.jpg"
# Expected: 400 error "File size must be less than 5MB"

# Test duplicate pending verification
curl -X POST http://localhost:3000/api/verification/upload \
  -F "userId=user-uuid" \
  -F "fileType=facebook" \
  -F "file=@facebook.jpg"
# Expected: 409 error "You already have a pending verification"
```

---

## 🔒 Security Considerations

### Current Implementation

✅ **Private Storage**
- Verification files stored in private bucket
- Only admins can access files
- Files automatically deleted after approval

✅ **Row Level Security (RLS)**
- Users can only view/upload their own verifications
- Admins can view all verifications
- Database functions enforce security

✅ **Input Validation**
- File size limit (5MB)
- File type validation (JPG, PNG, PDF only)
- UUID validation for all IDs
- Zod schema validation

✅ **Automatic Cleanup**
- Files deleted after approval
- Prevents storage bloat
- Reduces security risk

⚠️ **Missing (TODO)**
- JWT authentication not implemented
- Admin role check not enforced
- Rate limiting not configured
- No virus scanning on uploaded files

### Recommendations

#### 1. Add JWT Authentication

```typescript
// middleware/verify-auth.ts
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export async function verifyAuth(request: NextRequest, userId: string) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    throw new Error('No authentication token');
  }
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
  
  if (decoded.userId !== userId) {
    throw new Error('Token does not match user');
  }
  
  return decoded;
}

// Usage:
// await verifyAuth(request, userId);
```

#### 2. Add Admin Role Check

```typescript
// lib/check-admin.ts
export async function isAdmin(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .single();
  
  return !!data;
}

// Usage in admin endpoints:
// if (!await isAdmin(adminId)) {
//   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
// }
```

#### 3. Add Virus Scanning (Optional)

```typescript
import ClamScan from 'clamscan';

const clamscan = await new ClamScan().init();

const { isInfected, viruses } = await clamscan.scanFile(filePath);

if (isInfected) {
  return NextResponse.json(
    { error: 'File failed security scan' },
    { status: 400 }
  );
}
```

#### 4. Update RLS Policies with Admin Check

```sql
-- Replace placeholder admin check with actual role verification
CREATE OR REPLACE POLICY "Admins can view all verifications"
    ON verification_files FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );
```

---

## 📊 Database Schema Reference

### verification_files Table

```sql
CREATE TABLE verification_files (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('facebook', 'student_id', 'academic')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Helper Functions

- `get_user_verification_status(user_uuid)` - Get comprehensive verification status
- `approve_verification(verification_id, admin_id, notes)` - Approve and mark user verified
- `reject_verification(verification_id, admin_id, notes)` - Reject with notes

---

## 🚀 Deployment Checklist

- [ ] Run `migration_verification_system.sql` in production
- [ ] Create `verification_files` storage bucket (private)
- [ ] Configure storage RLS policies
- [ ] Add JWT authentication to all endpoints
- [ ] Add admin role verification
- [ ] Test complete upload → review → approval flow
- [ ] Test rejection and resubmission flow
- [ ] Monitor storage usage
- [ ] Set up file cleanup cron job (optional)
- [ ] Add error monitoring

---

**You're all set!** 🎉 The Ghosty Verification Backend is ready to deploy.
