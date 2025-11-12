'use client';

import { useState } from 'react';
import { Upload, CheckCircle, XCircle, Clock, Shield, Info, X } from 'lucide-react';

export function VerificationSection() {
  const [requestVerification, setRequestVerification] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);
  const [files, setFiles] = useState({
    facebook: null as File | null,
    studentId: null as File | null,
    academicDoc: null as File | null,
  });
  const [previews, setPreviews] = useState({
    facebook: '',
    studentId: '',
    academicDoc: '',
  });
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (type: 'facebook' | 'studentId' | 'academicDoc', file: File | null) => {
    if (file) {
      setFiles({ ...files, [type]: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews({ ...previews, [type]: reader.result as string });
      };
      reader.readAsDataURL(file);
    } else {
      setFiles({ ...files, [type]: null });
      setPreviews({ ...previews, [type]: '' });
    }
  };

  const removeFile = (type: 'facebook' | 'studentId' | 'academicDoc') => {
    handleFileChange(type, null);
  };

  const handleSubmitVerification = async () => {
    if (!files.facebook && !files.studentId && !files.academicDoc) {
      alert('Please upload at least one verification document');
      return;
    }

    setUploading(true);
    // Simulate upload
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setUploading(false);
    setVerificationStatus('pending');
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (verificationStatus) {
      case 'pending':
        return { title: 'Verification Pending', desc: 'Your verification request is under review. We\'ll notify you within 24-48 hours.' };
      case 'approved':
        return { title: 'Verified! ✓', desc: 'Congratulations! You now have a verified badge on your profile.' };
      case 'rejected':
        return { title: 'Verification Rejected', desc: 'Your verification was rejected. Please ensure documents are clear and valid.' };
      default:
        return null;
    }
  };

  if (verificationStatus) {
    const status = getStatusText();
    return (
      <div className="glassmorphic-card p-6 sm:p-8">
        <div className="flex items-center gap-4 mb-4">
          {getStatusIcon()}
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">{status?.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{status?.desc}</p>
          </div>
        </div>
        {verificationStatus === 'pending' && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              <strong>What's next?</strong> Our team is reviewing your documents. You can start using Ghosty now, and your verified badge will appear once approved.
            </p>
          </div>
        )}
        {verificationStatus === 'rejected' && (
          <button
            onClick={() => setVerificationStatus(null)}
            className="mt-4 text-purple-600 hover:text-purple-700 font-semibold text-sm"
          >
            Try again →
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="glassmorphic-card p-6 sm:p-8">
      <div className="flex items-start gap-3 mb-6">
        <Shield className="w-6 h-6 text-purple-600 shrink-0 mt-1" />
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            Get Verified (Optional)
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Get a verified badge to build trust and stand out on the platform
          </p>
        </div>
      </div>

      <div className="mb-6">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={requestVerification}
              onChange={(e) => setRequestVerification(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:bg-linear-to-r peer-checked:from-purple-600 peer-checked:to-pink-600 transition-all"></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-purple-600 transition-colors">
            I want to request a verified badge
          </span>
        </label>
      </div>

      {requestVerification && (
        <div className="space-y-6 animate-slide-up">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-blue-800 dark:text-blue-300">
              <p className="font-semibold mb-1">Verification Requirements</p>
              <p>Upload at least one of the following to verify your identity:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Facebook profile screenshot (showing your name)</li>
                <li>Student ID card photo</li>
                <li>Academic document (transcript, enrollment letter)</li>
              </ul>
            </div>
          </div>

          {/* Facebook Screenshot */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Facebook Profile Screenshot
            </label>
            <div className="relative">
              {!previews.facebook ? (
                <label className="upload-box group cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 group-hover:text-purple-600 transition-colors mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-purple-600 transition-colors">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('facebook', e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative group">
                  <img src={previews.facebook} alt="Facebook preview" className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700" />
                  <button
                    onClick={() => removeFile('facebook')}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Student ID */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Student ID Card
            </label>
            <div className="relative">
              {!previews.studentId ? (
                <label className="upload-box group cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 group-hover:text-purple-600 transition-colors mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-purple-600 transition-colors">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('studentId', e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative group">
                  <img src={previews.studentId} alt="Student ID preview" className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700" />
                  <button
                    onClick={() => removeFile('studentId')}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Academic Document */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Academic Document
            </label>
            <div className="relative">
              {!previews.academicDoc ? (
                <label className="upload-box group cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 group-hover:text-purple-600 transition-colors mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-purple-600 transition-colors">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, PDF up to 5MB</p>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange('academicDoc', e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative group">
                  {previews.academicDoc.startsWith('data:application/pdf') ? (
                    <div className="w-full h-48 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
                      <p className="text-gray-600 dark:text-gray-400">PDF Document Uploaded</p>
                    </div>
                  ) : (
                    <img src={previews.academicDoc} alt="Academic doc preview" className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700" />
                  )}
                  <button
                    onClick={() => removeFile('academicDoc')}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleSubmitVerification}
            disabled={uploading || (!files.facebook && !files.studentId && !files.academicDoc)}
            className="w-full btn-secondary py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="spinner" />
                Uploading documents...
              </span>
            ) : (
              'Submit for Verification'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
