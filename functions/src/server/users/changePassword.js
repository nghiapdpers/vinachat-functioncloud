const admin = require('firebase-admin');

const apiKeyUtils = require('../../utils/apiKey/index');

const database = admin.database();
const firestore = admin.firestore();

exports.changePassword = async (req, res) => {
  const { old_password, new_password } = req.body;

  // check and get api key
  const refreshApi = await apiKeyUtils.refreshApiKey(req, database);

  // if api key is active
  if (refreshApi.message == 'success') {
    // user ref
    const userRef = refreshApi.decrypt.ref;

    // user document
    const userDoc = firestore.collection('users').doc(userRef);

    // get user password
    const userPassword = (await userDoc.get()).get('password');

    // check is pass correct?
    if (userPassword == old_password) {
      // if pass correct, update password
      userDoc.update({
        password: new_password,
      });

      // response
      res.json({
        message: `success`,
        apiKey: refreshApi.apiKey,
      });
    }
    // otherwise, pass is not correct
    else {
      res.json({
        message: `Mật khẩu cũ không chính xác`,
        apiKey: refreshApi.apiKey,
      });
    }
  }
  // if api key not active
  else {
    res.json(refreshApi);
  }

  res.end();
};
