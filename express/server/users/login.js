const admin = require('firebase-admin');

const { Filter } = require('firebase-admin/firestore');
const jwtUtils = require('../../utils/jwt/index');
const apiKeyUtils = require('../../utils/apiKey/index');

const auth = admin.auth();
const database = admin.database();
const firestore = admin.firestore();

exports.login = async function (req, res) {
  const { mobile, password } = req.body;

  const formatMobile = mobile.slice(1);

  try {
    // is mobile number identify by firebase authentication?.
    const authResult = await auth.getUserByPhoneNumber(`+84${formatMobile}`);

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

      // save apikey and refreshtoken to server
      await apiKeyUtils.saveApiKey(apiKey, refreshToken, database);

      // create firebase verify token to login in client
      const firebaseToken = await auth.createCustomToken(authResult.uid, {
        ref: result.docs[0].id,
      });

      // respone
      res.json({
        message: `success`,
        data: {
          ref: result.docs[0].id,
          fullname: result.docs[0].get('fullname'),
          mobile: result.docs[0].get('mobile'),
          nickname: result.docs[0].get('nickname'),
          gender: result.docs[0].get('gender'),
          email: result.docs[0].get('email'),
          birthday: result.docs[0].get('birthday'),
          avatar: result.docs[0].get('avatar'),
        },
        apiKey: apiKey,
        firebaseToken: firebaseToken,
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
      console.error('SERVER / USERES / LOGIN >> ERROR ', error);

      res.json({
        message: 'Server lỗi',
      });
    }
  }

  res.end();
};
