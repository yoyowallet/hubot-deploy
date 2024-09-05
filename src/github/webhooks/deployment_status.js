/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__, or convert again using --optional-chaining
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
class DeploymentStatus {
  constructor(id, payload) {
    this.id = id;
    this.payload = payload;
    const {
      deployment
    } = this.payload;
    this.name        = __guard__(deployment != null ? deployment.payload : undefined, x => x.name) || this.payload.repository.name;
    this.repoName    = this.payload.repository.full_name;

    this.number      = deployment.id;
    this.sha         = deployment.sha.substring(0,7);
    this.ref         = deployment.ref;
    this.environment = deployment.environment;
    this.notify      = deployment.payload.notify;
    if ((this.notify != null) && (this.notify.user != null)) {
      this.actorName = this.notify.user;
    } else {
      this.actorName = deployment.creator.login;
    }

    const {
      deployment_status
    } = this.payload;
    this.state       = deployment_status.state;
    this.targetUrl   = deployment_status.target_url;
    this.description = deployment_status.description;

    if (deployment.sha === this.ref) {
      this.ref = this.sha;
    }
  }

  toSimpleString() {
    let msg = `hubot-deploy: ${this.actorName}'s deployment #${this.number} of ${this.name}/${this.ref} to ${this.environment} `;
    switch (this.state) {
      case "success":
        msg += "was successful.";
        break;
      case "failure": case "error":
        msg += "failed.";
        break;
      default:
        msg += "is running.";
    }

    if (this.targetUrl != null) {
      msg += " " + this.targetUrl;
    }

    return msg;
  }
}

exports.DeploymentStatus = DeploymentStatus;

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}