/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
const VCR           = require("ys-vcr");
const Path          = require("path");
const Robot         = require("hubot/src/robot");
const {
  TextMessage
} = require("hubot/src/message");
const Verifiers     = require(Path.join(__dirname, "..", "..", "src", "models", "verifiers"));

describe("Latest deployments", function() {
  let user  = null;
  let robot = null;
  let adapter = null;

  beforeEach(function(done) {
    VCR.playback();
    if (!process.env.HUBOT_DEPLOY_FERNET_SECRETS) { process.env.HUBOT_DEPLOY_FERNET_SECRETS = "HSfTG4uWzw9whtlLEmNAzscHh96eHUFt3McvoWBXmHk="; }
    robot = new Robot(null, "mock-adapter", true, "Hubot");

    robot.adapter.on("connected", function() {
      require("../../index")(robot);

      const userInfo = {
        name: "atmos",
        room: "#my-room"
      };

      user    = robot.brain.userForId("1", userInfo);
      ({
        adapter
      } = robot);

      return done();
    });

    return robot.run();
  });

  afterEach(function() {
    VCR.stop();
    robot.server.close();
    return robot.shutdown();
  });

  it("tells you the latest production deploys", function(done) {
    VCR.play('/github-deployments-latest-production-success');
    robot.on("hubot_deploy_recent_deployments", function(msg, deployment, deployments, formatter) {
      assert.equal("hubot-deploy", deployment.name);
      assert.equal("production", deployment.env);
      assert.equal(2, deployments.length);
      return done();
    });

    return adapter.receive(new TextMessage(user, "Hubot deploys hubot-deploy in production"));
  });

  return it("tells you the latest staging deploys", function(done) {
    VCR.play('/github-deployments-latest-staging-success');
    robot.on("hubot_deploy_recent_deployments", function(msg, deployment, deployments, formatter) {
      assert.equal("hubot-deploy", deployment.name);
      assert.equal("staging", deployment.env);
      assert.equal(2, deployments.length);
      return done();
    });

    return adapter.receive(new TextMessage(user, "Hubot deploys hubot-deploy in staging"));
  });
});
