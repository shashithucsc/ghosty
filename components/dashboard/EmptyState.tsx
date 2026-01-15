'use client';

import { RotateCcw } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md mx-auto px-4 bg-white rounded-2xl shadow-lg p-8">
        <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
          No More Profiles
        </h2>
        <p className="text-gray-600 mb-6">
          You've seen all available profiles matching your filters. Try adjusting your preferences or check back later for new matches!
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-8 rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center gap-2 mx-auto"
        >
          <RotateCcw className="w-5 h-5" />
          Refresh
        </button>
      </div>
    </div>
  );
}
