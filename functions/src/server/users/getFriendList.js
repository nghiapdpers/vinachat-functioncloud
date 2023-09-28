const apiKeyUtils = require('../../utils/apiKey/index');

const {
  getListFromRelationship,
} = require('../../utils/user/getListFromRelationship');

exports.getFriendList = async function (req, res, firestore, database) {
  // check and get api key
  const refreshApi = await apiKeyUtils.refreshApiKey(req, database);

  // if api key is active
  if (refreshApi.message === 'success') {
    const myRef = refreshApi.decrypt.ref;

    const data = await getListFromRelationship('F', myRef, firestore);

    // if have no request
    res.json({
      message: 'success',
      data,
      apiKey: refreshApi.apiKey,
    });
  }
  // if api key unactive
  else {
    res.json(refreshApi);
  }

  res.end();
};
