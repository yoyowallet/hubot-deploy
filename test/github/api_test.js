/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
const Path = require('path');

const GitHubApi = require(Path.join(__dirname, "..", "..", "src", "github", "api"));

describe("GitHubApi", function() {
  describe("defaults", function() {
    const apiConfig = new GitHubApi.Api("xxx", null);

    it("fetches the GitHub API token provided", () => assert.equal("xxx", apiConfig.token));
    it("defaults to api.github.com", () => assert.equal("api.github.com", apiConfig.hostname));
    it("handles no path suffix requests", () => assert.equal("/", apiConfig.path("")));
    return it("handles path suffixes", () => assert.equal("/repos/atmos/heaven/deployments", apiConfig.path("repos/atmos/heaven/deployments")));
  });

  return describe("custom application and enterprise url", function() {
    let application;
    const config =
      (application = {
        github_api:   "https://enterprise.mycompany.com/api/v3/",
        github_token: "yyy"
      });
    const apiConfig = new GitHubApi.Api("xxx", application);

    it("fetches the custom GitHub API token", () => assert.equal("yyy", apiConfig.token));
    it("uses the application api_url field for hostname", () => assert.equal("enterprise.mycompany.com", apiConfig.hostname));
    it("handles no path suffix requests", () => assert.equal("/api/v3/", apiConfig.path("")));
    return it("handles path suffixes", () => assert.equal("/api/v3/repos/atmos/heaven/deployments", apiConfig.path("repos/atmos/heaven/deployments")));
  });
});

