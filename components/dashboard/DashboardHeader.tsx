'use client';

import { useState } from 'react';
import { Settings, Bell, MessageCircle, Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DashboardHeaderProps {
  user: {
    anonymousName: string;
    avatar: string;
  };
  onShowFilters: () => void;
  notificationCount: number;
}

export function DashboardHeader({
  user,
  onShowFilters,
  notificationCount = 0,
}: DashboardHeaderProps) {
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}&userId=${userId}`);
      const data = await response.json();
      
      if (response.ok) {
        setSearchResults(data.users || []);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearch(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Ghosty 👻
            </h1>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden sm:block flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by username..."
                className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              )}
              
              {/* Desktop Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto z-50">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => {
                        router.push(`/profile/${result.id}`);
                        clearSearch();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
                    >
                      <span className="text-2xl">{result.avatar}</span>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-gray-900 dark:text-white">{result.username}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {result.age && `${result.age} years`} {result.gender && `• ${result.gender}`}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {searching && searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 text-center text-gray-500 dark:text-gray-400 text-sm z-50">
                  Searching...
                </div>
              )}
              
              {searchQuery && !searching && searchResults.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 text-center text-gray-500 dark:text-gray-400 text-sm z-50">
                  No users found
                </div>
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="hidden sm:flex items-center gap-2 glassmorphic-card px-4 py-2">
            <span className="text-2xl">{user.avatar}</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {user.anonymousName}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 sm:p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Search Users"
            >
              <Search className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-400" />
            </button>

            {/* Messages */}
            <button
              onClick={() => router.push('/inbox')}
              className="relative p-2 sm:p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Messages"
            >
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-400" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Notifications */}
            <button
              className="relative p-2 sm:p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-400" />
              {notificationCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* Filters/Settings */}
            <button
              onClick={onShowFilters}
              className="p-2 sm:p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Filters"
            >
              <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Mobile User Info */}
        <div className="sm:hidden mt-3 flex items-center justify-center gap-2 glassmorphic-card px-4 py-2">
          <span className="text-xl">{user.avatar}</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {user.anonymousName}
          </span>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="sm:hidden mt-3 animate-slide-down">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by username..."
                className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>
            
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => {
                      router.push(`/profile/${result.id}`);
                      clearSearch();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <span className="text-2xl">{result.avatar}</span>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900 dark:text-white">{result.username}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {result.age && `${result.age} years`} {result.gender && `• ${result.gender}`}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {searching && (
              <div className="mt-2 text-center py-4 text-gray-500 dark:text-gray-400">
                Searching...
              </div>
            )}
            
            {searchQuery && !searching && searchResults.length === 0 && (
              <div className="mt-2 text-center py-4 text-gray-500 dark:text-gray-400">
                No users found
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
