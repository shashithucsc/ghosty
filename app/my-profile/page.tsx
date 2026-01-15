'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, User, Mail, Calendar, Users, School, GraduationCap, MapPin, Ruler, Palette, Award, Eye, EyeOff, ArrowLeft } from 'lucide-react';

interface ProfileData {
  id: string;
  username: string;
  email: string;
  fullName: string;
  birthday: string;
  gender: string;
  universityName: string;
  faculty: string;
  bio: string;
  anonymousName: string;
  anonymousAvatar: string;
  age: number | null;
  heightCm: number | null;
  skinTone: string;
  degreeType: string;
  hometown: string;
  isPublic: boolean;
}

const avatarOptions = ['👤', '😊', '😎', '🤓', '😇', '🥳', '🤩', '😍', '🥰', '😋', '🤔', '🧐', '🤗', '🤠', '👻', '🎭', '🎨', '🎯', '⚡', '🌟'];

const skinToneOptions = ['Fair', 'Medium', 'Olive', 'Tan', 'Brown', 'Dark'];
const degreeOptions = ['Diploma', 'Private Degree', 'Goverment Degree', 'Master', 'PhD'];
const genderOptions = ['Male', 'Female'];

export default function MyProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const [profileData, setProfileData] = useState<ProfileData>({
    id: '',
    username: '',
    email: '',
    fullName: '',
    birthday: '',
    gender: '',
    universityName: '',
    faculty: '',
    bio: '',
    anonymousName: '',
    anonymousAvatar: '👤',
    age: null,
    heightCm: null,
    skinTone: '',
    degreeType: '',
    hometown: '',
    isPublic: true,
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`/api/profile/edit?userId=${userId}`);
      const result = await response.json();

      if (response.ok && result.success) {
        setProfileData(result.data);
      } else {
        setError('Failed to load profile');
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/profile/edit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profileData.id,
          fullName: profileData.fullName,
          birthday: profileData.birthday,
          gender: profileData.gender,
          universityName: profileData.universityName,
          faculty: profileData.faculty,
          bio: profileData.bio,
          anonymousName: profileData.anonymousName,
          anonymousAvatar: profileData.anonymousAvatar,
          heightCm: profileData.heightCm,
          skinTone: profileData.skinTone,
          degreeType: profileData.degreeType,
          hometown: profileData.hometown,
          isPublic: profileData.isPublic,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess('Profile updated successfully!');
        // Update localStorage
        localStorage.setItem('username', result.data.username);
        localStorage.setItem('avatar', result.data.avatar);
        
        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof ProfileData, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-800 dark:text-white text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-purple-950 py-6 px-4 pb-24">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Profile</h1>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700/50 backdrop-blur-xl">
            <p className="text-green-800 dark:text-green-300 text-center font-medium">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700/50 backdrop-blur-xl">
            <p className="text-red-800 dark:text-red-300 text-center font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Anonymous Identity Section */}
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200 dark:border-gray-700/50 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Anonymous Identity
            </h2>

            {/* Avatar Picker */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Anonymous Avatar
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                  className="text-6xl p-3 rounded-xl bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-all border border-purple-200 dark:border-purple-700/50"
                >
                  {profileData.anonymousAvatar}
                </button>
                <span className="text-gray-600 dark:text-gray-400 text-sm">Click to change</span>
              </div>
              
              {showAvatarPicker && (
                <div className="mt-3 grid grid-cols-8 sm:grid-cols-10 gap-2 p-3 rounded-xl bg-gray-100 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/50">
                  {avatarOptions.map(avatar => (
                    <button
                      key={avatar}
                      type="button"
                      onClick={() => {
                        handleChange('anonymousAvatar', avatar);
                        setShowAvatarPicker(false);
                      }}
                      className={`text-3xl p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all ${
                        profileData.anonymousAvatar === avatar ? 'bg-purple-200 dark:bg-purple-900/50 ring-2 ring-purple-600 dark:ring-purple-400' : ''
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Anonymous Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Anonymous Name
              </label>
              <input
                type="text"
                value={profileData.anonymousName}
                onChange={(e) => handleChange('anonymousName', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="Your anonymous display name"
                required
              />
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200 dark:border-gray-700/50 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </h2>

            <div className="space-y-4">
              {/* Username (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username (Cannot be changed)
                </label>
                <input
                  type="text"
                  value={profileData.username}
                  disabled
                  className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Mail className="w-4 h-4" />
                  Email (Cannot be changed)
                </label>
                <input
                  type="email"
                  value={profileData.email || 'Not provided'}
                  disabled
                  className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="Your full name"
                  required
                />
              </div>

              {/* Birthday */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="w-4 h-4" />
                  Birthday
                </label>
                <input
                  type="date"
                  value={profileData.birthday}
                  onChange={(e) => handleChange('birthday', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  required
                />
              </div>

              {/* Gender */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Users className="w-4 h-4" />
                  Gender
                </label>
                <select
                  value={profileData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  required
                >
                  <option value="" className="bg-white dark:bg-gray-800">Select gender</option>
                  {genderOptions.map(option => (
                    <option key={option} value={option} className="bg-white dark:bg-gray-800">{option}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Education Section */}
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200 dark:border-gray-700/50 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <School className="w-5 h-5" />
              Education
            </h2>

            <div className="space-y-4">
              {/* University */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  University
                </label>
                <input
                  type="text"
                  value={profileData.universityName}
                  onChange={(e) => handleChange('universityName', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="Your university name"
                  required
                />
              </div>

              {/* Faculty */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <GraduationCap className="w-4 h-4" />
                  Faculty
                </label>
                <input
                  type="text"
                  value={profileData.faculty}
                  onChange={(e) => handleChange('faculty', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="Your faculty/department"
                  required
                />
              </div>

              {/* Degree Type */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Award className="w-4 h-4" />
                  Degree Type
                </label>
                <select
                  value={profileData.degreeType}
                  onChange={(e) => handleChange('degreeType', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="" className="bg-white dark:bg-gray-800">Select degree type</option>
                  {degreeOptions.map(option => (
                    <option key={option} value={option} className="bg-white dark:bg-gray-800">{option}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Additional Details Section */}
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200 dark:border-gray-700/50 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Additional Details</h2>

            <div className="space-y-4">
              {/* Hometown */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin className="w-4 h-4" />
                  Hometown
                </label>
                <input
                  type="text"
                  value={profileData.hometown}
                  onChange={(e) => handleChange('hometown', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="Your hometown"
                />
              </div>

              {/* Height */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Ruler className="w-4 h-4" />
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={profileData.heightCm || ''}
                  onChange={(e) => handleChange('heightCm', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="Your height in centimeters"
                  min="100"
                  max="250"
                />
              </div>

              {/* Skin Tone */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Palette className="w-4 h-4" />
                  Skin Tone
                </label>
                <select
                  value={profileData.skinTone}
                  onChange={(e) => handleChange('skinTone', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="" className="bg-white dark:bg-gray-800">Select skin tone</option>
                  {skinToneOptions.map(option => (
                    <option key={option} value={option} className="bg-white dark:bg-gray-800">{option}</option>
                  ))}
                </select>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                  placeholder="Tell others about yourself..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Privacy Section */}
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200 dark:border-gray-700/50 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Privacy Settings</h2>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {profileData.isPublic ? (
                  <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <EyeOff className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
                <div>
                  <p className="text-gray-900 dark:text-white font-medium">Profile Visibility</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {profileData.isPublic ? 'Your profile is visible to others' : 'Your profile is private'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleChange('isPublic', !profileData.isPublic)}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                  profileData.isPublic ? 'bg-green-600' : 'bg-gray-400 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    profileData.isPublic ? 'translate-x-8' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 rounded-xl bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
