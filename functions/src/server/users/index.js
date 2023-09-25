const { find } = require('./find');
const { login } = require('./login');
const { logout } = require('./logout');
const { register } = require('./register');
const { update } = require('./update');

exports.register = register;
exports.login = login;
exports.logout = logout;
exports.find = find;
exports.update = update;
