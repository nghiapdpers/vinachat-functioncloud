const apiKeyUtils = require('../../utils/apiKey/index');

exports.logout = async function (req, res, database) {
  const { authorization } = req.headers;

  // get api key from request header
  const apiKey = authorization.split(' ').at(1);

  // delete api key
  await apiKeyUtils.deleteApiKey(apiKey, database);

  res.json({
    message: 'success',
  });

  res.end();
};
