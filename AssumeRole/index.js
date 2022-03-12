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
    return res; 
}

async function getIdentityWithEventListener(credentials) {
    const sts = new AWS.STS(credentials);
    const request = sts.getCallerIdentity({});
    request.on("sign", function (req) {
        console.log("iam_http_request_method:", req.httpRequest.method);
        console.log("iam_request_url:", req.httpRequest.endpoint.href);
        console.log("iam_request_headers:", JSON.stringify(req.httpRequest.headers));
        console.log("iam_request_body:", JSON.stringify(req.httpRequest.body));
        req.abort();//abort so that we only get the signed headers. 
    });

    request.on("send", function (res) {
        console.log("Hmm, 'send' event shall not fire as the request is aborted: " + res.httpResponse.statusCode + " body: " + res.httpResponse.body);
    });

    request.on('success', function (res) {
        console.log("Success!");
        console.log("Response: " + res.httpResponse.statusCode + " body: " + res.httpResponse.body);
    }).on('error', function (err) {
        console.log("Error: " + JSON.stringify(err));
    }).on('complete', function () {
        console.log("Always!");
    }).send();
}

const f = async () => {
    const credentials = await assumeRole();
    const res = await getIdentity(credentials);
    console.log("Identity: " + JSON.stringify(res));
    getIdentityWithEventListener(credentials);
};

f();
