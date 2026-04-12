const { Resend } = require('resend');
const fs = require('fs');
const logger = require('../utils/logger');

const resend = new Resend(process.env.RESEND_API_KEY);

// ── Base HTML wrapper ─────────────────────────────────────────────────────────
const wrapEmail = (bodyContent) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #0D0D0D; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #111; }
    .header { background: #0D0D0D; padding: 32px 40px 24px; border-bottom: 2px solid #6C63FF; }
    .logo { color: #fff; font-size: 28px; font-weight: 900; letter-spacing: 2px; }
    .logo span { color: #6C63FF; }
    .tagline { color: #00E5FF; font-size: 11px; letter-spacing: 3px; margin-top: 4px; }
    .body { padding: 40px; background: #fff; }
    .h1 { color: #0D0D0D; font-size: 24px; font-weight: 700; margin: 0 0 16px; }
    .p { color: #333; font-size: 15px; line-height: 1.7; margin: 0 0 16px; }
    .score-badge { background: linear-gradient(135deg, #6C63FF, #00E5FF); color: #fff; border-radius: 12px; padding: 20px 32px; text-align: center; margin: 24px 0; }
    .score-num { font-size: 48px; font-weight: 900; }
    .score-label { font-size: 13px; opacity: 0.85; margin-top: 4px; }
    .cta-btn { display: inline-block; background: #6C63FF; color: #fff; text-decoration: none; padding: 16px 36px; border-radius: 8px; font-size: 16px; font-weight: 700; margin: 16px 0; }
    .agent-card { background: #F9F7FF; border-left: 4px solid #6C63FF; padding: 14px 18px; margin: 8px 0; border-radius: 6px; }
    .agent-name { color: #6C63FF; font-weight: 700; font-size: 14px; }
    .agent-desc { color: #555; font-size: 13px; margin-top: 4px; }
    .divider { border: none; border-top: 1px solid #eee; margin: 24px 0; }
    .footer { background: #0D0D0D; padding: 24px 40px; text-align: center; }
    .footer p { color: #666; font-size: 12px; margin: 4px 0; }
    .footer a { color: #6C63FF; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">AVE<span>OL</span></div>
      <div class="tagline">AUTONOMOUS INTELLIGENCE. INFINITE SCALE.</div>
    </div>
    <div class="body">
      ${bodyContent}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} AVEOL AI Automation Agency · Based in India</p>
      <p><a href="https://aveol.netlify.app">aveol.netlify.app</a> · <a href="mailto:rajaditya81156@gmail.com">rajaditya81156@gmail.com</a></p>
      <p style="color:#444; font-size:11px; margin-top:12px;">You're receiving this because you submitted an audit request. <a href="#" style="color:#444;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
`;

// ── Send Audit Report Email ───────────────────────────────────────────────────
const sendAuditReportEmail = async (client, auditResponse, pdfPath) => {
  const analysis = auditResponse.aiAnalysis;

  const agentCards = (analysis.recommendedAgents || [])
    .slice(0, 4)
    .map(
      (a) =>
        `<div class="agent-card">
          <div class="agent-name">🤖 ${a.agentName}</div>
          <div class="agent-desc">${a.description}</div>
          <div style="font-size:12px; color:#6C63FF; margin-top:6px;">ROI: ${a.estimatedROI} · Deploy: ${a.implementationTime}</div>
        </div>`
    )
    .join('');

  const savings = analysis.estimatedAnnualSavings || {};

  const body = `
    <h1 class="h1">Your AI Automation Audit is Ready, ${client.name.split(' ')[0]} 🚀</h1>
    <p class="p">We've analyzed <strong>${client.companyName}</strong>'s operations and identified significant automation opportunities. Here's your summary:</p>
    
    <div class="score-badge">
      <div class="score-num">${analysis.auditScore}/100</div>
      <div class="score-label">AUTOMATION OPPORTUNITY SCORE · ${analysis.automationReadinessLevel} Readiness</div>
    </div>

    <p class="p"><strong>Key Findings:</strong> ${analysis.executiveSummary?.substring(0, 300)}...</p>

    <hr class="divider">
    <h2 style="font-size:16px; color:#0D0D0D; font-weight:700; margin:0 0 12px;">AI Agents Recommended for ${client.companyName}</h2>
    ${agentCards}

    <hr class="divider">
    <div style="background:#F0FFF8; border-radius:8px; padding:20px; margin:20px 0; text-align:center;">
      <p style="margin:0 0 8px; font-weight:700; color:#0D0D0D; font-size:16px;">Estimated Annual Impact</p>
      <p style="margin:0; color:#00C48C; font-size:20px; font-weight:900;">₹${(savings.moneyINR || 0).toLocaleString('en-IN')} saved · ${savings.timeHours || 0} hours freed</p>
    </div>

    <p class="p">Your full audit report PDF is attached to this email. Book a free 30-minute strategy call to discuss implementation:</p>
    
    <div style="text-align:center; margin:32px 0;">
      <a href="${process.env.CALENDLY_BOOKING_URL}" class="cta-btn">📅 Book Your Free Strategy Call →</a>
      <p style="color:#888; font-size:12px; margin-top:8px;">30 minutes · No commitment · Free</p>
    </div>
    
    <p class="p" style="color:#888; font-size:13px;">Questions? Reply to this email or reach us at rajaditya81156@gmail.com</p>
  `;

  const attachments = [];
  if (pdfPath && fs.existsSync(pdfPath)) {
    attachments.push({
      filename: `AVEOL-Audit-${client.companyName.replace(/\s+/g, '-')}.pdf`,
      content: fs.readFileSync(pdfPath),
    });
  }

  try {
    await resend.emails.send({
      from: `${process.env.EMAIL_FROM_NAME || 'AVEOL'} <notifications@resend.dev>`,
      to: client.email,
      reply_to: 'rajaditya81156@gmail.com',
      subject: `Your AVEOL AI Audit is Ready — Score: ${analysis.auditScore}/100 🤖`,
      html: wrapEmail(body),
      attachments,
    });
    logger.info(`Audit report email sent to ${client.email}`);
  } catch (err) {
    logger.error(`Failed to send audit email to ${client.email}: ${err.message}`);
  }
};

// ── Follow-up Email 1 (Day 3) ─────────────────────────────────────────────────
const sendFollowUp1Email = async (client) => {
  const transporter = createTransporter();

  const body = `
    <h1 class="h1">Did you get a chance to review your audit? 👀</h1>
    <p class="p">Hi ${client.name.split(' ')[0]},</p>
    <p class="p">A few days ago we sent your AI Automation Audit for <strong>${client.companyName}</strong>. We wanted to check in — did you get a chance to go through it?</p>
    <p class="p">Most business owners we speak to find 2-3 quick wins they can act on within the first month. We'd love to show you exactly how to get started.</p>
    <div style="background:#F9F7FF; border-radius:8px; padding:20px; margin:20px 0;">
      <p style="font-weight:700; margin:0 0 8px; color:#6C63FF;">What happens in the strategy call?</p>
      <p style="margin:4px 0; color:#333;">✓ We map your top 3 automation opportunities</p>
      <p style="margin:4px 0; color:#333;">✓ You get a clear implementation roadmap</p>
      <p style="margin:4px 0; color:#333;">✓ No sales pressure — just genuine advice</p>
    </div>
    <div style="text-align:center; margin:32px 0;">
      <a href="${process.env.CALENDLY_BOOKING_URL}" class="cta-btn">Book Your Free Call →</a>
    </div>
    <p class="p" style="color:#888; font-size:13px;">If the timing isn't right, no worries — just let us know.</p>
  `;

  try {
    await resend.emails.send({
      from: `${process.env.EMAIL_FROM_NAME || 'AVEOL'} <notifications@resend.dev>`,
      to: client.email,
      reply_to: 'rajaditya81156@gmail.com',
      subject: `Quick question about your automation audit, ${client.name.split(' ')[0]}`,
      html: wrapEmail(body),
    });
    logger.info(`Follow-up 1 sent to ${client.email}`);
  } catch (err) {
    logger.error(`Failed to send follow-up 1 email to ${client.email}: ${err.message}`);
  }
};

// ── Follow-up Email 2 (Day 7) ─────────────────────────────────────────────────
const sendFollowUp2Email = async (client) => {

  const body = `
    <h1 class="h1">Last nudge — your automation window is open 🪟</h1>
    <p class="p">Hi ${client.name.split(' ')[0]},</p>
    <p class="p">This is our final follow-up on your AI audit for <strong>${client.companyName}</strong>. We don't want to flood your inbox — but we do want to make sure you don't miss this.</p>
    <p class="p">We're currently onboarding our first wave of founding clients at significantly reduced rates. Once these spots are filled, pricing goes to standard rates.</p>
    <div style="background:#0D0D0D; border-radius:8px; padding:20px; margin:20px 0; text-align:center;">
      <p style="color:#fff; font-weight:700; font-size:16px; margin:0 0 8px;">Founding Client Benefits</p>
      <p style="color:#00E5FF; margin:4px 0;">✓ Lifetime founders' pricing locked in</p>
      <p style="color:#00E5FF; margin:4px 0;">✓ Priority onboarding & support</p>
      <p style="color:#00E5FF; margin:4px 0;">✓ Direct access to the founding team</p>
    </div>
    <div style="text-align:center; margin:32px 0;">
      <a href="${process.env.CALENDLY_BOOKING_URL}" class="cta-btn">Claim Your Spot →</a>
    </div>
    <p class="p" style="color:#888; font-size:13px;">Not interested? No problem. We won't reach out again.</p>
  `;

  try {
    await resend.emails.send({
      from: `${process.env.EMAIL_FROM_NAME || 'AVEOL'} <notifications@resend.dev>`,
      to: client.email,
      reply_to: 'rajaditya81156@gmail.com',
      subject: `Founding client spots are filling up — ${client.companyName}`,
      html: wrapEmail(body),
    });
    logger.info(`Follow-up 2 sent to ${client.email}`);
  } catch (err) {
    logger.error(`Failed to send follow-up 2 email to ${client.email}: ${err.message}`);
  }
};

// ── Admin Notification Email ──────────────────────────────────────────────────
const sendAdminNotification = async (client, auditResponse, type = 'new_lead') => {

  const subjects = {
    new_lead: `🔥 New Audit Submission — ${client.companyName} (Score: ${auditResponse?.aiAnalysis?.auditScore || '?'}/100)`,
    call_booked: `📅 Consultation Booked — ${client.name} (${client.companyName})`,
    high_value_lead: `💰 HIGH VALUE LEAD — ${client.companyName} · Score: ${auditResponse?.aiAnalysis?.auditScore || '?'}/100`,
  };

  const analysis = auditResponse?.aiAnalysis || {};

  const body = `
    <h1 class="h1">${type === 'call_booked' ? '📅 New Consultation Booked' : '🔥 New Lead Audit Submitted'}</h1>
    <table style="width:100%; border-collapse:collapse;">
      <tr><td style="padding:8px 0; border-bottom:1px solid #eee; color:#888; width:140px;">Name</td><td style="padding:8px 0; border-bottom:1px solid #eee; font-weight:600;">${client.name}</td></tr>
      <tr><td style="padding:8px 0; border-bottom:1px solid #eee; color:#888;">Email</td><td style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:${client.email}">${client.email}</a></td></tr>
      <tr><td style="padding:8px 0; border-bottom:1px solid #eee; color:#888;">Company</td><td style="padding:8px 0; border-bottom:1px solid #eee; font-weight:600;">${client.companyName}</td></tr>
      <tr><td style="padding:8px 0; border-bottom:1px solid #eee; color:#888;">Industry</td><td style="padding:8px 0; border-bottom:1px solid #eee;">${client.industry}</td></tr>
      <tr><td style="padding:8px 0; border-bottom:1px solid #eee; color:#888;">Team Size</td><td style="padding:8px 0; border-bottom:1px solid #eee;">${client.teamSize}</td></tr>
      <tr><td style="padding:8px 0; border-bottom:1px solid #eee; color:#888;">Lead Score</td><td style="padding:8px 0; border-bottom:1px solid #eee; font-weight:700; color:#6C63FF;">${client.leadScore}/100 · ${client.priority?.toUpperCase()}</td></tr>
      <tr><td style="padding:8px 0; border-bottom:1px solid #eee; color:#888;">Audit Score</td><td style="padding:8px 0; border-bottom:1px solid #eee;">${analysis.auditScore}/100 · ${analysis.automationReadinessLevel}</td></tr>
      <tr><td style="padding:8px 0; color:#888;">Budget</td><td style="padding:8px 0;">${auditResponse?.budgetRange || 'Not specified'}</td></tr>
    </table>
    <div style="margin:20px 0; padding:16px; background:#F9F7FF; border-radius:8px;">
      <p style="margin:0; font-size:13px; color:#555;">${analysis.executiveSummary?.substring(0, 300) || 'Analysis complete.'}...</p>
    </div>
    <p style="font-size:13px; color:#888;">Login to the admin dashboard to view full details and update lead status.</p>
  `;

  try {
    await resend.emails.send({
      from: `AVEOL Leads <notifications@resend.dev>`,
      to: 'rajaditya81156@gmail.com',
      subject: subjects[type] || subjects.new_lead,
      html: wrapEmail(body),
    });
    logger.info(`Admin notification sent to rajaditya81156@gmail.com`);
  } catch (err) {
    logger.error(`Failed to send admin notification: ${err.message}`);
  }
};

module.exports = {
  sendAuditReportEmail,
  sendFollowUp1Email,
  sendFollowUp2Email,
  sendAdminNotification,
};
