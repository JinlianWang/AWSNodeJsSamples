
const handleTargetResource = require("./services.js").handleTargetResource;

let args = process.argv.slice(2)
const targetName = args[0]; //Name of target to be CRUDed

const startTime = (new Date()).getTime();
console.log("Trying to handle: ", targetName, "at: ", startTime);

handleTargetResource(targetName, startTime);