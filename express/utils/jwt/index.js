const jwt = require('jsonwebtoken');

exports.create = function (payload, secretKey, ttl, algorithm) {
  return jwt.sign(payload, secretKey, {
    expiresIn: ttl,
    algorithm: algorithm,
  });
};

exports.verify = function (token, secretKey, algorithm) {
  return jwt.verify(token, secretKey, {
    algorithms: algorithm,
  });
};
