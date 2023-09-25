// The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
const functions = require('firebase-functions/v1');

// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
admin.initializeApp();
const express = require('express');

const userActions = require('./src/server/users/index');
const apiKeyUtils = require('./src/utils/apiKey/index');

const database = admin.database();
const firestore = admin.firestore();
const auth = admin.auth();

const app = express();
const main = express();

app.post('/login', async (req, res) => {
  userActions.login(req, res, firestore, database, auth);
});

app.post('/register', async (req, res) => {
  userActions.register(req, res, firestore, database);
});

app.post('/logout', async (req, res) => {
  userActions.logout(req, res, database);
});

app.post('/search', async (req, res) => {
  userActions.find(req, res, firestore, database);
});

app.post('/update', async (req, res) => {
  userActions.update(req, res, firestore, database);
});

// chức năng chỉ để test - only for test
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

main.use('/api', app);

exports.api = functions.https.onRequest(main);
