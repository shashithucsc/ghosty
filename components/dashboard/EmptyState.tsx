'use client';

import { RotateCcw } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="text-6xl sm:text-7xl mb-6 animate-bounce-gentle">👻</div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-4">
          No More Profiles
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          You've seen all available profiles matching your filters. Try adjusting your preferences or check back later for new matches!
        </p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary py-3 px-8 max-w-xs mx-auto flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          Refresh
        </button>
      </div>
    </div>
  );
}
