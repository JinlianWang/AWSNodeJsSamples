const AWS = require('aws-sdk');
const res = require('express/lib/response');
let uuid = require('uuid');
AWS.config.update({region:'us-east-1'});

let secretsmanager = new AWS.SecretsManager();


let args = process.argv.slice(2)

const username = args[0]; 
const password = args[1];

let secretPathName = args[2];
if(secretPathName == null) {
    secretPathName = "/uuid1/rds/credential";
}

console.log("Trying to create a secret using username: ", username, " password: ", password, " at: ", secretPathName);


async function createIfNotExisting() {
    let params = {
        SecretId: secretPathName
    };

    try {//Try to see if secret already exists with the same name
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
    } catch (err) {//Secrets not existing yet, create one
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


createIfNotExisting().then((res)=>{
    console.log("Secret ARN returned: ", res);
});
