'use client';

import { Moon, Sun, LogOut, Shield } from 'lucide-react';

interface AdminHeaderProps {
  darkMode: boolean;
  onToggleTheme: () => void;
}

export function AdminHeader({ darkMode, onToggleTheme }: AdminHeaderProps) {
  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-linear-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-linear-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Ghosty Admin
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Platform Management</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-110"
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <Sun className="text-yellow-500" size={20} />
              ) : (
                <Moon className="text-purple-600" size={20} />
              )}
            </button>

            {/* Logout */}
            <button
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              onClick={() => {
                // Handle logout
                window.location.href = '/';
              }}
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
