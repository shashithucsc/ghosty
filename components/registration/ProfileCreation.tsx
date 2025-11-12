'use client';

import { useState } from 'react';
import { User, Calendar, Heart, GraduationCap, Building2, Sparkles, Info } from 'lucide-react';
import { VerificationSection } from './VerificationSection';

interface ProfileCreationProps {
  email: string;
}

export function ProfileCreation({ email }: ProfileCreationProps) {
  const [formData, setFormData] = useState({
    realName: '',
    dob: '',
    gender: '',
    university: '',
    faculty: '',
    bio: '',
    preferredGender: '',
    ageRangeMin: '18',
    ageRangeMax: '30',
    interests: [] as string[],
    hopesFromPartner: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [assignedAlias, setAssignedAlias] = useState('');
  const [assignedAvatar, setAssignedAvatar] = useState('');

  const genderOptions = ['Male', 'Female', 'Non-binary', 'Other', 'Prefer not to say'];
  const interestOptions = [
    'Music', 'Movies', 'Sports', 'Reading', 'Gaming', 'Cooking', 
    'Travel', 'Art', 'Photography', 'Fitness', 'Dancing', 'Technology'
  ];

  const universities = [
    'Harvard University', 'Stanford University', 'MIT', 'UC Berkeley',
    'Oxford University', 'Cambridge University', 'Yale University', 'Other'
  ];

  const generateAlias = (gender: string) => {
    const adjectives = ['Mysterious', 'Charming', 'Curious', 'Lovely', 'Gentle', 'Kind', 'Brave', 'Smart'];
    const nouns = ['Ghost', 'Spirit', 'Soul', 'Dream', 'Star', 'Moon', 'Sun', 'Cloud'];
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${randomAdj}${randomNoun}${Math.floor(Math.random() * 999)}`;
  };

  const generateAvatar = (gender: string) => {
    const maleAvatars = ['🧑', '👨', '🙋‍♂️', '💼', '🎩'];
    const femaleAvatars = ['👩', '🙋‍♀️', '👸', '💃', '🌸'];
    const neutralAvatars = ['👤', '🌟', '✨', '🎭', '🦄'];
    
    if (gender === 'Male') {
      return maleAvatars[Math.floor(Math.random() * maleAvatars.length)];
    } else if (gender === 'Female') {
      return femaleAvatars[Math.floor(Math.random() * femaleAvatars.length)];
    } else {
      return neutralAvatars[Math.floor(Math.random() * neutralAvatars.length)];
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: '' });
  };

  const toggleInterest = (interest: string) => {
    const newInterests = formData.interests.includes(interest)
      ? formData.interests.filter((i) => i !== interest)
      : [...formData.interests, interest];
    handleChange('interests', newInterests);
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.realName.trim()) newErrors.realName = 'Name is required';
    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    } else {
      const age = calculateAge(formData.dob);
      if (age < 18) newErrors.dob = 'You must be at least 18 years old';
      if (age > 100) newErrors.dob = 'Please enter a valid date of birth';
    }
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.university) newErrors.university = 'University is required';
    if (!formData.faculty.trim()) newErrors.faculty = 'Faculty/Major is required';
    if (!formData.bio.trim() || formData.bio.length < 20) {
      newErrors.bio = 'Bio must be at least 20 characters';
    }
    if (!formData.preferredGender) newErrors.preferredGender = 'Partner gender preference is required';
    if (formData.interests.length === 0) {
      newErrors.interests = 'Please select at least one interest';
    }
    if (!formData.hopesFromPartner.trim() || formData.hopesFromPartner.length < 10) {
      newErrors.hopesFromPartner = 'Please describe what you hope from a partner (min 10 characters)';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    // Generate alias and avatar
    const alias = generateAlias(formData.gender);
    const avatar = generateAvatar(formData.gender);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setAssignedAlias(alias);
    setAssignedAvatar(avatar);
    setLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="glassmorphic-card p-8 sm:p-10 text-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 text-6xl sm:text-7xl mx-auto mb-6 animate-bounce-gentle">
            {assignedAvatar}
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Profile Created! 🎉
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-2">Your anonymous alias is:</p>
          <p className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-6">
            {assignedAlias}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            This will be your identity on Ghosty. Your real name remains private.
          </p>
        </div>

        <VerificationSection />

        <button
          onClick={() => window.location.href = '/dashboard'}
          className="w-full btn-primary py-4 text-lg font-semibold"
        >
          Go to Dashboard 🚀
        </button>
      </div>
    );
  }

  return (
    <div className="glassmorphic-card p-6 sm:p-10 animate-slide-up">
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Create your profile
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
          Tell us about yourself (kept private and secure)
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5 text-purple-600" />
            Personal Information
          </h3>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.realName}
              onChange={(e) => handleChange('realName', e.target.value)}
              className={`input-field ${errors.realName ? 'border-red-500' : ''}`}
              placeholder="Your real name (kept private)"
            />
            {errors.realName && <p className="text-red-500 text-xs flex items-center gap-1"><Info className="w-3 h-3" />{errors.realName}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => handleChange('dob', e.target.value)}
                  className={`input-field pl-10 ${errors.dob ? 'border-red-500' : ''}`}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              {errors.dob && <p className="text-red-500 text-xs flex items-center gap-1"><Info className="w-3 h-3" />{errors.dob}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className={`input-field ${errors.gender ? 'border-red-500' : ''}`}
              >
                <option value="">Select gender</option>
                {genderOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {errors.gender && <p className="text-red-500 text-xs flex items-center gap-1"><Info className="w-3 h-3" />{errors.gender}</p>}
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-purple-600" />
            Academic Information
          </h3>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              University <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={formData.university}
                onChange={(e) => handleChange('university', e.target.value)}
                className={`input-field pl-10 ${errors.university ? 'border-red-500' : ''}`}
              >
                <option value="">Select your university</option>
                {universities.map((uni) => (
                  <option key={uni} value={uni}>{uni}</option>
                ))}
              </select>
            </div>
            {errors.university && <p className="text-red-500 text-xs flex items-center gap-1"><Info className="w-3 h-3" />{errors.university}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Faculty / Major <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.faculty}
              onChange={(e) => handleChange('faculty', e.target.value)}
              className={`input-field ${errors.faculty ? 'border-red-500' : ''}`}
              placeholder="e.g., Computer Science, Business, Medicine"
            />
            {errors.faculty && <p className="text-red-500 text-xs flex items-center gap-1"><Info className="w-3 h-3" />{errors.faculty}</p>}
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            About You <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            className={`input-field min-h-[100px] resize-none ${errors.bio ? 'border-red-500' : ''}`}
            placeholder="Tell us about yourself, your hobbies, what makes you unique... (min 20 characters)"
            maxLength={500}
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">{formData.bio.length}/500 characters</span>
            {errors.bio && <p className="text-red-500 text-xs flex items-center gap-1"><Info className="w-3 h-3" />{errors.bio}</p>}
          </div>
        </div>

        {/* Partner Preferences */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-600" />
            Partner Preferences
          </h3>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Preferred Gender <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.preferredGender}
              onChange={(e) => handleChange('preferredGender', e.target.value)}
              className={`input-field ${errors.preferredGender ? 'border-red-500' : ''}`}
            >
              <option value="">Select preference</option>
              {genderOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
              <option value="Any">Any</option>
            </select>
            {errors.preferredGender && <p className="text-red-500 text-xs flex items-center gap-1"><Info className="w-3 h-3" />{errors.preferredGender}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Age Range Preference
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  value={formData.ageRangeMin}
                  onChange={(e) => handleChange('ageRangeMin', e.target.value)}
                  className="input-field"
                  min="18"
                  max="100"
                  placeholder="Min age"
                />
              </div>
              <div>
                <input
                  type="number"
                  value={formData.ageRangeMax}
                  onChange={(e) => handleChange('ageRangeMax', e.target.value)}
                  className="input-field"
                  min="18"
                  max="100"
                  placeholder="Max age"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">Age range: {formData.ageRangeMin} - {formData.ageRangeMax} years</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Shared Interests <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    formData.interests.includes(interest)
                      ? 'bg-linear-to-r from-purple-600 to-pink-600 text-white shadow-md scale-105'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
            {errors.interests && <p className="text-red-500 text-xs flex items-center gap-1"><Info className="w-3 h-3" />{errors.interests}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              What do you hope from a partner? <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.hopesFromPartner}
              onChange={(e) => handleChange('hopesFromPartner', e.target.value)}
              className={`input-field min-h-20 resize-none ${errors.hopesFromPartner ? 'border-red-500' : ''}`}
              placeholder="What qualities or values do you seek in a partner? (min 10 characters)"
              maxLength={300}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">{formData.hopesFromPartner.length}/300 characters</span>
              {errors.hopesFromPartner && <p className="text-red-500 text-xs flex items-center gap-1"><Info className="w-3 h-3" />{errors.hopesFromPartner}</p>}
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-purple-800 dark:text-purple-300">
            <p className="font-semibold mb-1">🔒 Privacy Protected</p>
            <p>Your personal information is kept private. You'll be assigned an anonymous alias and avatar for your dating profile.</p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary py-3 sm:py-4 text-base sm:text-lg font-semibold"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="spinner" />
              Creating your profile...
            </span>
          ) : (
            'Complete Profile ✨'
          )}
        </button>
      </form>
    </div>
  );
}
