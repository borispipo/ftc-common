const {Session} = require("@fto-consult/node-utils");
const packageJSON = require("$packageJSON");
module.exports = Session({appName:packageJSON?.name});