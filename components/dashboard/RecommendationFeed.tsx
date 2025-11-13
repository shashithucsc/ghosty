'use client';

import { useState, useEffect } from 'react';
import { UserProfile, FilterOptions } from '@/app/dashboard/page';
import { ProfileCard } from './ProfileCard';
import { EmptyState } from './EmptyState';
import { Toast } from '@/components/ui/Toast';

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
          age: rec.age,
          gender: rec.gender,
          avatar: rec.avatar,
          bio: rec.bio,
          isVerified: rec.isVerified,
          interests: rec.interests || [],
          university: rec.university,
          faculty: rec.faculty,
          distance: undefined, // Distance calculation can be added later
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
      const response = await fetch('/api/inbox/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          recipientId: currentProfile.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle 409 conflict - request already exists
        if (response.status === 409) {
          setToast({ message: 'You already sent a request to this user', type: 'info' });
          return;
        }
        throw new Error(data.error || 'Failed to send request');
      }

      // Show success message
      setToast({ message: '✅ Message request sent successfully!', type: 'success' });

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
      await fetch('/api/swipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          targetUserId: currentProfile.id,
          action,
        }),
      });
    } catch (error) {
      console.error('Error recording swipe:', error);
      // Non-critical error, continue
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="spinner-large mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Finding your matches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Oops! Something went wrong
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {currentIndex + 1} of {profiles.length} profiles
        </p>
        <div className="mt-2 w-full max-w-md mx-auto h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-600 transition-all duration-300 rounded-full"
            style={{ width: `${((currentIndex + 1) / profiles.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
