const admin = require('firebase-admin');

const jwtUtils = require('../../utils/jwt/index');
const apiKeyUtils = require('../../utils/apiKey/index');
const { v5 } = require('uuid');

const auth = admin.auth();
const database = admin.database();
const firestore = admin.firestore();

// register
exports.register = async function (req, res) {
  const { mobile, password, fullname, vid } = req.body;

  try {
    // is mobile number identify by firebase authentication?.
    const authResult = await auth.getUserByPhoneNumber(`+84${mobile}`);

    // check is mobile exist in database?
    const isExist = await firestore
      .collection('users')
      .where('mobile', '==', mobile)
      .get();

    // if mobile is not exist in database
    if (isExist.empty) {
      // generate uuid for user
      const uuid = v5(mobile, process.env.VNC_UUID_NAMESPACE);

      // save user information to firestore
      const register = await firestore.collection('users').add({
        uuid,
        mobile,
        password,
        fullname,
        nickname: '',
        vinateks_id: vid ? vid : '',
        gender: '1',
        email: '',
        birthday: '',
        groups: [],
      });

      // payload to create api key
      const payload = {
        ref: register.id,
        uuid,
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

      // save api to server
      await apiKeyUtils.saveApiKey(apiKey, refreshToken, database);

      // create firebase verify token to login in client
      const firebaseToken = await auth.createCustomToken(authResult.uid, {
        ref: register.id,
      });

      // respone json
      res.json({
        message: 'success',
        data: {
          ref: register.id,
          fullname,
          mobile,
          nickname: '',
          gender: '1',
          email: '',
          birthday: '',
        },
        apiKey,
        firebaseToken,
      });
    } else {
      // otherwise, if mobile is exist in database
      res.json({
        message: 'Số điện thoại đã được sử dụng',
      });
    }

    // end
    res.end();
  } catch (error) {
    console.error('SERVER / USERS / REGISTER >> ERROR ', error);

    // if mobile number isn't identify by Firebase authentication.
    if (error.code === 'auth/user-not-found') {
      res.json({
        message: 'Số điện thoại chưa đăng ký tài khoản',
      });
    } else {
      res.json({
        message: 'Lỗi server',
      });
    }

    res.end();
  }
};
