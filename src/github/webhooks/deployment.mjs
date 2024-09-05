/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
const Fernet = require("fernet");

class Deployment {
  constructor(id, payload1) {
    let payload;
    this.id = id;
    this.payload = payload1;
    const {
      deployment
    } = this.payload;
    this.name        = this.payload.repository.name;
    this.repoName    = this.payload.repository.full_name;

    this.number      = deployment.id;
    this.sha         = deployment.sha.substring(0,7);
    this.ref         = deployment.ref;
    this.task        = deployment.task;
    this.environment = deployment.environment;

    if (process.env.HUBOT_DEPLOY_ENCRYPT_PAYLOAD && proccess.env.HUBOT_DEPLOY_FERNET_SECRETS) {
      const fernetSecret = new Fernet.Secret(process.env.HUBOT_DEPLOY_FERNET_SECRETS);
      const fernetToken  = new Fernet.Token({secret: fernetSecret, token: deployment.payload, ttl: 0});

      ({
        payload
      } = deployment);
      deployment.payload = fernetToken.decode(payload);
    }

    this.notify      = deployment.payload.notify;

    if ((this.notify != null) && (this.notify.user != null)) {
      this.actorName = this.notify.user;
    } else {
      this.actorName = deployment.creator.login;
    }

    if (deployment.payload.yubikey != null) {
      this.yubikey = deployment.payload.yubikey;
    }

    if (this.payload.deployment.sha === this.ref) {
      this.ref = this.sha;
    }
  }

  toSimpleString() {
    return `hubot-deploy: ${this.actorName}'s deployment #${this.number} of ${this.name}/${this.ref} to ${this.environment} requested.`;
  }
}

exports.Deployment = Deployment;

