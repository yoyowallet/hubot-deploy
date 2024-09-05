/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__, or convert again using --optional-chaining
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
const Fs        = require("fs");
const Url       = require("url");
const Path      = require("path");
const Fernet    = require("fernet");
const {
  Version
} = require(Path.join(__dirname, "..", "..", "version"));
const Octonode  = require("octonode");
const GitHubApi = require(Path.join(__dirname, "..", "api")).Api;
//##########################################################################

class Deployment {
  static initClass() {
    this.APPS_FILE = process.env['HUBOT_DEPLOY_APPS_JSON'] || "apps.json";
  }

  constructor(name, ref, task, env, force, hosts) {
    let applications;
    this.name = name;
    this.ref = ref;
    this.task = task;
    this.env = env;
    this.force = force;
    this.hosts = hosts;
    this.room             = 'unknown';
    this.user             = 'unknown';
    this.adapter          = 'unknown';
    this.userName         = 'unknown';
    this.robotName        = 'hubot';
    this.autoMerge        = true;
    this.environments     = [ "production" ];
    this.requiredContexts = null;
    if (process.env['HUBOT_CA_FILE']) { this.caFile           = Fs.readFileSync(process.env['HUBOT_CA_FILE']); }

    this.messageId        = undefined;
    this.threadId         = undefined;

    try {
      applications = JSON.parse(Fs.readFileSync(this.constructor.APPS_FILE).toString());
    } catch (error) {
      throw new Error("Unable to parse your apps.json file in hubot-deploy");
    }

    this.application = applications[this.name];

    if (this.application != null) {
      this.repository = this.application['repository'];

      this.configureAutoMerge();
      this.configureRequiredContexts();
      this.configureEnvironments();

      this.allowedRooms = this.application['allowed_rooms'];
    }
  }

  isValidApp() {
    return (this.application != null);
  }

  isValidEnv() {
    return Array.from(this.environments).includes(this.env);
  }

  isAllowedRoom(room) {
    return (this.allowedRooms == null) || Array.from(this.allowedRooms).includes(room);
  }

  // Retrieves a fully constructed request body and removes sensitive config info
  // A hash to be converted into the body of the post to create a GitHub Deployment
  requestBody() {
    const body = JSON.parse(JSON.stringify(this.unfilteredRequestBody()));
    if (__guard__(body != null ? body.payload : undefined, x => x.config) != null) {
      delete(body.payload.config.github_api);
      delete(body.payload.config.github_token);
    }
    if (process.env.HUBOT_DEPLOY_ENCRYPT_PAYLOAD && process.env.HUBOT_DEPLOY_FERNET_SECRETS) {
      const {
        payload
      } = body;
      const fernetSecret = new Fernet.Secret(process.env.HUBOT_DEPLOY_FERNET_SECRETS);
      const fernetToken  = new Fernet.Token({secret: fernetSecret});

      body.payload = fernetToken.encode(payload);
    }

    return body;
  }

  unfilteredRequestBody() {
    return {
      ref: this.ref,
      task: this.task,
      force: this.force,
      auto_merge: this.autoMerge,
      environment: this.env,
      required_contexts: this.requiredContexts,
      description: `${this.task} on ${this.env} from hubot-deploy-v${Version}`,
      payload: {
        name: this.name,
        robotName: this.robotName,
        hosts: this.hosts,
        yubikey: this.yubikey,
        notify: {
          adapter: this.adapter,
          room: this.room,
          user: this.user,
          user_name: this.userName,
          message_id: this.messageId,
          thread_id: this.threadId
        },
        config: this.application
      }
    };
  }

  setUserToken(token) {
    return this.userToken = token.trim();
  }

  apiConfig() {
    return new GitHubApi(this.userToken, this.application);
  }

