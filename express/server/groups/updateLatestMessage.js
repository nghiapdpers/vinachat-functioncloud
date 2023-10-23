const admin = require('firebase-admin');

const { FieldPath } = require('firebase-admin/firestore');

const apiKeyUtils = require('../../utils/apiKey/index');
const {
  onMessageListener,
} = require('../../utils/firestore/onSendMessageListener');

const database = admin.database();
const firestore = admin.firestore();

exports.updateLatestMessage = async (req, res) => {
  const { group_ref, message_ref } = req.body;

  // check and get api key
  const refreshApi = await apiKeyUtils.refreshApiKey(req, database);

  // if api key is active
  if (refreshApi.message == 'success') {
    // is user a member of group?
    const filter = await firestore
      .collection('groups')
      .doc(group_ref)
      .collection('members')
      .where(FieldPath.documentId(), '==', refreshApi.decrypt.ref)
      .get();

    let result = {};

    // if user not a member of group
    if (filter.empty) {
      result = {
        message: 'Bạn không có mặt trong cuộc trò chuyện này',
      };
    }
    // otherwise,
    else {
      const snapshot = await firestore
        .collection('groups')
        .doc(group_ref)
        .collection('messages')
        .doc(message_ref)
        .get();

      const context = {
        params: {
          groupId: group_ref,
        },
      };

      await onMessageListener(snapshot, context);

      result = {
        message: 'success',
      };
    }

    res.json({
      ...result,
      apiKey: refreshApi.apiKey,
    });
  }
  // if api key not active
  else {
    res.json(refreshApi);
  }

  res.end();
};
