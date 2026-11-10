const nodemailer = require('nodemailer');

let etherealAccount = null;

/**
 * Creates and returns a nodemailer transport.
 * If custom SMTP credentials are provided in .env, it uses those.
 * Otherwise, it creates or reuses an ephemeral Ethereal test inbox so sending works out-of-the-box!
 */
async function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    const isSecure = process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465;
    return {
      transporter: nodemailer.createTransport({
        host,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: isSecure,
        auth: { user, pass },
      }),
      fromEmail: process.env.SMTP_FROM || user,
      isTest: false,
    };
  }

  // Create ethereal test account if not cached
  if (!etherealAccount) {
    etherealAccount = await nodemailer.createTestAccount();
    console.log('--- Created Ethereal Test Email Account ---');
    console.log(`User: ${etherealAccount.user}`);
    console.log(`Pass: ${etherealAccount.pass}`);
    console.log('Emails sent will provide a live web preview link!');
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: etherealAccount.user,
      pass: etherealAccount.pass,
    },
  });

  return {
    transporter,
    fromEmail: `Bulk Mailer <${etherealAccount.user}>`,
    isTest: true,
  };
}

module.exports = { getTransporter, getTestAccount: () => etherealAccount };

