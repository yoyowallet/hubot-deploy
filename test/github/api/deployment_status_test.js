/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
const Fs   = require("fs");
const Path = require("path");

const GitHubRequests   = require(Path.join(__dirname, "..", "..", "..", "src", "github", "api"));
const {
  DeploymentStatus
} = GitHubRequests;

describe("GitHubRequests.GitHubDeploymentStatus", () => describe("basic variables", function() {
  it("knows the state and repo", function() {
    const status = new DeploymentStatus("token", "atmos/hubot-deploy", "42");
    status.targetUrl = "https://gist.github.com/my-sweet-gist";
    status.description = "Deploying from chat, wooo";
    status.state = "success";

    assert.equal("42", status.number);
    assert.equal("token", status.apiToken);
    assert.equal("atmos/hubot-deploy", status.repoName);
    return assert.equal("success", status.state);
  });

  return it("posts well formed parameters", function() {
    const status = new DeploymentStatus("token", "atmos/hubot-deploy", "42");
    status.targetUrl = "https://gist.github.com/my-sweet-gist";
    status.description = "Deploying from chat, wooo";
    status.state = "success";

    const postParams = {
      state: status.state,
      target_url: status.targetUrl,
      description: status.description
    };

    return assert.equal(JSON.stringify(postParams), status.postParams());
  });
}));
