const retry = require('@lifeomic/attempt').retry;
const SecretsProvisioner = require("./SecretsProvisioner").SecretsProvisioner;
const { CredentialsRetriever } = require("./CredentialsRetriever");

let args = process.argv.slice(2)
let secretName = args[0]; 
let serviceRole = args[1]; 

if(secretName == null) {
    secretName = "/uuid1/rds/credential";
}

if(serviceRole == null) {
    serviceRole = "read-admin-role";
}

const startTime = (new Date()).getTime();

console.log("Trying to CRUD: ", secretName, "at: ", startTime);


async function createOrUpdateSecret(secretName, accountId, serviceRole, startTime) {
    const credentialsRetriever = new CredentialsRetriever();

    const credentials = await credentialsRetriever
        .setAccountId(accountId)
        .setRoleName(serviceRole)
        .setResourceName(secretName)
        .retrieveCredentials();

        console.log("Credential retrieved:", credentials);

        
    const secretsProvisioner = new SecretsProvisioner(credentials);

    try {
        const data = await retry(async (context) => {

            return secretsProvisioner.createOrUpdateSecret(secretName, "testname21", "testpassword21");

        },
        {
            delay: 200,
            factor: 2,
            maxAttempts: 10,
            jitter: true, 
            maxDelay: 10000, 
            handleError (err, context) {
                console.log("error: " + err);
                console.log("Attempted times: " + (context.attemptNum+1));
            }
        });
        console.log("Response: ", data);
        console.log("Total time taken in millisecond: ", (new Date()).getTime() - startTime);
        return data;
    } catch (err) {
        console.log("Exceeding number of retries: ", err);
        throw new Error("Error: ", err);
    }
    
}

createOrUpdateSecret(secretName, "730508922179", serviceRole, startTime).then(res=>{
    console.log("Secrets updated: ", res);
});