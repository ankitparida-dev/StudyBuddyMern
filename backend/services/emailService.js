const { Resend } = require('resend');

// Initialize Resend client if API key is present
const getResendClient = () => {
  if (!process.env.RESEND_API_KEY) {
    require('dotenv').config();
  }
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }
  return new Resend(apiKey.trim());
};

/**
 * Generate a responsive, modern HTML email template for Weekly Study Reports
 */
const generateWeeklyReportHTML = ({ user, settings = {}, stats = {}, insight = '' }) => {
  const name = user.firstName ? `${user.firstName}` : 'Student';
  const hours = stats.hours !== undefined ? stats.hours : 12.5;
  const sessions = stats.sessions !== undefined ? stats.sessions : 18;
  const streak = stats.streak !== undefined ? stats.streak : 5;
  const completedTopics = stats.completedTopics || 4;
  const totalTopics = stats.totalTopics || 12;
  const examType = user.examType ? user.examType.toUpperCase() : 'JEE/NEET';

  const defaultInsight =
    insight ||
    `Great consistency this week! Your recall accuracy during practice tests was highest in morning sessions. Keep prioritizing high-weightage topics next week to maintain your momentum.`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>StudyBuddy Weekly Report</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f8fafc;
      padding: 32px 16px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #0d9488 100%);
      padding: 36px 32px;
      text-align: center;
      color: #ffffff;
    }
    .logo-badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      padding: 6px 16px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    .header h1 {
      margin: 0;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .header p {
      margin: 8px 0 0;
      opacity: 0.9;
      font-size: 15px;
    }
    .content {
      padding: 32px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 8px;
      color: #0f172a;
    }
    .subtext {
      font-size: 14px;
      color: #64748b;
      line-height: 1.5;
      margin-bottom: 24px;
    }
    .stats-grid {
      display: table;
      width: 100%;
      margin-bottom: 24px;
    }
    .stats-row {
      display: table-row;
    }
    .stat-card {
      display: table-cell;
      width: 50%;
      padding: 16px;
      background: #f1f5f9;
      border-radius: 16px;
      vertical-align: top;
      border: 4px solid #ffffff;
      box-sizing: border-box;
    }
    .stat-val {
      font-size: 24px;
      font-weight: 800;
      color: #1e293b;
      margin-bottom: 4px;
    }
    .stat-lbl {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }
    .insight-box {
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      border-radius: 12px;
      padding: 18px;
      margin-bottom: 24px;
    }
    .insight-title {
      font-size: 14px;
      font-weight: 700;
      color: #1d4ed8;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .insight-text {
      font-size: 13px;
      color: #334155;
      line-height: 1.6;
      margin: 0;
    }
    .cta-btn {
      display: block;
      width: fit-content;
      margin: 28px auto 8px;
      background: #2563eb;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 14px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
    }
    .footer {
      background: #f8fafc;
      padding: 24px 32px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.5;
    }
    .footer a {
      color: #2563eb;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <!-- Header -->
      <div class="header">
        <div class="logo-badge">StudyBuddy ⚡ AI</div>
        <h1>Weekly Progress Report</h1>
        <p>Your performance breakdown & key insights</p>
      </div>

      <!-- Content -->
      <div class="content">
        <div class="greeting">Hey ${name}! 👋</div>
        <div class="subtext">
          Here is how your study week shaped up for your <strong>${examType}</strong> preparation. Consistent effort is the foundation of high rank achievement!
        </div>

        <!-- 4-Stat Grid -->
        <table width="100%" cellpadding="0" cellspacing="6" style="margin-bottom: 20px;">
          <tr>
            <td width="50%" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px; text-align: center;">
              <div style="font-size: 26px; font-weight: 800; color: #2563eb;">${hours}h</div>
              <div style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">Study Time</div>
            </td>
            <td width="50%" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px; text-align: center;">
              <div style="font-size: 26px; font-weight: 800; color: #0d9488;">${streak} Days 🔥</div>
              <div style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">Current Streak</div>
            </td>
          </tr>
          <tr>
            <td width="50%" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px; text-align: center;">
              <div style="font-size: 26px; font-weight: 800; color: #7c3aed;">${sessions}</div>
              <div style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">Sessions Logged</div>
            </td>
            <td width="50%" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px; text-align: center;">
              <div style="font-size: 26px; font-weight: 800; color: #ea580c;">${completedTopics}/${totalTopics}</div>
              <div style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">Topics Mastered</div>
            </td>
          </tr>
        </table>

        <!-- AI Insights Section -->
        ${
          settings.includeInsights !== false
            ? `
        <div class="insight-box">
          <div class="insight-title">💡 AI Study Coach Insight</div>
          <p class="insight-text">${defaultInsight}</p>
        </div>
        `
            : ''
        }

        <!-- CTA Button -->
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/insights" class="cta-btn">
          View Detailed Insights & Analytics →
        </a>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p>Sent with ❤️ by StudyBuddy — your personalized AI study companion.</p>
        <p>
          You received this email because weekly reports are enabled in your 
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/settings">Settings</a>.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Send weekly report email using Resend
 */
const sendWeeklyReportEmail = async (
  user,
  settings = {},
  stats = {},
  isTest = false
) => {
  const cleanEmail = (user.email || '').trim().toLowerCase();
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    throw new Error(
      `Invalid recipient email: "${user.email}". It must follow the "name@example.com" format.`
    );
  }

  const resend = getResendClient();
  const subject = isTest
    ? '🧪 [Test] Your StudyBuddy Weekly Progress Report'
    : '📚 Your StudyBuddy Weekly Progress & Insights';

  const html = generateWeeklyReportHTML({
    user: { ...user, email: cleanEmail },
    settings,
    stats,
  });

  const fromAddress =
    process.env.EMAIL_FROM || 'StudyBuddy <onboarding@resend.dev>';

  if (!resend) {
    console.warn(
      `⚠️ [EmailService] RESEND_API_KEY is not configured in .env. ` +
        `Simulating email delivery to: ${cleanEmail} (Subject: "${subject}")`
    );
    return {
      success: true,
      simulated: true,
      message: `Simulated email send to ${cleanEmail} (RESEND_API_KEY missing in .env)`,
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [cleanEmail],
      subject,
      html,
    });

    if (error) {
      console.error('❌ Resend email delivery error:', error);
      throw new Error(error.message || 'Failed to send email via Resend');
    }

    console.log(`✅ Weekly report sent successfully via Resend to ${cleanEmail} (id: ${data?.id})`);
    return {
      success: true,
      id: data?.id,
      simulated: false,
    };
  } catch (error) {
    console.error('❌ Error sending weekly report email:', error);
    throw error;
  }
};

/**
 * Basic Welcome and Reset Password Email helpers
 */
const sendWelcomeEmail = async (user) => {
  const resend = getResendClient();
  if (!resend || !user?.email) return;
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'StudyBuddy <onboarding@resend.dev>',
      to: [user.email],
      subject: 'Welcome to StudyBuddy! 🚀',
      html: `<h2>Welcome to StudyBuddy, ${user.firstName || 'Student'}!</h2><p>Get ready to boost your focus and master your syllabus with AI.</p>`,
    });
  } catch (err) {
    console.warn('Welcome email could not be sent:', err.message);
  }
};

const sendResetPasswordEmail = async (user, resetToken) => {
  const resend = getResendClient();
  if (!resend || !user?.email) return;
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'StudyBuddy <onboarding@resend.dev>',
      to: [user.email],
      subject: 'Reset your StudyBuddy password',
      html: `<p>Use token <strong>${resetToken}</strong> to reset your password.</p>`,
    });
  } catch (err) {
    console.warn('Password reset email could not be sent:', err.message);
  }
};

module.exports = {
  generateWeeklyReportHTML,
  sendWeeklyReportEmail,
  sendWelcomeEmail,
  sendResetPasswordEmail,
};
