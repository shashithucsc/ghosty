'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  User,
  GraduationCap,
  MapPin,
  Ruler,
  Palette,
  FileText,
  Heart,
  CheckCircle2,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { Toast } from '@/components/ui/Toast';

// Sri Lankan universities list
const SRI_LANKAN_UNIVERSITIES = [
  'University of Colombo',
  'University of Peradeniya',
  'University of Sri Jayewardenepura',
  'University of Kelaniya',
  'University of Moratuwa',
  'University of Ruhuna',
  'University of Jaffna',
  'Eastern University',
  'South Eastern University',
  'Rajarata University',
  'Sabaragamuwa University',
  'Wayamba University',
  'Uva Wellassa University',
  'Open University of Sri Lanka',
  'Buddhist and Pali University',
  'University of the Visual & Performing Arts',
  'SLIIT',
  'NIBM',
  'ICBT',
  'NSBM Green University',
  'CINEC Campus',
  'IIT',
  'ESOFT',
  'Other',
];

const DEGREE_OPTIONS = [
  'Science Degree',
  'Management Degree',
  'Arts Degree',
  'Technology Degree',
  'Engineering Degree',
  'IT Degree',
  'Medicine Degree',
  'Other Degree',
];

const EDUCATION_LEVELS = [
  'No Degree',
  'Diploma',
  'Science Degree',
  'Management Degree',
  'Arts Degree',
  'Technology Degree',
  'Engineering Degree',
    'IT Degree',
    'Medicine Degree',
  'Other Degree',

];

const SKIN_TONES = ['Fair', 'Light Brown', 'Medium Brown', 'Dark'];

const MAJOR_TOWNS = [
  'Colombo',
  'Kandy',
  'Galle',
  'Jaffna',
  'Negombo',
  'Matara',
  'Batticaloa',
  'Trincomalee',
  'Anuradhapura',
  'Kurunegala',
  'Ratnapura',
  'Badulla',
  'Kalutara',
  'Gampaha',
  'Nuwara Eliya',
  'Other',
];

