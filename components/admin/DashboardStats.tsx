'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  AlertTriangle,
  ShieldCheck,
  ShieldOff,
  MessageCircle
} from 'lucide-react';
import { StatsCard } from './StatsCard';

export function DashboardStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    pendingVerifications: 0,
    restrictedUsers: 0,
    totalReports: 0,
    activeChats: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="spinner-large mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Overview Stats */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatsCard
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            icon={Users}
            color="purple"
          />
          <StatsCard
            title="Verified Users"
            value={stats.verifiedUsers.toLocaleString()}
            icon={UserCheck}
            color="green"
            percentage={stats.totalUsers > 0 ? Math.round((stats.verifiedUsers / stats.totalUsers) * 100) : 0}
          />
          <StatsCard
            title="Pending Verifications"
            value={stats.pendingVerifications.toLocaleString()}
            icon={UserX}
            color="orange"
          />
          <StatsCard
            title="Restricted Users"
            value={stats.restrictedUsers.toLocaleString()}
            icon={ShieldOff}
            color="red"
          />
          <StatsCard
            title="Total Reports"
            value={stats.totalReports.toLocaleString()}
            icon={AlertTriangle}
            color="red"
            urgent={stats.totalReports > 20}
          />
          <StatsCard
            title="Active Chats"
            value={stats.activeChats.toLocaleString()}
            icon={MessageCircle}
            color="purple"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="glassmorphic-card p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 text-left group">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
              Review Verifications
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {stats.pendingVerifications} pending requests
            </p>
          </button>

          <button className="glassmorphic-card p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 text-left group">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <AlertTriangle className="text-red-600 dark:text-red-400" size={24} />
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
              Handle Reports
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {stats.totalReports} reports to review
            </p>
          </button>

          <button className="glassmorphic-card p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 text-left group">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Users className="text-green-600 dark:text-green-400" size={24} />
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
              Manage Users
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {stats.totalUsers} total users
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
