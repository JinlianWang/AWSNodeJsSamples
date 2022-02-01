let uuid = require('uuid');
const AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});

let secretsmanager = new AWS.SecretsManager();

async function createOrUpdate(secretPathName, username, password) {
    let params = {
        SecretId: secretPathName
    };

    try { //Try to see if secret already exists with the same name
        let res = await secretsmanager.describeSecret(params).promise();
        console.log("Secret already exists with arn: ", res.ARN);

        //secrets already exists, update its value
        params = {
            ClientRequestToken: uuid.v4(),
            SecretId: secretPathName,
            SecretString: `{\"username\":\"${username}\",\"password\":\"${password}\"}`
        };
        res = await secretsmanager.putSecretValue(params).promise();
        console.log("Secret updated: ", res);
        return res.ARN;
    } catch (err) { //Secrets not existing yet, create one
        params = {
            ClientRequestToken: uuid.v4(),
            Description: "My test database secret created with the CLI",
            Name: secretPathName,
            SecretString: `{\"username\":\"${username}\",\"password\":\"${password}\"}`
        };
        let res = await secretsmanager.createSecret(params).promise();
        console.log("Result of creating a new secret: ", res);
        return res.ARN;
    }

}

module.exports.createOrUpdate = createOrUpdate;
