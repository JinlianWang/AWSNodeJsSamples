const AWS = require('aws-sdk');
const sts = new AWS.STS();

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

    setResourceTaggingRole(roleName) {
        this.#info.resourceTaggingRole = roleName;
        return this;
    }

    async retrieveCredentials() {
        let res;
        if(this.#info.resourceName != null) {
            res = await this.#tagRole();
        }
    
        res = await this.#assumeRole(this.#info.roleName);
        return res; 
    }

    async #assumeRole(roleName) {
        const accountId = this.#info.accountId;

        if(roleName == null) {
            throw new Error("Role name not set!");
        }

        if(accountId == null) {
            throw new Error("Account Id not set!");
        }

        const roleArn = "arn:aws:iam::" + accountId + ":role/" + roleName;
    
        const res = await sts.assumeRole({
            RoleArn: roleArn,
            RoleSessionName: "assumed-session"
        }).promise();
    
        return {
            accessKeyId: res.Credentials.AccessKeyId,
            secretAccessKey: res.Credentials.SecretAccessKey,
            sessionToken: res.Credentials.SessionToken,
        };
    }

    async #tagRole() {
        const credentials = await this.#assumeRole(this.#info.resourceTaggingRole); 
        let iam = new AWS.IAM(credentials);
        res = await iam.tagRole({
            RoleName: this.#info.roleName,
            Tags: [
                {
                    Key: "resourceName",
                    Value: this.#info.resourceName
                }
            ]
        }).promise();
        
        console.log("Tagging response: ", res);
        return res; 
    }
}

module.exports.CredentialsRetriever = CredentialsRetriever;