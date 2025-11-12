'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowLeft,
  Calendar,
  Building,
  FileText,
  Upload,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function VerifiedRegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    birthday: '',
    gender: '',
    university: '',
    faculty: '',
    username: '',
    password: '',
    confirmPassword: '',
    partnerPreferences: '',
    bio: '',
  });
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofType, setProofType] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const totalSteps = 3;

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.birthday) {
      newErrors.birthday = 'Birthday is required';
    } else {
      const age = calculateAge(formData.birthday);
      if (age < 18) {
        newErrors.birthday = 'You must be at least 18 years old';
      }
    }

    if (!formData.gender) {
      newErrors.gender = 'Please select your gender';
    }

    if (!formData.university.trim()) {
      newErrors.university = 'University name is required';
    }

    if (!formData.faculty.trim()) {
      newErrors.faculty = 'Faculty name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (formData.username.length > 20) {
      newErrors.username = 'Username must be less than 20 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.bio.trim()) {
      newErrors.bio = 'Bio is required';
    } else if (formData.bio.length < 20) {
      newErrors.bio = 'Bio must be at least 20 characters';
    }

    if (!formData.partnerPreferences.trim()) {
      newErrors.partnerPreferences = 'Partner preferences are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};

    if (!proofType) {
      newErrors.proofType = 'Please select a proof type';
    }

    if (!proofFile) {
      newErrors.proofFile = 'Please upload a verification document';
    } else {
      // Validate file size (max 5MB)
      if (proofFile.size > 5 * 1024 * 1024) {
        newErrors.proofFile = 'File size must be less than 5MB';
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(proofFile.type)) {
        newErrors.proofFile = 'Only JPG, PNG, and PDF files are allowed';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateAge = (birthday: string) => {
    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleNext = () => {
    let isValid = false;

    if (currentStep === 1) {
      isValid = validateStep1();
    } else if (currentStep === 2) {
      isValid = validateStep2();
    }

    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file);
      if (errors.proofFile) {
        setErrors({ ...errors, proofFile: '' });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep3()) {
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Prepare form data for upload
      const uploadData = new FormData();
      uploadData.append('fullName', formData.fullName);
      uploadData.append('birthday', formData.birthday);
      uploadData.append('gender', formData.gender);
      uploadData.append('university', formData.university);
      uploadData.append('faculty', formData.faculty);
      uploadData.append('username', formData.username);
      uploadData.append('password', formData.password);
      uploadData.append('partnerPreferences', formData.partnerPreferences);
      uploadData.append('bio', formData.bio);
      uploadData.append('proofType', proofType);
      if (proofFile) {
        uploadData.append('proofFile', proofFile);
      }

      const response = await fetch('/api/register/verified', {
        method: 'POST',
        body: uploadData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();

      if (response.ok) {
        setToast({
          message: 'Your account is under review. You\'ll get access once verified by admin.',
          type: 'success',
        });
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setToast({ message: data.error || 'Registration failed', type: 'error' });
        setUploadProgress(0);
      }
    } catch (error) {
      setToast({ message: 'An error occurred. Please try again.', type: 'error' });
      setUploadProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 py-12">
      {/* Toast Notification */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg max-w-md ${
            toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {toast.message}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>

        {/* Card */}
        <div className="glassmorphic-card p-8 rounded-3xl shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
              className="inline-block mb-4"
            >
              <div className="w-16 h-16 bg-linear-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
            </motion.div>

            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Verified Registration
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Complete your profile for full access
            </p>

            {/* Status Badge */}
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Verified Account • Full Features
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      step < currentStep
                        ? 'bg-green-500 text-white'
                        : step === currentStep
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {step < currentStep ? <CheckCircle className="w-6 h-6" /> : step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`flex-1 h-1 mx-2 transition-all ${
                        step < currentStep ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>Personal Info</span>
              <span>Account Details</span>
              <span>Verification</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      placeholder="Enter your full name"
                      className={`w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border ${
                        errors.fullName
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 dark:border-gray-600 focus:ring-purple-600'
                      } rounded-xl focus:outline-none focus:ring-2 text-gray-800 dark:text-white transition-all`}
                    />
                  </div>
                  {errors.fullName && <p className="mt-2 text-sm text-red-500">{errors.fullName}</p>}
                </div>

                {/* Birthday */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Birthday
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <input
                      type="date"
                      value={formData.birthday}
                      onChange={(e) => handleChange('birthday', e.target.value)}
                      className={`w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border ${
                        errors.birthday
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 dark:border-gray-600 focus:ring-purple-600'
                      } rounded-xl focus:outline-none focus:ring-2 text-gray-800 dark:text-white transition-all`}
                    />
                  </div>
                  {errors.birthday && <p className="mt-2 text-sm text-red-500">{errors.birthday}</p>}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Gender
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['male', 'female', 'other'].map((gender) => (
                      <button
                        key={gender}
                        type="button"
                        onClick={() => handleChange('gender', gender)}
                        className={`py-3 px-4 rounded-xl font-semibold capitalize transition-all ${
                          formData.gender === gender
                            ? 'bg-purple-600 text-white'
                            : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {gender}
                      </button>
                    ))}
                  </div>
                  {errors.gender && <p className="mt-2 text-sm text-red-500">{errors.gender}</p>}
                </div>

                {/* University */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    University Name
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <Building className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={formData.university}
                      onChange={(e) => handleChange('university', e.target.value)}
                      placeholder="e.g., Stanford University"
                      className={`w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border ${
                        errors.university
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 dark:border-gray-600 focus:ring-purple-600'
                      } rounded-xl focus:outline-none focus:ring-2 text-gray-800 dark:text-white transition-all`}
                    />
                  </div>
                  {errors.university && <p className="mt-2 text-sm text-red-500">{errors.university}</p>}
                </div>

                {/* Faculty */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Faculty Name
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={formData.faculty}
                      onChange={(e) => handleChange('faculty', e.target.value)}
                      placeholder="e.g., Computer Science"
                      className={`w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border ${
                        errors.faculty
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 dark:border-gray-600 focus:ring-purple-600'
                      } rounded-xl focus:outline-none focus:ring-2 text-gray-800 dark:text-white transition-all`}
                    />
                  </div>
                  {errors.faculty && <p className="mt-2 text-sm text-red-500">{errors.faculty}</p>}
                </div>
              </motion.div>
            )}

            {/* Step 2: Account Details */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Username */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleChange('username', e.target.value)}
                      placeholder="Choose a username"
                      className={`w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border ${
                        errors.username
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 dark:border-gray-600 focus:ring-purple-600'
                      } rounded-xl focus:outline-none focus:ring-2 text-gray-800 dark:text-white transition-all`}
                    />
                  </div>
                  {errors.username && <p className="mt-2 text-sm text-red-500">{errors.username}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="Enter your password"
                      className={`w-full pl-12 pr-12 py-3 bg-white dark:bg-gray-800 border ${
                        errors.password
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 dark:border-gray-600 focus:ring-purple-600'
                      } rounded-xl focus:outline-none focus:ring-2 text-gray-800 dark:text-white transition-all`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-2 text-sm text-red-500">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      placeholder="Confirm your password"
                      className={`w-full pl-12 pr-12 py-3 bg-white dark:bg-gray-800 border ${
                        errors.confirmPassword
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 dark:border-gray-600 focus:ring-purple-600'
                      } rounded-xl focus:outline-none focus:ring-2 text-gray-800 dark:text-white transition-all`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-500">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleChange('bio', e.target.value)}
                    placeholder="Tell us about yourself (min 20 characters)"
                    rows={4}
                    className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${
                      errors.bio
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:ring-purple-600'
                    } rounded-xl focus:outline-none focus:ring-2 text-gray-800 dark:text-white transition-all resize-none`}
                  ></textarea>
                  <div className="flex justify-between items-center mt-2">
                    {errors.bio && <p className="text-sm text-red-500">{errors.bio}</p>}
                    <p className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                      {formData.bio.length} characters
                    </p>
                  </div>
                </div>

                {/* Partner Preferences */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Partner Preferences
                  </label>
                  <textarea
                    value={formData.partnerPreferences}
                    onChange={(e) => handleChange('partnerPreferences', e.target.value)}
                    placeholder="Describe your ideal partner and what you're looking for..."
                    rows={4}
                    className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${
                      errors.partnerPreferences
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:ring-purple-600'
                    } rounded-xl focus:outline-none focus:ring-2 text-gray-800 dark:text-white transition-all resize-none`}
                  ></textarea>
                  {errors.partnerPreferences && (
                    <p className="mt-2 text-sm text-red-500">{errors.partnerPreferences}</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 3: Verification */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Proof Type Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Choose Verification Proof Type
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { value: 'student_id', label: 'Student ID', icon: '🎓' },
                      { value: 'facebook', label: 'Facebook Profile', icon: '📘' },
                      { value: 'academic', label: 'Academic Document', icon: '📄' },
                    ].map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => {
                          setProofType(type.value);
                          if (errors.proofType) {
                            setErrors({ ...errors, proofType: '' });
                          }
                        }}
                        className={`py-4 px-4 rounded-xl font-semibold transition-all flex flex-col items-center gap-2 ${
                          proofType === type.value
                            ? 'bg-purple-600 text-white'
                            : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span className="text-3xl">{type.icon}</span>
                        <span className="text-sm">{type.label}</span>
                      </button>
                    ))}
                  </div>
                  {errors.proofType && <p className="mt-2 text-sm text-red-500">{errors.proofType}</p>}
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Upload Verification Document
                  </label>
                  <div
                    className={`relative border-2 border-dashed ${
                      errors.proofFile
                        ? 'border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    } rounded-xl p-8 text-center transition-all hover:border-purple-600 dark:hover:border-purple-400`}
                  >
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,application/pdf"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />

                    {proofFile ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-white">{proofFile.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {(proofFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProofFile(null);
                          }}
                          className="text-sm text-red-600 hover:underline"
                        >
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                          <Upload className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-white mb-1">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            JPG, PNG or PDF (max 5MB)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  {errors.proofFile && <p className="mt-2 text-sm text-red-500">{errors.proofFile}</p>}
                </div>

                {/* Upload Progress */}
                {isLoading && uploadProgress > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Uploading...
                      </span>
                      <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                        {uploadProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                        className="h-full bg-linear-to-r from-purple-600 to-pink-600"
                      ></motion.div>
                    </div>
                  </div>
                )}

                {/* Info Box */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>Note:</strong> Your account will be reviewed by our admin team. You'll receive
                    access once your verification is approved. This usually takes 1-2 business days.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-8">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={isLoading}
                  className="flex-1 py-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back
                </button>
              )}

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 py-4 bg-linear-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-4 bg-linear-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </div>
                  ) : (
                    'Submit for Review'
                  )}
                </button>
              )}
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
