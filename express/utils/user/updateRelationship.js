const { Timestamp } = require('firebase-admin/firestore');

exports.updateRelationship = async function (
  myRef,
  frRef,
  myStatus,
  frStatus,
  firestore,
  groupRef
) {
  try {
    // get now timedate
    const now = Timestamp.now();
    const batch = firestore.batch();

    // create doc to batch update
    // my doc
    const me = await firestore
      .collection('users')
      .doc(myRef)
      .collection('relationship')
      .doc(frRef);

    // friend doc
    const friend = firestore
      .collection('users')
      .doc(frRef)
      .collection('relationship')
      .doc(myRef);

    // my log
    const mylog = firestore
      .collection('users')
      .doc(myRef)
      .collection('relationship')
      .doc(frRef)
      .collection('log')
      .doc();

    // friend log
    const friendlog = firestore
      .collection('users')
      .doc(frRef)
      .collection('relationship')
      .doc(myRef)
      .collection('log')
      .doc();

    // my data to update
    const myData = {
      status: myStatus,
      groupRef: groupRef,
    };

    // friend data to update
    const frData = {
      status: frStatus,
      groupRef: groupRef,
    };

    if (!groupRef) {
      delete myData.groupRef;
      delete frData.groupRef;
    }

    // set data
    batch.set(me, myData);

    batch.set(friend, frData);

    // set log
    batch.set(mylog, {
      status: myStatus,
      timestamp: now,
    });

    batch.set(friendlog, {
      status: frStatus,
      timestamp: now,
    });

    // commit batch
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
