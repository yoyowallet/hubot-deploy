/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
class Push {
  constructor(id, payload) {
    this.id = id;
    this.payload = payload;
    this.ref   = this.payload.ref;
    this.actor = this.payload.pusher.name;
    this.count = this.payload.commits.length;
    this.isTag = this.ref.match(/^refs\/tags\//);

    this.commits = this.payload.commits;

    this.refName   = this.ref.replace(/^refs\/(heads|tags)\//, "");

    this.afterSha  = this.payload.after.slice(0, 8);
    this.beforeSha = this.payload.before.slice(0, 8);
    this.repoName  = this.payload.repository.name;
    this.ownerName = this.payload.repository.owner.name;

    this.baseRef     = this.payload.base_ref;
    this.baseRefName = this.payload.base_ref_name;

    this.forced  = this.payload.forced || false;
    this.deleted = this.payload.deleted || this.payload.after.match(/0{40}/);
    this.created = this.payload.created || this.payload.before.match(/0{40}/);

    this.repoUrl       = this.payload.repository.url;
    this.branchUrl     = `${this.repoUrl}/commits/${this.refName}`;
    this.compareUrl    = this.payload.compare;
    this.afterShaUrl   = `${this.repoUrl}/commit/${this.afterSha}`;
    this.beforeShaUrl  = `${this.repoUrl}/commit/${this.beforeSha}`;
    this.nameWithOwner = `${this.ownerName}/${this.repoName}`;

    this.actorLink     = `<a href=\"https://github.com/${this.actor}\">${this.actor}</a>`;

    this.distinctCommits = (Array.from(this.commits).filter((commit) => commit.distinct && (commit.message.length > 0)));

    this.firstMessage    = this.formatCommitMessage(this.commits[0]);

    if (this.count > 1) {
      this.commitMessage = `${this.count} commits`;
    } else {
      this.commitMessage = "a commit";
    }
  }

  formatCommitMessage(commit) {
    const short = commit.message.split("\n", 2)[0];
    return `- ${short} - ${commit.author.name} - (<a href=\"${this.afterShaUrl}\">${this.afterSha}</a>)`;
  }

  summaryUrl() {
    if (this.created) {
      if (this.distinctCommits.length === 0) {
        return this.branchUrl;
      } else {
        return this.compareUrl;
      }
    } else if (this.deleted) {
      return this.beforeShaUrl;
    } else if (this.forced) {
      return this.branchUrl;
    } else if (this.commits.length === 1) {
      return this.commits[0].url;
    } else {
      return this.compareUrl;
    }
  }

  summaryMessage() {
    let num;
    const message = [];
    message.push(`[${this.repoName}] ${this.actor}`);

    if (this.created) {
      if (this.isTag) {
        message.push(`tagged ${this.refName} at`);
        message.push((this.baseRef != null) ? this.baseRefName : this.afterSha);
      } else {
        message.push(`created ${this.refName}`);

        if (this.baseRef) {
          message.push(`from ${this.baseRefName}`);
        } else if (this.distinctCommits.empty != null) {
          message.push(`at ${this.afterSha}`);
        }

        if (this.distinctCommits.length > 0) {
          num = this.distinctCommits.length;
          message << `(+${this.commitMessage})`;
        }
      }

    } else if (this.deleted) {
      message.push(`deleted ${this.refName} at ${this.beforeSha}`);

    } else if (this.forced) {
      message.push(`force-pushed ${this.refName} from ${this.beforeSha} to ${this.afterSha}`);

    } else if ((this.commits.length > 0) && (this.distinctCommits.length === 0)) {
      if (this.baseRef) {
        message.push(`merged ${baseRefName} into ${this.refName}`);
      } else {
        message.push(`fast-forwarded ${this.refName} from ${this.beforeSha} to ${this.afterSha}`);
      }

    } else if (this.distinctCommits.length > 0) {
      num = this.distinctCommits.length;
      message.push(`pushed ${num} new commit${num > 1 ? 's' : ''} to ${this.refName}`);
    } else {
      message.push("pushed nothing");
    }

    return message.join(" ");
  }

  toSimpleString() {
    return `hubot-deploy: ${this.actor} pushed ${this.commitMessage}`;
  }
}

exports.Push = Push;
