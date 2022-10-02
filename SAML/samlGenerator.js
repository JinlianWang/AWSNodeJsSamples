var saml = require('./node-saml/lib/saml20');
var fs = require('fs');

var options = {
  cert: fs.readFileSync("./node-saml/test" + '/test-auth0.pem'),
  key: fs.readFileSync("./node-saml/test" + '/test-auth0.key'),
  issuer: 'CapOneEnterprise',
  lifetimeInSeconds: 600,
  audiences: 'IAMShowcase',
  attributes: {
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': 'foo@bar.com',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': 'Foo Bar'
  },
  nameIdentifier: 'foo',
  sessionIndex: '_faed468a-15a0-4668-aed6-3d9c478cc8fa'
};

var signedAssertion = saml.create(options);
console.log("xml: ", signedAssertion);

console.log(Buffer.from(signedAssertion).toString('base64'));



