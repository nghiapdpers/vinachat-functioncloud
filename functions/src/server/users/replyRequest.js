const apiKeyUtils = require('../../utils/apiKey/index');
const { createGroup } = require('../../utils/group/create');
const { updateRelationship } = require('../../utils/user/updateRelationship');

exports.replyRequest = async function (req, res, firestore, database) {
  const { reply, ref } = req.body;

  // check and get api key
  const refreshApi = await apiKeyUtils.refreshApiKey(req, database);

  // if api key is active
  if (refreshApi.message === 'success') {
    const myStatus = reply == 'accept' ? 'F' : 'D';
    const frStatus = reply == 'accept' ? 'F' : 'ID';

    let groupRef = '';

    // if user accept friend request, create group chat with 2 member
    if (reply == 'accept') {
      const result = await createGroup(
        [refreshApi.decrypt.ref, ref],
        '',
        '',
        firestore
      );

      groupRef = result.data.groupRef;
    }

    // update relationship
    const result = await updateRelationship(
      refreshApi.decrypt.ref,
      ref,
      myStatus,
      frStatus,
      firestore,
      groupRef
    );

    res.json({
      ...result,
      apiKey: refreshApi.apiKey,
    });
  }
  // if api key unactive
  else {
    res.json(refreshApi);
  }

  res.end();
};
