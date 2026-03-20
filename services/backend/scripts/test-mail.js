const path = require('path');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const disableAuth = String(process.env.SMTP_DISABLE_AUTH || 'false').toLowerCase() === 'true';
const required = ['SMTP_HOST', 'SMTP_PORT', 'EMAIL_FROM'];
if (!disableAuth) {
  required.push('SMTP_USER', 'SMTP_PASS');
}
const missing = required.filter((key) => !String(process.env[key] || '').trim());

if (missing.length) {
  console.error(`Missing required SMTP env keys: ${missing.join(', ')}`);
  process.exit(1);
}

const secure = String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';
const rejectUnauthorized = String(process.env.SMTP_REJECT_UNAUTHORIZED || 'true').toLowerCase() === 'true';
const to = process.env.TEST_EMAIL_TO || process.env.SMTP_USER;
const transportConfig = {
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure,
  tls: {
    rejectUnauthorized,
  },
};

if (!disableAuth) {
  transportConfig.auth = {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  };
}

const transporter = nodemailer.createTransport(transportConfig);

async function run() {
  console.log(`Testing SMTP host=${process.env.SMTP_HOST} port=${process.env.SMTP_PORT} secure=${secure} rejectUnauthorized=${rejectUnauthorized}`);
  console.log(`Sending test email from ${process.env.EMAIL_FROM} to ${to || '(missing TEST_EMAIL_TO/SMTP_USER)'}`);

  if (!to) {
    throw new Error('No recipient. Set TEST_EMAIL_TO (or SMTP_USER when auth is enabled).');
  }

  await transporter.verify();

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: 'SMTP Test - Investor Hub Backend',
    text: `SMTP test successful at ${new Date().toISOString()}`,
    html: `<p>SMTP test successful at ${new Date().toISOString()}</p>`,
  });

  console.log(`MAIL_SENT messageId=${info.messageId}`);
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`MAIL_TEST_FAILED: ${err.message}`);
    process.exit(1);
  });
