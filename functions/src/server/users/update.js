const apiKeyUtils = require('../../utils/apiKey/index');

exports.update = async function (req, res, firestore, database) {
  const { fullname, nickname, email, gender, birthday } = req.body;

  const refreshApi = await apiKeyUtils.refreshApiKey(req, database);

  if (refreshApi.message === 'success') {
    const userRef = refreshApi.decrypt.ref;

    const updateResult = await update(userRef, fullname, nickname, firestore);

    res.json({
      ...updateResult,
      apiKey: refreshApi.apiKey,
    });
  } else {
    res.json(refreshApi);
  }

  res.end();
};

async function update(ref, fullname, nickname, firestore) {
  try {
    await firestore.collection('users').doc(ref).update({
      fullname: fullname,
      nickname: nickname,
    });

    const user = await firestore.collection('users').doc(ref).get();

    return {
      message: 'success',
      data: {
        fullname: user.get('fullname'),
        mobile: user.get('mobile'),
        nickname: user.get('nickname'),
      },
    };
  } catch (error) {
    if (error.code == 5) {
      return {
        message: 'Không tìm thấy người dùng',
      };
    }
  }
}
