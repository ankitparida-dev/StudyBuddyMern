import { storage } from './storage';

const KEY = 'sb_email_settings';

const DEFAULTS = {
  enabled: true,
  day: 'sunday',
  time: '20:00',
  includeInsights: true,
  includeSessions: true,
  includeCharts: true,
};

export const getEmailSettings = () => ({
  ...DEFAULTS,
  ...storage.get(KEY, {}),
});

export const saveEmailSettings = (settings) => {
  storage.set(KEY, { ...DEFAULTS, ...settings });
};

export const WEEKDAYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

export const DAY_LABELS = {
  sunday: 'Sunday',
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
};