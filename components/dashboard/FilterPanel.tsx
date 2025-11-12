'use client';

import { useState, useEffect } from 'react';
import { X, Sliders } from 'lucide-react';
import { FilterOptions } from '@/app/dashboard/page';

interface FilterPanelProps {
  currentFilters: FilterOptions;
  onApply: (filters: FilterOptions) => void;
  onClose: () => void;
}

export function FilterPanel({ currentFilters, onApply, onClose }: FilterPanelProps) {
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
  };

  const handleReset = () => {
    setAgeRange([18, 30]);
    setSelectedUniversities([]);
    setSelectedInterests([]);
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
        <div className="h-full bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <Sliders className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Filters</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-8 pb-32">
            {/* Age Range */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Age Range</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Minimum: {ageRange[0]}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Maximum: {ageRange[1]}</span>
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
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <span className="text-purple-700 dark:text-purple-300 font-semibold">
                    {ageRange[0]} - {ageRange[1]} years old
                  </span>
                </div>
              </div>
            </div>

            {/* Universities */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Universities
              </h3>
              <div className="flex flex-wrap gap-2">
                {universities.map((uni) => (
                  <button
                    key={uni}
                    onClick={() => toggleUniversity(uni)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedUniversities.includes(uni)
                        ? 'bg-linear-to-r from-purple-600 to-pink-600 text-white shadow-md scale-105'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {uni}
                  </button>
                ))}
              </div>
              {selectedUniversities.length > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {selectedUniversities.length} selected
                </p>
              )}
            </div>

            {/* Interests */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedInterests.includes(interest)
                        ? 'bg-linear-to-r from-purple-600 to-pink-600 text-white shadow-md scale-105'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
              {selectedInterests.length > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {selectedInterests.length} selected
                </p>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="fixed bottom-0 inset-x-0 sm:right-0 sm:left-auto sm:w-full sm:max-w-md bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-6 space-y-3">
            <button
              onClick={handleApply}
              className="w-full btn-primary py-4 text-lg font-semibold"
            >
              Apply Filters
            </button>
            <button
              onClick={handleReset}
              className="w-full btn-secondary py-3 text-base font-semibold"
            >
              Reset All
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
