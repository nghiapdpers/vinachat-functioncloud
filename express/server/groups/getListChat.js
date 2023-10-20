const apiKeyUtils = require('../../utils/apiKey/index');
const { getListChat } = require('../../utils/group/getListChat');
const { FieldPath } = require('firebase-admin/firestore');

exports.getListChat = async function (req, res, firestore, database) {
  const { group_ref, page, last_chat_id } = req.body;

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
      const currentPage = page ? parseInt(page) : 1;

      result = await getListChat(
        group_ref,
        currentPage,
        last_chat_id,
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
