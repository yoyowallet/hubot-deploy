/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__, or convert again using --optional-chaining
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
const Crypto       = require("crypto");
const Fernet       = require("fernet");

const {
  GitHubDeploymentStatus
} = require("../github/api");

class Handler {
  constructor(robot, deployment) {
    this.robot = robot;
    this.deployment = deployment;
    this.ref              = this.deployment.ref;
    this.sha              = this.deployment.sha;
    this.repoName         = this.deployment.repoName;
    this.environment      = this.deployment.environment;
    this.notify           = this.deployment.notify;
    this.actualDeployment = this.deployment.payload.deployment;
    this.provider         = __guard__(this.actualDeployment.payload != null ? this.actualDeployment.payload.config : undefined, x => x.provider);
    this.number           = this.actualDeployment.id;
    this.task             = this.actualDeployment.task;
  }

  run(callback) {
    try {
      if (this.robot.name !== this.actualDeployment.payload.robotName) {
        throw new Error(`Received request for unintended robot ${this.actualDeployment.payload.robotName}.`);
      }
      if (this.notify == null) {
        throw new Error(`Not deploying ${this.repoName}/${this.ref} to ${this.environment}. Not chat initiated.`);
      }
      return callback(undefined, this);
    } catch (err) {
      return callback(err, this);
    }
  }
}

exports.Handler = Handler;

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}