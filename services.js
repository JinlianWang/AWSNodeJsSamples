const retry = require('@lifeomic/attempt').retry;
const AWS = require('aws-sdk');
const sts = new AWS.STS();
let iam = new AWS.IAM();
AWS.config.update({region:'us-east-1'});

const services = {};

services.handleTargetResource = async function handleTargetResource(targetName, roleName = "read-admin-role", startTime) {

    const roleArn = "arn:aws:iam::730508922179:role/" + roleName;

    //Tag role with key as "resourceName" and specific target resource name as its value
    let res = await iam.tagRole({
        RoleName: roleName,
        Tags: [
            {
                Key: "resourceName",
                Value: targetName
            }
        ]
    }).promise();

    console.log("Tagging response: ", res);

    //Assume role to gain permissions to CRUD targets of specific target resource name
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

    //Use new credentials to create a new SQS queue with queue name as specific target resource name, retries with exponential backoff and jitter as there is lag for role tags to apply
    try {
        let sqs = new AWS.SQS(options);
        const data = await retry(async (context) => {
            //console.log("Attempts remaining: " + context.attemptsRemaining);
            return sqs.createQueue({
                    QueueName: targetName
            }).promise();
        },
        {
            delay: 200,
            factor: 2,
            maxAttempts: 10,
            jitter: true, 
            maxDelay: 10000, 
            handleError (err, context) {
                console.log("error: " + err);
                console.log("Attempted times: " + (context.attemptNum+1));
            }
        });
        console.log("Response: ", data);
        console.log("Total time taken in millisecond: ", (new Date()).getTime() - startTime);
    } catch (err) {
        console.log("Exceeding number of retries: ", err);
    }

};

module.exports = services;