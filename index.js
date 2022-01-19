const AWS = require('aws-sdk');
const sts = new AWS.STS();
let iam = new AWS.IAM();
const roleName = "read-admin-role"
const roleArn = "arn:aws:iam::730508922179:role/" + roleName;
const startTime = (new Date()).getTime();
let retriedNumber = 0;
const retries = 3;

let args = process.argv.slice(2)

const targetRole = args[0]; //admin_role Test-Role
console.log("Trying to read role: ", targetRole, "at: ", startTime);


let params = {
    RoleName: roleName,
    Tags: [
        {
            Key: "resourceName",
            Value: targetRole
        }
    ]
};

iam.tagRole(params, function (err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else console.log(data);           // successful response
    assumeRole();
});

function assumeRole() {
    const params = {
        RoleArn: roleArn,
        RoleSessionName: `role-name-${startTime}`
    };
    sts.assumeRole(params, (err, data) => {
        if (err) reject(err);
        else {
            console.log("Credentials:", JSON.stringify({
                accessKeyId: data.Credentials.AccessKeyId,
                secretAccessKey: data.Credentials.SecretAccessKey,
                sessionToken: data.Credentials.SessionToken,
            }));
            fetchRetry({
                accessKeyId: data.Credentials.AccessKeyId,
                secretAccessKey: data.Credentials.SecretAccessKey,
                sessionToken: data.Credentials.SessionToken
            });
        }
    });
};

function fetchRetry(options) {
    let iam2 = new AWS.IAM(options);
    let params = {
        RoleName: targetRole
    };
    iam2.getRole(params, function (err, data) {
        if (err && retriedNumber < retries) {
            console.log("Fails to read, trying again ...");
            setTimeout(function () {
                fetchRetry(options);
            }, 3000);
        } else {
            console.log("IAM role info: ", data);           // successful response
            console.log("Total time taken in millisecond: ", (new Date()).getTime() - startTime);
        }
    });
}
