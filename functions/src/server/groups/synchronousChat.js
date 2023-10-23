const admin = require('firebase-admin');
const { FieldPath } = require('firebase-admin/firestore');
const apiKeyUtils = require('../../utils/apiKey/index');

const database = admin.database();
const firestore = admin.firestore();

exports.synchronousChat = async (req, res) => {
  const { group_ref, last_chat_ref } = req.body;

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
      let synchronousData;

      if (last_chat_ref == undefined || last_chat_ref == '') {
        synchronousData = await firestore
          .collection('groups')
          .doc(group_ref)
          .collection('messages')
          .orderBy('sent_time', 'desc')
          .limit(20)
          .get();
        synchronousData.docs.reverse();
      } else {
        const last_chat_doc = await firestore
          .collection('groups')
          .doc(group_ref)
          .collection('messages')
          .doc(last_chat_ref)
          .get();

        synchronousData = await firestore
          .collection('groups')
          .doc(group_ref)
          .collection('messages')
          .orderBy('sent_time', 'asc')
          .startAfter(last_chat_doc)
          .get();
      }
      result = {
        message: 'success',
        data: synchronousData.docs.map((item) => {
          return {
            ref: item.id,
            ...item.data(),
          };
        }),
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
