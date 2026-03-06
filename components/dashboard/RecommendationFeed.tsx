'use client';

import { useState, useEffect } from 'react';
import { UserProfile, FilterOptions } from '@/app/dashboard/page';
import { ProfileCard } from './ProfileCard';
import { EmptyState } from './EmptyState';
import { Toast } from '@/components/ui/Toast';
import { MatchModal } from './MatchModal';
import { Loader2, AlertCircle } from 'lucide-react';

interface RecommendationFeedProps {
  filters: FilterOptions;
  onRequestSent?: (user: UserProfile) => void;
}

export function RecommendationFeed({ filters, onRequestSent }: RecommendationFeedProps) {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [viewedProfiles, setViewedProfiles] = useState<string[]>([]);
  const [matchedUser, setMatchedUser] = useState<{ user: UserProfile } | null>(null);

  // Debug: Watch matchedUser state changes
  useEffect(() => {
    console.log('🎭 matchedUser state changed:', matchedUser);
  }, [matchedUser]);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        setError(null);
        const currentUserId = localStorage.getItem('userId');
        
        if (!currentUserId) {
          setError('Please log in to view recommendations');
          setLoading(false);
          return;
        }

        const params = new URLSearchParams({ userId: currentUserId, limit: '50' });
        if (filters.ageRange) {
          params.append('minAge', filters.ageRange[0].toString());
          params.append('maxAge', filters.ageRange[1].toString());
        }
        if (filters.universities.length > 0) params.append('universities', filters.universities.join(','));
        if (filters.interests.length > 0) params.append('interests', filters.interests.join(','));

        const response = await fetch(`/api/recommendations?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch recommendations');

        const data = await response.json();
        const transformedProfiles: UserProfile[] = (data.recommendations || []).map((rec: any) => ({
          id: rec.id,
          anonymousName: rec.anonymousName,
          realName: rec.realName,
          age: rec.age,
          gender: rec.gender,
          avatar: rec.avatar,
          bio: rec.bio,
          isVerified: rec.isVerified,
          interests: rec.interests || [],
          university: rec.university,
          faculty: rec.faculty,
          height: rec.height,
          degree: rec.degree,
          hometown: rec.hometown,
          skinTone: rec.skinTone,
        }));

        setProfiles(transformedProfiles);
        setCurrentIndex(0);
      } catch (err) {
        console.error('Error fetching profiles:', err);
        setError('Failed to load recommendations.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, [filters]);

  // Arrow key navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (sendingRequest || loading || profiles.length === 0) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); handleMessageRequest(); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); handleSkip(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, profiles, sendingRequest, loading]);

  const handleMessageRequest = async () => {
    if (sendingRequest) return;
    const currentProfile = profiles[currentIndex];
    const currentUserId = localStorage.getItem('userId');
    if (!currentUserId) return;

    // Optimistic UI
    handleNext();
    setSendingRequest(true);

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ swiperId: currentUserId, targetId: currentProfile.id, action: 'like' }),
      });

      const data = await response.json();
      console.log('🎯 Swipe API Response:', { status: response.status, data });
      
      // Handle 409 (already swiped) silently - this is expected behavior
      if (response.status === 409) {
        console.log('Profile already swiped, skipping...');
        setSendingRequest(false);
        return;
      }
      
      if (!response.ok) throw new Error(data.error);

      console.log(`🔍 Checking match: data.isMatch=${data.isMatch}, currentProfile:`, currentProfile);
      if (data.isMatch) {
        console.log('🎉 MATCH DETECTED! Setting matchedUser state');
        const matchData = { user: currentProfile };
        console.log('📦 About to set matchedUser with:', matchData);
        setMatchedUser(matchData);
        console.log('✅ setMatchedUser called');
      } else {
        setToast({ message: 'Liked! Hope they like you back.', type: 'success' });
      }
    } catch (error: any) {
      console.error('Error liking profile:', error);
      setToast({ message: 'Failed to like profile.', type: 'error' });
    } finally {
      setSendingRequest(false);
    }
  };

  const handleSkip = async () => {
    const currentProfile = profiles[currentIndex];
    handleNext();
    const currentUserId = localStorage.getItem('userId');
    if (!currentUserId || !currentProfile) return;

    try {
      await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ swiperId: currentUserId, targetId: currentProfile.id, action: 'skip' }),
      });
    } catch (error) { console.error(error); }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleNext = () => {
    if (currentIndex < profiles.length - 1) {
      if (!viewedProfiles.includes(profiles[currentIndex].id)) {
        setViewedProfiles([...viewedProfiles, profiles[currentIndex].id]);
      }
      setCurrentIndex(currentIndex + 1);
    } else {
      setProfiles([]);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] font-sans">
        <div className="w-16 h-16 border-4 border-black border-t-[#FFD166] rounded-full animate-spin mx-auto mb-6 shadow-[4px_4px_0px_rgba(0,0,0,1)]"></div>
        <p className="text-black font-black uppercase tracking-wider text-xl">Finding Matches...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center font-sans">
        <div className="bg-white border-4 border-black p-8 rounded-2xl shadow-[8px_8px_0px_rgba(0,0,0,1)] max-w-sm w-full">
          <div className="w-16 h-16 bg-[#FF6B6B] border-4 border-black rounded-full flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <AlertCircle className="w-8 h-8 stroke-[3] text-black" />
          </div>
          <h3 className="text-2xl font-black text-black mb-2 uppercase tracking-tight">Whoops!</h3>
          <p className="text-black font-bold mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-[#FFD166] border-4 border-black text-black font-black uppercase text-lg rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (profiles.length === 0) return <EmptyState />;

  console.log('🔄 RecommendationFeed render: matchedUser=', matchedUser);

  return (
    <div className="relative flex flex-col h-full w-full max-w-md mx-auto font-sans">
      {matchedUser && (
        <MatchModal user={matchedUser.user} onClose={() => setMatchedUser(null)} />
      )}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Card Stack */}
      <div className="relative flex-1 w-full mt-1 sm:mt-2">
        {profiles.slice(currentIndex, currentIndex + 3).map((profile, index) => (
          <div
            key={profile.id}
            className="absolute inset-0 transition-all duration-300 ease-out origin-bottom"
            style={{
              // Swapped out soft opacity/blur for a rigid, physical deck style
              transform: `translateY(${index * 16}px) translateX(${index * 4}px) scale(${1 - index * 0.03})`,
              zIndex: 30 - index,
              pointerEvents: index === 0 ? 'auto' : 'none',
            }}
          >
            <ProfileCard
              profile={profile}
              onMessageRequest={handleMessageRequest}
              onSkip={handleSkip}
              onPrevious={handlePrevious}
              isActive={index === 0}
              hasPrevious={currentIndex > 0}
            />
          </div>
        ))}
      </div>

      {/* Chunky Progress Bar */}
      <div className="mt-3 mb-2 px-4">
        <div className="flex justify-between text-black font-black text-xs sm:text-sm mb-2 uppercase tracking-wider">
          <span>Discover</span>
          <span>{currentIndex + 1} / {profiles.length}</span>
        </div>
        <div className="w-full h-3 sm:h-4 bg-white border-3 sm:border-4 border-black rounded-full overflow-hidden shadow-[2px_2px_0px_rgba(0,0,0,1)]">
          <div
            className="h-full bg-[#4ECDC4] border-r-4 border-black transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / profiles.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}