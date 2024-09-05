/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
const Fs   = require("fs");
const Path = require("path");

const srcDir = Path.join(__dirname, "..", "..", "..", "src");

const GitHubEvents     = require(Path.join(srcDir, "github", "webhooks"));

describe("GitHubEvents.Push fixtures", function() {
  const pushFor = function(fixtureName) {
    let push;
    const fixtureData = Path.join(__dirname, "..", "..", "fixtures", "pushes", `${fixtureName}.json`);
    const fixturePayload = JSON.parse(Fs.readFileSync(fixtureData));
    return push = new GitHubEvents.Push("uuid", fixturePayload);
  };

  describe("single commit", () => it("knows the state and repo", function(done) {
    const push = pushFor("single");
    const message = "hubot-deploy: atmos pushed a commit";
    assert.equal(message, push.toSimpleString());
    const summaryMessage = "[hubot-deploy] atmos pushed 1 new commit to changes";
    assert.equal(summaryMessage, push.summaryMessage());
    const actorLink = "<a href=\"https://github.com/atmos\">atmos</a>";
    assert.equal(actorLink, push.actorLink);
    const branchUrl = "https://github.com/atmos/hubot-deploy/commits/changes";
    assert.equal(branchUrl, push.branchUrl);
    const firstMessage = "- Update README.md - atmos - (<a href=\"https://github.com/atmos/hubot-deploy/commit/0d1a26e6\">0d1a26e6</a>)";
    assert.equal(firstMessage, push.firstMessage);
    const summaryUrl = "https://github.com/atmos/hubot-deploy/commit/0d1a26e67d8f5eaf1f6ba5c57fc3c7d91ac0fd1c";
    assert.equal(summaryUrl, push.summaryUrl());
    return done();
  }));

  return describe("multiple commits", () => it("knows the state and repo", function(done) {
    const push = pushFor("multiple");
    const message = "hubot-deploy: atmos pushed 3 commits";
    assert.equal(message, push.toSimpleString());
    const summaryMessage = "[hubot-deploy] atmos pushed 3 new commits to master";
    assert.equal(summaryMessage, push.summaryMessage());
    const summaryUrl = "http://github.com/atmos/hubot-deploy/compare/4c8124f...a47fd41";
    assert.equal(summaryUrl, push.summaryUrl());
    return done();
  }));
});
