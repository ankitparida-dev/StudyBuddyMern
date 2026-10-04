import { useState, useEffect } from 'react';
import {
  Mail,
  Save,
  Send,
  Loader2,
  CheckCircle2,
  Bell,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageTransition from '../components/shared/PageTransition';
import EmailPreview from '../components/settings/EmailPreview';
import {
  getEmailSettings,
  saveEmailSettings,
  WEEKDAYS,
  DAY_LABELS,
} from '../utils/emailSettings';
import { storage } from '../utils/storage';
import { dashboardApi, learningApi } from '../utils/api';
import { usePageTitle } from '../utils/usePageTitle';

export default function Settings() {
  usePageTitle('Settings');

  const account = storage.get('sb_user', {});
  const [emailSettings, setEmailSettings] = useState(getEmailSettings());
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [stats, setStats] = useState({
    hours: 0,
    sessions: 0,
    streak: 0,
    completedTopics: 0,
    totalTopics: 0,
  });

  // Load real stats for preview
  useEffect(() => {
    (async () => {
      try {
        const [statsRes, streakRes, topicsRes] = await Promise.all([
          dashboardApi.stats().catch(() => null),
          dashboardApi.streaks().catch(() => ({ currentStreak: 0 })),
          learningApi.topics().catch(() => ({ topics: [] })),
        ]);

        const topics = topicsRes.topics || [];
        setStats({
          hours: statsRes?.week?.hours || statsRes?.total?.hours || 0,
          sessions: statsRes?.week?.sessions || 0,
          streak: streakRes.currentStreak || 0,
          completedTopics: topics.filter((t) => t.progress >= 100).length,
          totalTopics: topics.length,
        });
      } catch {
        // Ignore — preview will just show defaults
      }
    })();
  }, []);

  const handleChange = (field, value) => {
    setEmailSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to localStorage for now; backend sync later
      saveEmailSettings(emailSettings);

      // Optional: call backend if endpoint exists
      // await settingsApi.save(emailSettings);

      await new Promise((r) => setTimeout(r, 500));
      toast.success('Email preferences saved ✅');
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    setTesting(true);
    try {
      // For now: simulate. Later, call backend endpoint.
      // await emailApi.sendTest();

      await new Promise((r) => setTimeout(r, 1200));
      toast.success(
        `Test email sent to ${account.email || 'your inbox'} 📬`
      );
    } catch (err) {
      toast.error(err.message || 'Failed to send test');
    } finally {
      setTesting(false);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6 max-w-5xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold dark:text-sb-dark-text">
            Settings
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your email preferences and account
          </p>
        </div>

        {/* Weekly Email Report Section */}
        <div className="bg-white dark:bg-sb-dark-card rounded-2xl shadow p-6 transition-colors">
          <div className="flex items-start gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-sb-blue/10 flex items-center justify-center shrink-0">
              <Mail className="text-sb-blue" size={20} />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-lg dark:text-sb-dark-text">
                Weekly Email Report
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Get a summary of your study week + AI insights delivered to your
                inbox
              </p>
            </div>
            {/* Toggle */}
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={emailSettings.enabled}
                onChange={(e) => handleChange('enabled', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-sb-blue rounded-full peer dark:bg-sb-dark-border peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sb-blue" />
            </label>
          </div>

          {emailSettings.enabled && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-100 dark:border-sb-dark-border">
              {/* Left: Preferences */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-sb-dark-text">
                    Send every
                  </label>
                  <select
                    value={emailSettings.day}
                    onChange={(e) => handleChange('day', e.target.value)}
                    className="w-full p-3 border rounded-xl outline-none focus:border-sb-blue bg-white dark:bg-sb-dark-bg dark:border-sb-dark-border dark:text-sb-dark-text"
                  >
                    {WEEKDAYS.map((day) => (
                      <option key={day} value={day}>
                        {DAY_LABELS[day]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-sb-dark-text">
                    At what time
                  </label>
                  <input
                    type="time"
                    value={emailSettings.time}
                    onChange={(e) => handleChange('time', e.target.value)}
                    className="w-full p-3 border rounded-xl outline-none focus:border-sb-blue dark:bg-sb-dark-bg dark:border-sb-dark-border dark:text-sb-dark-text"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium mb-3 dark:text-sb-dark-text">
                    Include in email
                  </p>
                  <div className="space-y-3">
                    <ToggleOption
                      label="AI-generated insights"
                      checked={emailSettings.includeInsights}
                      onChange={(v) => handleChange('includeInsights', v)}
                    />
                    <ToggleOption
                      label="Session history"
                      checked={emailSettings.includeSessions}
                      onChange={(v) => handleChange('includeSessions', v)}
                    />
                    <ToggleOption
                      label="Charts & graphs"
                      checked={emailSettings.includeCharts}
                      onChange={(v) => handleChange('includeCharts', v)}
                    />
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-3 flex items-start gap-2">
                  <Bell className="text-sb-blue shrink-0 mt-0.5" size={16} />
                  <p className="text-xs text-sb-teal dark:text-sb-dark-text">
                    Emails will be sent to{' '}
                    <strong>{account.email || 'your account email'}</strong>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-sb-blue text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    {saving ? 'Saving...' : 'Save Preferences'}
                  </button>
                  <button
                    onClick={handleTestEmail}
                    disabled={testing}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-sb-blue text-sb-blue font-semibold hover:bg-sb-blue/10 transition disabled:opacity-50"
                  >
                    {testing ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                    {testing ? 'Sending...' : 'Send Test Email'}
                  </button>
                </div>
              </div>

              {/* Right: Preview */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium dark:text-sb-dark-text">
                    Email Preview
                  </p>
                  <span className="text-xs text-gray-400">
                    Live preview
                  </span>
                </div>
                <EmailPreview
                  settings={emailSettings}
                  user={account}
                  stats={stats}
                />
              </div>
            </div>
          )}

          {!emailSettings.enabled && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-sb-dark-bg rounded-xl text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Weekly emails are turned off. Toggle the switch above to
                re-enable them.
              </p>
            </div>
          )}
        </div>

        {/* About Section */}
        <div className="bg-white dark:bg-sb-dark-card rounded-2xl shadow p-6 transition-colors">
          <h2 className="font-semibold dark:text-sb-dark-text mb-3">About</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Email</span>
              <span className="dark:text-sb-dark-text">
                {account.email || '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">
                Exam Target
              </span>
              <span className="dark:text-sb-dark-text">
                {account.examType === 'neet' ? 'NEET' : 'JEE'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">
                Class
              </span>
              <span className="dark:text-sb-dark-text">
                Class {account.class || '11'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

function ToggleOption({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm text-gray-700 dark:text-sb-dark-text">
        {label}
      </span>
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-sb-blue rounded-full peer dark:bg-sb-dark-border peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sb-blue" />
      </div>
    </label>
  );
}