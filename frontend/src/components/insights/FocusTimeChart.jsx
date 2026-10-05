import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';
import { Sunrise, Sun, Sunset, Moon } from 'lucide-react';

const TIME_SLOTS = [
  { key: 'morning', label: 'Morning', sub: '5am - 12pm', icon: Sunrise, color: '#F5D547' },
  { key: 'afternoon', label: 'Afternoon', sub: '12pm - 5pm', icon: Sun, color: '#FB923C' },
  { key: 'evening', label: 'Evening', sub: '5pm - 9pm', icon: Sunset, color: '#4A90E2' },
  { key: 'night', label: 'Night', sub: '9pm - 5am', icon: Moon, color: '#A78BFA' },
];

export default function FocusTimeChart({ data = [] }) {
  // data: [{ timeOfDay: 'morning', hours: 12, sessions: 5 }]
  const lookup = {};
  data.forEach((d) => {
    lookup[d.timeOfDay] = d;
  });

  const chartData = TIME_SLOTS.map((slot) => ({
    name: slot.label,
    hours: lookup[slot.key]?.hours || 0,
    sessions: lookup[slot.key]?.sessions || 0,
    color: slot.color,
    icon: slot.icon,
    sub: slot.sub,
  }));

  const bestSlot = [...chartData].sort((a, b) => b.hours - a.hours)[0];
  const hasData = chartData.some((d) => d.hours > 0);

  const tooltipStyle = {
    borderRadius: 12,
    border: 'none',
    fontSize: 12,
    padding: '8px 12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  };

  return (
    <div className="bg-white dark:bg-sb-dark-card rounded-2xl shadow p-4 md:p-6">
      <div className="mb-4">
        <h3 className="font-semibold dark:text-sb-dark-text">
          ⏰ Best Focus Time
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {hasData && bestSlot.hours > 0
            ? `You focus best during ${bestSlot.label.toLowerCase()} (${bestSlot.sub})`
            : 'Log sessions to see your peak focus hours'}
        </p>
      </div>

      {!hasData ? (
        <div className="h-56 flex items-center justify-center text-gray-400 text-sm">
          No session data yet
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ left: -20, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={30} />
              <Tooltip
                formatter={(v) => [`${v}h`, 'Hours']}
                contentStyle={tooltipStyle}
                wrapperStyle={{ outline: 'none' }}
              />
              <Bar dataKey="hours" radius={[8, 8, 0, 0]}>
                {chartData.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Bottom stats */}
          <div className="grid grid-cols-4 gap-2 mt-4 text-xs">
            {chartData.map((slot) => {
              const Icon = slot.icon;
              const isBest = slot.name === bestSlot.name && slot.hours > 0;
              return (
                <div
                  key={slot.name}
                  className={`p-2 rounded-lg text-center transition ${
                    isBest
                      ? 'bg-sb-blue/10 ring-1 ring-sb-blue/30'
                      : 'bg-gray-50 dark:bg-sb-dark-bg'
                  }`}
                >
                  <Icon
                    size={14}
                    className="mx-auto mb-1"
                    style={{ color: slot.color }}
                  />
                  <p className="font-bold dark:text-sb-dark-text">
                    {slot.hours.toFixed(1)}h
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    {slot.name}
                  </p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}