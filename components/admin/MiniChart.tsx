'use client';

interface MiniChartProps {
  data: number[];
  color: 'purple' | 'blue' | 'green' | 'red';
}

export function MiniChart({ data, color }: MiniChartProps) {
  const max = Math.max(...data);
  const colorClasses = {
    purple: 'bg-purple-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
  };

  return (
    <div className="flex items-end justify-between gap-2 h-32">
      {data.map((value, index) => {
        const height = (value / max) * 100;
        return (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <div className="relative flex-1 w-full flex items-end">
              <div
                className={`w-full ${colorClasses[color]} rounded-t-lg transition-all duration-500 hover:opacity-80 relative group`}
                style={{ height: `${height}%` }}
              >
                {/* Tooltip */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {value}
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
            </div>
          </div>
        );
      })}
    </div>
  );
}
