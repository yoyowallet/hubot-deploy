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

describe("Setting tokens and such", function() {
  let user  = null;
  let robot = null;
  let adapter = null;

  beforeEach(function(done) {
    VCR.playback();
    process.env.HUBOT_DEPLOY_PRIVATE_MESSAGE_TOKEN_MANAGEMENT = "true";
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

  it("tells you when your provided GitHub token is invalid", function(done) {
    VCR.play("/user-invalid-auth");
    adapter.on("send", function(envelope, strings) {
      assert.match(strings[0], /Your GitHub token is invalid/);
      return done();
    });
    return adapter.receive(new TextMessage(user, "Hubot deploy-token:set:github 123456789"));
  });

  it("tells you when your provided GitHub token is valid", function(done) {
    VCR.play("/user-valid");
    const expectedResponse = /Your GitHub token is valid. I stored it for future use./;
    adapter.on("send", function(envelope, strings) {
      assert.match(strings[0], expectedResponse);
      assert(robot.vault.forUser(user).get(Verifiers.VaultKey));
      assert.equal(robot.vault.forUser(user).get(Verifiers.VaultKey), "123456789");
      return done();
    });
    return adapter.receive(new TextMessage(user, "Hubot deploy-token:set:github 123456789"));
  });

  it("tells you when your stored GitHub token is invalid", function(done) {
    VCR.play("/user-invalid-auth");
    robot.vault.forUser(user).set(Verifiers.VaultKey, "123456789");
    adapter.on("send", function(envelope, strings) {
      assert.match(strings[0], /Your GitHub token is invalid, verify that it has \'repo\' scope./);
      return done();
    });
    return adapter.receive(new TextMessage(user, "Hubot deploy-token:verify:github"));
  });

  return it("tells you when your stored GitHub token is valid", function(done) {
    VCR.play("/user-valid");
    robot.vault.forUser(user).set(Verifiers.VaultKey, "123456789");
    adapter.on("send", function(envelope, strings) {
      assert.match(strings[0], /Your GitHub token is valid on api.github.com./);
      return done();
    });
    return adapter.receive(new TextMessage(user, "Hubot deploy-token:verify:github"));
  });
});
