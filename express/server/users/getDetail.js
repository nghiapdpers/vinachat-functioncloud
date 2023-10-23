const admin = require('firebase-admin');

const apiKeyUtils = require('../../utils/apiKey/index');

const database = admin.database();
const firestore = admin.firestore();

exports.getDetail = async (req, res) => {
  // check and get api key
  const refreshApi = await apiKeyUtils.refreshApiKey(req, database);

  // if api key is active
  if (refreshApi.message == 'success') {
    const userRef = refreshApi.decrypt.ref;

    const result = await firestore.collection('users').doc(userRef).get();

    res.json({
      message: `success`,
      data: {
        ref: result.id,
        fullname: result.get('fullname'),
        mobile: result.get('mobile'),
        nickname: result.get('nickname'),
        gender: result.get('gender'),
        email: result.get('email'),
        birthday: result.get('birthday'),
        avatar: result.get('avatar'),
      },
      apiKey: refreshApi.apiKey,
    });
  }
  // if api key not active
  else {
    res.json(refreshApi);
  }

  res.end();
};
