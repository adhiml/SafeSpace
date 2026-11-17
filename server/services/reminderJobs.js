const Appointment = require('../models/Appointment');
const MoodEntry = require('../models/MoodEntry');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { notify } = require('./notify');
const mailer = require('./mailer');
const { accountState, VALID_DAYS, RENEW_WINDOW_DAYS, DAY_MS } = require('../utils/accountState');

// Two small jobs that run inside the server process (no extra scheduler needed):
//   - upcoming appointment: a reminder about an hour before a confirmed session
//   - daily mood check-in: a nudge to students who haven't checked in today
const TICK_MS = 60 * 1000;
const MOOD_CHECK_EVERY_TICKS = 30; // about every 30 minutes
const REMIND_BEFORE_MS = 60 * 60 * 1000;
const MALAYSIA_OFFSET_MS = 8 * 60 * 60 * 1000; // UTC+8, no daylight saving
const MOOD_REMINDER_HOUR = 9; // from 9 AM Malaysia time

const startOfTodayMalaysia = (now = Date.now()) =>
  new Date(Math.floor((now + MALAYSIA_OFFSET_MS) / 86400000) * 86400000 - MALAYSIA_OFFSET_MS);

const hourMalaysia = (now = Date.now()) => new Date(now + MALAYSIA_OFFSET_MS).getUTCHours();

const timeLabel = (date) =>
  date.toLocaleTimeString('en-MY', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kuala_Lumpur' });

const sendAppointmentReminders = async () => {
  const now = new Date();
  const due = await Appointment.find({
    status: 'approved',
    is_dev_room: { $ne: true },
    reminder_sent: { $ne: true },
    appointment_datetime: { $gt: now, $lte: new Date(now.getTime() + REMIND_BEFORE_MS) },
  });

  for (const appt of due) {
    const when = timeLabel(appt.appointment_datetime);
    for (const userId of [appt.student_user_id, appt.counsellor_user_id]) {
      await notify({
        userId,
        type: 'appointment_reminder',
        appointmentId: appt._id,
        title: 'Upcoming appointment',
        message: `Your counselling session starts at ${when}.`,
      });
    }
    appt.reminder_sent = true;
    await appt.save();
  }
};

const sendMoodCheckInReminders = async () => {
  if (hourMalaysia() < MOOD_REMINDER_HOUR) return;
  const today = startOfTodayMalaysia();

  const students = await User.find({ role: 'student' }).select('_id is_demo email_verified_at');
  for (const student of students) {
    if (accountState(student).state !== 'active') continue; // frozen accounts get nothing new

    const [checkedIn, alreadyReminded] = await Promise.all([
      MoodEntry.exists({ user_id: student._id, created_at: { $gte: today } }),
      Notification.exists({ user_id: student._id, type: 'mood_checkin', created_at: { $gte: today } }),
    ]);
    if (checkedIn || alreadyReminded) continue;

    await notify({
      userId: student._id,
      type: 'mood_checkin',
      title: 'Daily check-in',
      message: "How are you feeling today? Take a moment to log your mood.",
    });
  }
};

// Emails people whose verification ends within two weeks, once per verification.
const sendRenewalReminders = async () => {
  const now = Date.now();
  const due = await User.find({
    is_demo: { $ne: true },
    email: { $gt: '' },
    email_verified_at: {
      $gt: new Date(now - VALID_DAYS * DAY_MS), // still verified...
      $lte: new Date(now - (VALID_DAYS - RENEW_WINDOW_DAYS) * DAY_MS), // ...but ending soon
    },
  });

  for (const user of due) {
    if (user.expiry_reminder_sent_at && user.expiry_reminder_sent_at >= user.email_verified_at) continue; // already told
    try {
      const endDate = accountState(user).verifiedUntil.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      await mailer.sendRenewalReminder(user.email, endDate);
      user.expiry_reminder_sent_at = new Date();
      await user.save();
    } catch (e) {
      console.warn('[reminders] renewal email failed for', user._id, e.message); // retried on the next run
    }
  }
};

const start = () => {
  let tick = 0;
  const run = async () => {
    try {
      await sendAppointmentReminders();
      if (tick % MOOD_CHECK_EVERY_TICKS === 0) {
        await sendMoodCheckInReminders();
        await sendRenewalReminders();
      }
    } catch (e) {
      console.warn('[reminders] failed:', e.message);
    }
    tick += 1;
  };
  run();
  setInterval(run, TICK_MS).unref(); // unref: never keeps the process alive on its own
};

module.exports = { start, sendAppointmentReminders, sendMoodCheckInReminders, sendRenewalReminders, startOfTodayMalaysia };
