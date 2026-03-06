'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, X, Eye, MapPin, CheckCircle, GraduationCap, ChevronLeft, ChevronRight, Ruler, Palette } from 'lucide-react';
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
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const convertCmToFeetInches = (cm: number): string => {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'${inches}"`;
  };

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

    if (isLeftSwipe) onSkip();
    else if (isRightSwipe) onMessageRequest();

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
      className="bg-white rounded-3xl h-full overflow-hidden relative border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] flex flex-col font-sans text-black"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={isActive ? getSwipeStyle() : {}}
    >
      {/* Swipe Overlay Indicators (Hard Solid Stamps) */}
      {swipeDirection === 'right' && (
        <div className="absolute top-8 left-8 z-30 border-4 border-black bg-[#A3E635] text-black px-6 py-2 rounded-2xl font-black text-4xl uppercase tracking-widest transform -rotate-12 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          LIKE
        </div>
      )}
      {swipeDirection === 'left' && (
        <div className="absolute top-8 right-8 z-30 border-4 border-black bg-[#FF6B6B] text-black px-6 py-2 rounded-2xl font-black text-4xl uppercase tracking-widest transform rotate-12 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          NOPE
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 p-6 overflow-y-auto scrollbar-hide bg-white">
        
        {/* Header Section */}
        <div className="flex items-center gap-5 mb-8 border-b-4 border-black pb-6">
          
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-3xl font-black text-black uppercase tracking-tight truncate">
                {profile.realName || profile.anonymousName}
              </h2>
              {profile.isVerified && (
                <CheckCircle className="w-6 h-6 text-[#4ECDC4] stroke-[3]" />
              )}
            </div>
            
            <div className="flex items-center gap-3 text-black font-bold uppercase tracking-wider text-sm">
              <span className="bg-[#F8F9FA] px-2 py-1 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">{profile.age} YRS</span>
              <span className="w-2 h-2 bg-black rounded-full"></span>
              <span>{profile.gender}</span>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {profile.height && (
            <div className="bg-[#F8F9FA] border-4 border-black rounded-2xl p-4 flex items-center gap-3 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all">
              <div className="w-10 h-10 rounded-xl bg-white border-4 border-black flex items-center justify-center text-black shrink-0">
                <Ruler className="w-5 h-5 stroke-[3]" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs text-black uppercase font-black tracking-widest">Height</p>
                <p className="text-lg font-black text-black truncate">{convertCmToFeetInches(profile.height)}</p>
              </div>
            </div>
          )}

          {profile.skinTone && (
            <div className="bg-[#F8F9FA] border-4 border-black rounded-2xl p-4 flex items-center gap-3 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all">
              <div className="w-10 h-10 rounded-xl bg-white border-4 border-black flex items-center justify-center text-black shrink-0">
                <Palette className="w-5 h-5 stroke-[3]" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs text-black uppercase font-black tracking-widest">Tone</p>
                <p className="text-lg font-black text-black truncate">{profile.skinTone}</p>
              </div>
            </div>
          )}
        </div>

        {/* Education Row */}
        {profile.university && (
          <div className="bg-[#F8F9FA] border-4 border-black rounded-2xl p-4 mb-6 flex items-start gap-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <div className="w-12 h-12 rounded-xl bg-[#4ECDC4] border-4 border-black flex items-center justify-center shrink-0 text-black">
              <GraduationCap className="w-6 h-6 stroke-[3]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-black uppercase font-black tracking-widest mb-1">Education</p>
              <p className="text-lg font-black text-black truncate uppercase">{profile.university}</p>
              {(profile.faculty || profile.degree) && (
                <p className="text-sm font-bold text-gray-600 mt-1 truncate">
                  {[profile.faculty, profile.degree].filter(Boolean).join(' • ')}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Hometown */}
        {profile.hometown && (
          <div className="flex items-center gap-3 mb-6 font-bold uppercase tracking-wider text-black">
            <MapPin className="w-5 h-5 stroke-[3]" />
            <span>From <span className="font-black bg-[#FFD166] px-2 border-2 border-black ml-1">{profile.hometown}</span></span>
          </div>
        )}

        {/* Interests Tags */}
        {profile.interests && profile.interests.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-6">
            {profile.interests.slice(0, 5).map((interest) => (
              <span key={interest} className="px-4 py-2 bg-white border-4 border-black rounded-xl text-xs font-black text-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-[#F8F9FA] transition-colors cursor-default">
                {interest}
              </span>
            ))}
          </div>
        )}

        {/* Bio */}
        {profile.bio && (
          <div className="bg-[#F8F9FA] border-l-8 border-[#FF9F1C] border-y-4 border-r-4 border-black p-4 rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <p className="text-base font-bold text-black leading-relaxed line-clamp-3 italic">
              "{profile.bio}"
            </p>
          </div>
        )}
      </div>

      {/* ACTION BAR (Fixed at bottom) */}
      <div className="p-6 border-t-4 border-black bg-white">
        <div className="flex items-center justify-center gap-6 mb-4">
          
          {/* Skip Button */}
          <button
            onClick={onSkip}
            className="w-16 h-16 rounded-full bg-white border-4 border-black text-black hover:bg-[#FF6B6B] hover:text-white transition-all duration-200 flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none"
            title="Skip"
          >
            <X className="w-8 h-8 stroke-[4]" />
          </button>

          {/* View Profile Button */}
          <button
            onClick={() => router.push(`/profile/${profile.id}`)}
            className="w-12 h-12 rounded-full bg-white border-4 border-black text-black hover:bg-[#FFD166] transition-all flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none"
            title="View Details"
          >
            <Eye className="w-5 h-5 stroke-[3]" />
          </button>

          {/* Like Button */}
          <button
            onClick={onMessageRequest}
            className="w-16 h-16 rounded-full bg-white border-4 border-black text-black hover:bg-[#A3E635] transition-all duration-200 flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none"
            title="Like"
          >
            <Heart className="w-7 h-7 stroke-[3] fill-current" />
          </button>
        </div>

        {/* Keyboard Hints */}
        <div className="flex justify-between text-xs text-black uppercase tracking-widest font-black px-4 mt-2">
          <span className="flex items-center gap-1"><ChevronLeft className="w-4 h-4 stroke-[3]" /> NOPE</span>
          <span className="flex items-center gap-1">LIKE <ChevronRight className="w-4 h-4 stroke-[3]" /></span>
        </div>
      </div>
    </div>
  );
}