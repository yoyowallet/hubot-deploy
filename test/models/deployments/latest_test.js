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

describe("Deployment#latest", function() {
  beforeEach(() => VCR.playback());
  afterEach(() => VCR.stop());

  it("gets the latest deployments from the api", function(done) {
    VCR.play('/github-deployments-latest-production-success');
    const deployment = new Deployment("hubot-deploy", "master", "deploy", "production", "", "");
    return deployment.latest(function(err, deployments) {
      if (err) { throw err; }
      assert.equal("hubot-deploy", deployment.name);
      assert.equal("production", deployment.env);
      assert.equal(2, deployments.length);
      return done();
    });
  });

  return it("gets the latest deployments from the api", function(done) {
    VCR.play('/github-deployments-latest-staging-success');
    const deployment = new Deployment("hubot-deploy", "master", "deploy", "staging", "", "");
    return deployment.latest(function(err, deployments) {
      if (err) { throw err; }
      assert.equal("hubot-deploy", deployment.name);
      assert.equal("staging", deployment.env);
      assert.equal(2, deployments.length);
      return done();
    });
  });
});

