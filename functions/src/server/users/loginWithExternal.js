const external = require('../../utils/external/index');
const apiKeyUtils = require('../../utils/apiKey/index');
const jwtUtils = require('../../utils/jwt/index');
const { Filter } = require('firebase-admin/firestore');

exports.loginWithExternal = async (req, res, firestore, database, auth) => {
  const { mobile, password } = req.body;

  try {
    // login to external server system
    const user = await external.login(mobile, password);

    if (user.message === 'success') {
      // database query condition
      const queryCondition = Filter.and(Filter.where('mobile', '==', mobile));

      // filter result from database
      const result = await firestore
        .collection('users')
        .where(queryCondition)
        .limit(1)
        .get();

      // if user is unlinked, create a auth account
      if (result.empty) {
        // try create auth account
        try {
          await auth.createUser({
            phoneNumber: `+84${mobile}`,
          });
        } catch (error) {
          // if auth account is exist continue
        }

        // respone to client
        res.json({
          message: 'unlinked account',
          data: {
            fullname: user.data.fullname,
            mobile,
            nickname: '',
            vinateks_id: user.data.user_id,
          },
        });
      }
      // otherwise, user had created.
      else {
        const vid = result.docs[0].get['vinateks_id'];
        // if account have no vinateks_id
        if (!vid) {
          // update vinateks_id
          await firestore.collection('users').doc(result.docs[0].id).update({
            vinateks_id: user.data.user_id,
          });
        }

        // generate payload
        const payload = {
          ref: result.docs[0].id,
          uuid: result.docs[0].get('uuid'),
        };

        // generate api key
        const apiKey = jwtUtils.create(
          payload,
          process.env.SECRET,
          process.env.API_EXPIRESIN,
          process.env.ALGORITHM
        );

        // generate refreshToken for api key
        const refreshToken = jwtUtils.create(
          payload,
          apiKey,
          process.env.REFRESH_EXPIRES,
          process.env.ALGORITHM
        );

        await apiKeyUtils.saveApiKey(apiKey, refreshToken, database);

        // respone login option
        res.json({
          message: 'success',
          data: {
            fullname: result.docs[0].get('fullname'),
            mobile,
            nickname: result.docs[0].get('nickname'),
            gender: result.docs[0].get('gender'),
            email: result.docs[0].get('email'),
            birthday: result.docs[0].get('birthday'),
          },
          apiKey: apiKey,
        });
      }
    }
    // if login unsuccesss
    else {
      res.json({
        message: user.message,
      });
    }
  } catch (error) {
    // error
    console.error('SERVER / USERS / LOGIN-WITH-EXTERNAL >> ERROR ', error);

    res.json({
      message: 'Server lỗi',
    });
  }

  res.end();
};
