   
 const jwt = require('jsonwebtoken');
 const User = require('../models/user');
 const RedisClient = require('../config/redis');
 
 const userMiddleware = async (req,res,next)=>{
     try{
       const {token} = req.cookies;
       if(!token) throw new Error('Token is not present');
       const payload = jwt.verify(token, process.env.JWT_KEY);
       const {_id} = payload;
       if(!_id) throw new Error('Invalid token');
       const result = await User.findById(_id);
       if(!result) throw new Error('User does not exist');
       
       const IsBlocked = await RedisClient.exists(`token ${token}`); // check if the token is blocked or not
       if(IsBlocked) throw new Error('Invalid token');
       req.user = result;
       next();
     } catch(err){
       res.status(401).send("Error" + err);
     }
 };
 
 module.exports = userMiddleware;