// Consultation slots: Monday–Friday, 1-hour sessions starting 9:00–16:00 (Malaysia time).
// Checked in a fixed timezone so the rule doesn't depend on where the server runs.
const TZ = 'Asia/Kuala_Lumpur';
const SLOT_START_HOURS = [9, 10, 11, 12, 13, 14, 15, 16];
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

// A confirmed (or finished) session occupies its slot; pending and cancelled ones do not.
const SLOT_BLOCKING_STATUSES = ['approved', 'completed'];

const myTimeParts = (date) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type)?.value;
  return { weekday: get('weekday'), hour: Number(get('hour')), minute: Number(get('minute')) };
};

/** Returns an error message if `date` is not a bookable slot, otherwise null. */
const slotError = (date) => {
  if (Number.isNaN(date.getTime())) return 'appointment_datetime is not a valid date';
  const { weekday, hour, minute } = myTimeParts(date);
  if (!WEEKDAYS.includes(weekday)) return 'Consultations are only available Monday to Friday';
  if (minute !== 0 || !SLOT_START_HOURS.includes(hour)) {
    return 'Pick a 1-hour slot between 9:00 AM and 5:00 PM';
  }
  if (date.getTime() <= Date.now()) return 'That time has already passed';
  return null;
};

module.exports = { slotError, SLOT_BLOCKING_STATUSES };
