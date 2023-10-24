const { FieldPath } = require('firebase-admin/firestore');

const admin = require('firebase-admin');

const firestore = admin.firestore();

exports.getListFromRelationship = async function (statusFind, myRef) {
  // filter list
  const listRef = await firestore
    .collection('users')
    .doc(myRef)
    .collection('relationship')
    .where('status', '==', statusFind)
    .get();

  let listId = [];
  let listGroupRef = [];

  listRef.docs.forEach((result, index) => {
    listId[index] = result.id;
    listGroupRef[index] = result.get('groupRef');
  });

  // if has data
  if (listId.length > 0) {
    const list = await firestore
      .collection('users')
      .where(FieldPath.documentId(), 'in', listId)
      .get();

    const data = list.docs.map((result, index) => {
      let dt = {
        ref: result.id,
        fullname: result.get('fullname'),
        mobile: result.get('mobile'),
        nickname: result.get('nickname'),
        gender: result.get('gender'),
        email: result.get('email'),
        birthday: result.get('birthday'),
        avatar: result.get('avatar'),
      };

      if (listGroupRef[index] && statusFind == 'F') {
        dt = {
          ...dt,
          groupRef: listGroupRef[index],
        };
      }

      return dt;
    });

    return data;
  }
  // if have no data
  else {
    return [];
  }
};
