/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
const Url  = require("url");
const Path = require("path");
//##########################################################################
class GitHubApi {
  constructor(userToken, application) {
    this.userToken = userToken;
    this.application = application;
    this.token = this.apiToken();

    this.parsedApiUrl = Url.parse(this.apiUri());
    this.hostname     = this.parsedApiUrl.host;
  }

  apiUri() {
    return ((this.application != null) && this.application['github_api']) ||
      process.env.HUBOT_GITHUB_API ||
      'https://api.github.com';
  }

  apiToken() {
    return ((this.application != null) && this.application['github_token']) ||
      ((this.userToken != null) && this.userToken) ||
      process.env.HUBOT_GITHUB_TOKEN;
  }

  filterPaths() {
    let newArr;
    return newArr = this.pathParts().filter(word => word !== "");
  }

  pathParts() {
    return this.parsedApiUrl.path.split("/");
  }

  path(suffix) {
    if ((suffix != null ? suffix.length : undefined) > 0) {
      const parts = this.filterPaths();
      parts.push(suffix);
      return `/${parts.join('/')}`;
    } else {
      return this.parsedApiUrl.path;
    }
  }
}

exports.Api              = GitHubApi;
exports.Deployment       = require(Path.join(__dirname, "api", "deployment")).Deployment;
exports.DeploymentStatus = require(Path.join(__dirname, "api", "deployment_status")).DeploymentStatus;
