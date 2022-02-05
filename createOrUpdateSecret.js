const { createOrUpdateSecret } = require("./secretServices");
const { createSecretTable, createOrUpdateSecretRecord, getSecretRecord, deleteSecretRecord } = require("./dynomodbServices"); 


let args = process.argv.slice(2)

const username = args[0]; 
const password = args[1];
let secretPathName = args[2];
if(secretPathName == null) {
    secretPathName = "/uuid1/rds/credential";
}

console.log("Trying to create a secret using username: ", username, " password: ", password, " at: ", secretPathName);


createSecretTable().then((res)=> {
    console.log("Table created: ", res); 
    createOrUpdateSecret(secretPathName, username, password).then((res)=>{
        console.log("Secret ARN returned: ", res);
        createOrUpdateSecretRecord({path: secretPathName, ARN: res.ARN}).then((res)=>{
            console.log("Secret saved: ", res);
        });
    });
});


getSecretRecord(secretPathName).then((res)=>{
    console.log("Secret found: ", res);
});


deleteSecretRecord(secretPathName).then((res)=>{
    console.log("Secret deleted: ", res);
});

