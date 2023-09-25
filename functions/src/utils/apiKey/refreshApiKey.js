const jwtUtils = require('../jwt/index');
const apiKeyUtils = require('./index');

// refresh api key when api key of user is expired.
exports.refreshApiKey = async function (req, database) {
  const { authorization } = req.headers;

  // get api key
  const apiKey = authorization.split(' ').at(1);

  // check api key is exist in server
  const verify = await apiKeyUtils.verifyApiKey(req, database);

  // if api key exist in database
  if (verify.message == 'success') {
    // if api key isn't expired
    if (verify.apiKey.message == 'success') {
      return {
        message: 'success',
        apiKey: apiKey,
        decrypt: verify.apiKey.data,
      };
    }
    // if api key is expired
    else {
      // if refreshToken isn't expired
      if (verify.refreshToken.message == 'success') {
        // generate payload
        const payload = {
          ref: verify.refreshToken.data.ref,
          uuid: verify.refreshToken.data.ref.uuid,
        };

        // generate new api key
        const newApiKey = jwtUtils.create(
          payload,
          process.env.SECRET,
          process.env.API_EXPIRESIN,
          process.env.ALGORITHM
        );

        // generate new refreshToken
        const newRefreshToken = jwtUtils.create(
          payload,
          newApiKey,
          process.env.REFRESH_EXPIRES,
          process.env.ALGORITHM
        );

        // delete old api key
        await apiKeyUtils.deleteApiKey(apiKey, database);

        // save new api key
        await apiKeyUtils.saveApiKey(newApiKey, newRefreshToken, database);

        // return
        return {
          message: 'success',
          apiKey: newApiKey,
          decrypt: payload,
        };
      }
      // if refreshToken expired
      else {
        return {
          message: `${verify.refreshToken.message}, vui lòng đăng nhập lại`,
        };
      }
    }
  } else {
    // if api key is not exist in server.
    return {
      ...verify,
    };
  }
};
