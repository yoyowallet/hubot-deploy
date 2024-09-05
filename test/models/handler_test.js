/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
const Fs            = require("fs");
const VCR           = require("ys-vcr");
const Path          = require('path');
const Robot         = require("hubot/src/robot");
const {
  TextMessage
} = require("hubot/src/message");
const GitHubEvents  = require(Path.join(__dirname, "..", "..", "src", "github", "webhooks"));
const {
  Deployment
} = GitHubEvents;

const Handler = require(Path.join(__dirname, "..", "..", "src", "models", "handler"));

describe("Deployment Handlers", function() {
  let user = null;
  let robot = null;
  let adapter = null;
  let deployment = null;

  beforeEach(function(done) {
    VCR.playback();
    if (!process.env.HUBOT_DEPLOY_FERNET_SECRETS) { process.env.HUBOT_DEPLOY_FERNET_SECRETS = "HSfTG4uWzw9whtlLEmNAzscHh96eHUFt3McvoWBXmHk="; }
    process.env.HUBOT_DEPLOY_EMIT_GITHUB_DEPLOYMENTS = true;
    robot = new Robot(null, "mock-adapter", true, "hubot");

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

  const deploymentFixtureFor = function(fixtureName) {
    const fixtureData = Path.join(__dirname, "..", "..", "test", "fixtures", "deployments", `${fixtureName}.json`);
    return JSON.parse(Fs.readFileSync(fixtureData));
  };

  it("only responds to the currently running bot name", function(done) {
    const fixturePayload = deploymentFixtureFor("production");
    fixturePayload.deployment.payload.robotName = "evilbot";
    deployment = new Deployment("uuid", fixturePayload);

    const handler = new Handler.Handler(robot, deployment);
    return handler.run(function(err, handler) {
      assert.equal(err.message, "Received request for unintended robot evilbot.");
      return done();
    });
  });

  it("ignores deployments that have no notify attrs in their payload", function(done) {
    const fixturePayload = deploymentFixtureFor("production");
    delete fixturePayload.deployment.payload.notify;
    deployment = new Deployment("uuid", fixturePayload);

    const handler = new Handler.Handler(robot, deployment);
    return handler.run(function(err, handler) {
      assert.equal(err.message, "Not deploying atmos/my-robot/heroku to production. Not chat initiated.");
      return done();
    });
  });

  return it("dispatches to specific providers", function(done) {
    const fixturePayload = deploymentFixtureFor("production");
    deployment = new Deployment("uuid", fixturePayload);

    const handler = new Handler.Handler(robot, deployment);
    return handler.run(function(err, handler) {
      if (err) { throw err; }
      assert.equal("heroku",  handler.provider);
      assert.equal("heroku",  handler.ref);
      assert.equal("3c9f42c", handler.sha);
      assert.equal("1875476", handler.number);
      assert.equal("production", handler.environment);
      assert.equal("atmos/my-robot", handler.repoName);
      return done();
    });
  });
});
