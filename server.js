const http = require('http')
const {getSecretInfo, createOrUpdate} = require("./SecretsProvisioner");

const port = process.env.PORT || 3000

const server = http.createServer((req, res) => {
  if(req.url == "/get"){
    getSecretInfo("/uuid1/rds/credential").then((secret)=>{
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      res.end(`<h1>ARN GET:${secret.ARN} </h1>`);
    });
  } else if(req.url == "/put") {
    createOrUpdate("/uuid1/rds/credential", "hellousername", "hellopassword").then((secret)=>{
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      res.end(`<h1>ARN:${secret.ARN} </h1>`);
    });
  }
})

server.listen(port, () => {
  console.log(`Server running at port ${port}`)
})
