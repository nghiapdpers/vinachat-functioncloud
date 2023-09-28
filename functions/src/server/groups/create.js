const apiKeyUtils = require('../../utils/apiKey/index');
const { createGroup } = require('../../utils/group/create');

exports.create = async function (req, res, firestore, database) {
  const { refs, name } = req.body;

  // check and get api key
  const refreshApi = await apiKeyUtils.refreshApiKey(req, database);

  // if api key is active
  if (refreshApi.message == 'success') {
    const myRef = refreshApi.decrypt.ref;
    const refList = JSON.parse(refs);

    const result = await createGroup(
      [...refList, myRef],
      myRef,
      name,
      firestore
    );

    res.json({
      ...result,
      apiKey: refreshApi.apiKey,
    });
  }
  // if api key not active
  else {
    res.json(refreshApi);
  }

  res.end();
};
