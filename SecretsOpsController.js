const retry = require('@lifeomic/attempt').retry;
const SecretsProvisioner = require("./SecretsProvisioner").SecretsProvisioner;
const { CredentialsRetriever } = require("./CredentialsRetriever");
const { DynamoDBUpdator } = require("./DynamoDBUpdator"); 
const utils = require('./Utils');


class SecretsOpsController {
    #info = {};
    #dynamoDBUpdator; 

    setAccountId(accountId) {
        this.#info.accountId = accountId;
        return this;
    }

    setSecretOps(ops) {
        this.#info.ops = ops;
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
            .setSecretOps(data.ops)
            .setSecretName(data.secretName)
            .setUserName(data.userName)
            .setPassword(data.password);

        try {

            let existingRecord = await this.#dynamoDBUpdator.getSecretRecord(data.secretName);
            let res; 

            switch(data.ops){
                case "create":
                    if(existingRecord != null) {
                        return utils.generateJsonResponse(200, {
                            result: "Secret already exists",
                            ARN: existingRecord.Item.ARN["S"]
                        }, data);
                    } else {
                        let res = await this.#handleOperationWithRetries();
                        await this.#dynamoDBUpdator.createSecretRecord(res);
                        return  utils.generateJsonResponse(201, {
                            result: "Secret created",
                            ARN: res.ARN
                        }, data);
                    }
                case "update":
                    if(existingRecord == null) {
                        return utils.generateResponse(400, `Secret of ${data.secretName} does not exist in account of ${data.accountId}.`);
                    }
                    res = await this.#handleOperationWithRetries();
                    await this.#dynamoDBUpdator.updateSecretRecord(res);
                    return  utils.generateJsonResponse(200, {
                        result: "Secret updated",
                        ARN: res.ARN
                    }, data);
                case "delete":
                    res = await this.#handleOperationWithRetries();
                    await this.#dynamoDBUpdator.deleteSecretRecord(this.#info.secretName);
                    return  utils.generateJsonResponse(200, {
                        result: "Secret deleted!"
                    }, data);
                default: 
                    return utils.generateJsonResponse(500, {result: "Internal server error: operation of " + data.ops + " is not supported"}, data);
            }
        } catch (err) {
            return utils.generateJsonResponse(500, {result: "Internal server error: " + err}, data);
        }
    }

    async #handleOperationWithRetries() {
    
        const secretsProvisioner = await this.#getSecretsProvisioner();
    
        try {
            const startTime = (new Date()).getTime();

            const data = await retry(async (context) => {
                const ops = this.#info.ops;
                if(ops == "delete") {
                    return secretsProvisioner.deleteSecret(this.#info.secretName);
                } else if (ops == "create") {
                    return secretsProvisioner.createSecret(this.#info.secretName, this.#info.userName, this.#info.password);
                } else {
                    return secretsProvisioner.createOrUpdateSecret(this.#info.secretName, this.#info.userName, this.#info.password);
                }
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