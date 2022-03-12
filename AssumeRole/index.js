const AWS = require('aws-sdk');

async function assumeRole() {
    const sts = new AWS.STS();
    const roleArn = "arn:aws:iam::975156237701:role/CoS-Secrets-Provisioner";

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

async function getIdentity(credentials) {
    const sts = new AWS.STS(credentials);
    const res = await sts.getCallerIdentity({}).promise();
    console.log("Identity: " + JSON.stringify(res));
}

const f = async ()=> {
    const credentials = await assumeRole();
    getIdentity(credentials);
};

f();
