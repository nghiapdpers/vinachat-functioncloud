const { create } = require('./create');
const { add } = require('./add');
const { sendMessage } = require('./send');
const { getListChat } = require('./getListChat');
const { synchronousChat } = require('./synchronousChat');
const { updateLatestMessage } = require('./updateLatestMessage');
const { getDetailGroupChat } = require('./getDetail');

exports.create = create;
exports.add = add;
exports.sendMessage = sendMessage;
exports.getListChat = getListChat;
exports.synchronous = synchronousChat;
exports.updateLatestMessage = updateLatestMessage;
exports.getDetailGroupChat = getDetailGroupChat;
