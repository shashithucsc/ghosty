'use client';

import { useRouter } from 'next/navigation';
import { 
  User, 
  Calendar, 
  GraduationCap, 
  BookOpen, 
  Heart, 
  MapPin, 
  Flag, 
  MessageCircle,
  Shield,
  ShieldAlert,
  ArrowLeft,
  Cake
} from 'lucide-react';
import { useState } from 'react';
import { Toast } from '@/components/ui/Toast';

// =============================================
// PROFILE TYPES
// =============================================

interface BaseProfile {
  id: string;
  username: string;
  age: number | null;
  reportCount: number;
  isVerified: boolean;
  registrationType: string;
  avatar: string;
  anonymousName: string;
}

interface FullProfile extends BaseProfile {
  realName?: string;
  gender?: string;
  bio?: string;
  university?: string;
  faculty?: string;
  preferences?: string[] | null;
  partnerPreferences?: string[] | null;
  verificationType?: string;
  isPublic?: boolean;
  memberSince?: string;
}

interface ProfileViewProps {
  profile: BaseProfile | FullProfile;
  isLimited: boolean;
  isOwnProfile?: boolean;
  currentUserId?: string;
}

// =============================================
// PROFILE VIEW COMPONENT
// =============================================

export default function ProfileView({ 
  profile, 
  isLimited, 
  isOwnProfile = false,
  currentUserId 
}: ProfileViewProps) {
  const router = useRouter();
  const [sendingRequest, setSendingRequest] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  // =============================================
  // MESSAGE REQUEST HANDLER
  // =============================================
  
  const handleSendMessageRequest = async () => {
    if (!currentUserId) {
      setToast({ message: 'Please log in to send messages', type: 'error' });
      router.push('/login');
      return;
    }

    if (isOwnProfile) {
      setToast({ message: "You can't message yourself", type: 'error' });
      return;
    }

    setSendingRequest(true);

    try {
      const response = await fetch('/api/inbox/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          recipientId: profile.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setToast({ message: '✅ Message request sent! 💌', type: 'success' });
      } else if (response.status === 409) {
        setToast({ message: 'You already sent a request to this user', type: 'info' });
      } else {
        setToast({ message: data.error || 'Failed to send request', type: 'error' });
      }
    } catch (error) {
      console.error('Error sending message request:', error);
      setToast({ message: 'Something went wrong', type: 'error' });
    } finally {
      setSendingRequest(false);
    }
  };

  // =============================================
  // RENDER LIMITED PROFILE (UNVERIFIED USERS)
  // =============================================
  
  if (isLimited) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-20">
       

        {/* Profile Card */}
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Avatar Section */}
            <div className="bg-purple-600 p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-purple-700 opacity-90"></div>
              <div className="relative z-10">
                <div className="w-28 h-28 mx-auto bg-white rounded-full flex items-center justify-center text-5xl shadow-xl">
                  {profile.avatar}
                </div>
                <h2 className="text-2xl font-bold text-white mt-4">
                  {profile.username}
                </h2>
                
                {/* Unverified Badge */}
                <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full mt-3 shadow-md">
                  <ShieldAlert className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-orange-700">Unverified User</span>
                </div>
              </div>
            </div>

            {/* Limited Info Section */}
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                {/* Age */}
                {profile.age && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Cake className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Age</p>
                      <p className="text-base font-semibold text-gray-800">{profile.age} years old</p>
                    </div>
                  </div>
                )}

                {/* University */}
                {(profile as any).university && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">University</p>
                      <p className="text-base font-semibold text-gray-800">{(profile as any).university}</p>
                    </div>
                  </div>
                )}

                {/* Degree */}
                {(profile as any).degree_type && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Degree</p>
                      <p className="text-base font-semibold text-gray-800">{(profile as any).degree_type}</p>
                    </div>
                  </div>
                )}

                {/* Height */}
                {(profile as any).height_cm && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Height</p>
                      <p className="text-base font-semibold text-gray-800">{(profile as any).height_cm} cm</p>
                    </div>
                  </div>
                )}

                {/* Hometown */}
                {(profile as any).hometown && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Hometown</p>
                      <p className="text-base font-semibold text-gray-800">{(profile as any).hometown}</p>
                    </div>
                  </div>
                )}

                {/* Report Count */}
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    profile.reportCount > 0 ? 'bg-red-100' : 'bg-green-100'
                  }`}>
                    <Flag className={`w-5 h-5 ${
                      profile.reportCount > 0 ? 'text-red-600' : 'text-green-600'
                    }`} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Reports</p>
                    <p className={`text-base font-semibold ${
                      profile.reportCount > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {profile.reportCount} {profile.reportCount === 1 ? 'report' : 'reports'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Limited Profile Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-800">Limited Profile</p>
                    <p className="text-xs text-amber-700 mt-1">
                      This user hasn't verified their account yet. Only basic information is available.
                    </p>
                  </div>
                </div>
              </div>

              {/* Message Button */}
              {!isOwnProfile && (
                <button
                  onClick={handleSendMessageRequest}
                  disabled={sendingRequest}
                  className="w-full bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white py-4 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  {sendingRequest ? 'Sending...' : 'Send Message Request'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    );
  }

  // =============================================
  // RENDER FULL PROFILE (VERIFIED USERS)
  // =============================================
  
  const fullProfile = profile as FullProfile;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">
            {isOwnProfile ? 'My Profile' : 'Profile'}
          </h1>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Main Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Avatar & Header Section */}
          <div className="bg-purple-600 p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-purple-700 opacity-90"></div>
            <div className="relative z-10">
            <div className="w-28 h-28 mx-auto bg-white rounded-full flex items-center justify-center text-5xl shadow-xl">
              {fullProfile.avatar}
            </div>
            <h2 className="text-2xl font-bold text-white mt-4">
              {fullProfile.realName || fullProfile.username}
            </h2>
            {fullProfile.anonymousName && fullProfile.anonymousName !== fullProfile.username && (
              <p className="text-white/90 text-sm mt-1">@{fullProfile.anonymousName}</p>
            )}
              
              {/* Verified Badge */}
              <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full mt-3 shadow-md">
              <Shield className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Verified User</span>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          {fullProfile.bio && (
            <div className="p-6 border-b border-gray-100">
              <p className="text-gray-700 text-sm leading-relaxed">{fullProfile.bio}</p>
            </div>
          )}

          {/* Details Section */}
          <div className="p-6 space-y-3">
            {/* Age & Gender */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Personal Info</p>
                <p className="text-sm font-medium text-gray-800">
                  {fullProfile.age ? `${fullProfile.age} years old` : 'Age not specified'}
                  {fullProfile.gender && ` • ${fullProfile.gender}`}
                </p>
              </div>
            </div>

            {/* University */}
            {fullProfile.university && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">University</p>
                  <p className="text-sm font-medium text-gray-800">{fullProfile.university}</p>
                </div>
              </div>
            )}

            {/* Degree */}
            {(fullProfile as any).degree_type && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Degree</p>
                  <p className="text-sm font-medium text-gray-800">{(fullProfile as any).degree_type}</p>
                </div>
              </div>
            )}

            {/* Faculty */}
            {fullProfile.faculty && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Faculty</p>
                  <p className="text-sm font-medium text-gray-800">{fullProfile.faculty}</p>
                </div>
              </div>
            )}

            {/* Height */}
            {(fullProfile as any).height_cm && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-teal-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Height</p>
                  <p className="text-sm font-medium text-gray-800">{(fullProfile as any).height_cm} cm</p>
                </div>
              </div>
            )}

            {/* Hometown */}
            {(fullProfile as any).hometown && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Hometown</p>
                  <p className="text-sm font-medium text-gray-800">{(fullProfile as any).hometown}</p>
                </div>
              </div>
            )}

            {/* Report Count */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                fullProfile.reportCount > 0 ? 'bg-red-100' : 'bg-green-100'
              }`}>
                <Flag className={`w-5 h-5 ${
                  fullProfile.reportCount > 0 ? 'text-red-600' : 'text-green-600'
                }`} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Community Reports</p>
                <p className={`text-sm font-semibold ${
                  fullProfile.reportCount > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {fullProfile.reportCount} {fullProfile.reportCount === 1 ? 'report' : 'reports'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences Card */}
        {(fullProfile.preferences || fullProfile.partnerPreferences) && (
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              Interests & Preferences
            </h3>

            {fullProfile.preferences && fullProfile.preferences.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">My Interests</p>
                <div className="flex flex-wrap gap-2">
                  {fullProfile.preferences.map((pref: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full"
                    >
                      {pref}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {fullProfile.partnerPreferences && fullProfile.partnerPreferences.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Looking For</p>
                <div className="flex flex-wrap gap-2">
                  {fullProfile.partnerPreferences.map((pref: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-pink-100 text-pink-700 text-xs font-medium rounded-full"
                    >
                      {pref}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Message Button (for other users) */}
        {!isOwnProfile && (
          <button
            onClick={handleSendMessageRequest}
            disabled={sendingRequest}
                  className="w-full bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white py-4 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            {sendingRequest ? 'Sending...' : 'Send Message Request'}
          </button>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
