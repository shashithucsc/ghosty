'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send, X, Eye, MapPin, CheckCircle, XCircle, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react';
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
      className="bg-white dark:bg-gray-800 rounded-3xl h-full overflow-hidden relative animate-scale-in shadow-2xl border border-gray-100 dark:border-gray-700"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={isActive ? getSwipeStyle() : {}}
    >
      {/* Swipe Indicators */}
      {swipeDirection === 'right' && (
        <div className="absolute top-8 right-8 z-20 bg-blue-500 text-white px-6 py-3 rounded-lg font-bold text-xl rotate-12 animate-scale-in">
          MESSAGE 💌
        </div>
      )}
      {swipeDirection === 'left' && (
        <div className="absolute top-8 left-8 z-20 bg-red-500 text-white px-6 py-3 rounded-lg font-bold text-xl -rotate-12 animate-scale-in">
          SKIP ✗
        </div>
      )}

      {/* Card Content */}
      <div className="h-full flex flex-col p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-5xl sm:text-6xl">{profile.avatar}</div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                  {profile.anonymousName}
                </h2>
                {profile.isVerified ? (
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 fill-blue-500" aria-label="Verified" />
                ) : (
                  <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" aria-label="Not Verified" />
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                {profile.age} • {profile.gender}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Information - Single Compact Card */}
        <div className="mb-4 bg-gradient-to-br from-purple-50/50 via-blue-50/50 to-pink-50/50 dark:from-purple-900/10 dark:via-blue-900/10 dark:to-pink-900/10 rounded-2xl p-4 border border-purple-100 dark:border-purple-800/50 space-y-3">
          {/* Name */}
          <div>
            <h3 className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-0.5 uppercase tracking-wide">Name</h3>
            <p className="text-xl font-bold text-gray-800 dark:text-white">
              {profile.realName || profile.anonymousName}
            </p>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center bg-white/60 dark:bg-gray-800/60 rounded-lg p-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Age</p>
              <p className="text-lg font-bold text-gray-800 dark:text-white">{profile.age}</p>
            </div>
            {profile.height && (
              <div className="text-center bg-white/60 dark:bg-gray-800/60 rounded-lg p-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Height</p>
                <p className="text-lg font-bold text-gray-800 dark:text-white">{profile.height}<span className="text-xs">cm</span></p>
              </div>
            )}
            {profile.skinTone && (
              <div className="text-center bg-white/60 dark:bg-gray-800/60 rounded-lg p-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Skin Tone</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{profile.skinTone}</p>
              </div>
            )}
          </div>

          {/* Education */}
          <div className="flex items-start gap-2 bg-blue-50/70 dark:bg-blue-900/20 rounded-lg p-3">
            <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                {profile.university || 'University not specified'}
              </p>
              <div className="flex gap-2 mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                {profile.faculty && <span>• {profile.faculty}</span>}
                {profile.degree && <span>• {profile.degree}</span>}
              </div>
            </div>
          </div>

          {/* Hometown */}
          {profile.hometown && (
            <div className="flex items-center gap-2 bg-pink-50/70 dark:bg-pink-900/20 rounded-lg p-2">
              <MapPin className="w-4 h-4 text-pink-600 dark:text-pink-400 shrink-0" />
              <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                {profile.hometown}
              </p>
            </div>
          )}
        </div>

        {/* Interests */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs sm:text-sm font-medium border border-purple-200 dark:border-purple-700 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 mt-auto">
          {/* Skip Button */}
          <button
            onClick={onSkip}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white dark:bg-gray-800 border-2 border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg flex items-center justify-center group"
            title="Skip"
          >
            <X className="w-6 h-6 sm:w-7 sm:h-7 group-hover:scale-110 transition-transform" />
          </button>

          {/* View Profile Button */}
          <button
            onClick={() => router.push(`/profile/${profile.id}`)}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white dark:bg-gray-800 border-2 border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg flex items-center justify-center group"
            title="View Full Profile"
          >
            <Eye className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
          </button>

          {/* Send Message Request Button */}
          <button
            onClick={onMessageRequest}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg flex items-center justify-center group"
            title="Send Message Request"
          >
            <Send className="w-6 h-6 sm:w-7 sm:h-7 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            onClick={onPrevious}
            disabled={!hasPrevious}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${
              hasPrevious
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-95'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
            }`}
            title="Previous Profile"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <button
            onClick={onSkip}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all active:scale-95"
            title="Next Profile"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Swipe Hint */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-500 mt-3 sm:hidden">
          Swipe right to send message request, left to skip
        </p>
      </div>
    </div>
  );
}
