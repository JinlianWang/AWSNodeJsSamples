const AWS = require('aws-sdk');
const sts = new AWS.STS();
let iam = new AWS.IAM();
const roleName = "read-admin-role"
const roleArn = "arn:aws:iam::730508922179:role/" + roleName;
const startTime = (new Date()).getTime();
let retriedNumber = 0;
const retries = 10;

let args = process.argv.slice(2)

const targetRole = args[0]; //admin_role Test-Role
console.log("Trying to read role: ", targetRole, "at: ", startTime);

async function fetchRoleInfo() {
let params = {
    RoleName: roleName,
    Tags: [
        {
            Key: "resourceName",
            Value: targetRole
        }
    ]
};

let res = await iam.tagRole(params).promise();
console.log("Tagging response: ", res);

params = {
  RoleArn: roleArn,
  RoleSessionName: `role-name-${startTime}`
};

const data = await sts.assumeRole(params).promise();

console.log("Credentials:", JSON.stringify({
  accessKeyId: data.Credentials.AccessKeyId,
  secretAccessKey: data.Credentials.SecretAccessKey,
  sessionToken: data.Credentials.SessionToken,
}));

fetchRoleInfoWithRetries({
    accessKeyId: data.Credentials.AccessKeyId,
    secretAccessKey: data.Credentials.SecretAccessKey,
    sessionToken: data.Credentials.SessionToken
});

};

async function fetchRoleInfoWithRetries(options) {
    let iam2 = new AWS.IAM(options);
    let params = {
        RoleName: targetRole
    };
    try {
        let data = await iam2.getRole(params).promise();
        console.log("IAM role info: ", data);           // successful response
        console.log("Total time taken in millisecond: ", (new Date()).getTime() - startTime);
    } catch (err) {
        if(retriedNumber < retries) {
            console.log("Fails to read, trying again ...");
            setTimeout(function () {
                fetchRoleInfoWithRetries(options);
            }, 3000);
            retriedNumber++;
        } else {
            console.log("Exceeding number of retries: ", retries);
        }
    }
}

fetchRoleInfo();