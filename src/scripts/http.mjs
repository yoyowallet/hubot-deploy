/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__, or convert again using --optional-chaining
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
// Description
//   Enable deployment statuses from the GitHub API
//
// Commands:
//

const Fs               = require("fs");
const Path             = require("path");
const Crypto           = require("crypto");

const GitHubEvents     = require(Path.join(__dirname, "..", "github", "webhooks"));
const {
  Push
} = GitHubEvents;
const {
  Deployment
} = GitHubEvents;
const {
  PullRequest
} = GitHubEvents;
const {
  DeploymentStatus
} = GitHubEvents;
const {
  CommitStatus
} = GitHubEvents;

const {
  DeployPrefix
} = require(Path.join(__dirname, "..", "models", "patterns"));

const GitHubSecret     = process.env.HUBOT_DEPLOY_WEBHOOK_SECRET;

const WebhookPrefix    = process.env.HUBOT_DEPLOY_WEBHOOK_PREFIX || "/hubot-deploy";

const supported_tasks       = [ `${DeployPrefix}-hooks:sync` ];

const Verifiers = require(Path.join(__dirname, "..", "models", "verifiers"));

const AppsJsonFile = process.env['HUBOT_DEPLOY_APPS_JSON'] || "apps.json";
const AppsJsonData = JSON.parse(Fs.readFileSync(AppsJsonFile));
//##########################################################################
module.exports = function(robot) {
  const ipVerifier = new Verifiers.GitHubWebHookIpVerifier;

  if (!process.env.HUBOT_DEPLOY_WEBHOOK_SECRET) { process.env.HUBOT_DEPLOY_WEBHOOK_SECRET = "459C1E17-AAA9-4ABF-9120-92E8385F9949"; }
  if (GitHubSecret) {
    robot.router.get(WebhookPrefix + "/apps", function(req, res) {
      const token = __guard__(req.headers['authorization'] != null ? req.headers['authorization'].match(/Bearer (.+){1,256}/) : undefined, x => x[1]);
      if (token === process.env["HUBOT_DEPLOY_WEBHOOK_SECRET"]) {
        res.writeHead(200, {'content-type': 'application/json' });
        return res.end(JSON.stringify(AppsJsonData));
      } else {
        res.writeHead(404, {'content-type': 'application/json' });
        return res.end(JSON.stringify({message: "Not Found"}));
      }
    });

    robot.router.post(WebhookPrefix + "/repos/:owner/:repo/messages", function(req, res) {
      const token = __guard__(req.headers['authorization'] != null ? req.headers['authorization'].match(/Bearer (.+){1,256}/) : undefined, x => x[1]);
      if (token === process.env["HUBOT_DEPLOY_WEBHOOK_SECRET"]) {
        const emission = {
          body: req.body,
          repo: req.params.repo,
          owner: req.params.owner
        };

        robot.emit("hubot_deploy_repo_message", emission);
        res.writeHead(202, {'content-type': 'application/json' });
        return res.end("{}");
      } else {
        res.writeHead(404, {'content-type': 'application/json' });
        return res.end(JSON.stringify({message: "Not Found"}));
      }
    });

    robot.router.post(WebhookPrefix + "/teams/:team/messages", function(req, res) {
      const token = __guard__(req.headers['authorization'] != null ? req.headers['authorization'].match(/Bearer (.+){1,256}/) : undefined, x => x[1]);
      if (token === process.env["HUBOT_DEPLOY_WEBHOOK_SECRET"]) {
        const emission = {
          team: req.params.team,
          body: req.body
        };

        robot.emit("hubot_deploy_team_message", emission);
        res.writeHead(202, {'content-type': 'application/json' });
        return res.end("{}");
      } else {
        res.writeHead(404, {'content-type': 'application/json' });
        return res.end(JSON.stringify({message: "Not Found"}));
      }
    });

    robot.router.get(WebhookPrefix + "/apps/:name", function(req, res) {
      try {
        const token = __guard__(req.headers['authorization'] != null ? req.headers['authorization'].match(/Bearer (.+){1,256}/) : undefined, x => x[1]);
        if (token !== process.env["HUBOT_DEPLOY_WEBHOOK_SECRET"]) {
          throw new Error("Bad auth headers");
        } else {
          const app = AppsJsonData[req.params["name"]];
          if (app != null) {
            res.writeHead(200, {'content-type': 'application/json' });
            return res.end(JSON.stringify(app));
          } else {
            throw new Error("App not found");
          }
        }
      } catch (error) {
        res.writeHead(404, {'content-type': 'application/json' });
        return res.end(JSON.stringify({message: "Not Found"}));
      }
    });

    return robot.router.post(WebhookPrefix, function(req, res) {
      try {
        const remoteIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        if (!ipVerifier.ipIsValid(remoteIp)) {
          res.writeHead(400, {'content-type': 'application/json' });
          return res.end(JSON.stringify({error: "Webhook requested from a non-GitHub IP address."}));
        }

        const payloadSignature = req.headers['x-hub-signature'];
        if (payloadSignature == null) {
          res.writeHead(400, {'content-type': 'application/json' });
          return res.end(JSON.stringify({error: "No GitHub payload signature headers present"}));
        }

        const expectedSignature = Crypto.createHmac("sha1", GitHubSecret).update(JSON.stringify(req.body)).digest("hex");
        if (payloadSignature === !`sha1=${expectedSignature}`) {
          res.writeHead(400, {'content-type': 'application/json' });
          return res.end(JSON.stringify({error: "X-Hub-Signature does not match blob signature"}));
        }

        const deliveryId = req.headers['x-github-delivery'];
        switch (req.headers['x-github-event']) {
          case "ping":
            res.writeHead(204, {'content-type': 'application/json' });
            return res.end(JSON.stringify({message: `Hello from ${robot.name}. :D`}));

          case "push":
            var push = new Push(deliveryId, req.body);

            robot.emit("github_push_event", push);

            res.writeHead(202, {'content-type': 'application/json' });
            return res.end(JSON.stringify({message: push.toSimpleString()}));

          case "deployment":
            var deployment = new Deployment(deliveryId, req.body);

            robot.emit("github_deployment_event", deployment);

            res.writeHead(202, {'content-type': 'application/json' });
            return res.end(JSON.stringify({message: deployment.toSimpleString()}));

          case "deployment_status":
            var status = new DeploymentStatus(deliveryId, req.body);

            robot.emit("github_deployment_status_event", status);

            res.writeHead(202, {'content-type': 'application/json' });
            return res.end(JSON.stringify({message: status.toSimpleString()}));

          case "status":
            status = new CommitStatus(deliveryId, req.body);

            robot.emit("github_commit_status_event", status);

            res.writeHead(202, {'content-type': 'application/json' });
            return res.end(JSON.stringify({message: status.toSimpleString()}));

          case "pull_request":
            var pullRequest = new PullRequest(deliveryId, req.body);

            robot.emit("github_pull_request", pullRequest);

            res.writeHead(202, {'content-type': 'application/json' });
            return res.end(JSON.stringify({message: pullRequest.toSimpleString()}));

          default:
            res.writeHead(204, {'content-type': 'application/json' });
            return res.end(JSON.stringify({message: "Received but not processed."}));
        }

      } catch (err) {
        robot.logger.error(err);
        res.writeHead(500, {'content-type': 'application/json' });
        return res.end(JSON.stringify({error: "Something went crazy processing the request."}));
      }
    });

  } else if (process.env.NODE_ENV === !"test") {
    robot.logger.error("You're using hubot-deploy without specifying the shared webhook secret");
    robot.logger.error("Take a second to learn about them: https://developer.github.com/webhooks/securing/");
    return robot.logger.error("Then set the HUBOT_DEPLOY_WEBHOOK_SECRET variable in the robot environment");
  }
};

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}