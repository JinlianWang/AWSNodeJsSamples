const retry = require('@lifeomic/attempt').retry;
const SecretsProvisioner = require("./SecretsProvisioner").SecretsProvisioner;
const { CredentialsRetriever } = require("./CredentialsRetriever");
const { DynamoDBUpdator } = require("./DynamoDBUpdator"); 

async function createOrUpdateSecret(secretName, accountId, serviceRole, startTime) {
    const credentialsRetriever = new CredentialsRetriever();

    const credentials = await credentialsRetriever
        .setAccountId(accountId)
        .setRoleName(serviceRole)
        .setResourceName(secretName)
        .retrieveCredentials();

        console.log("Credential retrieved:", credentials);

        
    const secretsProvisioner = new SecretsProvisioner(credentials);

    try {
        const data = await retry(async (context) => {

            return secretsProvisioner.createOrUpdateSecret(secretName, "testname21", "testpassword21");

        },
        {
            delay: 200,
            factor: 2,
            maxAttempts: 16,
            jitter: true, 
            maxDelay: 10000, 
            handleError (err, context) {
                console.log("error: " + err);
                console.log("Attempted times: " + (context.attemptNum+1));
            }
        });
        console.log("Response: ", data);
        console.log("Total time taken in millisecond: ", (new Date()).getTime() - startTime);
        return data;
    } catch (err) {
        console.log("Exceeding number of retries: ", err);
        throw new Error("Error: " + err);
    }
    
}

exports.handler = async (event) => {
    const startTime = (new Date()).getTime();
    const secretName = "/rds/admin";
    const serviceRole = "Secrets-Provisioning-Role";

    let res = await createOrUpdateSecret(secretName, "730508922179", serviceRole, startTime);

    const dynamoDBUpdator = new DynamoDBUpdator({tableName:"SecretsInfo"});

    res = await dynamoDBUpdator.createOrUpdateSecretRecord({path: secretName, ARN: res.ARN});

    const response = {
        statusCode: 200,
        body: JSON.stringify(res)
    };
    return response;
};

//aws lambda update-function-code --function-name SecretsProvisioner --zip-file fileb://function.zip