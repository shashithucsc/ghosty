'use client';

import { useRouter } from 'next/navigation';
import { 
  User, 
  GraduationCap, 
  BookOpen, 
  Heart, 
  MapPin, 
  Flag, 
  MessageCircle,
  Shield,
  ShieldAlert,
  ArrowLeft,
  Cake,
  Ruler,
  Palette
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
  height_cm?: number;
  skinTone?: string;
  degree_type?: string;
  hometown?: string;
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
        setToast({ message: 'Message request sent', type: 'success' });
      } else if (response.status === 409) {
        setToast({ message: 'Request already sent', type: 'info' });
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
      <div className="min-h-screen bg-background pb-20 pt-16 md:pt-20">
        <div className="max-w-xl mx-auto px-4">
          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            
            {/* Header / Avatar */}
            <div className="bg-zinc-900/50 p-8 text-center border-b border-border relative">
               <div className="w-28 h-28 mx-auto bg-surface rounded-2xl border border-border flex items-center justify-center text-6xl shadow-xl">
                 {profile.avatar}
               </div>
               <h2 className="text-2xl font-bold text-primary mt-4">
                 {profile.username}
               </h2>
               
               {/* Unverified Badge */}
               <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full mt-3">
                 <ShieldAlert className="w-4 h-4 text-red-500" />
                 <span className="text-xs font-semibold text-red-400 uppercase tracking-wide">Unverified</span>
               </div>
            </div>

            {/* Limited Info Section */}
            <div className="p-6 space-y-4">
              <div className="bg-background border border-border rounded-xl p-4 space-y-3">
                {/* Age */}
                {profile.age && (
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-400">
                      <Cake className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-zinc-500">Age</p>
                      <p className="text-base font-semibold text-primary">{profile.age} years old</p>
                    </div>
                  </div>
                )}
                
                <div className="h-px bg-border w-full" />

                {/* Reports */}
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    profile.reportCount > 0 ? 'bg-red-900/20 text-red-500' : 'bg-green-900/20 text-green-500'
                  }`}>
                    <Flag className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-zinc-500">Status</p>
                    <p className={`text-sm font-semibold ${
                      profile.reportCount > 0 ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {profile.reportCount > 0 ? `${profile.reportCount} Reports` : 'Good Standing'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Limited Notice */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex gap-3">
                <ShieldAlert className="w-5 h-5 text-zinc-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-zinc-300">Limited Profile</p>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                    This user is not verified. Full details are hidden to ensure community safety.
                  </p>
                </div>
              </div>

              {/* Message Button */}
              {!isOwnProfile && (
                <button
                  onClick={handleSendMessageRequest}
                  disabled={sendingRequest}
                  className="w-full bg-accent hover:bg-accent-hover disabled:bg-zinc-800 disabled:text-zinc-500 text-white py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  {sendingRequest ? 'Sending...' : 'Send Message Request'}
                </button>
              )}
            </div>
          </div>
        </div>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    );
  }

  // =============================================
  // RENDER FULL PROFILE (VERIFIED USERS)
  // =============================================
  
  const fullProfile = profile as FullProfile;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-surface rounded-full transition-colors text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-semibold text-primary">
            {isOwnProfile ? 'My Profile' : fullProfile.username}
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Main Card */}
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          
          {/* Header */}
          <div className="bg-zinc-900/50 p-8 text-center border-b border-border relative">
            <div className="w-32 h-32 mx-auto bg-surface border border-zinc-700 rounded-2xl flex items-center justify-center text-7xl shadow-2xl">
              {fullProfile.avatar}
            </div>
            <h2 className="text-3xl font-bold text-primary mt-4 tracking-tight">
              {fullProfile.realName || fullProfile.username}
            </h2>
            {fullProfile.anonymousName && fullProfile.anonymousName !== fullProfile.username && (
              <p className="text-zinc-500 text-sm mt-1">@{fullProfile.anonymousName}</p>
            )}
            
            {/* Verified Badge */}
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-4 py-1.5 rounded-full mt-4">
              <Shield className="w-3 h-3 text-green-500" fill="currentColor" />
              <span className="text-xs font-bold text-green-500 uppercase tracking-wider">Verified Student</span>
            </div>
          </div>

          {/* Bio */}
          {fullProfile.bio && (
            <div className="p-6 border-b border-border">
              <p className="text-zinc-400 text-sm leading-relaxed text-center italic">"{fullProfile.bio}"</p>
            </div>
          )}

          {/* Details Grid */}
          <div className="p-6 grid grid-cols-1 gap-4">
            
            {/* Basic Info Row */}
            <div className="flex items-center gap-4 p-3 rounded-xl bg-background border border-border">
              <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-500">Identity</p>
                <p className="text-sm font-semibold text-zinc-200">
                  {fullProfile.age ? `${fullProfile.age} Years` : 'N/A'} 
                  {fullProfile.gender && <span className="text-zinc-600 mx-2">•</span>}
                  {fullProfile.gender}
                </p>
              </div>
            </div>

            {/* University Row */}
            {fullProfile.university && (
              <div className="flex items-center gap-4 p-3 rounded-xl bg-background border border-border">
                <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold text-zinc-500">Education</p>
                  <p className="text-sm font-semibold text-zinc-200 truncate">{fullProfile.university}</p>
                  <p className="text-xs text-zinc-500 truncate">{fullProfile.faculty}</p>
                </div>
              </div>
            )}

            {/* Physical Traits Grid */}
            <div className="grid grid-cols-2 gap-4">
               {/* Height */}
               {fullProfile.height_cm && (
                 <div className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border">
                   <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-400">
                     <Ruler className="w-4 h-4" />
                   </div>
                   <div>
                     <p className="text-[10px] uppercase font-bold text-zinc-500">Height</p>
                     <p className="text-sm font-semibold text-zinc-200">{fullProfile.height_cm} cm</p>
                   </div>
                 </div>
               )}
               
               {/* Skin Tone */}
               {fullProfile.skinTone && (
                 <div className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border">
                   <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-400">
                     <Palette className="w-4 h-4" />
                   </div>
                   <div>
                     <p className="text-[10px] uppercase font-bold text-zinc-500">Complexion</p>
                     <p className="text-sm font-semibold text-zinc-200">{fullProfile.skinTone}</p>
                   </div>
                 </div>
               )}
            </div>

            {/* Hometown */}
            {fullProfile.hometown && (
              <div className="flex items-center gap-4 p-3 rounded-xl bg-background border border-border">
                <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-zinc-500">Hometown</p>
                  <p className="text-sm font-semibold text-zinc-200">{fullProfile.hometown}</p>
                </div>
              </div>
            )}

            {/* Status */}
            <div className="flex items-center gap-4 p-3 rounded-xl bg-background border border-border">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                fullProfile.reportCount > 0 ? 'bg-red-900/20 text-red-500' : 'bg-green-900/20 text-green-500'
              }`}>
                <Flag className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-500">Community Status</p>
                <p className={`text-sm font-semibold ${
                  fullProfile.reportCount > 0 ? 'text-red-400' : 'text-green-400'
                }`}>
                  {fullProfile.reportCount > 0 ? 'Flags Reported' : 'Good Standing'}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Interests Card */}
        {(fullProfile.preferences || fullProfile.partnerPreferences) && (
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-6">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Heart className="w-4 h-4 text-accent" />
              Preferences
            </h3>

            {fullProfile.preferences && fullProfile.preferences.length > 0 && (
              <div>
                <p className="text-xs text-zinc-500 mb-3 font-medium">My Interests</p>
                <div className="flex flex-wrap gap-2">
                  {fullProfile.preferences.map((pref: string, idx: number) => (
                    <span key={idx} className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-medium rounded-lg">
                      {pref}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {fullProfile.partnerPreferences && fullProfile.partnerPreferences.length > 0 && (
              <div>
                <p className="text-xs text-zinc-500 mb-3 font-medium">Looking For</p>
                <div className="flex flex-wrap gap-2">
                  {fullProfile.partnerPreferences.map((pref: string, idx: number) => (
                    <span key={idx} className="px-3 py-1.5 bg-accent/10 border border-accent/20 text-accent text-xs font-medium rounded-lg">
                      {pref}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        {!isOwnProfile && (
          <button
            onClick={handleSendMessageRequest}
            disabled={sendingRequest}
            className="w-full bg-accent hover:bg-accent-hover text-white py-4 rounded-xl font-bold text-sm shadow-lg shadow-accent/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            {sendingRequest ? 'Sending Request...' : 'Send Message Request'}
          </button>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}