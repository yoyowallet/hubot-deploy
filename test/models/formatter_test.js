/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
const Path = require('path');

const {
  Deployment
} = require(Path.join(__dirname, "..", "..", "src", "github", "api"));
const Formatter  = require(Path.join(__dirname, "..", "..", "src", "models", "formatters"));

describe("Formatter", function() {
  describe("LatestFormatter", () => it("displays recent deployments", function() {
    const deployment = new Deployment("hubot", null, null, "production");
    const deployments = require(Path.join(__dirname, "..", "fixtures", "deployments"));
    const formatter = new Formatter.LatestFormatter(deployment, deployments);

    const message = formatter.message();

    assert.match(message, /Recent production Deployments for hubot/im);
    assert.match(message, /atmos           \| master\(8efb8c88\)\s+\| (.*) 2014-06-13T20:55:21Z/);
    assert.match(message, /atmos           \| 8efb8c88\(auto-deploy\)\s+\| (.*) 2014-06-13T20:52:13Z/);
    return assert.match(message, /atmos           \| master\(ffcabfea\)\s+\| (.*) 2014-06-11T22:47:34Z/);
  }));

  return describe("WhereFormatter", () => it("displays deployment environments", function() {
    const deployment = new Deployment("hubot", null, null, "production");
    const deployments = require(Path.join(__dirname, "..", "fixtures", "deployments"));
    const formatter = new Formatter.WhereFormatter(deployment);

    const message = formatter.message();

    assert.match(message, /Environments for hubot/im);
    assert.match(message, /production/im);
    return assert.notMatch(message, /staging/im);
  }));
});
