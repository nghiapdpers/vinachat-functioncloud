const { Timestamp } = require('firebase-admin/firestore');

exports.sendMessage = async function sendMessage(
  from_ref,
  to_group_ref,
  message,
  firestore
) {
  const batch = firestore.batch();

  const toGroupRef = firestore.collection('groups').doc(to_group_ref);

  const fromUser = await firestore.collection('users').doc(from_ref).get();

  const now = Timestamp.now();

  batch.update(toGroupRef, {
    latest_message_from: from_ref,
    latest_message_from_name: fromUser.get('fullname'),
    latest_message_text: message,
    latest_message_sent_time: now,
    latest_message_type: 'text',
  });

  batch.create(toGroupRef.collection('messages').doc(), {
    from: from_ref,
    message: message,
    sent_time: now,
    type: 'text',
  });

  try {
    await batch.commit();

    return {
      message: 'success',
      data: {
        sent_time: now,
      },
    };
  } catch (error) {
    console.error('UTILS / GROUP / SEND-MESSAGE >> ERROR ', error);

    return {
      message: 'Server lỗi',
    };
  }
};
