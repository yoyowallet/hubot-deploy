/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
const Sprintf = require("sprintf").sprintf;
const Timeago = require("timeago");

class Formatter {
  constructor(deployment, extras) {
    this.deployment = deployment;
    this.extras = extras;
  }
}

class WhereFormatter extends Formatter {
  message() {
    let output  = `Environments for ${this.deployment.name}\n`;
    output += "-----------------------------------------------------------------\n";
    output += Sprintf("%-15s\n", "Environment");
    output += "-----------------------------------------------------------------\n";

    for (var environment of Array.from(this.deployment.environments)) {
      output += `${environment}\n`;
    }
    output += "-----------------------------------------------------------------\n";

    return output;
  }
}

class LatestFormatter extends Formatter {
  delimiter() {
    return "-----------------------------------------------------------------------------------\n";
  }

  loginForDeployment(deployment) {
    let result = null;
    if (deployment.payload != null) {
      if (deployment.payload.notify) {
        if (!result) { result = deployment.payload.notify.user_name; }
      }
      if (!result) { result = deployment.payload.actor; }
    }

    return result || (result = deployment.creator.login);
  }

  message() {
    let output  = `Recent ${this.deployment.env} Deployments for ${this.deployment.name}\n`;
    output += this.delimiter();
    output += Sprintf("%-15s | %-21s | %-38s\n", "Who", "What", "When");
    output += this.delimiter();

    if (this.extras != null) {
      for (var deployment of Array.from(this.extras.slice(0, 11))) {
        var ref;
        if (deployment.ref === deployment.sha.slice(0, 8)) {
          ({
            ref
          } = deployment);
          if (deployment.description.match(/auto deploy triggered by a commit status change/)) {
            ref += "(auto-deploy)";
          }

        } else {
          ref = `${deployment.ref}(${deployment.sha.slice(0, 8)})`;
        }

        var login = this.loginForDeployment(deployment);
        var timestamp = Sprintf("%18s / %-21s", Timeago(deployment.created_at), deployment.created_at);

        output += Sprintf("%-15s | %-21s | %38s\n", login, ref, timestamp);
      }

      output += this.delimiter();
    }
    return output;
  }
}

exports.WhereFormatter  = WhereFormatter;
exports.LatestFormatter = LatestFormatter;
