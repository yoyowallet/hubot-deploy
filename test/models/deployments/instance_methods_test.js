/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
const Path = require("path");

const srcDir = Path.join(__dirname, "..", "..", "..", "src");

const {
  Version
} = require(Path.join(srcDir, "version"));
const {
  Deployment
} = require(Path.join(srcDir, "github", "api"));

describe("Deployment fixtures", function() {
  describe("#isValidApp()", function() {
    it("is invalid if the app can't be found", function() {
      const deployment = new Deployment("hubot-reloaded", "master", "deploy", "production", "", "");
      return assert.equal(deployment.isValidApp(), false);
    });

    return it("is valid if the app can be found", function() {
      const deployment = new Deployment("hubot-deploy", "master", "deploy", "production", "", "");
      return assert.equal(deployment.isValidApp(), true);
    });
  });

  describe("#isValidEnv()", function() {
    it("is invalid if the env can't be found", function() {
      const deployment = new Deployment("hubot", "master", "deploy", "garage", "", "");
      return assert.equal(deployment.isValidEnv(), false);
    });

    return it("is valid if the env can be found", function() {
      const deployment = new Deployment("hubot", "master", "deploy", "production", "", "");
      return assert.equal(deployment.isValidEnv(), true);
    });
  });

  describe("#requiredContexts", () => it("works with required contexts", function() {
    const deployment = new Deployment("hubot", "master", "deploy", "production", "", "");
    const expectedContexts = ["ci/janky", "ci/travis-ci"];

    return assert.deepEqual(expectedContexts, deployment.requiredContexts);
  }));

  describe("#isAllowedRoom()", function() {
    it("allows everything when there is no configuration", function() {
      const deployment = new Deployment("hubot", "master", "deploy", "production", "", "");
      return assert.equal(deployment.isAllowedRoom('anything'), true);
    });
    it("is allowed with room that is in configuration", function() {
      const deployment = new Deployment("restricted-app", "master", "deploy", "production", "", "");
      return assert.equal(deployment.isAllowedRoom('ops'), true);
    });
    return it("is not allowed with room that is not in configuration", function() {
      const deployment = new Deployment("restricted-app", "master", "deploy", "production", "", "");
      return assert.equal(deployment.isAllowedRoom('watercooler'), false);
    });
  });

  return describe("#requestBody()", function() {
    it("shouldn't blow up", function() {
      const deployment = new Deployment("hubot", "master", "deploy", "garage", "", "");
      deployment.requestBody();
      return assert.equal(true, true);
    });
    return it("should have the right description", function() {
      const deployment = new Deployment("hubot", "master", "deploy", "production", "", "");
      const body = deployment.requestBody();
      return assert.equal(body.description, `deploy on production from hubot-deploy-v${Version}`);
    });
  });
});