  api() {
    console.log("----------------------------------------------------------");
    console.log("github/api/deployment.api");
    console.log(typeof this.apiConfig().token);
    console.log("----------------------------------------------------------");
    const api = Octonode.client(this.apiConfig().token, { hostname: this.apiConfig().hostname });
    if (this.caFile) { api.requestDefaults.agentOptions = { ca: this.caFile }; }
    return api;
  }

  latest(callback) {
    const path       = this.apiConfig().path(`repos/${this.repository}/deployments`);
    const params     =
      {environment: this.env};

    return this.api().get(path, params, (err, status, body, headers) => callback(err, body));
  }

  post(callback) {
    const {
      name
    } = this;
    const {
      repository
    } = this;
    const {
      env
    } = this;
    const {
      ref
    } = this;

    const {
      requiredContexts
    } = this;

    return this.rawPost(function(err, status, body, headers) {
      let message;
      let context;
      let data = body;

      if (err) {
        data = err;
      }

      if (data['message']) {
        let bodyMessage = data['message'];

        if (bodyMessage.match(/No successful commit statuses/)) {
          message = `\
I don't see a successful build for ${repository} that covers the latest \"${ref}\" branch.\
`;
        }

        if (bodyMessage.match(/Conflict merging ([-_\.0-9a-z]+)/)) {
          const default_branch = data.message.match(/Conflict merging ([-_\.0-9a-z]+)/)[1];
          message = `\
There was a problem merging the ${default_branch} for ${repository} into ${ref}.
You'll need to merge it manually, or disable auto-merging.\
`;
        }

        if (bodyMessage.match(/Merged ([-_\.0-9a-z]+) into/)) {
          const tmpMessage = `\
Successfully merged the default branch for ${repository} into ${ref}.
Normal push notifications should provide feedback.\
`;
          console.log(tmpMessage);
        }

        if (bodyMessage.match(/Conflict: Commit status checks/)) {
          const errors = data['errors'][0];
          const commitContexts = errors.contexts;

          const namedContexts  = ((() => {
            const result = [];
            for (context of Array.from(commitContexts)) {               result.push(context.context);
            } 
            return result;
          })());
          const failedContexts = ((() => {
            const result1 = [];
            for (context of Array.from(commitContexts)) {               if (context.state !== 'success') {
                result1.push(context.context);
              }
            }
            return result1;
          })());
          if (requiredContexts != null) {
            for (context of Array.from(requiredContexts)) { if (!Array.from(namedContexts).includes(context)) { failedContexts.push(context); } }
          }

          bodyMessage = `\
Unmet required commit status contexts for ${name}: ${failedContexts.join(',')} failed.\
`;
        }

        if (bodyMessage === "Not Found") {
          message = `Unable to create deployments for ${repository}. Check your scopes for this token.`;
        } else {
          message = bodyMessage;
        }
      }

      return callback(err, status, body, headers, message);
    });
  }

  rawPost(callback) {
    const path       = this.apiConfig().path(`repos/${this.repository}/deployments`);
    const {
      repository
    } = this;
    const {
      env
    } = this;
    const {
      ref
    } = this;

    return this.api().post(path, this.requestBody(), (err, status, body, headers) => callback(err, status, body, headers));
  }

  // Private Methods
  configureEnvironments() {
    if (this.application['environments'] != null) {
      this.environments = this.application['environments'];
    }

    if (this.env === 'stg') { this.env = 'staging'; }
    if (this.env === 'prod') { return this.env = 'production'; }
  }

  configureAutoMerge() {
    if (this.application['auto_merge'] != null) {
      this.autoMerge = this.application['auto_merge'];
    }
    if (this.force) {
      return this.autoMerge = false;
    }
  }

  configureRequiredContexts() {
    if (this.application['required_contexts'] != null) {
      this.requiredContexts = this.application['required_contexts'];
    }
    if (this.force) {
      return this.requiredContexts = [ ];
    }
  }
}
Deployment.initClass();

exports.Deployment = Deployment;

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}