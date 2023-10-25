const { Timestamp, FieldValue } = require('firebase-admin/firestore');

exports.addMember = async function (memberRefs, groupRef, firestore) {
  const batch = firestore.batch();

  const group = firestore.collection('groups').doc(groupRef);

  const now = FieldValue.serverTimestamp();

  memberRefs.map((ref) => {
    batch.set(group.collection('members').doc(ref), {
      joint_time: now,
      left_time: '',
      role: 'member',
    });
    batch.update(firestore.collection('users').doc(ref), {
      groups: FieldValue.arrayUnion(group.id),
    });
  });

  batch.update(group, {
    total_member: FieldValue.increment(memberRefs.length),
  });

  try {
    await batch.commit();

    return {
      message: 'success',
    };
  } catch (error) {
    console.error('UTILS / GROUP / ADD-MEMBER >> ERROR ', error);

    return {
      message: 'Server lỗi',
    };
  }
};
