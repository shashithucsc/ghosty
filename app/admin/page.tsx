'use client';

import { useState, useEffect } from 'react';
import { DashboardStats } from '@/components/admin/DashboardStats';
import { UsersManagement } from '@/components/admin/UsersManagement';
import { VerificationRequests } from '@/components/admin/VerificationRequests';
import { ReportsManagement } from '@/components/admin/ReportsManagement';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  AlertTriangle 
} from 'lucide-react';

type AdminTab = 'dashboard' | 'users' | 'verifications' | 'reports';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [darkMode, setDarkMode] = useState(false);

  // Load theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('adminTheme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('adminTheme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('adminTheme', 'light');
    }
  };

  const tabs = [
    { id: 'dashboard' as AdminTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users' as AdminTab, label: 'Users', icon: Users },
    { id: 'verifications' as AdminTab, label: 'Verifications', icon: ShieldCheck },
    { id: 'reports' as AdminTab, label: 'Reports', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950 dark:via-pink-950 dark:to-blue-950 transition-colors duration-300">
      {/* Admin Header */}
      <AdminHeader darkMode={darkMode} onToggleTheme={toggleTheme} />

      {/* Navigation Tabs */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto custom-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold whitespace-nowrap transition-all duration-300 border-b-2 ${
                    activeTab === tab.id
                      ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400'
                  }`}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'dashboard' && <DashboardStats />}
        {activeTab === 'users' && <UsersManagement />}
        {activeTab === 'verifications' && <VerificationRequests />}
        {activeTab === 'reports' && <ReportsManagement />}
      </main>
    </div>
  );
}
