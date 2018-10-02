import jwt from 'jsonwebtoken';

export default function(opts, callback){
  jwt.sign({
    username: opts.username,
    admin: opts.admin
  },
  process.env.TOKEN_SECRET,
  {
    expiresIn: '2h'
  },
  (err, token) => {
    try{
      if(err){
        return callback(err);
      }
  
      // Add token to response headers
      opts.res.set('Authorization', token);
      callback(null, token);
    }catch(err){
      callback(err);
    }
  });
}