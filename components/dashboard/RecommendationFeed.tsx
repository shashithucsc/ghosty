'use client';

import { useState, useEffect } from 'react';
import { UserProfile, FilterOptions } from '@/app/dashboard/page';
import { ProfileCard } from './ProfileCard';
import { EmptyState } from './EmptyState';

interface RecommendationFeedProps {
  filters: FilterOptions;
  onMatch: (user: UserProfile) => void;
}

export function RecommendationFeed({ filters, onMatch }: RecommendationFeedProps) {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Mock data generator
  useEffect(() => {
    const mockProfiles: UserProfile[] = [
      {
        id: '1',
        anonymousName: 'CharmingSoul456',
        age: 24,
        gender: 'Female',
        avatar: '👩',
        bio: 'Love adventure, deep conversations, and spontaneous road trips. Looking for someone who appreciates art and good music. 🎨🎵',
        isVerified: true,
        interests: ['Travel', 'Music', 'Art', 'Photography'],
        university: 'Stanford University',
        faculty: 'Arts & Humanities',
        distance: '2.3 km away',
      },
      {
        id: '2',
        anonymousName: 'BraveExplorer789',
        age: 26,
        gender: 'Male',
        avatar: '🧑',
        bio: 'Tech enthusiast and fitness junkie. Weekend hiker and coffee addict. Let\'s grab coffee and talk about changing the world! ☕🏔️',
        isVerified: false,
        interests: ['Technology', 'Fitness', 'Travel', 'Cooking'],
        university: 'MIT',
        faculty: 'Computer Science',
        distance: '5.1 km away',
      },
      {
        id: '3',
        anonymousName: 'GentleDreamer234',
        age: 23,
        gender: 'Female',
        avatar: '🌸',
        bio: 'Bookworm by day, stargazer by night. Love indie music, poetry, and meaningful connections. 📚✨',
        isVerified: true,
        interests: ['Reading', 'Music', 'Art', 'Dancing'],
        university: 'Harvard University',
        faculty: 'Literature',
        distance: '1.8 km away',
      },
      {
        id: '4',
        anonymousName: 'SmartVibes567',
        age: 25,
        gender: 'Male',
        avatar: '👨',
        bio: 'Aspiring entrepreneur with a passion for innovation. Love sports, gaming, and trying new cuisines. Always up for an adventure! 🚀🎮',
        isVerified: true,
        interests: ['Gaming', 'Sports', 'Technology', 'Cooking'],
        university: 'UC Berkeley',
        faculty: 'Business',
        distance: '3.7 km away',
      },
      {
        id: '5',
        anonymousName: 'LovelySpirit890',
        age: 22,
        gender: 'Female',
        avatar: '💃',
        bio: 'Dance is my therapy, photography is my passion. Looking for someone genuine who loves life and laughter. 📸💫',
        isVerified: false,
        interests: ['Dancing', 'Photography', 'Fitness', 'Movies'],
        university: 'Stanford University',
        faculty: 'Fine Arts',
        distance: '4.2 km away',
      },
      {
        id: '6',
        anonymousName: 'WiseOwl123',
        age: 27,
        gender: 'Male',
        avatar: '🎩',
        bio: 'Philosophy major with a love for deep discussions. Enjoy hiking, reading, and discovering hidden gems in the city. 🌆📖',
        isVerified: true,
        interests: ['Reading', 'Travel', 'Music', 'Art'],
        university: 'Oxford University',
        faculty: 'Philosophy',
        distance: '6.5 km away',
      },
      {
        id: '7',
        anonymousName: 'SweetHeart456',
        age: 24,
        gender: 'Female',
        avatar: '👸',
        bio: 'Aspiring chef who loves experimenting with new recipes. Looking for a foodie partner to explore the culinary world with! 🍳❤️',
        isVerified: false,
        interests: ['Cooking', 'Movies', 'Music', 'Travel'],
        university: 'Yale University',
        faculty: 'Culinary Arts',
        distance: '2.9 km away',
      },
      {
        id: '8',
        anonymousName: 'BoldAdventurer321',
        age: 28,
        gender: 'Male',
        avatar: '🙋‍♂️',
        bio: 'Outdoor enthusiast and adrenaline seeker. Love rock climbing, surfing, and everything that gets my heart racing! 🏄‍♂️⛰️',
        isVerified: true,
        interests: ['Sports', 'Travel', 'Fitness', 'Photography'],
        university: 'Cambridge University',
        faculty: 'Sports Science',
        distance: '7.3 km away',
      },
    ];

    // Apply filters
    let filteredProfiles = mockProfiles;

    if (filters.ageRange) {
      filteredProfiles = filteredProfiles.filter(
        (p) => p.age >= filters.ageRange[0] && p.age <= filters.ageRange[1]
      );
    }

    if (filters.universities.length > 0) {
      filteredProfiles = filteredProfiles.filter((p) =>
        filters.universities.includes(p.university)
      );
    }

    if (filters.interests.length > 0) {
      filteredProfiles = filteredProfiles.filter((p) =>
        p.interests.some((interest) => filters.interests.includes(interest))
      );
    }

    setProfiles(filteredProfiles);
    setCurrentIndex(0);
    setLoading(false);
  }, [filters]);

  const handleLike = () => {
    const currentProfile = profiles[currentIndex];
    
    // Simulate match (50% chance)
    if (Math.random() > 0.5) {
      onMatch(currentProfile);
    }

    handleNext();
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleNext = () => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // All profiles viewed
      setProfiles([]);
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

  if (profiles.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="relative">
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
              onLike={handleLike}
              onSkip={handleSkip}
              isActive={index === 0}
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
            className="h-full bg-linear-to-r from-purple-600 to-pink-600 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / profiles.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
