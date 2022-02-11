const AWS = require('aws-sdk');
const sts = new AWS.STS();
let iam = new AWS.IAM();

class CredentialsRetriever {

    #info = {};

    setAccountId(accountId) {
        this.#info.accountId = accountId;
        return this;
    }

    setRoleName(roleName) {
        this.#info.roleName = roleName;
        return this;
    }

    setResourceName(resourceName) {
        this.#info.resourceName = resourceName;
        return this;
    }

    async retrieveCredentials() {
        const accountId = this.#info.accountId;
        const roleName = this.#info.roleName;
        const resourceName = this.#info.resourceName;

        if(roleName == null) {
            throw new Error("Role name not set!");
        }

        if(accountId == null) {
            throw new Error("Account Id not set!");
        }


        const roleArn = "arn:aws:iam::" + accountId + ":role/" + roleName;

        let res; 

        if(resourceName != null) {
            res = await iam.tagRole({
                RoleName: roleName,
                Tags: [
                    {
                        Key: "resourceName",
                        Value: resourceName
                    }
                ]
            }).promise();
        
            console.log("Tagging response: ", res);
        }
    
        res = await sts.assumeRole({
            RoleArn: roleArn,
            RoleSessionName: "assumed-session"
        }).promise();
    
        return {
            accessKeyId: res.Credentials.AccessKeyId,
            secretAccessKey: res.Credentials.SecretAccessKey,
            sessionToken: res.Credentials.SessionToken,
        };
    }

}

module.exports.CredentialsRetriever = CredentialsRetriever;