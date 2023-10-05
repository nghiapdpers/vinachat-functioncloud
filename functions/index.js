// The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
const functions = require('firebase-functions/v1');

// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
admin.initializeApp();
const express = require('express');

const userActions = require('./src/server/users/index');
const groupActions = require('./src/server/groups/index');
const apiKeyUtils = require('./src/utils/apiKey/index');
const { generateData } = require('./src/server/test/generate');

const database = admin.database();
const firestore = admin.firestore();
const auth = admin.auth();

const main = express();
const app = express();
const users = express();
const groups = express();

//
// -----------------USER--------------------
//
users.post('/login', async (req, res) => {
  userActions.login(req, res, firestore, database, auth);
});

users.post('/loginWithExternal', async (req, res) => {
  userActions.loginWithExternal(req, res, firestore, database, auth);
});

users.post('/register', async (req, res) => {
  userActions.register(req, res, firestore, database);
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

//
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

//
// chức năng chỉ để test - only for test
//
app.post('/refresh', async (req, res) => {
  const result = await apiKeyUtils.refreshApiKey(req, database);

  res.json(result);
  res.end();
});

app.post('/verify', async (req, res) => {
  const result = await apiKeyUtils.verifyApiKey(req, database);

  res.json(result);
  res.end();
});

app.post('/generate', async (req, res) => {
  await generateData(req);
  res.end();
});

app.use('/user', users);
app.use('/group', groups);

main.use('/api', app);

exports.api = functions.https.onRequest(main);
