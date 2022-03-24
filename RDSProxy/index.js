const AWS = require('aws-sdk');


AWS.config.update({ region: 'us-east-1' });
var lambda = new AWS.Lambda();

function readSecretValue(secretName) {

    const data = {
        "ops": "read",
        "accountId": "975156237701",
        "secretName": secretName
    };

    const event = {
        "path": "/secrets",
        "httpMethod": "POST",
        "body": JSON.stringify(data)
    };

    var params = {
        FunctionName: 'SecretsProvisioner', /* required */
        InvocationType: 'RequestResponse',
        Payload: JSON.stringify(event)
    };

    lambda.invoke(params, function (err, res) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
            const data = JSON.parse(res.Payload);
            const secret = JSON.parse(data.body);
            if (secret.value) {
                console.log("Vaule for: " + secretName + " is: " + secret.value);
            }
        }
    });
}

const interval = 1000;

function intervalFunc(secretName) {
    readSecretValue(secretName);
}

setInterval(intervalFunc, 2 * interval, "/rds/userb");

setTimeout(() => {
    setInterval(intervalFunc, 2 * interval, "/rds/userg");
}, interval);