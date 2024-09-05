/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
const fernet = require('fernet');

class Vault {
  constructor(user) {
    this.user = user;
    if (this.user != null) {
      this.user.vault || (this.user.vault = {});
    }
    this.vault = this.user.vault;
    this.secrets = this.getSecrets();
  }

  set(key, value) {
    const token = new fernet.Token({secret: this.currentSecret()});
    return this.vault[key] = token.encode(JSON.stringify(value));
  }

  get(key) {
    if (!this.vault[key]) { return undefined; }
    for (var secret of Array.from(this.secrets)) {
      var token = new fernet.Token({
        secret,
        token: this.vault[key],
        ttl: 0
      });
      try {
        var value = JSON.parse(token.decode());
        return value;
      } catch (error) {
        continue;
      }
    }
  }

  unset(key) {
    return delete this.vault[key];
  }

  currentSecret() {
    return this.secrets[0];
  }

  getSecrets() {
    if (process.env.HUBOT_DEPLOY_FERNET_SECRETS == null) {
      throw new Error("Please set a HUBOT_DEPLOY_FERNET_SECRETS string in the environment");
    }
    const fernetSecrets = process.env.HUBOT_DEPLOY_FERNET_SECRETS.split(",");
    return (Array.from(fernetSecrets).map((secret) => new fernet.Secret(secret)));
  }
}

exports.Vault = Vault;
