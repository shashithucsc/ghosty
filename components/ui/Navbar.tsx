'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, LayoutDashboard, User, Menu, X, Inbox, Search, Bell, MessageCircle, UserCog, LogOut } from 'lucide-react';
import { useUser } from '@/lib/contexts/UserContext';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

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

  const handleLogout = () => {
    // Clear all user data from localStorage
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('avatar');
    localStorage.removeItem('token');
    
    // Clear user context
    setUser(null);
    
    // Redirect to home page
    router.push('/');
  };

  // Hide navbar on auth pages
  const hideNavbarPaths = ['/login', '/register', '/setup-profile', '/pending-verification', '/admin', '/restricted'];
  const shouldHideNavbar = hideNavbarPaths.some(path => pathname?.startsWith(path));

  // Hide only top navbar on chat pages (keep bottom mobile nav)
  const hideTopNavbarPaths = ['/chat'];
  const shouldHideTopNavbar = hideTopNavbarPaths.some(path => pathname?.startsWith(path));

  if (shouldHideNavbar) {
    return null;
  }

  // Mobile nav items include Home
  const mobileNavItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Inbox', path: '/inbox', icon: Inbox },
    { name: 'Profile', path: '/my-profile', icon: User }
  ];

  // Desktop nav items - Home is in logo
  const desktopNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Inbox', path: '/inbox', icon: Inbox },
    { name: 'Profile', path: '/my-profile', icon: User },
  ];

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname?.startsWith(path);
  };

  return (
    <>
      {/* Desktop & Mobile Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          shouldHideTopNavbar ? 'hidden md:block' : ''
        } ${
          isScrolled
            ? 'glass-card shadow-2xl'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div
              onClick={() => router.push('/')}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="text-3xl sm:text-4xl transform group-hover:scale-110 transition-transform duration-300">
                👻
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-purple-400 text-transparent bg-clip-text text-glow">
                අතැගිලි
              </span>
            </div>

            {/* Desktop Search Bar */}
            {user && (
              <div className="hidden md:block flex-1 max-w-md mx-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search by username..."
                    className="w-full pl-10 pr-10 py-2 rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent text-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full"
                    >
                      <X className="w-4 h-4 text-gray-300" />
                    </button>
                  )}
                  
                  {/* Desktop Search Results Dropdown */}
                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-xl rounded-lg shadow-2xl border border-white/10 max-h-96 overflow-y-auto z-50">
                      {searchResults.map((result) => (
                        <button
                          key={result.id}
                          onClick={() => {
                            router.push(`/profile/${result.id}`);
                            clearSearch();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors border-b border-white/5 last:border-0"
                        >
                          <span className="text-2xl">{result.avatar}</span>
                          <div className="flex-1 text-left">
                            <p className="font-semibold text-white">{result.username}</p>
                            <p className="text-xs text-gray-400">
                              {result.age && `${result.age} years`} {result.gender && `• ${result.gender}`}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {searching && searchQuery && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-xl rounded-lg shadow-2xl border border-white/10 p-4 text-center text-gray-400 text-sm z-50">
                      Searching...
                    </div>
                  )}
                  
                  {searchQuery && !searching && searchResults.length === 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-xl rounded-lg shadow-2xl border border-white/10 p-4 text-center text-gray-400 text-sm z-50">
                      No users found
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Desktop User Actions */}
            {user && (
              <div className="hidden md:flex items-center gap-2">
                {/* User Info */}
                <div className="flex items-center gap-2 glass-panel px-3 py-2 rounded-xl">
                  <span className="text-xl">{user.avatar}</span>
                  <span className="text-sm font-medium text-white">
                    {user.anonymousName}
                  </span>
                </div>

                {/* Navigation Buttons */}
                {desktopNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <button
                      key={item.path}
                      onClick={() => router.push(item.path)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                        active
                          ? 'btn-glass-primary shadow-lg'
                          : 'btn-glass-secondary hover:scale-105'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{item.name}</span>
                    </button>
                  );
                })}

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 border border-red-400/30 hover:border-red-400/50"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl glass-panel hover:bg-white/10 transition-all duration-300"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen
              ? 'max-h-96 opacity-100'
              : 'max-h-0 opacity-0 overflow-hidden'
          }`}
        >
          <div className="bg-gray-900/95 backdrop-blur-xl mx-4 mb-4 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            {/* Mobile User Info */}
            {user && (
              <div className="flex items-center justify-center gap-2 px-6 py-4 border-b border-white/10 bg-white/5">
                <span className="text-2xl">{user.avatar}</span>
                <span className="text-sm font-medium text-white">
                  {user.anonymousName}
                </span>
              </div>
            )}

            {/* Mobile Search */}
            {user && (
              <div className="px-4 py-3 border-b border-white/10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search by username..."
                    className="w-full pl-10 pr-10 py-2 rounded-lg border border-white/20 bg-gray-800/80 backdrop-blur-sm text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:border-transparent text-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full"
                    >
                      <X className="w-4 h-4 text-gray-300" />
                    </button>
                  )}
                </div>

                {/* Mobile Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-2 bg-gray-800/90 rounded-lg max-h-48 overflow-y-auto border border-white/10">
                    {searchResults.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => {
                          router.push(`/profile/${result.id}`);
                          clearSearch();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 transition-colors border-b border-white/5 last:border-0"
                      >
                        <span className="text-xl">{result.avatar}</span>
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-white text-sm">{result.username}</p>
                          <p className="text-xs text-gray-400">
                            {result.age && `${result.age} years`} {result.gender && `• ${result.gender}`}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {searching && searchQuery && (
                  <div className="mt-2 text-center py-2 text-gray-400 text-sm">
                    Searching...
                  </div>
                )}

                {searchQuery && !searching && searchResults.length === 0 && (
                  <div className="mt-2 text-center py-2 text-gray-400 text-sm">
                    No users found
                  </div>
                )}
              </div>
            )}

            {mobileNavItems.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    router.push(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-6 py-4 transition-all duration-300 ${
                    active
                      ? 'bg-white/10 text-white font-semibold'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  } ${index !== mobileNavItems.length - 1 ? 'border-b border-white/10' : ''}`}
                  style={{
                    transitionDelay: isMobileMenuOpen ? `${index * 50}ms` : '0ms',
                  }}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-purple-400' : ''}`} />
                  <span>{item.name}</span>
                  {active && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                  )}
                </button>
              );
            })}

            {/* Logout Button in Mobile Menu */}
            {user && (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-6 py-4 text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-all duration-300 border-t border-white/10"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Bottom Mobile Navigation (iOS style) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-700/50 safe-area-inset-bottom shadow-lg">
        <div className="grid grid-cols-4 h-16">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
                  active ? 'text-white' : 'text-gray-400'
                }`}
              >
                <div
                  className={`p-1.5 rounded-xl transition-all duration-300 ${
                    active ? 'bg-white/10' : ''
                  }`}
                >
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${active ? 'text-purple-400' : ''}`} />
                </div>
                <span className={`text-[10px] sm:text-xs font-medium ${active ? 'text-glow' : ''}`}>
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Spacer for fixed navbar - hidden on mobile for chat pages */}
      <div className={`h-16 sm:h-20 ${shouldHideTopNavbar ? 'hidden md:block' : ''}`} />
    </>
  );
}
