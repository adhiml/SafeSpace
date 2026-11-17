// Sends the app's emails. For now the only mode is "console": the email is printed in the server
// terminal instead of being sent, so everything can be built and tested without an email account.
// Real sending (SMTP) is added later behind EMAIL_MODE; nothing else needs to change when it is.
const mode = () => process.env.EMAIL_MODE || 'console';

const sendMail = async ({ to, subject, text }) => {
  if (mode() === 'console') {
    // A printed code is only acceptable while developing.
    if (process.env.NODE_ENV === 'production') throw new Error('Email sending is not configured');
    console.log(`\n--- EMAIL (console mode, not really sent) ---\nTo: ${to}\nSubject: ${subject}\n\n${text}\n---------------------------------------------\n`);
    return;
  }
  throw new Error(`EMAIL_MODE "${mode()}" is not supported yet`);
};

const sendVerificationCode = (to, code) =>
  module.exports.sendMail({
    to,
    subject: `Your tenang verification code: ${code}`,
    text: `Your tenang verification code is ${code}.\n\nIt expires in 10 minutes. If you didn't ask for it, you can ignore this email.`,
  });

const sendRenewalReminder = (to, expiryDate) =>
  module.exports.sendMail({
    to,
    subject: 'Your tenang email verification is about to expire',
    text: `Your tenang email verification expires on ${expiryDate}.\n\nOpen the app and tap "Verify now" to renew it. After that date your account becomes read-only until you verify again.`,
  });

// Called through module.exports so tests can swap sendMail out.
module.exports = { sendMail, sendVerificationCode, sendRenewalReminder };
