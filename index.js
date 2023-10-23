require('dotenv').config();
const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');

var serviceAccount = require('./itestcloudfunction-firebase-adminsdk-262by-76e6101f3a.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    'https://itestcloudfunction-default-rtdb.asia-southeast1.firebasedatabase.app',
  storageBucket: 'itestcloudfunction.appspot.com',
});

const userActions = require('./express/server/users/index');
const groupActions = require('./express/server/groups/index');
const apiKeyUtils = require('./express/utils/apiKey/index');
const { generateData } = require('./express/server/test/generate');
const {
  onMessageListener,
} = require('./express/utils/firestore/onSendMessageListener');

let isBypassFirstStart = false;

const database = admin.database();
const firestore = admin.firestore();

const main = express();
const api = express();
const users = express();
const groups = express();

main.use(express.static('public'));
main.use(bodyParser.json());
api.use(bodyParser.json());
users.use(bodyParser.json());
groups.use(bodyParser.json());

// running server
main.listen(process.env.PORT | 3000, () => {
  console.log('Server is running...');
});

// home
main.get('/', (req, res) => {
  res.sendFile('./index.html');
});

// api documents
api.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/docs.html');
});

//---------------------------------------------------------------------------
// -----------------USER--------------------
//
users.post('/login', async (req, res) => {
  userActions.login(req, res);
});

users.post('/loginWithExternal', async (req, res) => {
  userActions.loginWithExternal(req, res);
});

users.post('/register', async (req, res) => {
  userActions.register(req, res);
});

users.post('/logout', async (req, res) => {
  userActions.logout(req, res, database);
});

users.post('/search', async (req, res) => {
  userActions.find(req, res, firestore, database);
});

users.post('/update', async (req, res) => {
  userActions.update(req, res, firestore, database);
});

users.post('/requestFriend', async (req, res) => {
  userActions.requestFriend(req, res, firestore, database);
});

users.post('/getRequestList', async (req, res) => {
  userActions.getRequestList(req, res, firestore, database);
});

users.post('/replyRequest', async (req, res) => {
  userActions.replyRequest(req, res, firestore, database);
});

users.post('/getFriendList', async (req, res) => {
  userActions.getFriendList(req, res, firestore, database);
});

users.post('/getGroupChat', async (req, res) => {
  userActions.getGroupChat(req, res, firestore, database);
});

users.post('/getDetail', async (req, res) => {
  userActions.getDetail(req, res);
});

users.post('/changePassword', async (req, res) => {
  userActions.changePassword(req, res);
});

//---------------------------------------------------------------------------
// --------------------GROUP------------------
//
groups.post('/create', async (req, res) => {
  groupActions.create(req, res, firestore, database);
});

groups.post('/addMember', async (req, res) => {
  groupActions.add(req, res, firestore, database);
});

groups.post('/sendMessage', async (req, res) => {
  groupActions.sendMessage(req, res, firestore, database);
});

groups.post('/getListMessage', async (req, res) => {
  groupActions.getListChat(req, res, firestore, database);
});

groups.post('/synchronous', async (req, res) => {
  groupActions.synchronous(req, res);
});

groups.post('/updateLatestMessage', async (req, res) => {
  groupActions.updateLatestMessage(req, res);
});

//---------------------------------------------------------------------------
// ------------ UPDATE LATEST MESSAGE FOR GROUP
// firestore.collectionGroup('messages').onSnapshot((snapshot) => {
//   snapshot.docChanges().forEach((item) => {
//     const timer = setTimeout(() => {
//       isBypassFirstStart = true;
//       clearTimeout(timer);
//     });
//     if (item.type === 'added' && isBypassFirstStart) {
//       const snapshot = item.doc;
//       const groupId = item.doc.ref.parent.parent.id;
//       const context = {
//         params: {
//           groupId,
//         },
//       };

//       onMessageListener(snapshot, context);
//     }
//   });
// });

//---------------------------------------------------------------------------
// ------------chức năng chỉ để test - only for test
//
// api.post('/refresh', async (req, res) => {
//   const result = await apiKeyUtils.refreshApiKey(req, database);

//   res.json(result);
//   res.end();
// });

// api.post('/verify', async (req, res) => {
//   const result = await apiKeyUtils.verifyApiKey(req, database);

//   res.json(result);
//   res.end();
// });

// api.post('/generate', (req, res) => {
//   generateData(req, res);
// });

api.use('/user', users);
api.use('/group', groups);

main.use('/api', api);
