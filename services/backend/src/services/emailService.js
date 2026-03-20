const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const nodemailer = require('nodemailer');

const getEnv = (key) => String(process.env[key] || '').trim();

const loginUrl = () => process.env.APP_LOGIN_URL || 'http://localhost:8080/login';

const buildSubject = () => 'Your investor account has been approved ✅';
const buildText   = (name) => `Hello ${name},\n\nYour account has been approved. You are now a member and can sign in at ${loginUrl()}.\n\nThank you.`;
const buildHtml   = (name) => `<p>Hello ${name},</p><p>Your account has been approved. You are now a member and can sign in.</p><p><a href="${loginUrl()}">Sign in to your account</a></p><p>Thank you.</p>`;

// ── 1. AWS SES ───────────────────────────────────────────────────────────────
const isSesConfigured = () =>
  ['AWS_ACCESS_KEY', 'AWS_SECRET_KEY', 'SENDER_EMAIL'].every((k) => getEnv(k).length > 0);

const sendViaSes = async ({ email, name }) => {
  const ses = new SESClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: getEnv('AWS_ACCESS_KEY'),
      secretAccessKey: getEnv('AWS_SECRET_KEY'),
    },
  });

  await ses.send(new SendEmailCommand({
    Source: getEnv('SENDER_EMAIL'),
    Destination: { ToAddresses: [email] },
    Message: {
      Subject: { Data: buildSubject() },
      Body: {
        Text: { Data: buildText(name) },
        Html: { Data: buildHtml(name) },
      },
    },
  }));
};

// ── 2. SMTP fallback (nodemailer) ────────────────────────────────────────────
const isSmtpConfigured = () =>
  ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'EMAIL_FROM'].every((k) => getEnv(k).length > 0);

const sendViaSmtp = async ({ email, name }) => {
  const transporter = nodemailer.createTransport({
    host: getEnv('SMTP_HOST'),
    port: Number(getEnv('SMTP_PORT') || 587),
    secure: String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true',
    auth: {
      user: getEnv('SMTP_USER'),
      pass: getEnv('SMTP_PASS'),
    },
    tls: {
      rejectUnauthorized: String(process.env.SMTP_REJECT_UNAUTHORIZED || 'true').toLowerCase() === 'true',
      servername: getEnv('SMTP_TLS_SERVERNAME') || getEnv('SMTP_HOST'),
    },
  });

  await transporter.sendMail({
    from: getEnv('EMAIL_FROM'),
    to: email,
    subject: buildSubject(),
    text: buildText(name),
    html: buildHtml(name),
  });
};

// ── Main: try SES → fallback to SMTP ────────────────────────────────────────
const isEmailConfigured = () => isSesConfigured() || isSmtpConfigured();

const sendApprovalEmail = async ({ email, name }) => {
  if (isSesConfigured()) {
    try {
      await sendViaSes({ email, name });
      console.log(`[email] Sent via AWS SES to ${email}`);
      return true;
    } catch (sesErr) {
      console.warn(`[email] SES failed (${sesErr.message}). Trying SMTP fallback...`);
    }
  }

  if (isSmtpConfigured()) {
    await sendViaSmtp({ email, name });
    console.log(`[email] Sent via SMTP to ${email}`);
    return true;
  }

  throw new Error('No email provider configured. Set AWS SES credentials or SMTP settings in .env');
};

module.exports = { sendApprovalEmail, isEmailConfigured };
