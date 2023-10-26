const admin = require('firebase-admin');

const { FieldPath } = require('firebase-admin/firestore');

const apiKeyUtils = require('../../utils/apiKey/index');

const database = admin.database();
const firestore = admin.firestore();

exports.getDetailGroupChat = async (req, res) => {
  const { group_ref } = req.body;

  // check and get api key
  const refreshApi = await apiKeyUtils.refreshApiKey(req, database);

  // if api key is active
  if (refreshApi.message == 'success') {
    // is user a member of group?
    const filter = await firestore
      .collection('groups')
      .doc(group_ref)
      .collection('members')
      .where(FieldPath.documentId(), '==', refreshApi.decrypt.ref)
      .get();

    let result = {};

    // if user not a member of group
    if (filter.empty) {
      result = {
        message: 'Bạn không có mặt trong cuộc trò chuyện này',
      };
    }
    // otherwise,
    else {
      // get detail group chat data
      const detailGroup = await firestore
        .collection('groups')
        .doc(group_ref)
        .get();

      const isMore = parseInt(detailGroup.get('total_member')) > 2;
      let groupName = '';
      let groupAvatar = '';

      if (isMore) {
        // set name of group
        groupName = detailGroup.get('name');
        groupAvatar = detailGroup.get('groupAvatar');
      }
      // otherwise, group is only has 2 people
      else {
        // get another member
        const members = await detailGroup.ref
          .collection('members')
          .where(FieldPath.documentId(), '!=', refreshApi.decrypt.ref)
          .limit(1)
          .get();

        // get another member information
        const member = await firestore
          .collection('users')
          .doc(members.docs[0].id)
          .get();

        // set name of group is name of another one.
        groupName = member.get('fullname');
        groupAvatar = member.get('avatar');
      }

      const detail = {
        ref: detailGroup.id,
        adminRef: detailGroup.get('adminRef'),
        total_member: detailGroup.get('total_member'),
        groupAvatar: groupAvatar,
        name: groupName,
      };

      // get members list data
      const groupMember = await firestore
        .collection('groups')
        .doc(group_ref)
        .collection('members')
        .get();

      // get member ref
      const groupMemberRefs = [];
      const groupMemberData = groupMember.docs.map((item) => {
        if (item.id !== refreshApi.decrypt.ref) {
          groupMemberRefs.push(item.id);
          return {
            ref: item.id,
            ...item.data(),
          };
        }
      });

      // generate member data
      const memberFromUsers = await firestore
        .collection('users')
        .where(FieldPath.documentId(), 'in', groupMemberRefs)
        .get();
      const memberDataFromUsers = memberFromUsers.docs.map((item) => {
        return {
          fullname: item.get('fullname'),
          nickname: item.get('nickname'),
          birthday: item.get('birthday'),
          gender: item.get('gender'),
          avatar: item.get('avatar'),
          email: item.get('email'),
          mobile: item.get('mobile'),
        };
      });

      const members = groupMemberData.map((item, index) => {
        return {
          ...item,
          ...memberDataFromUsers[index],
        };
      });

      result = {
        message: 'success',
        data: {
          ref: detail.id,
          ...detail,
          members,
        },
      };
    }

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
