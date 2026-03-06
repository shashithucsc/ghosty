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
    onClose(); 
  };

  const handleReset = () => {
    setAgeRange([18, 30]);
    setSelectedUniversities([]);
    setSelectedInterests([]);
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    localStorage.removeItem('fullName');
    localStorage.removeItem('verificationStatus');
    localStorage.removeItem('anonymousName');
    localStorage.removeItem('avatar');
    
    router.push('/login');
  };

  return (
    <>
      {/* Backdrop (Solid Dark, No Blur) */}
      <div
        className="fixed inset-0 bg-black/90 z-50 animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Panel (Super compact) */}
      <div className="fixed inset-x-0 bottom-0 sm:inset-y-0 sm:right-0 sm:left-auto sm:w-full sm:max-w-[280px] z-50 animate-slide-up sm:animate-slide-left font-sans text-black">
        <div className="h-full bg-[#FDF8F5] border-l-2 border-black shadow-[-4px_0_0_rgba(0,0,0,1)] overflow-y-auto flex flex-col">
          
          {/* Header */}
          <div className="sticky top-0 bg-[#FFD166] border-b-2 border-black px-3 py-2.5 flex items-center justify-between z-10 shadow-[0_2px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-white border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                <Sliders className="w-3.5 h-3.5 stroke-[3] text-black" />
              </div>
              <h2 className="text-base font-black uppercase tracking-tight">Filters</h2>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 bg-white border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:bg-[#FF6B6B] hover:text-white active:translate-y-[1px] active:translate-x-[1px] active:shadow-none transition-all"
            >
              <X className="w-4 h-4 stroke-[3]" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-3 space-y-4 pb-32">
            
            {/* Age Filter */}
            <div className="bg-white border-2 border-black rounded-lg p-3 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-2 mb-3 border-b-2 border-black pb-2">
                <div className="w-6 h-6 bg-[#4ECDC4] border-2 border-black rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 stroke-[2] text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-sm font-black uppercase tracking-tight">Age Range</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] font-black uppercase text-gray-600">
                  <span>Min: {ageRange[0]}</span>
                  <span>Max: {ageRange[1]}</span>
                </div>
                <div className="space-y-2">
                  {/* Custom Neobrutalist Range Sliders would ideally require custom CSS, but standard inputs are styled to fit */}
                  <input
                    type="range"
                    min="18"
                    max="50"
                    value={ageRange[0]}
                    onChange={(e) => setAgeRange([parseInt(e.target.value), ageRange[1]])}
                    className="w-full accent-black cursor-pointer h-1"
                  />
                  <input
                    type="range"
                    min="18"
                    max="50"
                    value={ageRange[1]}
                    onChange={(e) => setAgeRange([ageRange[0], parseInt(e.target.value)])}
                    className="w-full accent-black cursor-pointer h-1"
                  />
                </div>
                <div className="text-center p-2 bg-[#FFD166] border-2 border-black rounded-lg shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                  <span className="text-black font-black uppercase text-xs">
                    {ageRange[0]} - {ageRange[1]} YRS
                  </span>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-[#FF6B6B] hover:text-white hover:translate-y-[-1px] hover:translate-x-[-1px] hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all group"
              >
                <div className="w-6 h-6 bg-black border border-black rounded-lg flex items-center justify-center group-hover:bg-white transition-colors">
                  <LogOut className="w-3.5 h-3.5 text-white group-hover:text-[#FF6B6B] stroke-[2]" />
                </div>
                <span className="text-sm font-black uppercase tracking-wider">
                  Log Out
                </span>
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="fixed bottom-16 sm:bottom-0 inset-x-0 sm:right-0 sm:left-auto sm:w-full sm:max-w-[280px] bg-white border-t-2 border-l-2 border-black p-3 space-y-2 shadow-[0_-2px_0px_rgba(0,0,0,1)]">
            <button
              onClick={handleApply}
              className="w-full bg-[#4ECDC4] text-black py-2.5 text-sm font-black uppercase tracking-wider rounded-lg border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] hover:translate-x-[-1px] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-[3px] active:translate-x-[3px] active:shadow-none transition-all"
            >
              Apply Filters
            </button>
            <button
              onClick={handleReset}
              className="w-full bg-white text-black py-2 text-xs font-black uppercase tracking-wider rounded-lg border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-[#F8F9FA] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </>
  );
}