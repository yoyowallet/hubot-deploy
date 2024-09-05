/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
const Path = require("path");

const {
  Version
} = require(Path.join(__dirname, "..", "..", "..", "src", "version"));
const {
  Deployment
} = require(Path.join(__dirname, "..", "..", "..", "src", "github", "api"));

describe("Deployment fixtures", function() {
  describe("#autoMerge", () => it("works with auto-merging", function() {
    const deployment = new Deployment("hubot", "master", "deploy", "production", "", "");
    return assert.equal(false, deployment.autoMerge);
  }));

  return describe("#api", function() {
    context("with no ca file", () => it("doesnt set agentOptions", function() {
      const deployment = new Deployment("hubot", "master", "deploy", "production", "", "");
      const api = deployment.api();
      return assert.equal(api.requestDefaults.agentOptions, null);
    }));

    return context("with ca file", () => it("sets agentOptions.ca", function() {
      process.env.HUBOT_CA_FILE = Path.join(__dirname, "..", "..", "fixtures", "cafile.txt");
      const deployment = new Deployment("hubot", "master", "deploy", "production", "", "");
      const api = deployment.api();
      return assert(api.requestDefaults.agentOptions.ca);
    }));
  });
});

  //describe "#latest()", () ->
  //  it "fetches the latest deployments", (done) ->
  //    deployment = new Deployment("hubot")
  //    deployment.latest (deployments) ->
  //      done()

  //describe "#post()", () ->
  //  it "404s with a handy message", (done) ->
  //    failureMessage = "Unable to create deployments for github/github. Check your scopes for this token."
  //    deployment = new Deployment("github", "master", "deploy", "garage", "", "")
  //    deployment.post (responseMessage) ->
  //      assert.equal(responseMessage, failureMessage)
  //      done()
