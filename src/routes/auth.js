import allowMethods from 'allow-methods';
import { Router } from 'express';
import ldap from 'ldapjs';

const route = new Router();

// Save invalid login error outside function to call on it easier
const error = {
  error: 'Incorrect username or password.'
}

route
  .route('/')
  .all(allowMethods(['POST']))
  .post((req, res, next) => {
    // Check if username and password are received
    if(typeof req.body.username !== 'string' || typeof req.body.password !== 'string'){
      res.status(401).send(error);
      return;
    }

    // Connect to ldap
    const ldapClient = ldap.createClient({
      url: process.env.LDAP_URL,
      timeout: 5000,
      connectTimeout: 10000
    });

    ldapClient.bind(process.env.LDAP_USER, process.env.LDAP_PASS, err => {
      if(err){
        client.unbind();
  
        return next(err);
      }

      // Start search for the username we received
      const opts = {
        filter: `(&(objectclass=user)(samaccountname=${req.body.username}))`,
        scope: 'sub',
        attributes: ['dn', 'memberOf', 'sAMAccountName']
      }

      ldapClient.search(process.env.LDAP_CN, opts, (err, search) => {
        // Variable to store search results
        let foundObject = null;

        search.on('error', err => {
          ldapClient.unbind();
          return next(err);
        });

        // Stop searching if we find an object
        search.on('searchEntry', entry => {
          if(entry.object){
            foundObject = entry.object;
            ldapClient.unbind();
          }
        });

        search.on('end', result => {
          ldapClient.unbind();

          // End if no results were found
          if(!foundObject){
            res.status(401).send(error);
            return;
          }

          // We found a valid user, now try binding an LDAP request using
          // the credentials we received
          const userClient = ldap.createClient({
            url: process.env.LDAP_URL,
            timeout: 5000,
            connectTimeout: 10000
          });

          userClient.bind(foundObject.dn, req.body.password, err => {
            userClient.unbind();

            if(err){
              // Check if error happened due to password error
              if(err.name === 'InvalidCredentialsError'){
                res.status(401).send(error);
                return;
              }
  
              return next(err);
            }

            // Add fake members array if it doesn't exist

            // TODO: foundObject.memberOf returns a string if there is only
            //       one group. Make sure we check for this in the future.
            if(typeof foundObject.memberOf !== 'object' && !(foundObject.memberOf instanceof Array)){
              foundObject.memberOf = [];
            }

            // User authentication succeeded. Now check if user has the necessary groups
            const groupRO = new RegExp('^cn='+process.env.LDAP_RO_GROUP, 'i');
            const groupRW = new RegExp('^cn='+process.env.LDAP_RW_GROUP, 'i');
            const groups = foundObject.memberOf.filter(group => groupRO.test(group) || groupRW.test(group));

            // No groups passed the check, this means the user credentials are
            // correct, but user doesn't have permissions
            if(!groups.length){
              res.status(403).send({error: 'You do not have the necessary permissions.'});
              return;
            }

            res.send('Login successful');
          });
        });
      });
    });
  });

export default route;