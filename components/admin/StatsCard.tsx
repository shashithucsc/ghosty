'use client';

import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: 'purple' | 'green' | 'orange' | 'red' | 'blue';
  trend?: number;
  trendLabel?: string;
  percentage?: number;
  urgent?: boolean;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
  trendLabel,
  percentage,
  urgent,
}: StatsCardProps) {
  const colorClasses = {
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  };

  return (
    <div className={`glassmorphic-card p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 ${urgent ? 'ring-2 ring-red-500 animate-pulse-slow' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 ${colorClasses[color]} rounded-xl flex items-center justify-center`}>
          <Icon size={24} />
        </div>
        {percentage !== undefined && (
          <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            {percentage}%
          </div>
        )}
      </div>

      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
        {title}
      </h3>
      <p className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
        {value}
      </p>

      {trend !== undefined && trendLabel && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold text-green-600 dark:text-green-400">+{trend}</span> {trendLabel}
        </p>
      )}
    </div>
  );
}
