const AWS = require('aws-sdk');
const sts = new AWS.STS();
var iam = new AWS.IAM();
const roleName = "read-admin-role"
const roleArn = "arn:aws:iam::730508922179:role/" + roleName;

var args = process.argv.slice(2)

const targetRole = args[0]; //admin_role Test-Role

console.log("trying to read role: ", targetRole);

var params = {
  RoleName: roleName, 
  Tags: [
     {
    Key: "resourceName", 
    Value: targetRole
   }
  ]
 };

 iam.tagRole(params, function(err, data) {
   if (err) console.log(err, err.stack); // an error occurred
   else     console.log(data);           // successful response
   assumeRole();
 });

 function assumeRole() {
    const timestamp = (new Date()).getTime();
    const params = {
      RoleArn: roleArn,
      RoleSessionName: `be-descriptibe-here-${timestamp}`
    };
    sts.assumeRole(params, (err, data) => {
      if (err) reject(err);
      else {
        console.log("Credentials:", JSON.stringify({
          accessKeyId: data.Credentials.AccessKeyId,
          secretAccessKey: data.Credentials.SecretAccessKey,
          sessionToken: data.Credentials.SessionToken,
        }));
        var iam2 = new AWS.IAM({
          accessKeyId: data.Credentials.AccessKeyId,
          secretAccessKey: data.Credentials.SecretAccessKey,
          sessionToken: data.Credentials.SessionToken,
          maxRetries: 15, 
          retryDelayOptions: {base: 300}
        });
        var params = {
          RoleName: targetRole
         };
         iam2.getRole(params, function(err, data) {
           if (err) console.log(err, err.stack); // an error occurred
           else     console.log(data);           // successful response
         });
      }
    });
  };



