/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
// Description
//   Enable deployments from chat that correctly attribute you as the creator - https://github.com/atmos/hubot-deploy
//
// Commands:
//   hubot deploy-token:set:github <token> - Sets your user's GitHub deployment token. Requires repo scope.
//   hubot deploy-token:reset:github - Resets your user's GitHub deployment token.
//   hubot deploy-token:verify:github - Verifies that your GitHub deployment token is valid.
//
const supported_tasks = [ `${DeployPrefix}-token` ];

const Path           = require("path");
const Patterns       = require(Path.join(__dirname, "..", "models", "patterns"));
const {
  Deployment
} = require(Path.join(__dirname, "..", "github", "api"));
var {
  DeployPrefix
} = Patterns;
const {
  DeployPattern
} = Patterns;
const {
  DeploysPattern
} = Patterns;

const Verifiers = require(Path.join(__dirname, "..", "models", "verifiers"));

const TokenForBrain    = Verifiers.VaultKey;
const {
  ApiTokenVerifier
} = Verifiers;
//##########################################################################
module.exports = function(robot) {
  if (process.env.HUBOT_DEPLOY_PRIVATE_MESSAGE_TOKEN_MANAGEMENT === "true") {
    robot.respond(new RegExp(`${DeployPrefix}-token:set:github\\s+(.*)`, 'i'), {id: "hubot-deploy.token.set"}, function(msg) {
      const user  = robot.brain.userForId(msg.envelope.user.id);
      const token = msg.match[1];

      // Versions of hubot-deploy < 0.9.0 stored things unencrypted, encrypt them.
      delete(user.githubDeployToken);

      const verifier = new ApiTokenVerifier(token);
      return verifier.valid(function(result) {
        if (result) {
          robot.vault.forUser(user).set(TokenForBrain, verifier.token);
          return msg.send("Your GitHub token is valid. I stored it for future use.");
        } else {
          return msg.send("Your GitHub token is invalid, verify that it has 'repo' scope.");
        }
      });
    });

    robot.respond(new RegExp(`${DeployPrefix}-token:reset:github$`, 'i'), {id: "hubot-deploy.token.reset"}, function(msg) {
      const user = robot.brain.userForId(msg.envelope.user.id);
      robot.vault.forUser(user).unset(TokenForBrain);
      // Versions of hubot-deploy < 0.9.0 stored things unencrypted, encrypt them.
      delete(user.githubDeployToken);
      return msg.reply("I nuked your GitHub token. I'll try to use my default token until you configure another.");
    });

    return robot.respond(new RegExp(`${DeployPrefix}-token:verify:github$`, 'i'), {id: "hubot-deploy.token.verify"},  function(msg) {
      const user = robot.brain.userForId(msg.envelope.user.id);
      // Versions of hubot-deploy < 0.9.0 stored things unencrypted, encrypt them.
      delete(user.githubDeployToken);
      const token = robot.vault.forUser(user).get(TokenForBrain);
      const verifier = new ApiTokenVerifier(token);
      return verifier.valid(function(result) {
        if (result) {
          return msg.send(`Your GitHub token is valid on ${verifier.config.hostname}.`);
        } else {
          return msg.send("Your GitHub token is invalid, verify that it has 'repo' scope.");
        }
      });
    });
  }
};