export default function SetupProfilePage() {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Qualifications state
  const [qualifications, setQualifications] = useState({
    height_cm: '',
    university: '',
    degree: '',
    hometown: '',
    age: '',
    skin_tone: '',
  });

  // Partner preferences state
  const [partnerPreferences, setPartnerPreferences] = useState({
    age_min: '18',
    age_max: '35',
    education_levels: [] as string[],
    height_pref_type: 'no_preference' as 'less' | 'greater' | 'no_preference',
    height_pref_value: '',
    hometown: '',
    skin_tone: 'No preference',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setToast({ message: 'Please log in to set up your profile', type: 'error' });
      setTimeout(() => router.push('/login'), 1500);
      return;
    }
    setCurrentUserId(userId);
  }, [router]);

  const handleQualificationChange = (field: string, value: string) => {
    setQualifications({ ...qualifications, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handlePreferenceChange = (field: string, value: any) => {
    setPartnerPreferences({ ...partnerPreferences, [field]: value });
  };

  const toggleEducationLevel = (level: string) => {
    const current = partnerPreferences.education_levels;
    if (current.includes(level)) {
      setPartnerPreferences({
        ...partnerPreferences,
        education_levels: current.filter((l) => l !== level),
      });
    } else {
      setPartnerPreferences({
        ...partnerPreferences,
        education_levels: [...current, level],
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate qualifications - only age is required
    if (!qualifications.age || Number(qualifications.age) < 18 || Number(qualifications.age) > 100) {
      newErrors.age = 'Age must be between 18-100';
    }
    
    // Optional validations
    if (qualifications.height_cm && (Number(qualifications.height_cm) < 100 || Number(qualifications.height_cm) > 250)) {
      newErrors.height_cm = 'Height must be between 100-250 cm';
    }

    // Validate partner preferences
    if (Number(partnerPreferences.age_min) >= Number(partnerPreferences.age_max)) {
      newErrors.age_range = 'Min age must be less than max age';
    }
    if (partnerPreferences.education_levels.length === 0) {
      newErrors.education_levels = 'Select at least one education level';
    }
    if (partnerPreferences.height_pref_type !== 'no_preference' && !partnerPreferences.height_pref_value) {
      newErrors.height_pref = 'Specify height preference value';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormComplete = (): boolean => {
    return !!(
      qualifications.age &&
      partnerPreferences.education_levels.length > 0
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setToast({ message: 'Please fix validation errors', type: 'error' });
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');

      const payload = {
        qualifications: {
          height_cm: qualifications.height_cm ? Number(qualifications.height_cm) : null,
          university: qualifications.university || null,
          degree: qualifications.degree || null,
          hometown: qualifications.hometown || null,
          age: Number(qualifications.age),
          skin_tone: qualifications.skin_tone || null,
        },
        partner_preferences: {
          age_min: Number(partnerPreferences.age_min),
          age_max: Number(partnerPreferences.age_max),
          education_levels: partnerPreferences.education_levels,
          height_pref:
            partnerPreferences.height_pref_type === 'no_preference'
              ? null
              : {
                  type: partnerPreferences.height_pref_type,
                  value_cm: Number(partnerPreferences.height_pref_value),
                },
          hometown: partnerPreferences.hometown || null,
          skin_tone: partnerPreferences.skin_tone === 'No preference' ? null : partnerPreferences.skin_tone,
        },
      };

      const response = await fetch('/api/setup-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setToast({ message: 'Profile and preferences saved! Recommendations updated.', type: 'success' });
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setToast({ message: data.error || 'Failed to save profile', type: 'error' });
      }
    } catch (error) {
      console.error('Profile setup error:', error);
      setToast({ message: 'An error occurred. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUserId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-20">
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Complete Your Profile</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Help us find your perfect match</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Section A: About You (Qualifications) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glassmorphic-card p-6 rounded-2xl space-y-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">About You (Qualifications)</h2>
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Age <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={qualifications.age}
              onChange={(e) => handleQualificationChange('age', e.target.value)}
              placeholder="e.g., 24"
              min="18"
              max="100"
              className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${
                errors.age ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 text-gray-800 dark:text-white`}
            />
            {errors.age && <p className="mt-1 text-sm text-red-500">{errors.age}</p>}
          </div>

          {/* Height */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Height (cm)
            </label>
            <div className="relative">
              <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={qualifications.height_cm}
                onChange={(e) => handleQualificationChange('height_cm', e.target.value)}
                placeholder="e.g., 170"
                min="100"
                max="250"
                className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border ${
                  errors.height_cm ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 text-gray-800 dark:text-white`}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Height in centimeters (e.g., 170)</p>
            {errors.height_cm && <p className="mt-1 text-sm text-red-500">{errors.height_cm}</p>}
          </div>

          {/* University */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              University
            </label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={qualifications.university}
                onChange={(e) => handleQualificationChange('university', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border ${
                  errors.university ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 text-gray-800 dark:text-white`}
              >
                <option value="">Select your university</option>
                {SRI_LANKAN_UNIVERSITIES.map((uni) => (
                  <option key={uni} value={uni}>
                    {uni}
                  </option>
                ))}
              </select>
            </div>
            {errors.university && <p className="mt-1 text-sm text-red-500">{errors.university}</p>}
          </div>

          {/* Degree */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Degree
            </label>
            <select
              value={qualifications.degree}
              onChange={(e) => handleQualificationChange('degree', e.target.value)}
              className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${
                errors.degree ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 text-gray-800 dark:text-white`}
            >
              <option value="">Select your degree</option>
              {DEGREE_OPTIONS.map((degree) => (
                <option key={degree} value={degree}>
                  {degree}
                </option>
              ))}
            </select>
            {errors.degree && <p className="mt-1 text-sm text-red-500">{errors.degree}</p>}
          </div>

          {/* Hometown */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Hometown
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={qualifications.hometown}
                onChange={(e) => handleQualificationChange('hometown', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border ${
                  errors.hometown ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 text-gray-800 dark:text-white`}
              >
                <option value="">Select your hometown</option>
                {MAJOR_TOWNS.map((town) => (
                  <option key={town} value={town}>
                    {town}
                  </option>
                ))}
              </select>
            </div>
            {errors.hometown && <p className="mt-1 text-sm text-red-500">{errors.hometown}</p>}
          </div>

          {/* Skin Tone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Skin Tone
            </label>
            <div className="relative">
              <Palette className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={qualifications.skin_tone}
                onChange={(e) => handleQualificationChange('skin_tone', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border ${
                  errors.skin_tone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 text-gray-800 dark:text-white`}
              >
                <option value="">Select skin tone</option>
                {SKIN_TONES.map((tone) => (
                  <option key={tone} value={tone}>
                    {tone}
                  </option>
                ))}
              </select>
            </div>
            {errors.skin_tone && <p className="mt-1 text-sm text-red-500">{errors.skin_tone}</p>}
          </div>

        </motion.div>

        {/* Section B: Partner Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glassmorphic-card p-6 rounded-2xl space-y-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Partner Preferences</h2>
          </div>

          {/* Age Range */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Age Range <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  value={partnerPreferences.age_min}
                  onChange={(e) => handlePreferenceChange('age_min', e.target.value)}
                  min="18"
                  max="100"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 text-gray-800 dark:text-white"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Min age</p>
              </div>
              <div>
                <input
                  type="number"
                  value={partnerPreferences.age_max}
                  onChange={(e) => handlePreferenceChange('age_max', e.target.value)}
                  min="18"
                  max="100"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 text-gray-800 dark:text-white"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Max age</p>
              </div>
            </div>
            {errors.age_range && <p className="mt-1 text-sm text-red-500">{errors.age_range}</p>}
          </div>

          {/* Education Level */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Education Level <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {EDUCATION_LEVELS.map((level) => (
                <label
                  key={level}
                  className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={partnerPreferences.education_levels.includes(level)}
                    onChange={() => toggleEducationLevel(level)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{level}</span>
                </label>
              ))}
            </div>
            {errors.education_levels && <p className="mt-1 text-sm text-red-500">{errors.education_levels}</p>}
          </div>

          {/* Height Preference */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Height Preference
            </label>
            <div className="space-y-3">
              <div className="flex gap-2">
                {[
                  { value: 'no_preference', label: 'No preference' },
                  { value: 'less', label: 'Less than' },
                  { value: 'greater', label: 'Greater than' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handlePreferenceChange('height_pref_type', option.value)}
                    className={`flex-1 px-4 py-2 rounded-xl border-2 font-semibold transition-all text-sm ${
                      partnerPreferences.height_pref_type === option.value
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {partnerPreferences.height_pref_type !== 'no_preference' && (
                <input
                  type="number"
                  value={partnerPreferences.height_pref_value}
                  onChange={(e) => handlePreferenceChange('height_pref_value', e.target.value)}
                  placeholder="Height in cm"
                  min="100"
                  max="250"
                  className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${
                    errors.height_pref ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 text-gray-800 dark:text-white`}
                />
              )}
            </div>
            {errors.height_pref && <p className="mt-1 text-sm text-red-500">{errors.height_pref}</p>}
          </div>

          {/* Hometown Preference */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Hometown Preference (Optional)
            </label>
            <input
              type="text"
              value={partnerPreferences.hometown}
              onChange={(e) => handlePreferenceChange('hometown', e.target.value)}
              placeholder="e.g., Near Colombo"
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 text-gray-800 dark:text-white"
            />
          </div>

          {/* Skin Tone Preference */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Skin Tone Preference
            </label>
            <select
              value={partnerPreferences.skin_tone}
              onChange={(e) => handlePreferenceChange('skin_tone', e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 text-gray-800 dark:text-white"
            >
              <option value="No preference">No preference</option>
              {SKIN_TONES.map((tone) => (
                <option key={tone} value={tone}>
                  {tone}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          type="submit"
          disabled={!isFormComplete() || isLoading}
          className="w-full py-4 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Complete Setup
            </>
          )}
        </motion.button>

        {!isFormComplete() && (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Please fill all required fields to continue
          </p>
        )}
      </form>
    </div>
  );
}
