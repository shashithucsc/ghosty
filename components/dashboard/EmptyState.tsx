'use client';

import { RotateCcw } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] font-sans text-black">
      <div className="text-center max-w-md mx-auto px-4 bg-white border-4 border-black rounded-3xl shadow-[12px_12px_0px_rgba(0,0,0,1)] p-10">
        
        <div className="w-24 h-24 bg-[#FF6B6B] border-4 border-black rounded-full flex items-center justify-center mx-auto mb-8 shadow-[4px_4px_0px_rgba(0,0,0,1)] transform -rotate-12">
          <svg className="w-12 h-12 stroke-[3] text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>

        <h2 className="text-3xl font-black uppercase tracking-tight mb-4">
          No Matches Found
        </h2>
        
        <p className="text-black font-bold uppercase tracking-wider text-sm mb-10 leading-relaxed">
          You've seen all available profiles matching your filters. Adjust your preferences or check back later!
        </p>

        <button
          onClick={() => window.location.reload()}
          className="bg-[#A3E635] text-black py-4 px-10 border-4 border-black rounded-xl font-black uppercase text-lg tracking-wider transition-all shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] active:translate-y-[6px] active:translate-x-[6px] active:shadow-none flex items-center justify-center gap-3 mx-auto"
        >
          <RotateCcw className="w-6 h-6 stroke-[3]" />
          Refresh Feed
        </button>
      </div>
    </div>
  );
}