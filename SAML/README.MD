A project to play with SAML assertion. [node-saml](https://github.com/auth0/node-saml) is another public repo we used to general saml (see commands below). Directly include this repo in here, just for convenience as it is not published module. [Validate SAML Response](https://www.samltool.com/validate_response.php) is a good place to validate SAML assertion. [xml-crypto](https://github.com/yaronn/xml-crypto) is used by other module to validate xml signature, including this one used in this project, [Node Saml](https://github.com/Authress/saml-login.js). 

## Checks during SAML validation

1) Is this for me? Check the SP entity ID (saml:Audience field) and make sure it matches the entity in its SP metadata xml; 
2) Is this from an IdP I trust? Check the IdP entity ID (saml:Issuer field) and make sure it matches the entity in its IdP metadata xml;
3) Is this for my ACS? Check the SP Attribute Consume Service Endpoint (saml:SubjectConfirmationData node, Recipient attribute) and make sure it matches the ACS in SP metadata xml; 
4) Is now within the timeframe defined? Check the time range (saml:Conditions node, NotBefore and NotOnOrAfter attributes) and make sure now falls within the range <NotBefore, NotOnOrAfter>;
5) Is this the certificate from the IdP I trust? Check the certificate (KeyInfo node, X509Certificate field) and make sure it matches the cert in its IdP metadata xml; 
6) Is the signature valid? Check for signature (ds:SignatureValue field) and verify whether it is the right signature for the digest value (ds:DigestValue field), which is calculated from the xml (after xml and new line normalization), and using the digest method as specified (ds:SignatureMethod node and Algorithm attribute). 


Note: xml.replace(/\r\n?/g, "\n") to normalize the new line, and (0, exports.parseDomFromString)(xml).toString() to normalize the xml. 


## Commands

To validate saml assertion, 
```
node --inspect-brk index.js //to validate SAML assertion. The current saml and signature does not match. Need to find one that works. 
node xmlEncrypt.js  //to generate an xml file called signed.xml, with signed info 
node xmlVerify.js //to verify that the signed.xml generated in previous command to be a valid xml
```

To run general saml, needs to 

```
git clone https://github.com/auth0/node-saml
npm install ./node-saml/
node samlGenerator.js //To generate a saml
```

To debug in node.js, run the ```node --inspect-brk <js file>``` and then launch Chrome new tab pointing to "chrome://inspect", and click the "Remote Target", which would open up a new Chrome Dev Tool window and pause at the first line. 