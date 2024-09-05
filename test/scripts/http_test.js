/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
const Path        = require("path");
const Robot       = require("hubot/src/robot");
const {
  TextMessage
} = require("hubot/src/message");

describe("Deployment Status HTTP Callbacks", function() {
  let user  = null;
  let robot = null;
  let adapter = null;

  beforeEach(function(done) {
    robot = new Robot(null, "mock-adapter", true, "Hubot");

    robot.adapter.on("connected", function() {
      process.env.HUBOT_DEPLOY_RANDOM_REPLY = "sup-dude";

      require("../../index")(robot);

      const userInfo = {
        name: "atmos",
        room: "#zf-promo"
      };

      user    = robot.brain.userForId("1", userInfo);
      ({
        adapter
      } = robot);

      return done();
    });

    return robot.run();
  });

  return afterEach(function() {
    robot.server.close();
    return robot.shutdown();
  });
});
