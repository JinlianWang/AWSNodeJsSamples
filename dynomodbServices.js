let uuid = require('uuid');
const AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});

let dynamodb = new AWS.DynamoDB();
const tableName = "SecretsInfo";

async function createSecretTable() {
    let params = {
        TableName: tableName
       };

    try {
        let res = await dynamodb.describeTable(params).promise();
        if(res.Table.TableStatus == 'CREATING' | res.Table.TableStatus == 'UPDATING') {
            return await dynamodb.waitFor('tableExists', params).promise(); 
        } else if(res.Table.TableStatus == 'ACTIVE') {
            return res;
        } else {
            throw new Error("Something is wrong with table status.");
        }
    } catch (err) {
        params = {
            AttributeDefinitions: [
                {
                    AttributeName: "Path", 
                    AttributeType: "S"
                }
            ], 
            KeySchema: [
                {
                    AttributeName: "Path", 
                    KeyType: "HASH"
                }
            ], 
            ProvisionedThroughput: {
                ReadCapacityUnits: 1, 
                WriteCapacityUnits: 1
            }, 
            TableName: tableName
        };
        let res = await dynamodb.createTable(params).promise();
        return res;
    }
}


async function createOrUpdateSecretRecord(data) {
    var params = {
        Item: {
         "Path": {
           S: data.path
          }, 
         "ARN": {
           S: data.ARN
          }
        }, 
        ReturnConsumedCapacity: "TOTAL", 
        TableName: tableName
       };
    return dynamodb.putItem(params).promise();
}

async function getSecretRecord(path) {
    var params = {
        Key: {
         "Path": {
           S: path
          }
        }, 
        TableName: tableName
    };
    return dynamodb.getItem(params).promise();
}

async function deleteSecretRecord(path) {
    var res = await getSecretRecord(path);
    let data = res.Item;
    console.log("data: ", data);
    data.Active = {"BOOL": false};
    var params = {
        Item: data, 
        ReturnConsumedCapacity: "TOTAL", 
        TableName: tableName
    };
    return dynamodb.putItem(params).promise();
}

module.exports.createSecretTable = createSecretTable;
module.exports.createOrUpdateSecretRecord = createOrUpdateSecretRecord;
module.exports.getSecretRecord = getSecretRecord;
module.exports.deleteSecretRecord = deleteSecretRecord;