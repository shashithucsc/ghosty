'use client';

import { useState, useEffect } from 'react';
import { X, Sliders, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FilterOptions } from '@/app/dashboard/page';

interface FilterPanelProps {
  currentFilters: FilterOptions;
  onApply: (filters: FilterOptions) => void;
  onClose: () => void;
}

export function FilterPanel({ currentFilters, onApply, onClose }: FilterPanelProps) {
  const router = useRouter();
  const [ageRange, setAgeRange] = useState<[number, number]>(currentFilters.ageRange);
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>(currentFilters.universities);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(currentFilters.interests);

  const universities = [
    'Stanford University',
    'MIT',
    'Harvard University',
    'UC Berkeley',
    'Yale University',
    'Oxford University',
    'Cambridge University',
    'Other',
  ];

  const interests = [
    'Music',
    'Movies',
    'Sports',
    'Reading',
    'Gaming',
    'Cooking',
    'Travel',
    'Art',
    'Photography',
    'Fitness',
    'Dancing',
    'Technology',
  ];

  const toggleUniversity = (uni: string) => {
    setSelectedUniversities((prev) =>
      prev.includes(uni) ? prev.filter((u) => u !== uni) : [...prev, uni]
    );
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleApply = () => {
    onApply({
      ageRange,
      universities: selectedUniversities,
      interests: selectedInterests,
    });
    onClose(); // Close the panel after applying
  };

  const handleReset = () => {
    setAgeRange([18, 30]);
    setSelectedUniversities([]);
    setSelectedInterests([]);
  };

  const handleLogout = () => {
    // Clear all localStorage items
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    localStorage.removeItem('fullName');
    localStorage.removeItem('verificationStatus');
    localStorage.removeItem('anonymousName');
    localStorage.removeItem('avatar');
    
    // Redirect to login
    router.push('/login');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Panel */}
      <div className="fixed inset-x-0 bottom-0 sm:inset-y-0 sm:right-0 sm:left-auto sm:w-full sm:max-w-md z-50 animate-slide-up sm:animate-slide-left">
        <div className="h-full bg-white shadow-2xl overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Sliders className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Filters</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-8 pb-48">
            {/* Age Filter */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Age Range</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Minimum: {ageRange[0]}</span>
                  <span className="text-sm font-medium text-gray-600">Maximum: {ageRange[1]}</span>
                </div>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="18"
                    max="50"
                    value={ageRange[0]}
                    onChange={(e) => setAgeRange([parseInt(e.target.value), ageRange[1]])}
                    className="w-full range-slider"
                  />
                  <input
                    type="range"
                    min="18"
                    max="50"
                    value={ageRange[1]}
                    onChange={(e) => setAgeRange([ageRange[0], parseInt(e.target.value)])}
                    className="w-full range-slider"
                  />
                </div>
                <div className="text-center p-3 bg-purple-100 rounded-xl border border-purple-200">
                  <span className="text-purple-700 font-bold">
                    {ageRange[0]} - {ageRange[1]} years old
                  </span>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-50 hover:bg-red-100 border-2 border-red-200 rounded-xl transition-all group shadow-sm"
              >
                <div className="w-10 h-10 rounded-full bg-red-100 group-hover:bg-red-200 flex items-center justify-center transition-colors">
                  <LogOut className="w-5 h-5 text-red-600 group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-base font-semibold text-red-600">
                  Logout from Account
                </span>
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="fixed bottom-0 inset-x-0 sm:right-0 sm:left-auto sm:w-full sm:max-w-md bg-white border-t border-gray-200 p-6 space-y-3 shadow-2xl">
            <button
              onClick={handleApply}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 text-lg font-semibold rounded-xl shadow-lg transition-all"
            >
              Apply Age Filter
            </button>
            <button
              onClick={handleReset}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 text-base font-semibold rounded-xl transition-all"
            >
              Reset Filter
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
