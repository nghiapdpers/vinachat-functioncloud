const { FieldPath } = require('firebase-admin/firestore');
const apiKeyUtils = require('../../utils/apiKey/index');
const { addMember } = require('../../utils/group/addMember');

exports.add = async function (req, res, firestore, database) {
  const { group_ref, member_refs } = req.body;

  // check and get api key
  const refreshApi = await apiKeyUtils.refreshApiKey(req, database);

  // if api key is active
  if (refreshApi.message == 'success') {
    const memberListRef = JSON.parse(member_refs);

    // filter user had a member of group
    const filter = await firestore
      .collection('groups')
      .doc(group_ref)
      .collection('members')
      .where(FieldPath.documentId(), 'in', memberListRef)
      .get();

    let result = {};
    let hadMemberList = [];
    let totalAdd = 0;

    // if not user had a member of group
    if (filter.empty) {
      result = await addMember(memberListRef, group_ref, firestore);
      totalAdd = memberListRef.length;
    }
    // otherwise,
    else {
      hadMemberList = filter.docs.map((doc) => doc.id);

      const canAddList = memberListRef.filter(
        (ref) => hadMemberList.indexOf(ref) < 0
      );

      result = await addMember(canAddList, group_ref, firestore);
      totalAdd = canAddList.length;
    }

    res.json({
      ...result,
      data: {
        had_member_list: hadMemberList,
        total_member_add: totalAdd,
      },
      apiKey: refreshApi.apiKey,
    });
  }
  // if api key not active
  else {
    res.json(refreshApi);
  }

  res.end();
};
