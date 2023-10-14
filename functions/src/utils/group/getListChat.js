exports.getListChat = async function (
  group_ref,
  page,
  last_chat_id,
  firestore
) {
  const limitChat = 20;

  let list = [];

  try {
    if (page == 1) {
      list = await firestore
        .collection('groups')
        .doc(group_ref)
        .collection('messages')
        .orderBy('sent_time', 'desc')
        .limit(limitChat)
        .get();
    } else {
      const startDoc = await firestore
        .collection('groups')
        .doc(group_ref)
        .collection('messages')
        .doc(last_chat_id)
        .get();

      list = await firestore
        .collection('groups')
        .doc(group_ref)
        .collection('messages')
        .orderBy('sent_time', 'desc')
        .startAfter(startDoc)
        .limit(limitChat)
        .get();
    }

    const total_record = await firestore
      .collection('groups')
      .doc(group_ref)
      .collection('messages')
      .count()
      .get();

    return {
      message: 'success',
      data: {
        chats: list.docs.map((item) => ({
          ref: item.id,
          ...item.data(),
        })),
        page: page,
        last_chat_id: list.size > 0 ? list.docs[list.size - 1].id : '',
        total_record: total_record.data().count,
      },
    };
  } catch (error) {
    console.error('UTILS / GROUP / GET-LIST-MESSAGE >> ERROR ', error);

    return {
      message: 'Server lỗi',
    };
  }
};
