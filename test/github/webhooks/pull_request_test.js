/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
const Fs   = require("fs");
const Path = require("path");

const srcDir = Path.join(__dirname, "..", "..", "..", "src");

const GitHubEvents = require(Path.join(srcDir, "github", "webhooks"));
const {
  PullRequest
} = GitHubEvents;

describe("GitHubEvents.PullRequest fixtures", function() {
  const pullRequestFor = function(fixtureName) {
    let status;
    const fixtureData = Path.join(__dirname, "..", "..", "fixtures", "pull_requests", `pull_request_${fixtureName}.json`);
    const fixturePayload = JSON.parse(Fs.readFileSync(fixtureData));
    return status = new PullRequest("uuid", fixturePayload);
  };

  describe("opened", () => it("knows the state, number, and repo", function() {
    const pullRequest = pullRequestFor("opened");
    assert.equal(32, pullRequest.number);
    assert.equal("open", pullRequest.state);
    assert.equal("hubot-deploy", pullRequest.name);
    return assert.equal("atmos/hubot-deploy", pullRequest.repoName);
  }));

  describe("merged", () => it("knows the state, number, and repo", function() {
    const pullRequest = pullRequestFor("merged");
    assert.equal(32, pullRequest.number);
    assert.equal("closed", pullRequest.state);
    assert.equal("hubot-deploy", pullRequest.name);
    return assert.equal("atmos/hubot-deploy", pullRequest.repoName);
  }));

  describe("closed", () => it("knows the state, number, and repo", function() {
    const pullRequest = pullRequestFor("closed");
    assert.equal(32, pullRequest.number);
    assert.equal("closed", pullRequest.state);
    assert.equal("hubot-deploy", pullRequest.name);
    return assert.equal("atmos/hubot-deploy", pullRequest.repoName);
  }));

  describe("reopened", () => it("knows the state, number, and repo", function() {
    const pullRequest = pullRequestFor("reopened");
    assert.equal(32, pullRequest.number);
    assert.equal("open", pullRequest.state);
    assert.equal("hubot-deploy", pullRequest.name);
    return assert.equal("atmos/hubot-deploy", pullRequest.repoName);
  }));

  describe("synchronize", () => it("knows the state, number, and repo", function() {
    const pullRequest = pullRequestFor("reopened");
    assert.equal(32, pullRequest.number);
    assert.equal("open", pullRequest.state);
    assert.equal("hubot-deploy", pullRequest.name);
    return assert.equal("atmos/hubot-deploy", pullRequest.repoName);
  }));

  return describe("toSimpleString", () => it("works", function() {
    const pullRequest = pullRequestFor("reopened");
    assert.equal(32, pullRequest.number);
    assert.equal("open", pullRequest.state);
    assert.equal("hubot-deploy", pullRequest.name);
    assert.equal("atmos/hubot-deploy", pullRequest.repoName);
    const expectedOutput = "hubot-deploy: atmos reopened pull request #32: webhooks-events-generator " +
                     "https://github.com/atmos/hubot-deploy/pull/32/files";
    return assert.equal(pullRequest.toSimpleString(), expectedOutput);
  }));
});
