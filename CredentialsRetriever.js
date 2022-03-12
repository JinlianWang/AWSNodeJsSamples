const AWS = require('aws-sdk');
const sts = new AWS.STS();

class CredentialsRetriever {

    #options;

    constructor(options) {
        this.#options = Object.assign({}, options);
    }

    async retrieveCredentials() {
        let res;
        if (this.#options.resourceName != null) {
            res = await this.#tagRole();
        }

        res = await this.#assumeRole(this.#options.roleName);
        return res;
    }

    async #assumeRole(roleName) {
        const accountId = this.#options.accountId;

        if (roleName == null) {
            throw new Error("Role name not set!");
        }

        if (accountId == null) {
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
        const credentials = await this.#assumeRole(this.#options.resourceTaggingRole);
        const parts = this.#options.roleName.split("/");
        const roleName = parts[parts.length-1];
        let iam = new AWS.IAM(credentials);
        let res = await iam.tagRole({
            RoleName: roleName,
            Tags: [
                {
                    Key: "resourceName",
                    Value: this.#options.resourceName
                }
            ]
        }).promise();

        console.log(`Tagging ${this.#options.roleName} successfully with response: ${res}.`);
        return res;
    }
}

module.exports.CredentialsRetriever = CredentialsRetriever;