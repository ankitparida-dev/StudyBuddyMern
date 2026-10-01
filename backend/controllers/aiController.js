const StudySession = require('../models/StudySession');
const SyllabusTopic = require('../models/SyllabusTopic');
const TestAnalytics = require('../models/TestAnalytics');
const { getSimpleResponse } = require('../services/geminiService');

const subjectSummary = (records, valueField) => {
  const summary = {};
  for (const record of records) {
    const subject = record.subject || 'general';
    if (!summary[subject]) summary[subject] = { count: 0, total: 0 };
    summary[subject].count += 1;
    summary[subject].total += Number(record[valueField] || 0);
  }
  return Object.fromEntries(Object.entries(summary).map(([subject, value]) => [
    subject,
    { count: value.count, average: Math.round(value.total / value.count * 10) / 10 },
  ]));
};

const generateInsight = async (req, res) => {
  let stage = 'load study metrics';
  try {
    const userId = req.user._id;
    const examSubjects = req.user.examType === 'NEET'
      ? ['physics', 'chemistry', 'biology']
      : ['physics', 'chemistry', 'math'];
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [sessions, tests, topics] = await Promise.all([
      StudySession.find({
        userId,
        subject: { $in: [...examSubjects, 'general'] },
        date: { $gte: since },
      })
        .select('subject duration date sessionType')
        .sort({ date: -1 })
        .limit(500)
        .lean(),
      TestAnalytics.find({ userId, subject: { $in: [...examSubjects, 'mixed'] } })
        .select('subject percentage totalQuestions attempted correct takenAt topicBreakdown')
        .sort({ takenAt: -1 })
        .limit(50)
        .lean(),
      SyllabusTopic.find({ userId, subject: { $in: examSubjects } })
        .select('subject chapter name progress')
        .limit(300)
        .lean(),
    ]);

    const sessionMinutes = sessions.reduce((total, session) => total + session.duration, 0);
    const sessionSubjects = {};
    const dailyMinutes = {};
    for (const session of sessions) {
      const subject = session.subject || 'general';
      sessionSubjects[subject] = (sessionSubjects[subject] || 0) + session.duration;
      const day = new Date(session.date).toISOString().slice(0, 10);
      dailyMinutes[day] = (dailyMinutes[day] || 0) + session.duration;
    }

    const averageTestScore = tests.length
      ? Math.round(tests.reduce((sum, test) => sum + test.percentage, 0) / tests.length * 10) / 10
      : null;
    const topicSubjects = {};
    for (const topic of topics) {
      const subject = topic.subject || 'general';
      if (!topicSubjects[subject]) topicSubjects[subject] = { total: 0, progressTotal: 0, incomplete: [] };
      topicSubjects[subject].total += 1;
      topicSubjects[subject].progressTotal += topic.progress || 0;
      if ((topic.progress || 0) < 50 && topicSubjects[subject].incomplete.length < 8) {
        topicSubjects[subject].incomplete.push(`${topic.chapter}: ${topic.name} (${topic.progress || 0}%)`);
      }
    }
    for (const value of Object.values(topicSubjects)) {
      value.averageProgress = value.total
        ? Math.round(value.progressTotal / value.total)
        : 0;
      delete value.progressTotal;
    }

    const metrics = {
      period: 'last 30 days',
      study: {
        sessions: sessions.length,
        totalHours: Math.round(sessionMinutes / 6) / 10,
        subjectMinutes: sessionSubjects,
        dailyMinutes: Object.entries(dailyMinutes).slice(0, 14).map(([date, minutes]) => ({ date, minutes })),
      },
      tests: {
        count: tests.length,
        averagePercentage: averageTestScore,
        bySubject: subjectSummary(tests, 'percentage'),
        latest: tests.slice(0, 5).map(({ subject, percentage, totalQuestions, attempted, correct, topicBreakdown }) => ({
          subject, percentage, totalQuestions, attempted, correct,
          topicBreakdown: (topicBreakdown || []).slice(0, 8),
        })),
      },
      syllabus: {
        topicCount: topics.length,
        bySubject: topicSubjects,
      },
    };

    const type = req.body.type;
    const instruction = type === 'progress'
      ? 'Analyze the study trend and test performance. Give a concise progress assessment, identify one evidence-based strength and one priority, then suggest 2 specific actions for the next 7 days.'
      : 'Write a concise study report from these metrics. Summarize syllabus completion, study balance, and test performance; identify the clearest weak area and give 3 actionable priorities. Do not invent data or claim trends not supported by the metrics.';

    stage = 'generate Gemini insight';
    const insight = await getSimpleResponse(
      `${instruction}\n\nUse only these aggregated, non-identifying study metrics:\n${JSON.stringify(metrics)}`
    );

    res.json({ success: true, insight });
  } catch (error) {
    console.error(`[ai-insight] ${stage} failed (${error.code || error.name || 'Error'}): ${error.message}`);
    res.status(stage === 'generate Gemini insight' ? 502 : 500).json({
      success: false,
      error: stage === 'generate Gemini insight'
        ? `Gemini insight is unavailable: ${error.message}`
        : 'Could not load study metrics for an AI insight',
    });
  }
};

module.exports = { generateInsight };