/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
const Path         = require("path");
const Octonode     = require("octonode");
const {
  Address4
} = require("ip-address");
const GitHubApi    = require(Path.join(__dirname, "..", "github", "api")).Api;
const ScopedClient = require("scoped-http-client");
//##########################################################################

const VaultKey = "hubot-deploy-github-secret";

class ApiTokenVerifier {
  constructor(token) {
    this.token = token != null ? token.trim() : undefined;

    this.config = new GitHubApi(this.token, null);

    let {
      hostname
    } = this.config;
    const path = this.config.path();

    if (path !== "/") {
      hostname += path;
    }

    this.api   = Octonode.client(this.config.token, {hostname});
  }

  valid(cb) {
    return this.api.get("/user", function(err, status, data, headers) {
      const scopes = headers != null ? headers['x-oauth-scopes'] : undefined;
      if ((scopes != null ? scopes.indexOf('repo') : undefined) >= 0) {
        return cb(true);
      } else {
        return cb(false);
      }
    });
  }
}

class GitHubWebHookIpVerifier {
  constructor() {
    const gitHubSubnets = process.env.HUBOT_DEPLOY_GITHUB_SUBNETS || "192.30.252.0/22";
    this.subnets = (Array.from(gitHubSubnets.split(',')).map((subnet) => new Address4(subnet.trim())));
  }

  ipIsValid(ipAddress) {
    const address = new Address4(`${ipAddress}/24`);
    for (var subnet of Array.from(this.subnets)) {
      if (address.isInSubnet(subnet)) { return true; }
    }
    return false;
  }
}

class GitHubTokenVerifier {
  constructor(token) {
    this.token = token != null ? token.trim() : undefined;
  }

  valid(cb) {
    if (typeof token === 'undefined' || token === null) { return cb(false); }
    return ScopedClient.create("https://api.github.com").
      header("User-Agent", "hubot-deploy/0.13.1").
      header("Authorization", `token ${this.token}`).
      path("/user").
      get()(function(err, res, body) {
        const scopes = res.headers != null ? res.headers['x-oauth-scopes'] : undefined;
        if (err) {
          return cb(false);
        } else if (res.statusCode !== 200) {
          return cb(false);
        } else if ((scopes != null ? scopes.indexOf("repo") : undefined) < 0) {
          return cb(false);
        } else {
          const user = JSON.parse(body);
          return cb(user);
        }
    });
  }
}

class HerokuTokenVerifier {
  constructor(token) {
    this.token = token != null ? token.trim() : undefined;
  }

  valid(cb) {
    if (typeof token === 'undefined' || token === null) { return cb(false); }
    return ScopedClient.create("https://api.heroku.com").
      header("Accept", "application/vnd.heroku+json; version=3").
      header("Authorization", `Bearer ${this.token}`).
      path("/account").
      get()(function(err, res, body) {
        if (err) {
          return cb(false);
        } else if (res.statusCode !== 200) {
          return cb(false);
        } else {
          const user = JSON.parse(body);
          return cb(user);
        }
    });
  }
}

exports.VaultKey                 = VaultKey;
exports.ApiTokenVerifier         = ApiTokenVerifier;
exports.GitHubTokenVerifier      = GitHubTokenVerifier;
exports.HerokuTokenVerifier      = HerokuTokenVerifier;
exports.GitHubWebHookIpVerifier  = GitHubWebHookIpVerifier;
