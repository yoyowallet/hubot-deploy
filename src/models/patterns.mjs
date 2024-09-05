const Inflection = require("inflection");

const validSlug = "([-_\.0-9a-z]+)";

const scriptPrefix = process.env['HUBOT_DEPLOY_PREFIX'] || "deploy";

// The :hammer: regex that handles all /deploy requests
const DEPLOY_SYNTAX = new RegExp(`\
(${scriptPrefix}(?:\\:[^\\s]+)?)\
(!)?\\s+\
${validSlug}\
(?:\\/([^\\s]+))?\
(?:\\s+(?:to|in|on)\\s+\
${validSlug}\
(?:\\/([^\\s]+))?)?\\s*\
(?:([cbdefghijklnrtuv]{32,64}|\\d{6})?\\s*)?$\
`, 'i');


// Supports tasks like
// /deploys github
//
// and
//
// /deploys github in staging
const inflectedScriptPrefix = Inflection.pluralize(scriptPrefix);
const DEPLOYS_SYNTAX = new RegExp(`\
(${inflectedScriptPrefix})\
\\s+\
${validSlug}\
(?:\\/([^\\s]+))?\
(?:\\s+(?:to|in|on)\\s+\
${validSlug})?\
`, 'i');

exports.DeployPrefix   = scriptPrefix;
exports.DeployPattern  = DEPLOY_SYNTAX;
exports.DeploysPattern = DEPLOYS_SYNTAX;
