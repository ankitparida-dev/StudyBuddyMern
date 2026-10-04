import { Flame, Clock, Trophy, Sparkles, TrendingUp, Calendar } from 'lucide-react';

export default function EmailPreview({ settings, user, stats }) {
  const dayLabel = settings.day.charAt(0).toUpperCase() + settings.day.slice(1);

  return (
    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
      {/* Email client mockup header */}
      <div className="bg-white rounded-t-xl border-b border-gray-200 px-4 py-3 text-xs">
        <div className="flex items-center gap-2 text-gray-500 mb-1">
          <span className="font-semibold text-gray-700">From:</span>
          <span>StudyBuddy &lt;noreply@studybuddy.app&gt;</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500 mb-1">
          <span className="font-semibold text-gray-700">To:</span>
          <span>{user?.email || 'you@example.com'}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <span className="font-semibold text-gray-700">Subject:</span>
          <span className="text-gray-900 font-medium">
            📊 Your week in review — {stats.hours}h studied
          </span>
        </div>
      </div>

      {/* Email body */}
      <div
        className="rounded-b-xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #F8FBFF 0%, #FFFFFF 30%)',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #4A90E2 0%, #1A4D4D 100%)',
            padding: '28px 24px',
            color: 'white',
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#F5D547',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                color: '#1A4D4D',
                fontSize: '18px',
              }}
            >
              {user?.name?.[0]?.toUpperCase() || 'S'}
            </div>
            <div>
              <p className="text-sm opacity-90">Weekly Report</p>
              <p className="font-bold text-lg leading-tight">
                Hi {user?.name || 'Student'}! 👋
              </p>
            </div>
          </div>
          <p className="text-sm opacity-90 mt-3">
            Here's how your study week looked. Every {dayLabel} at{' '}
            {settings.time}, we'll send this to your inbox.
          </p>
        </div>

        {/* Stats */}
        <div style={{ padding: '24px' }}>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <StatCard
              icon={<Clock size={20} className="text-sb-blue" />}
              label="Total Hours"
              value={`${stats.hours}h`}
            />
            <StatCard
              icon={<Calendar size={20} className="text-purple-500" />}
              label="Sessions"
              value={stats.sessions}
            />
            <StatCard
              icon={<Flame size={20} className="text-orange-500" />}
              label="Streak"
              value={`${stats.streak} days`}
            />
            <StatCard
              icon={<Trophy size={20} className="text-green-500" />}
              label="Topics Done"
              value={`${stats.completedTopics}/${stats.totalTopics}`}
            />
          </div>

          {/* AI Insight */}
          {settings.includeInsights && (
            <div
              style={{
                background: 'linear-gradient(135deg, #FFF7E1 0%, #FFEFD5 100%)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px',
                border: '1px solid #F5D54740',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-sb-blue" />
                <p className="text-xs font-bold tracking-wide text-sb-teal">
                  AI INSIGHT
                </p>
              </div>
              <p className="text-sm text-sb-teal leading-relaxed">
                You're most productive in the morning sessions. Consider
                scheduling tough topics before noon. Physics got most of your
                attention — Chemistry deserves some love next week! 🧪
              </p>
            </div>
          )}

          {/* Session list */}
          {settings.includeSessions && (
            <div style={{ marginBottom: '20px' }}>
              <p className="text-sm font-bold text-gray-700 mb-3">
                Your Sessions This Week
              </p>
              <div className="space-y-2">
                {[
                  { day: 'Mon', subject: 'Physics', hours: 2 },
                  { day: 'Tue', subject: 'Chemistry', hours: 1.5 },
                  { day: 'Wed', subject: 'Physics', hours: 3 },
                  { day: 'Thu', subject: 'Math', hours: 1 },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm"
                  >
                    <span className="text-gray-600">
                      <span className="font-semibold text-gray-800 mr-2">
                        {s.day}
                      </span>
                      {s.subject}
                    </span>
                    <span className="font-semibold text-sb-blue">
                      {s.hours}h
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="text-center mt-6">
            <a
              href="#"
              style={{
                display: 'inline-block',
                background: '#4A90E2',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '14px',
              }}
            >
              View Full Report →
            </a>
          </div>

          {/* Footer */}
          <div
            style={{
              textAlign: 'center',
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid #E5E7EB',
              fontSize: '12px',
              color: '#9CA3AF',
            }}
          >
            <p className="mb-2">
              You're receiving this because you enabled weekly reports.
            </p>
            <p>
              <a href="#" className="text-sb-blue underline">
                Unsubscribe
              </a>{' '}
              ·{' '}
              <a href="#" className="text-sb-blue underline">
                Manage preferences
              </a>
            </p>
            <p className="mt-3 font-semibold text-sb-blue">
              📚 StudyBuddy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white rounded-xl p-3 border border-gray-100">
      <div className="mb-1">{icon}</div>
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}