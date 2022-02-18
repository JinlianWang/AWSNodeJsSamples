let uuid = require('uuid');
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });

class SecretsProvisioner {

    #secretsmanager;

    constructor(options) {
        this.#secretsmanager = new AWS.SecretsManager(options);
    }

    async createOrUpdateSecret(secretPathName, username, password) {
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
                SecretString: `{\"username\":\"${username}\",\"password\":\"${password}\"}`
            };
            res = await this.#secretsmanager.putSecretValue(params).promise();
            console.log("Secret updated: ", res);
            return { path: secretPathName, ARN: res.ARN };
        } catch (err) { //Secrets not existing yet, create one
            params = {
                ClientRequestToken: uuid.v4(),
                Description: "Test database secret created through Secrets Provisioner.",
                Name: secretPathName,
                SecretString: `{\"username\":\"${username}\",\"password\":\"${password}\"}`
            };
            let res = await this.#secretsmanager.createSecret(params).promise();
            console.log("Result of creating a new secret: ", res);
            return { path: secretPathName, ARN: res.ARN };
        }

    }

    async deleteSecret(secretPathName) {
        let params = {
            SecretId: secretPathName
        };

        try { //Try to see if secret already exists with the same name
            let res = await this.#secretsmanager.describeSecret(params).promise();
            console.log("Secret already exists with arn: ", res.ARN);

            //secrets already exists, update its value
            params = {
                ClientRequestToken: uuid.v4(),
                SecretId: secretPathName
            };

            res = await this.#secretsmanager.deleteSecret(params).promise();
            console.log("Secret updated: ", res);
            return res;
        } catch (err) { //Secrets not existing yet, create one

        }
    }

    async getSecretInfo(secretPathName) {
        let params = {
            SecretId: secretPathName
        };

        try {
            let res = await this.#secretsmanager.describeSecret(params).promise();
            return res;
        } catch (err) {
            return null;
        }
    }

}

module.exports.SecretsProvisioner = SecretsProvisioner;

