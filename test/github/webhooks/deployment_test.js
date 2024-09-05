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
  Deployment
} = GitHubEvents;
const {
  DeploymentStatus
} = GitHubEvents;

describe("GitHubEvents.DeploymentStatus fixtures", function() {
  const deploymentStatusFor = function(fixtureName) {
    let status;
    const fixtureData = Path.join(__dirname, "..", "..", "fixtures", "deployment_statuses", `${fixtureName}.json`);
    const fixturePayload = JSON.parse(Fs.readFileSync(fixtureData));
    return status = new DeploymentStatus("uuid", fixturePayload);
  };

  describe("pending", () => it("knows the statue and repo", function() {
    const status = deploymentStatusFor("pending");
    assert.equal(status.state, "pending");
    assert.equal(status.repoName, "atmos/my-robot");
    return assert.equal(status.toSimpleString(), "hubot-deploy: atmos\'s deployment #123456 of my-robot/break-up-notifiers to production is running. https://gist.github.com/fa77d9fb1fe41c3bb3a3ffb2c");
  }));

  describe("failure", () => it("knows the statue and repo", function() {
    const status = deploymentStatusFor("failure");
    assert.equal(status.state, "failure");
    assert.equal(status.repoName, "atmos/my-robot");
    return assert.equal(status.toSimpleString(), "hubot-deploy: atmos\'s deployment #123456 of my-robot/break-up-notifiers to production failed. https://gist.github.com/fa77d9fb1fe41c3bb3a3ffb2c");
  }));

  return describe("success", () => it("knows the statue and repo", function() {
    const status = deploymentStatusFor("success");
    assert.equal(status.state, "success");
    assert.equal(status.repoName, "atmos/my-robot");
    return assert.equal(status.toSimpleString(), "hubot-deploy: atmos\'s deployment #11627 of my-robot/break-up-notifiers to production was successful. https://gist.github.com/fa77d9fb1fe41c3bb3a3ffb2c");
  }));
});

describe("GitHubEvents.Deployment fixtures", function() {
  const deploymentFor = function(fixtureName) {
    const fixtureData = Path.join(__dirname, "..", "..", "fixtures", "deployments", `${fixtureName}.json`);
    const fixturePayload = JSON.parse(Fs.readFileSync(fixtureData));
    return new Deployment("uuid", fixturePayload);
  };

  describe("production", () => it("works", function() {
    const deployment = deploymentFor("production");
    assert.equal(deployment.number, 1875476);
    assert.equal(deployment.repoName, "atmos/my-robot");
    assert.equal(deployment.ref, "heroku");
    assert.equal(deployment.sha, "3c9f42c");
    assert.equal(deployment.name, "my-robot");
    assert.equal(deployment.environment, "production");
    assert.isDefined(deployment.notify);
    assert.isNotNull(deployment.notify);
    return assert.equal(deployment.toSimpleString(), "hubot-deploy: atmos\'s deployment #1875476 of my-robot/heroku to production requested.");
  }));

  return describe("staging", () => it("works", function() {
    const deployment = deploymentFor("staging");
    assert.equal(deployment.number, 1875476);
    assert.equal(deployment.name, "heaven");
    assert.equal(deployment.repoName, "atmos/heaven");
    assert.equal(deployment.ref, "heroku");
    assert.equal(deployment.sha, "3c9f42c");
    assert.equal(deployment.environment, "staging");
    assert.isDefined(deployment.notify);
    assert.isNotNull(deployment.notify);
    return assert.equal(deployment.toSimpleString(), "hubot-deploy: atmos\'s deployment #1875476 of heaven/heroku to staging requested.");
  }));
});
