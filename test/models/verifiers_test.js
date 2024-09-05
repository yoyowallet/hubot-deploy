/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
const VCR  = require("ys-vcr");
const Path = require('path');

const Verifiers = require(Path.join(__dirname, "..", "..", "src", "models", "verifiers"));

describe("GitHubWebHookIpVerifier", function() {
  afterEach(() => delete process.env.HUBOT_DEPLOY_GITHUB_SUBNETS);

  it("verifies correct ip addresses", function() {
    const verifier = new Verifiers.GitHubWebHookIpVerifier;

    assert.isTrue(verifier.ipIsValid("192.30.252.1"));
    assert.isTrue(verifier.ipIsValid("192.30.253.1"));
    assert.isTrue(verifier.ipIsValid("192.30.254.1"));
    return assert.isTrue(verifier.ipIsValid("192.30.255.1"));
  });

  it("rejects incorrect ip addresses", function() {
    const verifier = new Verifiers.GitHubWebHookIpVerifier;

    assert.isFalse(verifier.ipIsValid("192.30.250.1"));
    assert.isFalse(verifier.ipIsValid("192.30.251.1"));
    assert.isFalse(verifier.ipIsValid("192.168.1.1"));
    return assert.isFalse(verifier.ipIsValid("127.0.0.1"));
  });

  return it("verifies correct ip addresses with custom subnets", function() {
    process.env.HUBOT_DEPLOY_GITHUB_SUBNETS = '207.97.227.0/22,,   198.41.190.0/22';
    const verifier = new Verifiers.GitHubWebHookIpVerifier;

    assert.isTrue(verifier.ipIsValid("207.97.224.1"));
    assert.isTrue(verifier.ipIsValid("198.41.188.1"));

    assert.isFalse(verifier.ipIsValid("192.30.252.1"));
    assert.isFalse(verifier.ipIsValid("207.97.228.1"));
    assert.isFalse(verifier.ipIsValid("198.41.194.1"));
    assert.isFalse(verifier.ipIsValid("192.168.1.1"));
    return assert.isFalse(verifier.ipIsValid("127.0.0.1"));
  });
});

describe("ApiTokenVerifier", function() {
  it("returns false when the GitHub token is invalid", function(done) {
    VCR.play("/user-invalid-auth");
    const verifier = new Verifiers.ApiTokenVerifier("123456789");
    return verifier.valid(function(result) {
      assert.isFalse(result);
      return done();
    });
  });

  it("returns false when the GitHub token has incorrect scopes", function(done) {
    VCR.play("/user-invalid-scopes");
    const verifier = new Verifiers.ApiTokenVerifier("123456789");
    return verifier.valid(function(result) {
      assert.isFalse(result);
      return done();
    });
  });

  return it("tells you when your provided GitHub token is valid", function(done) {
    VCR.play("/user-valid");
    const verifier = new Verifiers.ApiTokenVerifier("123456789");
    return verifier.valid(function(result) {
      assert.isTrue(result);
      return done();
    });
  });
});
