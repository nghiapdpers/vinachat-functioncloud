const { Timestamp, FieldValue } = require('firebase-admin/firestore');

exports.createGroup = async function (refs, adminRef, name, firestore) {
  // batch to write multiple documents
  const batch = firestore.batch();

  // create group reference
  const groupRef = firestore.collection('groups').doc();

  // time to create/join group
  const now = Timestamp.now();

  // create group with reference above
  batch.set(groupRef, {
    name: name,
    total_member: refs.length,
    adminRef: adminRef,
    groupAvatar: '',
    latest_message_sent_time: now,
  });

  // create list member reference
  const memberRefs = refs.map((item) =>
    groupRef.collection('members').doc(item)
  );

  // set member to collection members in group
  memberRefs.forEach(async (ref) => {
    batch.set(ref, {
      joint_time: now,
      left_time: '',
      role: ref.id == adminRef ? 'admin' : 'member',
    });
  });

  // update groups field in user
  refs.forEach((ref) => {
    batch.update(firestore.collection('users').doc(ref), {
      groups: FieldValue.arrayUnion(groupRef.id),
    });
  });

  try {
    // commit change
    await batch.commit();

    return {
      message: 'success',
      data: {
        groupRef: groupRef.id,
      },
    };
  } catch (error) {
    console.error('UTILS / GROUP / CREATE >> ERROR ', error);

    return {
      message: 'Server lỗi',
    };
  }
};
