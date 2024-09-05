/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
// Description
//   Cut GitHub deployments from chat that deploy via hooks - https://github.com/atmos/hubot-deploy
//
// Commands:
//   hubot where can I deploy <app> - see what environments you can deploy app
//   hubot deploy:version - show the script version and node/environment info
//   hubot deploy <app>/<branch> to <env>/<roles> - deploys <app>'s <branch> to the <env> environment's <roles> servers
//   hubot deploys <app>/<branch> in <env> - Displays recent deployments for <app>'s <branch> in the <env> environment
//
const supported_tasks = [ DeployPrefix ];

const Path          = require("path");
const {
  Version
} = require(Path.join(__dirname, "..", "version"));
const Patterns      = require(Path.join(__dirname, "..", "models", "patterns"));
const Formatters    = require(Path.join(__dirname, "..", "models", "formatters"));
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

const Verifiers     = require(Path.join(__dirname, "..", "models", "verifiers"));
const TokenForBrain = Verifiers.VaultKey;

const defaultDeploymentEnvironment = () => process.env.HUBOT_DEPLOY_DEFAULT_ENVIRONMENT || 'production';

//##########################################################################
module.exports = function(robot) {
  //##########################################################################
  // where can i deploy <app>
  //
  // Displays the available environments for an application
  robot.respond(new RegExp(`where\\s+can\\s+i\\s+${DeployPrefix}\\s+([-_\\.0-9a-z]+)`, 'i'), {id: "hubot-deploy.wcid"}, function(msg) {
    const name = msg.match[1];

    try {
      const deployment = new Deployment(name);
      const formatter  = new Formatters.WhereFormatter(deployment);

      return robot.emit("hubot_deploy_available_environments", msg, deployment, formatter);

    } catch (err) {
      return robot.logger.info(`Exploded looking for deployment locations: ${err}`);
    }
  });

  //##########################################################################
  // deploys <app> in <env>
  //
  // Displays the recent deployments for an application in an environment
  robot.respond(DeploysPattern, {id: "hubot-deploy.recent", hubotDeployAuthenticate: true}, function(msg) {
    const name        = msg.match[2];
    const environment = msg.match[4] || "";

    try {
      const deployment = new Deployment(name, null, null, environment);
      if (!deployment.isValidApp()) {
        msg.reply(`${name}? Never heard of it.`);
        return;
      }
      if (!deployment.isValidEnv()) {
        if (environment.length > 0) {
          msg.reply(`${name} doesn't seem to have an ${environment} environment.`);
          return;
        }
      }

      const user = robot.brain.userForId(msg.envelope.user.id);
      const token = robot.vault.forUser(user).get(TokenForBrain);
      if (token != null) {
        deployment.setUserToken(token);
      }

      deployment.user   = user.id;
      deployment.room   = msg.message.user.room;

      if (robot.adapterName === "flowdock") {
        deployment.threadId = msg.message.metadata.thread_id;
        deployment.messageId = msg.message.id;
      }

      if (robot.adapterName === "hipchat") {
        if (msg.envelope.user.reply_to != null) {
          deployment.room = msg.envelope.user.reply_to;
        }
      }
          
      if (robot.adapterName === "slack") {
        deployment.user = user.name;
        deployment.room = robot.adapter.client.rtm.dataStore.getChannelGroupOrDMById(msg.message.user.room).name;
      }

      deployment.adapter   = robot.adapterName;
      deployment.robotName = robot.name;

      return deployment.latest(function(err, deployments) {
        const formatter = new Formatters.LatestFormatter(deployment, deployments);
        return robot.emit("hubot_deploy_recent_deployments", msg, deployment, deployments, formatter);
      });

    } catch (error) {
      const err = error;
      return robot.logger.info(`Exploded looking for recent deployments: ${err}`);
    }
  });

  //##########################################################################
  // deploy hubot/topic-branch to staging
  //
  // Actually dispatch deployment requests to GitHub
  robot.respond(DeployPattern, {id: "hubot-deploy.create", hubotDeployAuthenticate: true}, function(msg) {
    const task  = msg.match[1].replace(DeployPrefix, "deploy");
    const force = msg.match[2] === '!';
    const name  = msg.match[3];
    const ref   = (msg.match[4]||'master');
    const env   = (msg.match[5]||defaultDeploymentEnvironment());
    const hosts = (msg.match[6]||'');
    const yubikey = msg.match[7];

    const deployment = new Deployment(name, ref, task, env, force, hosts);

    robot.logger.info(msg);

    if (!deployment.isValidApp()) {
      msg.reply(`${name}? Never heard of it.`);
      return;
    }
    if (!deployment.isValidEnv()) {
      msg.reply(`${name} doesn't seem to have an ${env} environment.`);
      return;
    }
    if (!deployment.isAllowedRoom(msg.message.user.room)) {
      msg.reply(`${name} is not allowed to be deployed from this room.`);
      return;
    }

    const user = robot.brain.userForId(msg.envelope.user.id);
    const token = robot.vault.forUser(user).get(TokenForBrain);
    if (token != null) {
      deployment.setUserToken(token);
    }

    deployment.user   = user.id;
    deployment.room   = msg.message.user.room;

    if (robot.adapterName === "flowdock") {
      deployment.threadId = msg.message.metadata.thread_id;
      deployment.messageId = msg.message.id;
    }

    if (robot.adapterName === "hipchat") {
      if (msg.envelope.user.reply_to != null) {
        deployment.room = msg.envelope.user.reply_to;
      }
    }

    if (robot.adapterName === "slack") {
      deployment.user = user.name;
    }

    deployment.yubikey   = yubikey;
    deployment.adapter   = robot.adapterName;
    deployment.userName  = user.name;
    deployment.robotName = robot.name;

    if (process.env.HUBOT_DEPLOY_EMIT_GITHUB_DEPLOYMENTS) {
      return robot.emit("github_deployment", msg, deployment);
    } else {
      return deployment.post(function(err, status, body, headers, responseMessage) {
        if (responseMessage != null) { return msg.reply(responseMessage); }
      });
    }
  });

  //##########################################################################
  // deploy:version
  //
  // Useful for debugging
  return robot.respond(new RegExp(`${DeployPrefix}\\:version$`, 'i'), {id: "hubot-deploy.version"}, msg => msg.send(`hubot-deploy v${Version}/hubot v${robot.version}/node ${process.version}`));
};
