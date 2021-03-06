const AWS = require('aws-sdk');
const { SecretsOpsController } = require('./SecretsOpsController');
const utils = require('./Utils');


exports.handler = async (event) => {

    AWS.config.update({ region: 'us-east-1' });

    const serviceRole = process.env.SECRETS_SERVICE_ROLE;
    const resourceTaggingRole = process.env.SECRETS_TAGGING_ROLE;
    const tableName = process.env.DYNAMODB_TABLE_NAME;
    const secretsProvisionerPath = process.env.SECRETS_PROVISIONER_PATH;

    if (event.httpMethod == "POST") {
        let response;
        if (event.body == null) {
            response = utils.generateResponse(400, "No body is found for POST http method."); //400 Bad Request
        }

        if (event.path != secretsProvisionerPath) {
            response = utils.generateResponse(404, "Only path of " + secretsProvisionerPath + " is supported."); //404 Not Found
        }

        response = utils.validateBody(event.body);

        if (response != null) return response; //Return http response back without further processing, as it does not pass body validation. 

        const data = JSON.parse(event.body);
        try {
            const secretsOpsController = new SecretsOpsController({
                serviceRole: serviceRole,
                resourceTaggingRole: resourceTaggingRole,
                tableName: tableName
            });

            return await secretsOpsController.handleSecretOperation(data);
        } catch (err) {
            return utils.generateJsonResponse(500, { result: "Internal server error: " + err }, data);
        }
    } else {
        return utils.generateResponse(405, "Http Method of " + event.httpMethod + " is not supported."); //405 Method Not Allowed
    }
};


/*
//Sandbox: 975156237701 

const data = {
    "ops": "update",
    "accountId": "975156237701",
    "secretName": "/rds/userb",
    "username": "new6",
    "password": "new6"
};

const event = {
    "path": "/secrets",
    "httpMethod": "POST",
    "body": JSON.stringify(data)
};

exports.handler(event).then(res => {
    console.log("Response:", res);
});

*/

/*
export AWS_PROFILE=admin
export SECRETS_SERVICE_ROLE=Secrets-Provisioning-Role
export SECRETS_TAGGING_ROLE=Secrets-Tagging-Role
export DYNAMODB_TABLE_NAME=SecretsInfo
export SECRETS_PROVISIONER_PATH=/secrets

rm -rf function.zip & zip -r function.zip . -x ".git/*"
aws lambda update-function-code --function-name SecretsProvisioner --zip-file fileb://function.zip

{
  "path": "/secrets",
  "httpMethod": "POST",
  "body": "{\"ops\":\"update\", \"accountId\":\"975156237701\",\"secretName\":\"/rds/userg\",\"username\":\"username-g\",\"password\":\"password-g\"}"
}
*/