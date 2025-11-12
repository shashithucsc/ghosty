'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ShieldCheck
} from 'lucide-react';
import { StatsCard } from './StatsCard';
import { MiniChart } from './MiniChart';

export function DashboardStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    nonVerifiedUsers: 0,
    totalReports: 0,
    newUsersThisWeek: 0,
    verificationsThisWeek: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with API call
    setTimeout(() => {
      setStats({
        totalUsers: 1247,
        verifiedUsers: 532,
        nonVerifiedUsers: 715,
        totalReports: 23,
        newUsersThisWeek: 89,
        verificationsThisWeek: 34,
      });
      setLoading(false);
    }, 500);
  }, []);

  // Mock chart data
  const registrationData = [45, 52, 61, 73, 68, 89, 95];
  const verificationData = [12, 18, 15, 22, 28, 34, 31];

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            icon={Users}
            color="purple"
            trend={stats.newUsersThisWeek}
            trendLabel="new this week"
          />
          <StatsCard
            title="Verified Users"
            value={stats.verifiedUsers.toLocaleString()}
            icon={UserCheck}
            color="green"
            percentage={Math.round((stats.verifiedUsers / stats.totalUsers) * 100)}
          />
          <StatsCard
            title="Non-Verified"
            value={stats.nonVerifiedUsers.toLocaleString()}
            icon={UserX}
            color="orange"
            percentage={Math.round((stats.nonVerifiedUsers / stats.totalUsers) * 100)}
          />
          <StatsCard
            title="Total Reports"
            value={stats.totalReports.toLocaleString()}
            icon={AlertTriangle}
            color="red"
            urgent={stats.totalReports > 20}
          />
        </div>
      </div>

      {/* Trends */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          Trends
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* New Registrations Chart */}
          <div className="glassmorphic-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  New Registrations
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Last 7 days</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
                <TrendingUp size={16} />
                <span className="text-sm font-semibold">+12%</span>
              </div>
            </div>
            <MiniChart data={registrationData} color="purple" />
            <div className="mt-4 text-center">
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats.newUsersThisWeek}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">users this week</p>
            </div>
          </div>

          {/* Verification Approvals Chart */}
          <div className="glassmorphic-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Verification Approvals
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Last 7 days</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                <TrendingUp size={16} />
                <span className="text-sm font-semibold">+8%</span>
              </div>
            </div>
            <MiniChart data={verificationData} color="blue" />
            <div className="mt-4 text-center">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.verificationsThisWeek}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">approved this week</p>
            </div>
          </div>
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
              {stats.verificationsThisWeek} pending requests
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
