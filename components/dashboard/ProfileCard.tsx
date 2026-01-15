'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, X, Eye, MapPin, CheckCircle, XCircle, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react';
import { UserProfile } from '@/app/dashboard/page';

interface ProfileCardProps {
  profile: UserProfile;
  onMessageRequest: () => void;
  onSkip: () => void;
  onPrevious?: () => void;
  isActive: boolean;
  hasPrevious?: boolean;
}

export function ProfileCard({ profile, onMessageRequest, onSkip, onPrevious, isActive, hasPrevious = false }: ProfileCardProps) {
  const router = useRouter();
  const [showFullBio, setShowFullBio] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
    
    if (touchStart !== null) {
      const distance = e.targetTouches[0].clientX - touchStart;
      if (Math.abs(distance) > 20) {
        setSwipeDirection(distance > 0 ? 'right' : 'left');
      }
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      onSkip();
    } else if (isRightSwipe) {
      onMessageRequest();
    }

    setSwipeDirection(null);
    setTouchStart(null);
    setTouchEnd(null);
  };

  const getSwipeStyle = () => {
    if (!touchStart || !touchEnd) return {};
    
    const distance = touchEnd - touchStart;
    const rotation = distance / 20;
    
    return {
      transform: `translateX(${distance}px) rotate(${rotation}deg)`,
      transition: 'none',
    };
  };

  return (
    <div
      className="bg-white rounded-3xl h-full overflow-hidden relative shadow-2xl border border-gray-100"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={isActive ? getSwipeStyle() : {}}
    >
      {/* Swipe Indicators */}
      {swipeDirection === 'right' && (
        <div className="absolute top-8 right-8 z-20 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-xl flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          SEND REQUEST
        </div>
      )}
      {swipeDirection === 'left' && (
        <div className="absolute top-8 left-8 z-20 bg-red-600 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-xl flex items-center gap-2">
          <X className="w-5 h-5" />
          SKIP
        </div>
      )}

      {/* Card Content - Compact Layout */}
      <div className="h-full flex flex-col p-5 sm:p-6">
        {/* Header - Horizontal Layout */}
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-purple-600 border-2 border-purple-500/30 flex items-center justify-center shrink-0 shadow-lg">
            {profile.gender?.toLowerCase() === 'male' ? (
              <svg className="w-12 h-12 sm:w-14 sm:h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            ) : (
              <svg className="w-12 h-12 sm:w-14 sm:h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 truncate">
                {profile.realName || profile.anonymousName}
              </h2>
              {profile.isVerified && (
                <div className="shrink-0 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <span className="text-lg font-semibold">{profile.age} yrs</span>
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span className="text-sm">{profile.gender}</span>
            </div>
          </div>
        </div>

        {/* Compact Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Height */}
          {profile.height && (
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Height</p>
                <p className="text-lg font-bold text-gray-800">{profile.height}<span className="text-xs ml-0.5">cm</span></p>
              </div>
            </div>
          )}

          {/* Skin Tone */}
          {profile.skinTone && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Skin</p>
                <p className="text-sm font-bold text-gray-800 truncate">{profile.skinTone}</p>
              </div>
            </div>
          )}
        </div>

        {/* Education - Full Width */}
        {profile.university && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 font-medium mb-1">Education</p>
              <p className="text-base font-bold text-gray-800 truncate">{profile.university}</p>
              {(profile.faculty || profile.degree) && (
                <p className="text-xs text-gray-600 mt-0.5 truncate">
                  {[profile.faculty, profile.degree].filter(Boolean).join(' • ')}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Hometown */}
        {profile.hometown && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 font-medium">From</p>
              <p className="text-base font-bold text-gray-800 truncate">{profile.hometown}</p>
            </div>
          </div>
        )}

        {/* Interests - If exists */}
        {profile.interests && profile.interests.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {profile.interests.slice(0, 4).map((interest) => (
              <span key={interest} className="px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-semibold text-indigo-700">
                {interest}
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons - Prominent */}
        <div className="mt-auto pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center gap-4 mb-3">
            {/* Skip Button */}
            <button
              onClick={onSkip}
              className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center"
              style={{ backgroundColor: '#F43F5E' }}
              title="Skip"
            >
              <X className="w-8 h-8 sm:w-9 sm:h-9" strokeWidth={2.5} />
            </button>

            {/* View Profile Button */}
            <button
              onClick={() => router.push(`/profile/${profile.id}`)}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center hover:brightness-110"
              style={{ backgroundColor: '#8B5CF6' }}
              title="View Full Profile"
            >
              <Eye className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2} />
            </button>

            {/* Send Message Request Button */}
            <button
              onClick={onMessageRequest}
              className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center"
              style={{ backgroundColor: '#0EA5E9' }}
              title="Send Message Request"
            >
              <MessageSquare className="w-8 h-8 sm:w-9 sm:h-9" strokeWidth={2.5} />
            </button>
          </div>

          {/* Navigation Row */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={onPrevious}
              disabled={!hasPrevious}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                hasPrevious
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95'
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Prev</span>
            </button>
            <span className="text-xs text-gray-500">
              Swipe left/right
            </span>
            <button
              onClick={onSkip}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all active:scale-95"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
