const admin = require('firebase-admin');

const firestore = admin.firestore();

exports.onMessageListener = async function (snapshot, context) {
  return firestore.collection('groups').doc(context.params.groupId).update({
    latest_message_ref: snapshot.id,
    latest_message_from: snapshot.data().from,
    latest_message_from_name: snapshot.data().from_name,
    latest_message_text: snapshot.data().message,
    latest_message_sent_time: snapshot.data().sent_time,
    latest_message_type: snapshot.data().type,
  });
};
