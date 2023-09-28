const apiKeyUtils = require('../../utils/apiKey/index');
const { updateRelationship } = require('../../utils/user/updateRelationship');

exports.requestFriend = async function (req, res, firestore, database) {
  const { ref } = req.body;

  // check and get api key
  const refreshApi = await apiKeyUtils.refreshApiKey(req, database);

  // if api key is active
  if (refreshApi.message === 'success') {
    // get friend document
    const isExist = await firestore.collection('users').doc(ref).get();

    // if friend document is exist
    if (isExist.exists) {
      const result = await updateRelationship(
        refreshApi.decrypt.ref,
        ref,
        'R',
        'RC',
        firestore
      );
      res.json({
        ...result,
        apiKey: refreshApi.apiKey,
      });
    }
    // if friend document not exist
    else {
      res.json({
        message: 'Người dùng này không tồn tại',
      });
    }
  }
  // if api key unactive
  else {
    res.json(refreshApi);
  }

  res.end();
};
