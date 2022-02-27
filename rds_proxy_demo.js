const { Client } = require('pg');
const AWS = require("aws-sdk");

const proxyHealthCheck = async (event, context) => {
  console.log(JSON.stringify({ event, context }));

  var signer = new AWS.RDS.Signer({
    region: 'us-east-1', 
    hostname: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER
  });
  
  let token = signer.getAuthToken({
    username: process.env.DB_USER
  });

  console.log('Creating database client')

  const client = new Client({
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: token,
    host: process.env.DB_HOST,
    ssl: { rejectUnauthorized: false }, //For production, need to pass in right cert and rejectUnauthorized=true.
    port: process.env.DB_PORT
  })

  let response
  try {
    console.log('Connecting to database')
    await client.connect()

    console.log('Quering the database')
    const res = await client.query('SELECT usename AS role_name FROM pg_catalog.pg_user')
    let users = "";
    res.rows.forEach(element => {
      users = users + "," + element['role_name'];
    });

    response = {
      statusCode: 200,
      body: JSON.stringify({
        serverTimestamp: new Date().toISOString(),
        users: users
      })
    }
  } catch (error) {
    console.error(error)
    response = {
      statusCode: 500,
      body: error.message
    }
  } finally {
    console.log('Closing database connection')
    await client.end()
  }

  console.log(response)
  return response
}

module.exports.handler = proxyHealthCheck
