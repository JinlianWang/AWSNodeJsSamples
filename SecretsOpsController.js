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

    setResourceTaggingRole(roleName) {
        this.#info.resourceTaggingRole = roleName;
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

    async handleSecretOperation(data) {
        this.setAccountId(data.accountId)
            .setSecretName(data.secretName)
            .setUserName(data.userName)
            .setPassword(data.password);

        let res = await this.#handleOperationWithRetries();
        res = await this.saveToDynamoDB(res);

        res.ops = data.ops;
        res.accountId = data.accountId;
        res.secretName = data.secretName;

        
        return res;
    }

    async #handleOperationWithRetries() {
    
        const secretsProvisioner = await this.#getSecretsProvisioner();
    
        try {
            const startTime = (new Date()).getTime();

            const data = await retry(async (context) => {
    
                return secretsProvisioner.createOrUpdateSecret(this.#info.secretName, this.#info.userName, this.#info.password);
    
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

    async #getSecretsProvisioner() {
        const credentialsRetriever = new CredentialsRetriever();
    
        const credentials = await credentialsRetriever
            .setAccountId(this.#info.accountId)
            .setRoleName(this.#info.roleName)
            .setResourceName(this.#info.secretName)
            .setResourceTaggingRole(this.#info.resourceTaggingRole)
            .retrieveCredentials();
    
        console.log("Credential retrieved with token: ", credentials.sessionToken);
    
            
        return new SecretsProvisioner(credentials);
    }
}

module.exports.SecretsOpsController = SecretsOpsController;