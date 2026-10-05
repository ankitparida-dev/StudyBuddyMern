import { useMemo, useState } from 'react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// Convert hours to color intensity
const getColor = (hours) => {
  if (!hours || hours === 0) return 'bg-gray-100 dark:bg-sb-dark-border';
  if (hours < 1) return 'bg-sb-blue/25';
  if (hours < 2) return 'bg-sb-blue/45';
  if (hours < 3) return 'bg-sb-blue/70';
  return 'bg-sb-blue';
};

export default function Heatmap({ data = [] }) {
  const [hovered, setHovered] = useState(null);

  // Build 12-week grid (84 days)
  const weeks = useMemo(() => {
    const days = 12 * 7;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Map of date string -> hours
    const lookup = {};
    data.forEach((d) => {
      lookup[d.date] = d.hours || 0;
    });

    const weeksArr = [];
    let currentWeek = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      currentWeek.push({
        date: dateStr,
        hours: lookup[dateStr] || 0,
        dayOfWeek: date.getDay(),
        month: date.getMonth(),
      });

      if (date.getDay() === 6 || i === 0) {
        weeksArr.push(currentWeek);
        currentWeek = [];
      }
    }

    return weeksArr;
  }, [data]);

  const totalHours = data.reduce((sum, d) => sum + (d.hours || 0), 0);
  const activeDays = data.filter((d) => (d.hours || 0) > 0).length;
  const maxHours = Math.max(...data.map((d) => d.hours || 0), 1);

  return (
    <div className="bg-white dark:bg-sb-dark-card rounded-2xl shadow p-4 md:p-6">
      <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="font-semibold dark:text-sb-dark-text">
            📅 Productivity Heatmap
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Last 12 weeks · {totalHours.toFixed(1)}h across {activeDays} days
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <span>Less</span>
          <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-sb-dark-border" />
          <div className="w-3 h-3 rounded-sm bg-sb-blue/25" />
          <div className="w-3 h-3 rounded-sm bg-sb-blue/45" />
          <div className="w-3 h-3 rounded-sm bg-sb-blue/70" />
          <div className="w-3 h-3 rounded-sm bg-sb-blue" />
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="inline-flex gap-1">
          {/* Weekday labels */}
          <div className="flex flex-col gap-1 pt-5 mr-1">
            {WEEKDAYS.map((d, i) => (
              <div
                key={i}
                className="h-3 w-3 text-[9px] text-gray-400 flex items-center justify-center"
              >
                {i % 2 === 1 ? d : ''}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-1">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {/* Month label */}
                <div className="h-4 text-[9px] text-gray-400 relative">
                  {week[0]?.dayOfWeek === 0 || wi === 0
                    ? MONTHS[week[0]?.month]
                    : ''}
                </div>
                {week.map((day, di) => (
                  <div
                    key={di}
                    onMouseEnter={() => setHovered(day)}
                    onMouseLeave={() => setHovered(null)}
                    className={`w-3 h-3 rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-sb-blue/50 ${getColor(
                      day.hours
                    )}`}
                    title={`${day.date}: ${day.hours.toFixed(1)}h`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hover tooltip */}
      {hovered && (
        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          <strong className="dark:text-sb-dark-text">{hovered.date}</strong> —{' '}
          {hovered.hours.toFixed(1)}h studied
          {hovered.hours === maxHours && hovered.hours > 0 && (
            <span className="ml-2 text-sb-blue font-semibold">
              🔥 Best day!
            </span>
          )}
        </div>
      )}
    </div>
  );
}