const { SecretsOpsController } = require('./SecretsOpsController');
const utils = require('./Utils');


exports.handler = async (event) => {
    const serviceRole = process.env.SECRETS_SERVICE_ROLE; 
    const resourceTaggingRole = process.env.SECRETS_TAGGING_ROLE; 
    const tableName = process.env.DYNAMODB_TABLE_NAME; 
    const secretsProvisionerPath = process.env.SECRETS_PROVISIONER_PATH;
    const httpMethod = event.httpMethod;
    const path = event.path;
    let response;

   switch(httpMethod) {
       case "POST":
            if(event.body == null) {
                response = utils.generateResponse(400, "No body is found for POST http method."); //400 Bad Request
            }

            if(path != secretsProvisionerPath) {
                response  = utils.generateResponse(404, "Only path of " + secretsProvisionerPath + " is supported."); //404 Not Found
            }

            let data = utils.validateBody(event.body);

            if(data.statusCode != null) return data; //Return http response back without further processing, as it contains invalid input in body. 

            const secretsOpsController = new SecretsOpsController()
                .setRoleName(serviceRole)
                .setResourceTaggingRole(resourceTaggingRole)
                .setTableName(tableName);

            let res = await secretsOpsController.handleSecretOperation(data);

            response = utils.generateResponse(200, JSON.stringify(res));

            break;
       default: 
            response = utils.generateResponse(405, "Http Method of " + httpMethod + " is not supported."); //405 Method Not Allowed
   }

    return response;
};

/* 
//Sandbox: 975156237701 

const data ={
    "ops": "create",
    "accountId": "975156237701", 
    "secretName": "/rds/test",
    "userName": "userName8",
    "password": "userPassword8"
}; 

const event = {
    "path": "/secrets",
    "httpMethod": "POST",
    "body": JSON.stringify(data)
}; 

exports.handler(event).then(res=>{
    console.log("test", res);
});
 */

/*
export SECRETS_SERVICE_ROLE=Secrets-Provisioning-Role
export SECRETS_TAGGING_ROLE=Secrets-Tagging-Role
export DYNAMODB_TABLE_NAME=SecretsInfo
export SECRETS_PROVISIONER_PATH=/secrets

zip -r function.zip . 
aws lambda update-function-code --function-name SecretsProvisioner --zip-file fileb://function.zip
*/