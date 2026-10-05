import { TrendingUp, TrendingDown, Minus, Target } from 'lucide-react';

export default function PredictedScore({ tests = [] }) {
  // tests: [{ testName, percentage, takenAt }]
  const recent = [...tests]
    .sort((a, b) => new Date(a.takenAt) - new Date(b.takenAt))
    .slice(-5);

  const avg =
    recent.length > 0
      ? Math.round(
          recent.reduce((sum, t) => sum + (t.percentage || 0), 0) /
            recent.length
        )
      : 0;

  // Simple linear regression for trend
  const trend = (() => {
    if (recent.length < 2) return 0;
    const n = recent.length;
    let sumX = 0,
      sumY = 0,
      sumXY = 0,
      sumX2 = 0;
    recent.forEach((t, i) => {
      sumX += i;
      sumY += t.percentage || 0;
      sumXY += i * (t.percentage || 0);
      sumX2 += i * i;
    });
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  })();

  // Predict next score: avg + slope
  const predicted = Math.min(
    100,
    Math.max(0, Math.round(avg + trend * Math.min(recent.length, 3)))
  );

  const improving = trend > 1;
  const declining = trend < -1;
  const stable = !improving && !declining;

  const TrendIcon = improving ? TrendingUp : declining ? TrendingDown : Minus;
  const trendColor = improving
    ? 'text-green-500'
    : declining
    ? 'text-red-500'
    : 'text-gray-400';
  const trendLabel = improving
    ? `+${trend.toFixed(1)}%/test`
    : declining
    ? `${trend.toFixed(1)}%/test`
    : 'Stable';

  return (
    <div className="bg-white dark:bg-sb-dark-card rounded-2xl shadow p-4 md:p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold dark:text-sb-dark-text">
            🎯 Predicted Score
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Based on your last {recent.length} test{recent.length !== 1 ? 's' : ''}
          </p>
        </div>
        <TrendIcon size={20} className={trendColor} />
      </div>

      {recent.length === 0 ? (
        <div className="h-40 flex flex-col items-center justify-center text-gray-400 text-sm">
          <Target size={32} className="mb-2 text-gray-300" />
          Take a mock test to see predictions
        </div>
      ) : (
        <>
          <div className="text-center my-4">
            <p className="text-5xl font-bold text-sb-blue">{predicted}%</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Estimated next score
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-gray-50 dark:bg-sb-dark-bg rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Current avg
              </p>
              <p className="text-xl font-bold dark:text-sb-dark-text">
                {avg}%
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-sb-dark-bg rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Trend
              </p>
              <p className={`text-xl font-bold ${trendColor}`}>
                {trendLabel}
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center leading-relaxed">
            {improving
              ? '📈 You\'re improving! Keep the momentum.'
              : declining
              ? '📉 Focus on weak topics and review mistakes.'
              : '📊 Consistency is key — try more mock tests.'}
          </p>
        </>
      )}
    </div>
  );
}