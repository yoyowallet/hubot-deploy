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

describe("Deploying from chat", function() {
  let user  = null;
  let robot = null;
  let adapter = null;

  beforeEach(function(done) {
    VCR.playback();
    if (!process.env.HUBOT_DEPLOY_FERNET_SECRETS) { process.env.HUBOT_DEPLOY_FERNET_SECRETS = "HSfTG4uWzw9whtlLEmNAzscHh96eHUFt3McvoWBXmHk="; }
    process.env.HUBOT_DEPLOY_EMIT_GITHUB_DEPLOYMENTS = true;
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
    delete(process.env.HUBOT_DEPLOY_DEFAULT_ENVIRONMENT);
    VCR.stop();
    robot.server.close();
    return robot.shutdown();
  });

  it("creates deployments when requested from chat", function(done) {
    VCR.play('/repos-atmos-hubot-deploy-deployment-production-create-success');
    robot.on("github_deployment", function(msg, deployment) {
      assert.equal("hubot-deploy", deployment.name);
      assert.equal("production", deployment.env);
      return done();
    });

    return adapter.receive(new TextMessage(user, "Hubot deploy hubot-deploy"));
  });

  return it("allows for the default environment to be overridden by an env var", function(done) {
    process.env.HUBOT_DEPLOY_DEFAULT_ENVIRONMENT = "staging";
    VCR.play('/repos-atmos-hubot-deploy-deployment-staging-create-success');
    robot.on("github_deployment", function(msg, deployment) {
      assert.equal("hubot-deploy", deployment.name);
      assert.equal("staging", deployment.env);
      return done();
    });

    return adapter.receive(new TextMessage(user, "Hubot deploy hubot-deploy"));
  });
});
