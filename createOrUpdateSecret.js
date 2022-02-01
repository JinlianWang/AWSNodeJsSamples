const createOrUpdate = require("./secretServices").createOrUpdate;


let args = process.argv.slice(2)

const username = args[0]; 
const password = args[1];
let secretPathName = args[2];
if(secretPathName == null) {
    secretPathName = "/uuid1/rds/credential";
}

console.log("Trying to create a secret using username: ", username, " password: ", password, " at: ", secretPathName);


createOrUpdate(secretPathName, username, password).then((res)=>{
    console.log("Secret ARN returned: ", res);
});
