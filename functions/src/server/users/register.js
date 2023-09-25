const jwtUtils = require('../../utils/jwt/index');
const apiKeyUtils = require('../../utils/apiKey/index');
const { v5 } = require('uuid');

// register
exports.register = async function (req, res, firestore, database) {
  const { mobile, password, fullname } = req.body;

  try {
    // check is mobile exist in database?
    const isExist = await firestore
      .collection('users')
      .where('mobile', '==', mobile)
      .get();

    // if mobile is not exist in database
    if (isExist.empty) {
      // generate uuid for user
      const uuid = v5(mobile, process.env.VNC_UUID_NAMESPACE);

      // save user information
      const register = await firestore.collection('users').add({
        uuid,
        mobile,
        password,
        fullname,
        nickname: '',
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

      // respone json
      res.json({
        message: 'success',
        data: {
          fullname,
          mobile,
          nickname: '',
        },
        apiKey,
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
    console.log(error);
    res.json({
      message: 'Lỗi server',
    });

    res.end();
  }
};
