'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { Home, LayoutDashboard, User, Menu, X, Inbox, Search, LogOut, ClipboardList } from 'lucide-react';
import { useUser } from '@/lib/contexts/UserContext';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      if (response.ok) setSearchResults(data.users || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    router.push('/');
  };

  // --- FIX START ---
  // Define the variable properly so it can be used in logic AND JSX
  const hideNavbarPaths = ['/login', '/register', '/setup-profile', '/pending-verification', '/admin', '/restricted'];
  const shouldHideNavbar = hideNavbarPaths.some(path => pathname?.startsWith(path));

  // Early return if on a hidden path (prevents rendering desktop nav)
  if (shouldHideNavbar) return null;
  // --- FIX END ---

  const hideTopNavbarPaths = ['/chat'];
  const shouldHideTopNavbar = hideTopNavbarPaths.some(path => pathname?.startsWith(path));

  const mobileNavItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Notices', path: '/notice-board', icon: ClipboardList },
    { name: 'Inbox', path: '/inbox', icon: Inbox },
    { name: 'Profile', path: '/my-profile', icon: User }
  ];

  const desktopNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Notice Board', path: '/notice-board', icon: ClipboardList },
    { name: 'Inbox', path: '/inbox', icon: Inbox },
    { name: 'Profile', path: '/my-profile', icon: User },
  ];

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname?.startsWith(path);
  };

  return (
    <>
      {/* DESKTOP & TOP NAVBAR */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b ${
          shouldHideTopNavbar ? 'hidden md:block' : ''
        } ${
          isScrolled 
            ? 'bg-background/95 border-border backdrop-blur-sm' 
            : 'bg-background border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div onClick={() => router.push('/')} className="flex items-center gap-3 cursor-pointer">
              <div className="relative w-8 h-8">
                <Image src="/logo.png" alt="Logo" fill className="object-contain" />
              </div>
              <span className="text-lg font-bold text-primary tracking-tight">Athagili</span>
            </div>

            {/* Desktop Search */}
            {user && (
              <div className="hidden md:block flex-1 max-w-sm mx-8 relative">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-accent transition-colors" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search users..."
                    className="w-full bg-surface border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder-zinc-600"
                  />
                  {searchQuery && (
                    <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2">
                      <X className="w-3 h-3 text-zinc-500 hover:text-primary" />
                    </button>
                  )}
                </div>

                {/* Desktop Search Results */}
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-lg shadow-xl overflow-hidden z-50">
                    {searchResults.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => { router.push(`/profile/${result.id}`); clearSearch(); }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-elevated transition-colors border-b border-border last:border-0"
                      >
                        <span className="text-xl">{result.avatar}</span>
                        <div className="text-left">
                          <p className="font-medium text-sm text-primary">{result.username}</p>
                          <p className="text-xs text-secondary">{result.age} • {result.gender}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Desktop Navigation */}
            {user && (
              <div className="hidden md:flex items-center gap-1">
                {desktopNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <button
                      key={item.path}
                      onClick={() => router.push(item.path)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        active 
                          ? 'bg-accent text-white shadow-sm' 
                          : 'text-secondary hover:text-primary hover:bg-surface'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </button>
                  );
                })}
                
                <div className="w-px h-6 bg-border mx-2"></div>

                <div className="flex items-center gap-3 pl-2">
                   <div className="text-right hidden lg:block">
                      <p className="text-sm font-medium text-primary">{user.anonymousName}</p>
                      <p className="text-xs text-secondary">Online</p>
                   </div>
                   <div className="w-9 h-9 bg-surface rounded-full flex items-center justify-center border border-border">
                      <span className="text-lg">{user.avatar}</span>
                   </div>
                   <button onClick={handleLogout} className="p-2 text-zinc-500 hover:text-danger transition-colors">
                      <LogOut className="w-5 h-5" />
                   </button>
                </div>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-primary hover:bg-surface rounded-lg"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu (Top Slide Down) */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search users..."
                  className="w-full bg-surface border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-sm text-primary focus:outline-none focus:border-accent"
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border">
                 <div className="flex items-center gap-3">
                    <span className="text-2xl">{user?.avatar}</span>
                    <div>
                       <p className="font-medium text-primary">{user?.anonymousName}</p>
                       <p className="text-xs text-secondary">Logged in</p>
                    </div>
                 </div>
                 <button onClick={handleLogout} className="text-xs font-medium text-red-400 hover:text-red-300">
                    Sign Out
                 </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* MOBILE BOTTOM NAVIGATION (Solid, Premium) */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border pb-[env(safe-area-inset-bottom)]`}>
        <div className="flex justify-around items-center h-16">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                  active ? 'text-accent' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Icon className={`w-6 h-6 ${active ? 'fill-current' : 'stroke-current'}`} strokeWidth={active ? 0 : 2} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Spacer */}
      <div className={`h-16 ${shouldHideTopNavbar ? 'hidden md:block' : ''}`} />
    </>
  );
}