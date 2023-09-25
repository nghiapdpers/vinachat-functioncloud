const { Filter } = require('firebase-admin/firestore');
const jwtUtils = require('../../utils/jwt/index');
const apiKeyUtils = require('../../utils/apiKey/index');

exports.login = async function (req, res, firestore, database, auth) {
  const { mobile, password } = req.body;

  try {
    // is mobile number identify by firebase authentication?.
    await auth.getUserByPhoneNumber(`+84${mobile}`);

    // database query condition
    const queryCondition = Filter.and(
      Filter.where('mobile', '==', mobile),
      Filter.where('password', '==', password)
    );

    // get result from database
    const result = await firestore
      .collection('users')
      .where(queryCondition)
      .limit(1)
      .get();

    // if result is empty
    if (result.empty) {
      res.json({
        message: 'Tài khoản hoặc mật khẩu không chính xác',
      });
    } else {
      // otherwise, user had created.
      const payload = {
        ref: result.docs[0].id,
        uuid: result.docs[0].get('uuid'),
      };

      // generate api key
      const apiKey = jwtUtils.create(
        payload,
        process.env.SECRET,
        process.env.API_EXPIRESIN,
        process.env.ALGORITHM
      );

      // generate refreshToken for api key
      const refreshToken = jwtUtils.create(
        payload,
        apiKey,
        process.env.REFRESH_EXPIRES,
        process.env.ALGORITHM
      );

      await apiKeyUtils.saveApiKey(apiKey, refreshToken, database);

      // respone
      res.json({
        message: `success`,
        data: {
          fullname: result.docs[0].get('fullname'),
          mobile: result.docs[0].get('mobile'),
          nickname: result.docs[0].get('nickname'),
        },
        apiKey: apiKey,
      });
    }
  } catch (error) {
    // if mobile number isn't identify by Firebase authentication.
    if (error.code === 'auth/user-not-found') {
      res.json({
        message: 'Số điện thoại chưa đăng ký tài khoản',
      });
    } else {
      // otherwise, has error from server.
      res.json({
        message: 'Server lỗi',
      });
    }
  }

  res.end();
};
