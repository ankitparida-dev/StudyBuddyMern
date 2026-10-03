import { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Flame, Clock, Trophy, Sparkles, BookOpen } from 'lucide-react';

const ShareCard = forwardRef(({ user, stats, insight }, ref) => {
  const today = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div
      ref={ref}
      style={{
        width: '540px',
        height: '720px',
        fontFamily: 'Inter, system-ui, sans-serif',
        background: 'linear-gradient(135deg, #4A90E2 0%, #1A4D4D 100%)',
        color: 'white',
        padding: '40px 36px',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Decorative circles */}
      <div
        style={{
          position: 'absolute',
          top: '-80px',
          right: '-80px',
          width: '240px',
          height: '240px',
          borderRadius: '50%',
          background: 'rgba(245, 213, 71, 0.25)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-60px',
          left: '-60px',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'rgba(244, 162, 162, 0.25)',
        }}
      />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '36px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: '#F5D547',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            color: '#1A4D4D',
            fontSize: '20px',
          }}
        >
          {user?.name?.[0]?.toUpperCase() || 'S'}
        </div>
        <div>
          <p style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
            {user?.name || 'Student'}
          </p>
          <p style={{ fontSize: '13px', opacity: 0.75, margin: 0 }}>
            StudyBuddy · {today}
          </p>
        </div>
      </div>

      {/* Title */}
      <div style={{ position: 'relative', zIndex: 1, marginBottom: '32px' }}>
        <p
          style={{
            fontSize: '13px',
            opacity: 0.75,
            margin: 0,
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}
        >
          My study progress
        </p>
        <h1
          style={{
            fontSize: '42px',
            fontWeight: 800,
            margin: '4px 0 0',
            lineHeight: 1.1,
          }}
        >
          On a{' '}
          <span style={{ color: '#F5D547' }}>
            {stats.streak} day{stats.streak !== 1 ? 's' : ''}
          </span>
          <br />
          streak 🔥
        </h1>
      </div>

      {/* Stats grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginBottom: '32px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <StatBox
          icon={<Clock size={24} color="#F5D547" />}
          label="Total hours"
          value={`${stats.hours}h`}
        />
        <StatBox
          icon={<BookOpen size={24} color="#F5D547" />}
          label="Sessions logged"
          value={stats.sessions}
        />
        <StatBox
          icon={<Trophy size={24} color="#F5D547" />}
          label="Topics mastered"
          value={`${stats.completedTopics}/${stats.totalTopics}`}
        />
        <StatBox
          icon={<Flame size={24} color="#F5D547" />}
          label="This week"
          value={`${stats.weekHours}h`}
        />
      </div>

      {/* AI Insight */}
      {insight && (
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '32px',
            position: 'relative',
            zIndex: 1,
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px',
            }}
          >
            <Sparkles size={16} color="#F5D547" />
            <p
              style={{
                fontSize: '12px',
                fontWeight: 700,
                margin: 0,
                color: '#F5D547',
                letterSpacing: '0.5px',
              }}
            >
              AI INSIGHT
            </p>
          </div>
          <p
            style={{
              fontSize: '14px',
              lineHeight: 1.5,
              margin: 0,
              opacity: 0.95,
            }}
          >
            {insight}
          </p>
        </div>
      )}

      {/* Footer with QR */}
      <div
        style={{
          position: 'absolute',
          bottom: '40px',
          left: '36px',
          right: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 1,
        }}
      >
        <div>
          <p
            style={{
              fontSize: '13px',
              fontWeight: 700,
              margin: 0,
              marginBottom: '2px',
            }}
          >
            Join me on StudyBuddy 📚
          </p>
          <p style={{ fontSize: '11px', opacity: 0.7, margin: 0 }}>
            {typeof window !== 'undefined' ? window.location.host : 'studybuddy.app'}
          </p>
        </div>
        <div
          style={{
            background: 'white',
            padding: '8px',
            borderRadius: '8px',
          }}
        >
          <QRCodeSVG
            value={
              typeof window !== 'undefined'
                ? window.location.origin
                : 'https://studybuddy.app'
            }
            size={72}
            level="M"
          />
        </div>
      </div>
    </div>
  );
});

ShareCard.displayName = 'ShareCard';

function StatBox({ icon, label, value }) {
  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '14px',
        padding: '18px',
        border: '1px solid rgba(255, 255, 255, 0.12)',
      }}
    >
      <div style={{ marginBottom: '8px' }}>{icon}</div>
      <p style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>{value}</p>
      <p style={{ fontSize: '12px', opacity: 0.7, margin: '2px 0 0' }}>
        {label}
      </p>
    </div>
  );
}

export default ShareCard;