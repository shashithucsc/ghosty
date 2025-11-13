'use client';

import { useState } from 'react';
import { Send, X, Eye, MapPin, CheckCircle, XCircle, GraduationCap } from 'lucide-react';
import { UserProfile } from '@/app/dashboard/page';

interface ProfileCardProps {
  profile: UserProfile;
  onMessageRequest: () => void;
  onSkip: () => void;
  isActive: boolean;
}

export function ProfileCard({ profile, onMessageRequest, onSkip, isActive }: ProfileCardProps) {
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
      className="glassmorphic-card h-full overflow-hidden relative animate-scale-in"
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

        {/* Bio */}
        <div className="mb-4 grow overflow-y-auto custom-scrollbar">
          <p className={`text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed ${!showFullBio && 'line-clamp-3'}`}>
            {profile.bio}
          </p>
          {profile.bio.length > 100 && (
            <button
              onClick={() => setShowFullBio(!showFullBio)}
              className="text-purple-600 hover:text-purple-700 text-sm font-medium mt-1"
            >
              {showFullBio ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        {/* University & Faculty */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
            <GraduationCap className="w-4 h-4" />
            <span>{profile.university}</span>
          </div>
          <div className="text-gray-600 dark:text-gray-400 text-sm ml-6">
            {profile.faculty}
          </div>
          {profile.distance && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
              <MapPin className="w-4 h-4" />
              <span>{profile.distance}</span>
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
                className="px-3 py-1 bg-linear-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs sm:text-sm font-medium border border-purple-200 dark:border-purple-700"
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
            onClick={() => alert('Profile view coming soon!')}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white dark:bg-gray-800 border-2 border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg flex items-center justify-center group"
            title="View Full Profile"
          >
            <Eye className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
          </button>

          {/* Send Message Request Button */}
          <button
            onClick={onMessageRequest}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-linear-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg flex items-center justify-center group"
            title="Send Message Request"
          >
            <Send className="w-6 h-6 sm:w-7 sm:h-7 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Swipe Hint */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-500 mt-4 sm:hidden">
          Swipe right to send message request, left to skip
        </p>
      </div>
    </div>
  );
}
