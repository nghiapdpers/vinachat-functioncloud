const { find } = require('./find');
const { login } = require('./login');
const { logout } = require('./logout');
const { register } = require('./register');
const { update } = require('./update');
const { loginWithExternal } = require('./loginWithExternal');
const { requestFriend } = require('./requestFriend');
const { getRequestList } = require('./getRequestList');
const { replyRequest } = require('./replyRequest');
const { getFriendList } = require('./getFriendList');
const { getGroupChat } = require('./getGroupChat');
const { getDetail } = require('./getDetail');
const { changePassword } = require('./changePassword');

exports.register = register;
exports.login = login;
exports.logout = logout;
exports.find = find;
exports.update = update;
exports.loginWithExternal = loginWithExternal;
exports.requestFriend = requestFriend;
exports.getRequestList = getRequestList;
exports.replyRequest = replyRequest;
exports.getFriendList = getFriendList;
exports.getGroupChat = getGroupChat;
exports.getDetail = getDetail;
exports.changePassword = changePassword;
