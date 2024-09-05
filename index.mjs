/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
const Path = require('path');
const {
  Vault
} = require('./src/hubot/vault.mjs');

module.exports = function (robot, scripts) {
  robot.vault = {
    forUser(user) {
      return new Vault(user);
    }
  };

  robot.loadFile(Path.resolve(__dirname, "src", "scripts"), "http.mjs");
  robot.loadFile(Path.resolve(__dirname, "src", "scripts"), "token.mjs");
  return robot.loadFile(Path.resolve(__dirname, "src", "scripts"), "deploy.mjs");
};
