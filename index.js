const AWS = require('aws-sdk');
const sts = new AWS.STS();
let iam = new AWS.IAM();
const roleName = "read-admin-role"
const roleArn = "arn:aws:iam::730508922179:role/" + roleName;
const startTime = (new Date()).getTime();
const retry = require('@lifeomic/attempt').retry;

let args = process.argv.slice(2)

const targetRole = args[0]; //admin_role Test-Role
console.log("Trying to read role: ", targetRole, "at: ", startTime);


async function fetchRoleInfo() {

    //Tag role with key as "resourceName" and specific role name as its value
    let res = await iam.tagRole({
        RoleName: roleName,
        Tags: [
            {
                Key: "resourceName",
                Value: targetRole
            }
        ]
    }).promise();

    console.log("Tagging response: ", res);

    //Assume role to gain permissions to read role with specific name
    res = await sts.assumeRole({
        RoleArn: roleArn,
        RoleSessionName: `role-name-${startTime}`
    }).promise();

    const options = {
        accessKeyId: res.Credentials.AccessKeyId,
        secretAccessKey: res.Credentials.SecretAccessKey,
        sessionToken: res.Credentials.SessionToken,
    };

    console.log("Credentials:", JSON.stringify(options));

    //Use new credentials to read new IAM role, retries with exponential backoff and jitter as there is lag for role tags to apply
    try {
        let iam = new AWS.IAM(options);
        const data = await retry(async (context) => {
            return iam.getRole({
                RoleName: targetRole
            }).promise();
        },
        {
            delay: 200,
            factor: 2,
            maxAttempts: 10,
            jitter: true, 
            maxDelay: 10000
        });
        console.log("IAM role info: ", data);
        console.log("Total time taken in millisecond: ", (new Date()).getTime() - startTime);
    } catch (err) {
        console.log("Exceeding number of retries.");
    }

};

fetchRoleInfo();