const admin = require('firebase-admin');

const firestore = admin.firestore();
const database = admin.database();

const apiKeyUtils = require('../../utils/apiKey/index');
const { FieldPath } = require('firebase-admin/firestore');

exports.getGroupChat = async function (req, res) {
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

    // avoid error: 'Invalid Query. A non-empty array is required for '${operator}' filters.'
    // This error appear when an empty array is used in query firestore data.
    //
    // So, if grouplist length equal 0
    if (groupList.length == 0) {
      res.json({
        message: 'success',
        data: [],
        apiKey: refreshApi.apiKey,
      });
    }
    // otherwise,
    else {
      // filter group
      const groups = await firestore
        .collection('groups')
        .where(FieldPath.documentId(), 'in', groupList)
        .get();

      groups.docs.sort((a, b) => {
        if (
          a.get('latest_message_sent_time').toMillis() <
          b.get('latest_message_sent_time').toMillis()
        ) {
          return 1;
        } else {
          return -1;
        }
      });

      // generate data to respone
      const promises = groups.docs.map(async (item) => {
        // is group have more than 2 people?
        const isMore = parseInt(item.get('total_member')) > 2;
        let groupName = '';
        let groupAvatar = '';

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
          groupAvatar = member.get('avatar');
        }

        // return
        return {
          ref: item.id,
          name: groupName,
          groupAvatar,
          total_member: item.get('total_member'),
          latest_message_text: item.get('latest_message_text'),
          latest_message_from: item.get('latest_message_from'),
          latest_message_from_name: item.get('latest_message_from_name'),
          latest_message_sent_time: item.get('latest_message_sent_time'),
          latest_message_type: item.get('latest_message_type'),
          latest_message_ref: item.get('latest_message_ref'),
        };
      });

      try {
        // try run all promise
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
  }
  // otherwise, apikey is unactive
  else {
    res.json(refreshApi);
  }

  res.end();
};
