const { FieldPath } = require('firebase-admin/firestore');

exports.getListFromRelationship = async function (
  statusFind,
  myRef,
  firestore
) {
  // filter list
  const listRef = await firestore
    .collection('users')
    .doc(myRef)
    .collection('relationship')
    .where('status', '==', statusFind)
    .get();

  let listId = [];

  listRef.forEach((result) => {
    listId.push(result.id);
  });

  // if has data
  if (listId.length > 0) {
    const list = await firestore
      .collection('users')
      .where(FieldPath.documentId(), 'in', listId)
      .get();

    const data = list.docs.map((result) => {
      return {
        ref: result.id,
        fullname: result.get('fullname'),
        mobile: result.get('mobile'),
        nickname: result.get('nickname'),
        gender: result.get('gender'),
        email: result.get('email'),
        birthday: result.get('birthday'),
        avatar: result.get('avatar'),
      };
    });

    return data;
  }
  // if have no data
  else {
    return [];
  }
};
