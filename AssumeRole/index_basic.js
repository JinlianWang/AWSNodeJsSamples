const AWS = require('aws-sdk');

async function assumeRole(roleArn) {
    const sts = new AWS.STS();

    const res = await sts.assumeRole({
        RoleArn: roleArn,
        RoleSessionName: "assumed-session"
    }).promise();

    console.log("Response: " + JSON.stringify(res));
    return {
        accessKeyId: res.Credentials.AccessKeyId,
        secretAccessKey: res.Credentials.SecretAccessKey,
        sessionToken: res.Credentials.SessionToken,
    };
}

const f = async (roleArn) => {
    const credentials = await assumeRole(roleArn);
    console.log("Assumed successfully with credentials: ", credentials);
};

let args = process.argv.slice(2)
const roleArn = args[0]; //Name of IAM role to be assumed, arn:aws:iam::730508922179:role/assumableRole, arn:aws:iam::730508922179:role/assumableRole2

f(roleArn);

/*
export AWS_PROFILE=admin                                        
node index_basic.js arn:aws:iam::730508922179:role/assumableRole
*/