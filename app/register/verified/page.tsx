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
import Image from 'next/image';

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
        // Store user data in localStorage for auto-login
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('username', data.username);
        localStorage.setItem('token', data.token);
        localStorage.setItem('registrationType', data.registrationType || 'verified');
        localStorage.setItem('verificationStatus', data.verificationStatus || 'pending');
        localStorage.setItem('isAdmin', 'false');
        localStorage.setItem('userRole', 'user');
        
        if (data.user?.fullName) {
          localStorage.setItem('fullName', data.user.fullName);
        }

        setToast({
          message: 'Registration successful! Your account is under review.',
          type: 'success',
        });
        
        setTimeout(() => {
          // Redirect to pending-verification page with auto-login
          router.push('/pending-verification');
        }, 2000);
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
    <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center p-4 py-12 font-sans text-black">
      {/* Toast Notification */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-6 right-6 z-50 px-8 py-4 rounded-xl border-4 border-black font-black uppercase tracking-wider shadow-[4px_4px_0px_rgba(0,0,0,1)] max-w-md ${
            toast.type === 'success' ? 'bg-[#A3E635] text-black' : 'bg-[#FF6B6B] text-black'
          }`}
        >
          {toast.message}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl z-10"
      >
        {/* Main Card */}
        <div className="bg-white p-8 rounded-3xl border-4 border-black shadow-[12px_12px_0px_rgba(0,0,0,1)]">
          
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
              className="inline-block mb-4"
            >
              <Image
                src="/logo.png"
                alt="Logo"
                width={80}
                height={80}
                className="object-contain mx-auto"
              />
            </motion.div>

            <h1 className="text-4xl font-black uppercase tracking-tight mb-2">
              Verified Join
            </h1>
            <p className="text-gray-600 font-bold uppercase tracking-widest text-sm">
              Complete your profile for full access
            </p>

            {/* Status Badge */}
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#A3E635] border-2 border-black font-black uppercase tracking-wider text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              <ShieldCheck className="w-4 h-4 stroke-[3]" />
              Verified Account • Full Features
            </div>
          </div>

          {/* Chunky Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div
                    className={`w-12 h-12 flex items-center justify-center font-black text-xl border-4 border-black transition-all ${
                      step < currentStep
                        ? 'bg-[#A3E635] text-black shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                        : step === currentStep
                        ? 'bg-black text-white shadow-[4px_4px_0px_rgba(78,205,196,1)] -translate-y-1'
                        : 'bg-white text-gray-400 border-dashed'
                    }`}
                  >
                    {step < currentStep ? <CheckCircle className="w-6 h-6 stroke-[3]" /> : step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`flex-1 h-2 mx-2 border-y-2 border-black transition-all ${
                        step < currentStep ? 'bg-[#A3E635]' : 'bg-gray-100'
                      }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs font-black uppercase tracking-widest text-gray-500">
              <span className={currentStep >= 1 ? 'text-black' : ''}>Personal Info</span>
              <span className={currentStep >= 2 ? 'text-black' : ''}>Account Details</span>
              <span className={currentStep >= 3 ? 'text-black' : ''}>Verification</span>
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
                className="space-y-6"
              >
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-black uppercase tracking-widest mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black">
                      <User className="w-5 h-5 stroke-[3]" />
                    </div>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      placeholder="Enter your full name"
                      className={`w-full pl-12 pr-4 py-4 bg-[#F8F9FA] border-4 ${
                        errors.fullName ? 'border-[#FF6B6B] focus:shadow-[4px_4px_0px_rgba(255,107,107,1)]' : 'border-black focus:shadow-[4px_4px_0px_rgba(0,0,0,1)]'
                      } rounded-xl focus:outline-none font-bold transition-shadow placeholder-gray-400`}
                    />
                  </div>
                  {errors.fullName && <p className="mt-2 text-sm font-bold text-[#FF6B6B] uppercase">{errors.fullName}</p>}
                </div>

                {/* Birthday */}
                <div>
                  <label className="block text-sm font-black uppercase tracking-widest mb-2">
                    Birthday
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black">
                      <Calendar className="w-5 h-5 stroke-[3]" />
                    </div>
                    <input
                      type="date"
                      value={formData.birthday}
                      onChange={(e) => handleChange('birthday', e.target.value)}
                      className={`w-full pl-12 pr-4 py-4 bg-[#F8F9FA] border-4 ${
                        errors.birthday ? 'border-[#FF6B6B] focus:shadow-[4px_4px_0px_rgba(255,107,107,1)]' : 'border-black focus:shadow-[4px_4px_0px_rgba(0,0,0,1)]'
                      } rounded-xl focus:outline-none font-bold transition-shadow text-black`}
                    />
                  </div>
                  {errors.birthday && <p className="mt-2 text-sm font-bold text-[#FF6B6B] uppercase">{errors.birthday}</p>}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-black uppercase tracking-widest mb-2">
                    Gender
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {['male', 'female'].map((gender) => (
                      <button
                        key={gender}
                        type="button"
                        onClick={() => handleChange('gender', gender)}
                        className={`py-4 px-4 rounded-xl font-black uppercase tracking-wider border-4 transition-all ${
                          formData.gender === gender
                            ? 'bg-black text-white border-black shadow-[4px_4px_0px_rgba(78,205,196,1)] translate-y-[-2px] translate-x-[-2px]'
                            : 'bg-white text-black border-black hover:bg-[#F8F9FA] shadow-[4px_4px_0px_rgba(0,0,0,1)]'
                        }`}
                      >
                        {gender}
                      </button>
                    ))}
                  </div>
                  {errors.gender && <p className="mt-2 text-sm font-bold text-[#FF6B6B] uppercase">{errors.gender}</p>}
                </div>

                {/* University */}
                <div>
                  <label className="block text-sm font-black uppercase tracking-widest mb-2">
                    University Name
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black">
                      <Building className="w-5 h-5 stroke-[3]" />
                    </div>
                    <input
                      type="text"
                      value={formData.university}
                      onChange={(e) => handleChange('university', e.target.value)}
                      placeholder="E.g., Stanford University"
                      className={`w-full pl-12 pr-4 py-4 bg-[#F8F9FA] border-4 ${
                        errors.university ? 'border-[#FF6B6B] focus:shadow-[4px_4px_0px_rgba(255,107,107,1)]' : 'border-black focus:shadow-[4px_4px_0px_rgba(0,0,0,1)]'
                      } rounded-xl focus:outline-none font-bold transition-shadow placeholder-gray-400`}
                    />
                  </div>
                  {errors.university && <p className="mt-2 text-sm font-bold text-[#FF6B6B] uppercase">{errors.university}</p>}
                </div>

                {/* Faculty */}
                <div>
                  <label className="block text-sm font-black uppercase tracking-widest mb-2">
                    Faculty Name
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black">
                      <FileText className="w-5 h-5 stroke-[3]" />
                    </div>
                    <input
                      type="text"
                      value={formData.faculty}
                      onChange={(e) => handleChange('faculty', e.target.value)}
                      placeholder="E.g., Computer Science"
                      className={`w-full pl-12 pr-4 py-4 bg-[#F8F9FA] border-4 ${
                        errors.faculty ? 'border-[#FF6B6B] focus:shadow-[4px_4px_0px_rgba(255,107,107,1)]' : 'border-black focus:shadow-[4px_4px_0px_rgba(0,0,0,1)]'
                      } rounded-xl focus:outline-none font-bold transition-shadow placeholder-gray-400`}
                    />
                  </div>
                  {errors.faculty && <p className="mt-2 text-sm font-bold text-[#FF6B6B] uppercase">{errors.faculty}</p>}
                </div>
              </motion.div>
            )}

            {/* Step 2: Account Details */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Username */}
                <div>
                  <label className="block text-sm font-black uppercase tracking-widest mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black">
                      <User className="w-5 h-5 stroke-[3]" />
                    </div>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleChange('username', e.target.value)}
                      placeholder="Choose a username"
                      className={`w-full pl-12 pr-4 py-4 bg-[#F8F9FA] border-4 ${
                        errors.username ? 'border-[#FF6B6B] focus:shadow-[4px_4px_0px_rgba(255,107,107,1)]' : 'border-black focus:shadow-[4px_4px_0px_rgba(0,0,0,1)]'
                      } rounded-xl focus:outline-none font-bold transition-shadow placeholder-gray-400`}
                    />
                  </div>
                  {errors.username && <p className="mt-2 text-sm font-bold text-[#FF6B6B] uppercase">{errors.username}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-black uppercase tracking-widest mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black">
                      <Lock className="w-5 h-5 stroke-[3]" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="Enter your password"
                      className={`w-full pl-12 pr-12 py-4 bg-[#F8F9FA] border-4 ${
                        errors.password ? 'border-[#FF6B6B] focus:shadow-[4px_4px_0px_rgba(255,107,107,1)]' : 'border-black focus:shadow-[4px_4px_0px_rgba(0,0,0,1)]'
                      } rounded-xl focus:outline-none font-bold transition-shadow placeholder-gray-400`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-black hover:text-[#4ECDC4] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5 stroke-[3]" /> : <Eye className="w-5 h-5 stroke-[3]" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-2 text-sm font-bold text-[#FF6B6B] uppercase">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-black uppercase tracking-widest mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black">
                      <Lock className="w-5 h-5 stroke-[3]" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      placeholder="Confirm your password"
                      className={`w-full pl-12 pr-12 py-4 bg-[#F8F9FA] border-4 ${
                        errors.confirmPassword ? 'border-[#FF6B6B] focus:shadow-[4px_4px_0px_rgba(255,107,107,1)]' : 'border-black focus:shadow-[4px_4px_0px_rgba(0,0,0,1)]'
                      } rounded-xl focus:outline-none font-bold transition-shadow placeholder-gray-400`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-black hover:text-[#4ECDC4] transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5 stroke-[3]" /> : <Eye className="w-5 h-5 stroke-[3]" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm font-bold text-[#FF6B6B] uppercase">{errors.confirmPassword}</p>
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
                  <label className="block text-sm font-black uppercase tracking-widest mb-3">
                    Choose Verification Proof Type
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { value: 'student_id', label: 'Student ID', icon: '🎓' },
                      { value: 'facebook', label: 'Facebook', icon: '📘' },
                      { value: 'academic', label: 'Academic Doc', icon: '📄' },
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
                        className={`py-6 px-4 rounded-xl font-black uppercase tracking-wider border-4 transition-all flex flex-col items-center gap-3 ${
                          proofType === type.value
                            ? 'bg-black text-white border-black shadow-[4px_4px_0px_rgba(78,205,196,1)] translate-y-[-2px] translate-x-[-2px]'
                            : 'bg-white text-black border-black hover:bg-[#F8F9FA] shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:translate-x-[-2px]'
                        }`}
                      >
                        <span className="text-4xl">{type.icon}</span>
                        <span className="text-sm">{type.label}</span>
                      </button>
                    ))}
                  </div>
                  {errors.proofType && <p className="mt-2 text-sm font-bold text-[#FF6B6B] uppercase">{errors.proofType}</p>}
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-black uppercase tracking-widest mb-3">
                    Upload Verification Document
                  </label>
                  <div
                    className={`relative border-4 border-dashed bg-[#F8F9FA] ${
                      errors.proofFile ? 'border-[#FF6B6B]' : 'border-black'
                    } rounded-2xl p-10 text-center transition-all hover:bg-white`}
                  >
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,application/pdf"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />

                    {proofFile ? (
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-[#A3E635] border-4 border-black rounded-full flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                          <CheckCircle className="w-8 h-8 stroke-[3] text-black" />
                        </div>
                        <div>
                          <p className="font-black text-black uppercase tracking-tight">{proofFile.name}</p>
                          <p className="text-sm font-bold text-gray-500 mt-1">
                            {(proofFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProofFile(null);
                          }}
                          className="mt-2 text-sm font-black uppercase text-[#FF6B6B] hover:text-red-800 transition-colors bg-white px-3 py-1 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                        >
                          Remove File
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 bg-[#FFD166] border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)] group-hover:scale-105 transition-transform">
                          <Upload className="w-10 h-10 stroke-[3] text-black" />
                        </div>
                        <div>
                          <p className="font-black uppercase tracking-widest text-black mb-2">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-sm font-bold text-gray-500 uppercase">
                            JPG, PNG or PDF (MAX 5MB)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  {errors.proofFile && <p className="mt-2 text-sm font-bold text-[#FF6B6B] uppercase">{errors.proofFile}</p>}
                </div>

                {/* Upload Progress */}
                {isLoading && uploadProgress > 0 && (
                  <div className="bg-white border-4 border-black p-4 rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-black uppercase tracking-widest text-black">
                        Uploading...
                      </span>
                      <span className="text-sm font-black text-[#4ECDC4]">
                        {uploadProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 border-2 border-black rounded-full h-4 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                        className="h-full bg-[#4ECDC4] border-r-2 border-black"
                      ></motion.div>
                    </div>
                  </div>
                )}

                {/* Info Box */}
                <div className="bg-[#4ECDC4] border-4 border-black rounded-xl p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                  <p className="text-sm font-bold text-black uppercase leading-relaxed">
                    <strong className="font-black block mb-1">Note:</strong> Your account will be reviewed by our admin team. You'll receive access once your verification is approved. This usually takes 1-2 business days.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-10">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={isLoading}
                  className="flex-1 py-5 bg-white border-4 border-black text-black font-black uppercase tracking-wider text-lg rounded-2xl shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-[#F8F9FA] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back
                </button>
              )}

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 py-5 bg-black border-4 border-black text-white font-black uppercase tracking-wider text-lg rounded-2xl shadow-[6px_6px_0px_rgba(163,230,53,1)] hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[8px_8px_0px_rgba(163,230,53,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-5 bg-[#FFD166] border-4 border-black text-black font-black uppercase tracking-wider text-lg rounded-2xl shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:bg-[#ffc033] hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <>
                      <div className="w-6 h-6 border-4 border-black border-t-white rounded-full animate-spin"></div>
                      SUBMITTING...
                    </>
                  ) : (
                    'SUBMIT FOR REVIEW'
                  )}
                </button>
              )}
            </div>

            {/* Footer */}
            <div className="text-center text-sm font-black uppercase tracking-widest text-gray-500 mt-8">
              Already have an account?{' '}
              <Link href="/login" className="text-black underline decoration-2 hover:text-[#4ECDC4] transition-colors">
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}