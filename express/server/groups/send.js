const { FieldPath } = require('firebase-admin/firestore');
const apiKeyUtils = require('../../utils/apiKey/index');
const { sendMessage } = require('../../utils/group/sendMessage');

exports.sendMessage = async function (req, res, firestore, database) {
  const { to_group_ref, message } = req.body;

  // check and get api key
  const refreshApi = await apiKeyUtils.refreshApiKey(req, database);

  // if api key is active
  if (refreshApi.message == 'success') {
    // is user a member of group?
    const filter = await firestore
      .collection('groups')
      .doc(to_group_ref)
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
      result = await sendMessage(
        refreshApi.decrypt.ref,
        to_group_ref,
        message,
        firestore
      );
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
