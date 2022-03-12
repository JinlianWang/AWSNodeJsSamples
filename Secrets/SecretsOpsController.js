const retry = require('@lifeomic/attempt').retry;
const SecretsProvisioner = require("./SecretsProvisioner").SecretsProvisioner;
const { CredentialsRetriever } = require("./CredentialsRetriever");
const { DynamoDBUpdator } = require("./DynamoDBUpdator");
const utils = require('./Utils');


class SecretsOpsController {
    #options = {};
    #dynamoDBUpdator;

    constructor(options) {
        this.#options = Object.assign({}, options);
    }

    async handleSecretOperation(data) {
        this.#options = Object.assign(this.#options, data);

        this.#dynamoDBUpdator = new DynamoDBUpdator({ tableName: this.#options.tableName });

        try {

            let existingRecord = await this.#dynamoDBUpdator.getSecretRecord(data.secretName);
            let res;

            switch (data.ops) {
                case "create":
                    if (existingRecord && existingRecord.Item && existingRecord.Item.ARN) { //TO-DO: handle Acitve == false
                        return utils.generateJsonResponse(200, {
                            result: "Secret already exists",
                            ARN: existingRecord.Item.ARN["S"]
                        }, data);
                    } else {
                        res = await this.#handleOperationWithRetries();
                        await this.#dynamoDBUpdator.createSecretRecord(res);
                        return utils.generateJsonResponse(201, {
                            result: "Secret created",
                            ARN: res.ARN
                        }, data);
                    }

                case "update":
                    if (existingRecord && existingRecord.Item && existingRecord.Item.ARN) { //TO-DO: handle Acitve == false
                        res = await this.#handleOperationWithRetries();
                        await this.#dynamoDBUpdator.updateSecretRecord(res);
                        return utils.generateJsonResponse(200, {
                            result: "Secret updated",
                            ARN: res.ARN
                        }, data);
                    } else {
                        return utils.generateResponse(400, `Secret of ${data.secretName} does not exist in account of ${data.accountId}.`);
                    }

                case "delete":
                    if (existingRecord && existingRecord.Item && existingRecord.Item.ARN) { //TO-DO: handle Acitve == false
                        res = await this.#handleOperationWithRetries();
                        await this.#dynamoDBUpdator.deleteSecretRecord(this.#options.secretName);
                        return utils.generateJsonResponse(200, {
                            result: "Secret deleted!"
                        }, data);
                    } else {
                        return utils.generateResponse(400, `Secret of ${data.secretName} does not exist in account of ${data.accountId}.`);
                    }

                default:
                    return utils.generateJsonResponse(500, { result: "Internal server error: operation of " + data.ops + " is not supported" }, data);
            }
        } catch (err) {
            return utils.generateJsonResponse(500, { result: "Internal server error: " + err }, data);
        }
    }

    async #handleOperationWithRetries() {

        const credentials = await this.#retrieveCredentials();
        const secretsProvisioner = new SecretsProvisioner(credentials);

        try {
            const startTime = (new Date()).getTime();

            const data = await retry(async (context) => {
                const ops = this.#options.ops;
                if (ops == "delete") {
                    return secretsProvisioner.deleteSecret(this.#options.secretName);
                } else if (ops == "create") {
                    return secretsProvisioner.createSecret(this.#options.secretName, {
                        username: this.#options.username,
                        password: this.#options.password
                    });
                } else {
                    return secretsProvisioner.updateSecretValue(this.#options.secretName, {
                        username: this.#options.username,
                        password: this.#options.password
                    });
                }
            },
                {
                    delay: 200,
                    factor: 2,
                    maxAttempts: 10,
                    jitter: true,
                    maxDelay: 10000,
                    handleError(err, context) {
                        console.log("error: " + err);
                        console.log("Attempted times: " + (context.attemptNum + 1));
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

    async #retrieveCredentials() {

        const credentialsRetriever = new CredentialsRetriever({
            accountId: this.#options.accountId,
            serviceRole: this.#options.serviceRole,
            resourceName: this.#options.secretName,
            resourceTaggingRole: this.#options.resourceTaggingRole
        });

        const credentials = await credentialsRetriever.retrieveCredentials();

        console.log("Credential retrieved with token: ", credentials.sessionToken);

        return credentials;
    }
}

module.exports.SecretsOpsController = SecretsOpsController;