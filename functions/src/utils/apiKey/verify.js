const apiKeyUtils = require('./index');
const jwtUtils = require('../jwt/index');
const jwt = require('jsonwebtoken');

exports.verify = async function (req, database) {
  const { authorization } = req.headers;

  const apiKey = authorization.split(' ').at(1);

  const refreshToken = await apiKeyUtils.filterApiKey(apiKey, database);

  if (refreshToken.val() != null) {
    const apiDecrypt = await check(apiKey, process.env.SECRET);

    const refreshDecrypt = await check(refreshToken.val(), apiKey);

    return {
      message: 'success',
      apiKey: apiDecrypt,
      refreshToken: refreshDecrypt,
    };
  }

  return {
    message: 'Token không tồn tại',
  };
};

async function check(apiKey, secret) {
  let decrypt = null;

  try {
    decrypt = jwtUtils.verify(apiKey, secret, process.env.ALGORITHM);
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return {
        message: 'Token đã hết hạn',
      };
    }

    return {
      message: 'Token không hợp lệ',
    };
  }

  return {
    message: 'success',
    data: {
      ...decrypt,
    },
  };
}
