/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
class PullRequest {
  constructor(id, payload) {
    this.id = id;
    this.payload = payload;
    this.name        = this.payload.repository.name;
    this.actor       = this.payload.sender.login;
    this.title       = this.payload.pull_request.title;
    this.branch      = this.payload.pull_request.head.ref;
    this.state       = this.payload.pull_request.state;
    this.merged      = this.payload.pull_request.merged;
    this.action      = this.payload.action;
    this.number      = this.payload.number;
    this.repoName    = this.payload.repository.full_name;
  }

  toSimpleString() {
    return `hubot-deploy: ${this.actor} ${this.action} pull request #${this.number}: ${this.branch} ` +
      `https://github.com/${this.repoName}/pull/${this.number}/files`;
  }
}

exports.PullRequest = PullRequest;
