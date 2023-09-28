const { Timestamp } = require('firebase-admin/firestore');

exports.updateRelationship = async function (
  myRef,
  frRef,
  myStatus,
  frStatus,
  firestore
) {
  try {
    const now = Timestamp.now();
    const batch = firestore.batch();

    const me = await firestore
      .collection('users')
      .doc(myRef)
      .collection('relationship')
      .doc(frRef);

    const friend = firestore
      .collection('users')
      .doc(frRef)
      .collection('relationship')
      .doc(myRef);

    const mylog = firestore
      .collection('users')
      .doc(myRef)
      .collection('relationship')
      .doc(frRef)
      .collection('log')
      .doc();

    const friendlog = firestore
      .collection('users')
      .doc(frRef)
      .collection('relationship')
      .doc(myRef)
      .collection('log')
      .doc();

    batch.set(me, {
      status: myStatus,
    });

    batch.set(friend, {
      status: frStatus,
    });

    batch.set(mylog, {
      status: myStatus,
      timestamp: now,
    });

    batch.set(friendlog, {
      status: frStatus,
      timestamp: now,
    });

    await batch.commit();

    return {
      message: 'success',
      status: myStatus,
    };
  } catch (error) {
    console.error('UTILS / USER / UPDATE-RELATIONSHIP >> ERROR ', error);

    return {
      message: 'Server lỗi',
    };
  }
};
