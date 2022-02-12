const retry = require('@lifeomic/attempt').retry;
const SecretsProvisioner = require("./SecretsProvisioner").SecretsProvisioner;
const { CredentialsRetriever } = require("./CredentialsRetriever");
const { DynamoDBUpdator } = require("./DynamoDBUpdator"); 


class SecretsOpsController {
    #info = {};
    #dynamoDBUpdator; 

    setAccountId(accountId) {
        this.#info.accountId = accountId;
        return this;
    }

    setRoleName(roleName) {
        this.#info.roleName = roleName;
        return this;
    }

    setSecretName(secretName) {
        this.#info.secretName = secretName;
        return this;
    }

    setUserName(userName) {
        this.#info.userName = userName;
        return this;
    }

    setPassword(password) {
        this.#info.password = password;
        return this;
    }

    setTableName(tableName) {
        this.#info.tableName = tableName;
        this.#dynamoDBUpdator = new DynamoDBUpdator({tableName:tableName});
        return this;
    }

    async createOrUpdateSecret() {

        const secretName = this.#info.secretName;
        const accountId = this.#info.accountId;
        const roleName = this.#info.roleName;

        const credentialsRetriever = new CredentialsRetriever();
    
        const credentials = await credentialsRetriever
            .setAccountId(accountId)
            .setRoleName(roleName)
            .setResourceName(secretName)
            .retrieveCredentials();
    
        console.log("Credential retrieved:", credentials);
    
            
        const secretsProvisioner = new SecretsProvisioner(credentials);
    
        try {
            const startTime = (new Date()).getTime();

            const data = await retry(async (context) => {
    
                return secretsProvisioner.createOrUpdateSecret(secretName, this.#info.userName, this.#info.password);
    
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
            return data;
        } catch (err) {
            console.log("Exceeding number of retries: ", err);
            throw new Error("Error: " + err);
        }
    }

    async saveToDynamoDB(data) {
        return this.#dynamoDBUpdator.createOrUpdateSecretRecord(
            {
                path: this.#info.secretName, 
                ARN: data.ARN
            });
    }
}

module.exports.SecretsOpsController = SecretsOpsController;