const { Filter } = require('firebase-admin/firestore');
const apiKeyUtils = require('../../utils/apiKey/index');

exports.find = async function (req, res, firestore, database) {
  const { keyword } = req.body;

  // check and get api key
  const refreshApi = await apiKeyUtils.refreshApiKey(req, database);

  // if api key is active
  if (refreshApi.message == 'success') {
    const findResult = await finding(keyword, firestore);

    res.json({
      ...findResult,
      apiKey: refreshApi.apiKey,
    });
  }
  // if api key not active
  else {
    res.json(refreshApi);
  }

  res.end();
};

async function finding(keyword, firestore) {
  const queryConditon = Filter.where('mobile', '==', keyword);

  const result = await firestore
    .collection('users')
    .where(queryConditon)
    .limit(1)
    .get();

  if (!result.empty) {
    return {
      message: 'success',
      data: {
        mobile: result.docs[0].get('mobile'),
        fullname: result.docs[0].get('fullname'),
        nickname: result.docs[0].get('nickname'),
      },
    };
  }

  return {
    message: 'Không tìm thấy người dùng',
  };
}
