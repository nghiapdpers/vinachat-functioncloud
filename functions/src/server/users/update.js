const apiKeyUtils = require('../../utils/apiKey/index');

exports.update = async function (req, res, firestore, database) {
  const refreshApi = await apiKeyUtils.refreshApiKey(req, database);

  if (refreshApi.message === 'success') {
    const userRef = refreshApi.decrypt.ref;

    const updateResult = await update(userRef, req.body, firestore);

    if (updateResult.message === 'success') {
      res.json({
        ...updateResult,
        apiKey: refreshApi.apiKey,
      });
    } else {
      res.json(updateResult);
    }
  } else {
    res.json(refreshApi);
  }

  res.end();
};

async function update(ref, data, firestore) {
  const { fullname, nickname, email, gender, birthday, vid } = data;

  const updateData = {
    fullname,
    nickname,
    email,
    gender,
    birthday,
    vinateks_id: vid,
  };

  !fullname && delete updateData.fullname;
  !nickname && delete updateData.nickname;
  !email && delete updateData.email;
  !gender && delete updateData.gender;
  !birthday && delete updateData.birthday;
  !vid && delete updateData.vinateks_id;

  try {
    await firestore.collection('users').doc(ref).update(updateData);

    const user = await firestore.collection('users').doc(ref).get();

    return {
      message: 'success',
      data: {
        fullname: user.get('fullname'),
        mobile: user.get('mobile'),
        nickname: user.get('nickname'),
        gender: user.get('gender'),
        email: user.get('email'),
        birthday: user.get('birthday'),
      },
    };
  } catch (error) {
    if (error.code == 5) {
      return {
        message: 'Không tìm thấy người dùng',
      };
    }

    console.error('SERVER / USERS / UPDATE >> ERROR ', error);

    return {
      message: 'Server lỗi',
    };
  }
}
