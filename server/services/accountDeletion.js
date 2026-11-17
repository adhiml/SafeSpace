const User = require('../models/User');
const Session = require('../models/Session');
const VerificationCode = require('../models/VerificationCode');
const MoodEntry = require('../models/MoodEntry');
const Journal = require('../models/Journal');
const PeerPost = require('../models/PeerPost');
const Appointment = require('../models/Appointment');
const ChatMessage = require('../models/ChatMessage');
const Notification = require('../models/Notification');

/**
 * Removes a user and everything that belongs to them. The email list entry (AllowedEmail) is
 * deliberately left alone, so the same university email can register again afterwards.
 *
 * The user record is removed last: if something fails halfway, the account still exists and
 * deleting again simply finishes the job.
 */
const deleteUserData = async (userId) => {
  // Consultations they took part in, and what hangs off them (chat messages, notifications about them).
  // Deleting one removes it for the other person too: there is no one left to talk to.
  const appointments = await Appointment.find({
    $or: [{ student_user_id: userId }, { counsellor_user_id: userId }],
  }).select('_id');
  const appointmentIds = appointments.map((a) => a._id);

  await ChatMessage.deleteMany({ appointment_id: { $in: appointmentIds } });
  await Notification.deleteMany({ $or: [{ user_id: userId }, { appointment_id: { $in: appointmentIds } }] });
  await Appointment.deleteMany({ _id: { $in: appointmentIds } });

  // "Me too" they gave to other people's posts: take the mark back so the counts stay right.
  await PeerPost.updateMany({ me_too_users: userId }, { $pull: { me_too_users: userId }, $inc: { me_too_count: -1 } });

  await PeerPost.deleteMany({ user_id: userId });
  await Journal.deleteMany({ user_id: userId });
  await MoodEntry.deleteMany({ user_id: userId });
  await Session.deleteMany({ user_id: userId });
  await VerificationCode.deleteMany({ user_id: userId });

  await User.deleteOne({ _id: userId });
};

module.exports = { deleteUserData };
