const Notification = require('../models/Notification');
const User = require('../models/User');

// Which notification type each setting in Settings > Notifications controls.
// Types that aren't listed here (e.g. a student cancelling) are always delivered.
const SETTING_FOR_TYPE = {
  mood_checkin: 'mood_checkin',
  approval: 'approval',
  message: 'messages',
  appointment_reminder: 'appointment_reminder',
  recommendation_feedback: 'recommendation_feedback',
  new_request: 'new_requests',
};

/**
 * Creates an in-app notification unless the recipient switched that kind off.
 * A switched-off kind is simply never created, so nothing sits unread in their list.
 */
const notify = async ({ userId, type, appointmentId, title, message }) => {
  const setting = SETTING_FOR_TYPE[type];
  if (setting) {
    const user = await User.findById(userId).select('notification_prefs');
    if (user?.notification_prefs?.[setting] === false) return null;
  }
  return Notification.create({ user_id: userId, type, appointment_id: appointmentId, title, message });
};

module.exports = { notify };
