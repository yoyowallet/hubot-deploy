/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
const Path = require('path');

const Patterns = require(Path.join(__dirname, "..", "..", "src", "models", "patterns"));

const {
  DeployPattern
} = Patterns;
const {
  DeploysPattern
} = Patterns;

describe("Patterns", function() {
  describe("DeployPattern", function() {
    it("rejects things that don't start with deploy", function() {
      assert(!"ping".match(DeployPattern));
      return assert(!"image me pugs".match(DeployPattern));
    });

    it("handles simple deployment", function() {
      const matches = "deploy hubot".match(DeployPattern);
      assert.equal("deploy",  matches[1], "incorrect task");
      assert.equal("hubot",   matches[3], "incorrect app name");
      assert.equal(undefined, matches[4], "incorrect branch");
      assert.equal(undefined, matches[5], "incorrect environment");
      return assert.equal(undefined, matches[6], "incorrect host specification");
    });

    it("handles ! operations", function() {
      const matches = "deploy! hubot".match(DeployPattern);
      assert.equal("deploy",  matches[1], "incorrect task");
      assert.equal("!",       matches[2], "incorrect task");
      assert.equal("hubot",   matches[3], "incorrect app name");
      assert.equal(undefined, matches[4], "incorrect branch");
      assert.equal(undefined, matches[5], "incorrect environment");
      return assert.equal(undefined, matches[6], "incorrect host specification");
    });

    it("handles custom tasks", function() {
      const matches = "deploy:migrate hubot".match(DeployPattern);
      assert.equal("deploy:migrate", matches[1], "incorrect task");
      assert.equal("hubot",          matches[3], "incorrect app name");
      assert.equal(undefined,        matches[4], "incorrect branch");
      assert.equal(undefined,        matches[5], "incorrect environment");
      return assert.equal(undefined,        matches[6], "incorrect host specification");
    });

    it("handles deploying branches", function() {
      const matches = "deploy hubot/mybranch to production".match(DeployPattern);
      assert.equal("deploy",      matches[1], "incorrect task");
      assert.equal("hubot",       matches[3], "incorrect app name");
      assert.equal("mybranch",    matches[4], "incorrect branch name");
      assert.equal("production",  matches[5], "incorrect environment name");
      return assert.equal(undefined,     matches[6], "incorrect branch name");
    });

    it("handles deploying to environments", function() {
      const matches = "deploy hubot to production".match(DeployPattern);
      assert.equal("deploy",      matches[1], "incorrect task");
      assert.equal("hubot",       matches[3], "incorrect app name");
      assert.equal(undefined,     matches[4], "incorrect branch name");
      assert.equal("production",  matches[5], "incorrect environment name");
      return assert.equal(undefined,     matches[6], "incorrect branch name");
    });

    it("handles environments with hosts", function() {
      const matches = "deploy hubot to production/fe".match(DeployPattern);
      assert.equal("deploy",      matches[1], "incorrect task");
      assert.equal("hubot",       matches[3], "incorrect app name");
      assert.equal(undefined,     matches[4], "incorrect branch name");
      assert.equal("production",  matches[5], "incorrect environment name");
      assert.equal("fe",          matches[6], "incorrect host name");
      return assert.equal(undefined,     matches[7], "incorrect yubikey pattern");
    });

    it("handles branch deploys with slashes and environments with hosts", function() {
      const matches = "deploy hubot/atmos/branch to production/fe".match(DeployPattern);
      assert.equal("deploy",       matches[1], "incorrect task");
      assert.equal("hubot",        matches[3], "incorrect app name");
      assert.equal("atmos/branch", matches[4], "incorrect branch name");
      assert.equal("production",   matches[5], "incorrect environment name");
      assert.equal("fe",           matches[6], "incorrect host name");
      return assert.equal(undefined,      matches[7], "incorrect yubikey pattern");
    });

    it("handles branch deploys with slashes and environments with hosts plus yubikeys", function() {
      const matches = "deploy hubot/atmos/branch to production/fe ccccccdlnncbtuevhdbctrccukdciveuclhbkvehbeve".match(DeployPattern);
      assert.equal("deploy",       matches[1], "incorrect task");
      assert.equal("hubot",        matches[3], "incorrect app name");
      assert.equal("atmos/branch", matches[4], "incorrect branch name");
      assert.equal("production",   matches[5], "incorrect environment name");
      assert.equal("fe",           matches[6], "incorrect host name");
      return assert.equal("ccccccdlnncbtuevhdbctrccukdciveuclhbkvehbeve", matches[7], "incorrect yubikey pattern");
    });

    it("handles branch deploys with slashes and environments with hosts plus 2fa keys", function() {
      const matches = "deploy hubot/atmos/branch to production/fe 123456".match(DeployPattern);
      assert.equal("deploy",       matches[1], "incorrect task");
      assert.equal("hubot",        matches[3], "incorrect app name");
      assert.equal("atmos/branch", matches[4], "incorrect branch name");
      assert.equal("production",   matches[5], "incorrect environment name");
      assert.equal("fe",           matches[6], "incorrect host name");
      return assert.equal("123456",       matches[7], "incorrect authenticator token");
    });

    it("doesn't match on malformed yubikeys", function() {
      const matches = "deploy hubot/atmos/branch to production/fe burgers".match(DeployPattern);
      return assert.equal(null, matches);
    });

    return it("does not match typos", function() {
      const matches = "deploy hubot/branch tos taging".match(DeployPattern);
      return assert.equal(matches, null);
    });
  });

  return describe("DeploysPattern", function() {
    it("rejects things that don't start with deploy", function() {
      assert(!"ping".match(DeploysPattern));
      return assert(!"image me pugs".match(DeploysPattern));
    });

    it("handles simple deploys listing", function() {
      const matches = "deploys hubot".match(DeploysPattern);
      assert.equal("deploys", matches[1], "incorrect task");
      assert.equal("hubot",   matches[2], "incorrect app name");
      assert.equal(undefined, matches[3], "incorrect branch");
      return assert.equal(undefined, matches[4], "incorrect environment");
    });

    it("handles deploys with environments", function() {
      const matches = "deploys hubot in production".match(DeploysPattern);
      assert.equal("deploys",     matches[1], "incorrect task");
      assert.equal("hubot",       matches[2], "incorrect app name");
      assert.equal(undefined,     matches[3], "incorrect branch name");
      return assert.equal("production",  matches[4], "incorrect environment name");
    });

    return it("handles deploys with branches", function() {
      const matches = "deploys hubot/mybranch to production".match(DeploysPattern);
      assert.equal("deploys",     matches[1], "incorrect task");
      assert.equal("hubot",       matches[2], "incorrect app name");
      assert.equal("mybranch",    matches[3], "incorrect branch name");
      return assert.equal("production",  matches[4], "incorrect environment name");
    });
  });
});
