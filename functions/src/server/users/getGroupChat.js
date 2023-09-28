const apiKeyUtils = require('../../utils/apiKey/index');
const { FieldPath } = require('firebase-admin/firestore');

exports.getGroupChat = async function (req, res, firestore, database) {
  // check and get api key
  const refreshApi = await apiKeyUtils.refreshApiKey(req, database);

  // if api key is active
  if (refreshApi.message === 'success') {
    // get user ref from api
    const myRef = refreshApi.decrypt.ref;

    // get user
    const user = await firestore.collection('users').doc(myRef).get();

    // get user group list
    const groupList = user.get('groups');

    // filter group
    const groups = await firestore
      .collection('groups')
      .where(FieldPath.documentId(), 'in', groupList)
      .get();

    // generate data to respone
    const promises = groups.docs.map(async (item) => {
      // is group have more than 2 people?
      const isMore = parseInt(item.get('total_member')) > 2;
      let groupName = '';

      // if group is has more 2 people
      if (isMore) {
        // set name of group
        groupName = item.get('name');
      }
      // otherwise, group is only has 2 people
      else {
        // get another member
        const members = await item.ref
          .collection('members')
          .where(FieldPath.documentId(), '!=', myRef)
          .limit(1)
          .get();

        // get another member information
        const member = await firestore
          .collection('users')
          .doc(members.docs[0].id)
          .get();

        // set name of group is name of another one.
        groupName = member.get('fullname');
      }

      // return
      return {
        ref: item.id,
        name: groupName,
        total_member: item.get('total_member'),
        latest_message_text: item.get('latest_message_text'),
        latest_message_from: item.get('latest_message_from'),
        latest_message_from_name: item.get('latest_message_from_name'),
        latest_message_sent_time: item.get('latest_message_sent_time'),
        latest_message_type: item.get('latest_message_type'),
      };
    });

    try {
      // try calculate all promise
      const data = await Promise.all(promises);

      // respone
      res.json({
        message: 'success',
        data,
        apiKey: refreshApi.apiKey,
      });
    } catch (error) {
      // if has error
      console.error('SERVER/USER/GET-GROUP-CHAT >> ERROR:', error);

      res.json({
        message: 'Server lỗi',
      });
    }
  }
  // otherwise, apikey is unactive
  else {
    res.json(refreshApi);
  }

  res.end();
};
