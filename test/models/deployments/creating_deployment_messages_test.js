/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
const VCR  = require("ys-vcr");
const Path = require("path");

const srcDir = Path.join(__dirname, "..", "..", "..", "src");

const {
  Version
} = require(Path.join(srcDir, "version"));
const {
  Deployment
} = require(Path.join(srcDir, "github", "api"));

describe("Deployment#post", function() {
  beforeEach(() => VCR.playback());
  afterEach(() => VCR.stop());

  it("does not create a deployment due to bad authentication", function(done) {
    VCR.play('/repos-atmos-hubot-deploy-deployment-production-create-bad-auth');
    const deployment = new Deployment("hubot-deploy", "master", "deploy", "production", "", "");
    return deployment.post(function(err, status, body, headers, message) {
      if (!err) {
        throw new Error("Should've thrown bad auth");
      }

      assert.equal("Bad credentials", err.message);
      assert.equal(401, err.statusCode);
      assert.equal("Bad credentials", message);
      return done();
    });
  });

  it("does not create a deployment due to missing required commit statuses", function(done) {
    VCR.play('/repos-atmos-hubot-deploy-deployment-production-create-required-status-missing');
    const deployment = new Deployment("hubot-deploy", "master", "deploy", "production", "", "");
    return deployment.post(function(err, status, body, headers, message) {
      if (err) { throw err; }
      assert.equal(409, status);
      assert.equal("Conflict: Commit status checks failed for master", body.message);
      assert.equal("Unmet required commit status contexts for hubot-deploy: continuous-integration/travis-ci/push failed.", message);
      return done();
    });
  });

  it("does not create a deployment due to failing required commit statuses", function(done) {
    VCR.play('/repos-atmos-hubot-deploy-deployment-production-create-required-status-failing');
    const deployment = new Deployment("hubot-deploy", "master", "deploy", "production", "", "");
    return deployment.post(function(err, status, body, headers, message) {
      if (err) { throw err; }
      assert.equal(409, status);
      assert.equal("Conflict: Commit status checks failed for master", body.message);
      assert.equal("continuous-integration/travis-ci/push", body.errors[0].contexts[0].context);
      assert.equal("code-climate", body.errors[0].contexts[1].context);
      assert.equal("Unmet required commit status contexts for hubot-deploy: continuous-integration/travis-ci/push,code-climate failed.", message);
      return done();
    });
  });

  it("sometimes can't auto-merge  when the requested ref is behind the default branch", function(done) {
    VCR.play('/repos-atmos-hubot-deploy-deployment-production-create-auto-merged-failed');
    const deployment = new Deployment("hubot-deploy", "topic", "deploy", "production", "", "");
    return deployment.post(function(err, status, body, headers, message) {
      if (err) { throw err; }
      assert.equal(409, status);
      assert.equal("Conflict merging master into topic.", body.message);
      assert.equal("Conflict merging master into topic.", message);
      return done();
    });
  });

  it("successfully auto-merges when the requested ref is behind the default branch", function(done) {
    VCR.play('/repos-atmos-hubot-deploy-deployment-production-create-auto-merged');
    const deployment = new Deployment("hubot-deploy", "topic", "deploy", "production", "", "");
    return deployment.post(function(err, status, body, headers, message) {
      if (err) { throw err; }
      assert.equal(202, status);
      assert.equal("Auto-merged master into topic on deployment.", body.message);
      assert.equal("Auto-merged master into topic on deployment.", message);
      return done();
    });
  });

  return it("successfully created deployment", function(done) {
    VCR.play('/repos-atmos-hubot-deploy-deployment-production-create-success');
    const deployment = new Deployment("hubot-deploy", "master", "deploy", "production", "", "");
    return deployment.post(function(err, status, body, headers, message) {
      if (err) { throw err; }
      assert.equal(201, status);
      assert.equal("deploy", body.deployment.task);
      assert.equal("production", body.deployment.environment);
      assert.equal(undefined, message);
      return done();
    });
  });
});
