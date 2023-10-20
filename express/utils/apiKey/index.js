const { refreshApiKey } = require('./refreshApiKey');
const { verify } = require('./verify');

// save apikey: refreshToken into realtime database
exports.saveApiKey = async function (apiKey, refreshToken, database) {
  const key = apiKey.replace(/\./g, '');

  await database.ref('apis').child(key).set(refreshToken);
};

// delete apikey
exports.deleteApiKey = async function (apiKey, database) {
  const key = apiKey.replace(/\./g, '');

  await database.ref('apis').child(key).remove();
};

// filter apiKey
exports.filterApiKey = async function (apiKey, database) {
  const key = apiKey.replace(/\./g, '');

  const filterItem = await database.ref('apis').child(key).get();

  return filterItem;
};

exports.verifyApiKey = verify;

exports.refreshApiKey = refreshApiKey;
