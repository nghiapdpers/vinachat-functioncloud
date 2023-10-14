const { Filter, FieldPath } = require('firebase-admin/firestore');
const apiKeyUtils = require('../../utils/apiKey/index');

exports.find = async function (req, res, firestore, database) {
  const { keyword } = req.body;

  // check and get api key
  const refreshApi = await apiKeyUtils.refreshApiKey(req, database);

  // if api key is active
  if (refreshApi.message == 'success') {
    const findResult = await finding(
      refreshApi.decrypt.ref,
      keyword,
      firestore
    );

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

async function finding(myRef, keyword, firestore) {
  const queryConditon = Filter.and(
    Filter.where('mobile', '==', keyword),
    Filter.where(FieldPath.documentId(), '!=', myRef)
  );

  const result = await firestore
    .collection('users')
    .where(queryConditon)
    .limit(1)
    .get();

  if (!result.empty) {
    const statusCondition = Filter.where(
      FieldPath.documentId(),
      '==',
      result.docs[0].id
    );

    const status = await firestore
      .collection('users')
      .doc(myRef)
      .collection('relationship')
      .where(statusCondition)
      .limit(1)
      .get();

    return {
      message: 'success',
      data: {
        ref: result.docs[0].id,
        mobile: result.docs[0].get('mobile'),
        fullname: result.docs[0].get('fullname'),
        nickname: result.docs[0].get('nickname'),
        gender: result.docs[0].get('gender'),
        email: result.docs[0].get('email'),
        birthday: result.docs[0].get('birthday'),
        status: status.empty ? 'N' : status.docs[0].get('status'),
      },
    };
  }

  return {
    message: 'Không tìm thấy người dùng',
  };
}
