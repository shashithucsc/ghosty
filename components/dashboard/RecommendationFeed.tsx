'use client';

import { useState, useEffect } from 'react';
import { UserProfile, FilterOptions } from '@/app/dashboard/page';
import { ProfileCard } from './ProfileCard';
import { EmptyState } from './EmptyState';
import { Toast } from '@/components/ui/Toast';
import { MatchModal } from './MatchModal';

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
  const [matchedUser, setMatchedUser] = useState<{ user: UserProfile; conversationId?: string } | null>(null);

  // Fetch real profiles from API
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user ID from localStorage or session
        // TODO: Replace with your actual auth implementation
        const currentUserId = localStorage.getItem('userId');
        
        if (!currentUserId) {
          setError('Please log in to view recommendations');
          setLoading(false);
          return;
        }

        // Build query parameters
        const params = new URLSearchParams({
          userId: currentUserId,
          limit: '50',
        });

        // Add filter parameters
        if (filters.ageRange) {
          params.append('minAge', filters.ageRange[0].toString());
          params.append('maxAge', filters.ageRange[1].toString());
        }

        if (filters.universities.length > 0) {
          params.append('universities', filters.universities.join(','));
        }

        if (filters.interests.length > 0) {
          params.append('interests', filters.interests.join(','));
        }

        // Fetch profiles from API
        const response = await fetch(`/api/recommendations?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }

        const data = await response.json();

        // Transform API data to match UserProfile interface
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
          distance: undefined, // Distance calculation can be added later
          height: rec.height,
          degree: rec.degree,
          hometown: rec.hometown,
          skinTone: rec.skinTone,
        }));

        setProfiles(transformedProfiles);
        setCurrentIndex(0);
      } catch (err) {
        console.error('Error fetching profiles:', err);
        setError('Failed to load recommendations. Please try again.');
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

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleMessageRequest();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleSkip();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, profiles, sendingRequest, loading, viewedProfiles]);

  const handleMessageRequest = async () => {
    if (sendingRequest) return;

    const currentProfile = profiles[currentIndex];
    const currentUserId = localStorage.getItem('userId');

    if (!currentUserId) {
      setToast({ message: 'Please log in to send message requests', type: 'error' });
      return;
    }

    setSendingRequest(true);

    try {
      console.log('📤 Sending request from:', currentUserId, 'to:', currentProfile.id);
      
      const response = await fetch('/api/inbox/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          recipientId: currentProfile.id,
        }),
      });

      const data = await response.json();
      console.log('📬 Response:', response.status, data);

      if (!response.ok) {
        // Handle 409 conflict - request already exists
        if (response.status === 409) {
          setToast({ message: 'You already sent a request to this user', type: 'info' });
          return;
        }
        throw new Error(data.error || 'Failed to send request');
      }

      // Check if it's a match!
      if (data.isMatch && data.matchData) {
        console.log('🎉 IT\'S A MATCH!', data.matchData);
        setMatchedUser({
          user: currentProfile,
          conversationId: data.matchData.conversationId,
        });
      } else {
        // Show success message for non-match like
        setToast({ message: '✅ Message request sent successfully!', type: 'success' });
      }

      // Notify parent component
      if (onRequestSent) {
        onRequestSent(currentProfile);
      }

      // Card stays visible - don't move to next automatically
    } catch (error: any) {
      console.error('Error sending message request:', error);
      setToast({ message: error.message || 'Failed to send message request. Please try again.', type: 'error' });
    } finally {
      setSendingRequest(false);
    }
  };

  const handleSkip = () => {
    recordSwipe('skip');
    handleNext();
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < profiles.length - 1) {
      // Track viewed profile
      if (!viewedProfiles.includes(profiles[currentIndex].id)) {
        setViewedProfiles([...viewedProfiles, profiles[currentIndex].id]);
      }
      setCurrentIndex(currentIndex + 1);
    } else {
      // All profiles viewed
      setProfiles([]);
    }
  };

  const recordSwipe = async (action: 'skip' | 'like') => {
    const currentProfile = profiles[currentIndex];
    const currentUserId = localStorage.getItem('userId');

    if (!currentUserId || !currentProfile) return;

    try {
      await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          swiperId: currentUserId,
          targetId: currentProfile.id,
          action,
        }),
      });
      // Swipe recording is optional - don't block user experience if it fails
    } catch (error) {
      // Silently fail - swipe recording is not critical for core functionality
      console.log('Swipe not recorded (optional feature):', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <div className="spinner-large"></div>
          </div>
          <p className="text-gray-700 font-medium">Finding your matches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Oops! Something went wrong
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (profiles.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="relative">
      {/* Match Modal */}
      {matchedUser && (
        <MatchModal
          user={matchedUser.user}
          conversationId={matchedUser.conversationId}
          onClose={() => setMatchedUser(null)}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Card Stack Preview */}
      <div className="relative h-[calc(100vh-200px)] sm:h-[600px] max-w-md mx-auto">
        {profiles.slice(currentIndex, currentIndex + 3).map((profile, index) => (
          <div
            key={profile.id}
            className="absolute inset-0 transition-all duration-300"
            style={{
              transform: `translateY(${index * 8}px) scale(${1 - index * 0.05})`,
              zIndex: 10 - index,
              opacity: index === 0 ? 1 : 0.5,
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

      {/* Progress Indicator */}
      <div className="mt-6 text-center">
        <p className="text-sm font-medium text-gray-600">
          {currentIndex + 1} of {profiles.length} profiles
        </p>
        <div className="mt-2 w-full max-w-md mx-auto h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-purple-600 transition-all duration-300 rounded-full"
            style={{ width: `${((currentIndex + 1) / profiles.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
