const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });

class DynamoDBUpdator {

    #dynamodb;
    #tableName;

    constructor(options) {
        this.#dynamodb = new AWS.DynamoDB(options);
        this.#tableName = options.tableName != null ? options.tableName : "SecretsInfoProd";
    }

    async createSecretTable() {
        let params = {
            TableName: this.#tableName
        };

        try {
            let res = await this.#dynamodb.describeTable(params).promise();
            if (res.Table.TableStatus == 'CREATING' | res.Table.TableStatus == 'UPDATING') {
                return await this.#dynamodb.waitFor('tableExists', params).promise();
            } else if (res.Table.TableStatus == 'ACTIVE') {
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
                TableName: this.#tableName
            };
            let res = await this.#dynamodb.createTable(params).promise();
            return res;
        }
    }


    async updateSecretRecord(data) {
        var params = {
            Key: {
                "Path": {
                    S: data.path
                }
            },
            ExpressionAttributeNames: {
                "#LUO": "LastUpdatedOn"
            },
            ExpressionAttributeValues: {
                ":x": {
                    N: String(new Date().getTime())
                }
            },
            UpdateExpression: "SET #LUO = :x",
            TableName: this.#tableName
        };

        return this.#dynamodb.updateItem(params).promise();
    }

    async createSecretRecord(data) {
        var params = {
            Item: {
                "Path": {
                    S: data.path
                },
                "ARN": {
                    S: data.ARN
                },
                "CreatedOn": {
                    N: String(new Date().getTime())
                }
            },
            TableName: this.#tableName
        };
        return this.#dynamodb.putItem(params).promise();
    }

    async getSecretRecord(path) {
        var params = {
            Key: {
                "Path": {
                    S: path
                }
            },
            TableName: this.#tableName
        };
        return this.#dynamodb.getItem(params).promise();
    }

    async deleteSecretRecord(path) {
        var params = {
            Key: {
                "Path": {
                    S: path
                }
            },
            ExpressionAttributeNames: {
                "#A": "Active",
                "#DO": "DeletedOn"
            },
            ExpressionAttributeValues: {
                ":x": {
                    BOOL: false
                },
                ":y": {
                    N: String(new Date().getTime())
                }
            },
            UpdateExpression: "SET #A = :x, #DO = :y",
            TableName: this.#tableName
        };

        return this.#dynamodb.updateItem(params).promise();
    }
}

module.exports.DynamoDBUpdator = DynamoDBUpdator;
