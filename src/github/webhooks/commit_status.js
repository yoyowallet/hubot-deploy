/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
class CommitStatus {
  constructor(id, payload) {
    this.id = id;
    this.payload = payload;
    this.state       = this.payload.state;
    this.targetUrl   = this.payload.target_url;
    this.description = this.payload.description;
    this.context     = this.payload.context;
    this.ref         = this.payload.branches[0].name;
    this.sha         = this.payload.sha.substring(0,7);
    this.name        = this.payload.repository.name;
    this.repoName    = this.payload.repository.full_name;
  }

  toSimpleString() {
    let msg = `hubot-deploy: Build for ${this.name}/${this.ref} (${this.context}) `;
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

exports.CommitStatus = CommitStatus;
