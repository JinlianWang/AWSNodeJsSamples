const { SecretsOpsController } = require('./SecretsOpsController');


exports.handler = async (event) => {
    const serviceRole = process.env.SECRETS_SERVICE_ROLE; 
    const resourceTaggingRole = process.env.SECRETS_TAGGING_ROLE; 
    const tableName = process.env.DYNAMODB_TABLE_NAME; 

    const secretsOpsController = new SecretsOpsController()
        .setAccountId(event.accountId)
        .setRoleName(serviceRole)
        .setSecretName(event.secretName)
        .setResourceTaggingRole(resourceTaggingRole)
        .setUserName(event.userName)
        .setPassword(event.password)
        .setTableName(tableName);

    let res = await secretsOpsController.createOrUpdateSecret();
    res = await secretsOpsController.saveToDynamoDB(res);

    const response = {
        statusCode: 200,
        body: JSON.stringify(res)
    };

    return response;
};

/*
//Sandbox: 975156237701 
const event = {
  "accountId": "730508922179", 
  "secretName": "/rds/admin3",
  "userName": "userName7",
  "password": "userPassword7"
}; 

exports.handler(event).then(res=>{
    console.log("test", res);
});
*/

/*
export SECRETS_SERVICE_ROLE=Secrets-Provisioning-Role
export SECRETS_TAGGING_ROLE=Secrets-Tagging-Role
export DYNAMODB_TABLE_NAME=SecretsInfo
zip -r function.zip . 
aws lambda update-function-code --function-name SecretsProvisioner --zip-file fileb://function.zip
*/