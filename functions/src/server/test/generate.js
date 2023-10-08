const { createAuth, makeFriend, registerUser } = require('./utils');

exports.generateData = async function (req, res) {
  const { data, make_friend_for_id } = req.body;

  const authPromises = data.map((item) => {
    return createAuth(item.mobile);
  });

  const registerPromises = data.map((item) => {
    return registerUser(item.mobile, item.fullname);
  });

  const mobilesToMakeFriend = make_friend_for_id.map((item) => {
    return data.at(parseInt(item)).mobile;
  });

  await Promise.all(authPromises);

  const registerData = await Promise.all(registerPromises);

  if (registerData.length > 0) {
    await makeFriend(mobilesToMakeFriend);
  }

  res.end();
};
