'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserContextType {
  user: {
    anonymousName: string;
    avatar: string;
    userId: string;
  } | null;
  setUser: (user: { anonymousName: string; avatar: string; userId: string } | null) => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{
    anonymousName: string;
    avatar: string;
    userId: string;
  } | null>(null);

  // Load user data from localStorage on mount
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    const avatar = localStorage.getItem('avatar');
    
    if (userId) {
      setUser({
        anonymousName: username || 'User',
        avatar: avatar || '👤',
        userId,
      });
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
