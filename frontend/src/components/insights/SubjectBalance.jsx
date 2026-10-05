import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

const SUBJECT_COLORS = {
  physics: '#4A90E2',
  chemistry: '#A78BFA',
  math: '#FB923C',
  biology: '#4ADE80',
  general: '#94A3B8',
};

const capitalize = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

export default function SubjectBalance({ subjects = {} }) {
  const entries = Object.entries(subjects)
    .map(([name, hours]) => ({ name, hours }))
    .filter((s) => s.hours > 0)
    .sort((a, b) => b.hours - a.hours);

  const total = entries.reduce((sum, s) => sum + s.hours, 0);

  const chartData = entries.map((s) => ({
    name: capitalize(s.name),
    value: Math.round(s.hours * 10) / 10,
    originalKey: s.name,
    percent: total > 0 ? Math.round((s.hours / total) * 100) : 0,
  }));

  const isBalanced =
    entries.length >= 3 && entries[0].hours / total <= 0.6;

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
          ⚖️ Subject Balance
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {entries.length === 0
            ? 'Log sessions to see your distribution'
            : isBalanced
            ? '✅ Nicely balanced across subjects'
            : `⚠️ You're spending ${chartData[0]?.percent}% on ${chartData[0]?.name}`}
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="h-56 flex items-center justify-center text-gray-400 text-sm">
          No subject data yet
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={45}
                outerRadius={80}
                dataKey="value"
                paddingAngle={3}
              >
                {chartData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={SUBJECT_COLORS[entry.originalKey] || '#94A3B8'}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => [`${v}h`, 'Hours']}
                contentStyle={tooltipStyle}
                wrapperStyle={{ outline: 'none' }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            {chartData.map((entry) => (
              <div
                key={entry.name}
                className="flex items-center gap-2 text-xs"
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{
                    background:
                      SUBJECT_COLORS[entry.originalKey] || '#94A3B8',
                  }}
                />
                <span className="text-gray-600 dark:text-gray-400 flex-1 truncate">
                  {entry.name}
                </span>
                <span className="font-semibold dark:text-sb-dark-text">
                  {entry.percent}%
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}