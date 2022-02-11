const { SecretsOpsController } = require('./SecretsOpsController');


exports.handler = async (event) => {
    const serviceRole = "Secrets-Provisioning-Role";

    const secretsOpsController = new SecretsOpsController()
        .setAccountId("730508922179")
        .setRoleName(serviceRole)
        .setSecretName(event.secretName)
        .setUserName(event.userName)
        .setPassword(event.password)
        .setTableName("SecretsInfo");

    let res = await secretsOpsController.createOrUpdateSecret();
    res = await secretsOpsController.saveToDynamoDB(res);

    const response = {
        statusCode: 200,
        body: JSON.stringify(res)
    };

    return response;
};

/*
const event = {
  "secretName": "/rds/admin3",
  "userName": "userName4",
  "password": "userPassword4"
}; 

exports.handler(event).then(res=>{
    console.log("test", res);
});
*/

//zip -r function.zip . 
//aws lambda update-function-code --function-name SecretsProvisioner --zip-file fileb://function.zip