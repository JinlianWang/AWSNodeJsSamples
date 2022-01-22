
const handleTargetResource = require("./services.js").handleTargetResource;

let args = process.argv.slice(2)
const targetName = args[0]; //Name of target to be CRUDed
const serviceRole = args[1]; //Name of IAM role to be assumed

const startTime = (new Date()).getTime();
console.log("Trying to CRUD: ", targetName, "at: ", startTime);

handleTargetResource(targetName, serviceRole, startTime);