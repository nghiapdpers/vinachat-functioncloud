const admin = require('firebase-admin');
const { Timestamp } = require('firebase-admin/firestore');
const { v5 } = require('uuid');
const { createGroup } = require('../../utils/group/create');

const auth = admin.auth();
const firestore = admin.firestore();

exports.createAuth = async function (mobile) {
  return auth.createUser({
    phoneNumber: `+84${mobile}`,
  });
};

exports.registerUser = async function (mobile, fullname) {
  firestore.collection('users').add({
    mobile: mobile,
    fullname: fullname,
    password: '1234',
    groups: [],
    uuid: v5(mobile, process.env.VNC_UUID_NAMESPACE),
    nickname: '',
    gender: '1',
    email: '',
    birthday: '',
    vinateks_id: '',
  });
};

exports.makeFriend = async function (mobiles) {
  const batch = firestore.batch();

  // get user by mobile is passsed
  const users = await firestore
    .collection('users')
    .where('mobile', 'in', mobiles)
    .get();

  // list ref for update relationship status
  let statusRefs = [];

  // list ref for create group.
  let makeGroupRefs = [];

  // make list ref for update relationship from formula:
  // Partial permutation 2 of n, n == users.docs.length
  // Chỉnh hợp chập 2 của n, n == users.docs.length
  users.docs.forEach((user, index) => {
    for (let i = 0; i < users.docs.length; i++) {
      if (i == index) {
        continue;
      }
      statusRefs.push(
        firestore
          .collection('users')
          .doc(user.id)
          .collection('relationship')
          .doc(users.docs.at(i).id)
      );
    }
  });

  // make list ref for create group from formula:
  // Combination 2 of n, n == users.docs.length
  // Tổ hợp chập 2 của n, n == users.docs.length
  users.docs.forEach((user, index) => {
    for (let i = index + 1; i < users.docs.length; i++) {
      const comb = [user.id, users.docs[i].id];
      makeGroupRefs.push(comb);
    }
  });

  // get timestamp
  const now = Timestamp.now();

  // make friend
  statusRefs.forEach((item) => {
    batch.set(item, {
      status: 'F',
    });

    batch.set(item.collection('log').doc(), {
      status: 'F',
      timestamp: now,
    });
  });

  // await make friend
  await batch.commit();

  // create group
  makeGroupRefs.forEach((item) => {
    createGroup(item, '', '', firestore);
  });
};
