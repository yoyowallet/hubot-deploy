/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
const Fs   = require("fs");
const Path = require("path");

const srcDir = Path.join(__dirname, "..", "..", "..", "src");

const GitHubEvents     = require(Path.join(srcDir, "github", "webhooks"));
const {
  CommitStatus
} = GitHubEvents;

describe("GitHubEvents.CommitStatus fixtures", function() {
  const deploymentStatusFor = function(fixtureName) {
    let status;
    const fixtureData = Path.join(__dirname, "..", "..", "fixtures", "statuses", `${fixtureName}.json`);
    const fixturePayload = JSON.parse(Fs.readFileSync(fixtureData));
    return status = new CommitStatus("uuid", fixturePayload);
  };

  describe("pending", () => it("knows the status and repo", function() {
    const status = deploymentStatusFor("pending");
    assert.equal(status.state, "pending");
    assert.equal(status.repoName, "atmos/my-robot");
    return assert.equal(status.toSimpleString(), "hubot-deploy: Build for atmos/master (Janky (github)) is running. https://ci.atmos.org/1123112/output");
  }));

  describe("failure", () => it("knows the status and repo", function() {
    const status = deploymentStatusFor("failure");
    assert.equal(status.state, "failure");
    assert.equal(status.repoName, "atmos/my-robot");
    return assert.equal(status.toSimpleString(), "hubot-deploy: Build for my-robot/jroes-patch-4 (Janky (github)) failed. https://baller.com/target_stuff");
  }));

  return describe("success", () => it("knows the status and repo", function() {
    const status = deploymentStatusFor("success");
    assert.equal(status.state, "success");
    assert.equal(status.repoName, "atmos/my-robot");
    return assert.equal(status.toSimpleString(), "hubot-deploy: Build for github/master (Janky (github)) was successful. https://ci.atmos.org/1123112/output");
  }));
});
