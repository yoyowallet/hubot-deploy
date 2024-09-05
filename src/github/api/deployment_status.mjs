/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
const Path         = require("path");
const {
  Version
} = require(Path.join(__dirname, "..", "..", "version"));
const ScopedClient = require("scoped-http-client");

class DeploymentStatus {
  constructor(apiToken, repoName, number) {
    this.apiToken = apiToken;
    this.repoName = repoName;
    this.number = number;
    this.state       = undefined;
    this.targetUrl   = undefined;
    this.description = undefined;
  }

  postParams() {
    const data = {
      state: this.state,
      target_url: this.targetUrl,
      description: this.description
    };
    return JSON.stringify(data);
  }

  create(callback) {
    return ScopedClient.create("https://api.github.com").
      header("Accept", "application/vnd.github+json").
      header("User-Agent", `hubot-deploy-v${Version}`).
      header("Authorization", `token ${this.apiToken}`).
      path(`/repos/${this.repoName}/deployments/${this.number}/statuses`).
      post(this.postParams())((err, res, body) => callback(err, res, body));
  }
}

exports.DeploymentStatus = DeploymentStatus;
