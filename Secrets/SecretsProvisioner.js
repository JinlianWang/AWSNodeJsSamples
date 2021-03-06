let uuid = require('uuid');
const AWS = require('aws-sdk');

class SecretsProvisioner {

    #secretsmanager;

    constructor(options) {
        this.#secretsmanager = new AWS.SecretsManager(options);
    }

    async createOrUpdateSecret(secretPathName, options) {
        let params = {
            SecretId: secretPathName
        };

        try { //Try to see if secret already exists with the same name
            let res = await this.#secretsmanager.describeSecret(params).promise();
            console.log("Secret already exists with arn: ", res.ARN);

            //secrets already exists, update its value
            params = {
                ClientRequestToken: uuid.v4(),
                SecretId: secretPathName,
                SecretString: `{\"username\":\"${options.username}\",\"password\":\"${options.password}\"}`
            };
            res = await this.#secretsmanager.putSecretValue(params).promise();
            console.log("Secret updated: ", res);
            return { path: secretPathName, ARN: res.ARN };
        } catch (err) { //Secrets not existing yet, create one
            params = {
                ClientRequestToken: uuid.v4(),
                Description: "Test database secret created through Secrets Provisioner.",
                Name: secretPathName,
                SecretString: `{\"username\":\"${options.username}\",\"password\":\"${options.password}\"}`
            };
            let res = await this.#secretsmanager.createSecret(params).promise();
            console.log("Result of creating a new secret: ", res);
            return { path: secretPathName, ARN: res.ARN };
        }

    }

    async createSecret(secretPathName, options) {
        try {
            let params = {
                ClientRequestToken: uuid.v4(),
                Description: "Test database secret created through Secrets Provisioner.",
                Name: secretPathName,
                SecretString: `{\"username\":\"${options.username}\",\"password\":\"${options.password}\"}`
            };
            let res = await this.#secretsmanager.createSecret(params).promise();
            console.log("Result of creating a new secret: ", res);
            return { path: secretPathName, ARN: res.ARN };
        } catch (err) {
            throw new Error("Secret creation failed: " + err);
        }
    }

    async updateSecretValue(secretPathName, options) {
        try {
            let params = {
                ClientRequestToken: uuid.v4(),
                SecretId: secretPathName,
                SecretString: `{\"username\":\"${options.username}\",\"password\":\"${options.password}\"}`
            };
            let res = await this.#secretsmanager.putSecretValue(params).promise();
            console.log("Secret updated: ", res);
            return { path: secretPathName, ARN: res.ARN };
        } catch (err) {
            throw new Error("Secret value update failed: " + err);
        }
    }


    async deleteSecret(secretPathName) {
        try {
            let params = {
                SecretId: secretPathName
            };

            let res = await this.#secretsmanager.deleteSecret(params).promise();
            console.log("Secret deleted: ", res);
            return { path: secretPathName, ARN: res.ARN };
        } catch (err) {
            throw new Error("Secrets deletion failed: " + err);
        }
    }

    async readSecretValue(secretPathName) {
        try {
            let params = {
                SecretId: secretPathName
            };

            let res = await this.#secretsmanager.getSecretValue(params).promise();
            console.log("Secret read: ", res.ARN);
            return { path: secretPathName, ARN: res.ARN, secretString: res.SecretString };
        } catch (err) {
            throw new Error("Secret reading failed: " + err);
        }
    }

    async getSecretInfo(secretPathName) {
        let params = {
            SecretId: secretPathName
        };

        try {
            return await this.#secretsmanager.describeSecret(params).promise();
        } catch (err) {
            return null;
        }
    }

}

module.exports.SecretsProvisioner = SecretsProvisioner;

