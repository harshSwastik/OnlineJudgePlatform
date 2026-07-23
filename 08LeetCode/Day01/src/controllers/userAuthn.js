const user = require('../models/user');
const validate = require('../utils/validator');  
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');

const register = async (req,res) => {

    try{
    // but validating the data is also necessary before saving it to the database.
    validate(req.body);  
    const {firstname,password,emailId} = req.body;
    req.body.password = await bcrypt.hash(password,10);
    req.body.role = 'user';
    const new_user = await user.create(req.body); 

    const token = jwt.sign({_id:new_user._id, emailId:new_user.emailId,role:new_user.role}, process.env.JWT_KEY, {expiresIn: 60*60});
 res.cookie('token', token, {
  maxAge: 60 * 60 * 1000,
  httpOnly: true,
  sameSite: 'lax',
  secure: false // set true only when using https in production
}); // max age is in milisecs 
     const reply = {
      _id: new_user._id,
      firstname: new_user.firstname,
      emailId: new_user.emailId, 
    }
    res.status(201).json({ message: "User registered successfully", user: reply });
    }
    catch(err){
    res.status(400).send("Error" + err);
    }
}
const login = async (req,res) => {
try{
   const {password,emailId} = req.body;
   if(!emailId || !password) throw new Error('Invalid credentials');
   const new_user = await user.findOne({emailId});
   const match = await bcrypt.compare(password, new_user.password );
    if(!match) throw new Error('Invalid credentials');
    const token = jwt.sign({_id:new_user._id, emailId:new_user.emailId,role:new_user.role}, process.env.JWT_KEY, {expiresIn: 60*60});
    res.cookie('token', token, {
  maxAge: 60 * 60 * 1000,
  httpOnly: true,
  sameSite: 'lax',
  secure: false // set true only when using https in production
}); // max age is in milisecs 
    const reply = {
      _id: new_user._id,
      firstname: new_user.firstname,
      emailId: new_user.emailId, 
    }
    res.status(200).json({ message: "User logged in successfully", user: reply });
}
catch(err){
 res.status(401).send("Error" + err);
}  
}  
// logout feature 
const logout = async (req,res) => {
 try{
    const {token} = req.cookies;
    const paload = jwt.decode(token);
    await redisClient.set(`token ${token}`, 'Blocked');
    await redisClient.expireAt(`token ${token}`, paload.exp);
   res.cookie("token", null, {
  expires: new Date(Date.now()),
  httpOnly: true,
  sameSite: 'lax',
  secure: false
});
    res.send("User logged out successfully");
 }
 catch(err){
  res.status(503).send("Error" + err);
 }
}

  const adminRegister = async (req,res) => {

    try{
    // but validating the data is also necessary before saving it to the database.
    validate(req.body);  
    const {firstname,password,emailId} = req.body;
    req.body.password = await bcrypt.hash(password,10);
    req.body.role = 'admin';
    const new_user = await user.create(req.body); 

    const token = jwt.sign({_id:new_user._id, emailId:new_user.emailId,role:new_user.role}, process.env.JWT_KEY, {expiresIn: 60*60});
    res.cookie('token', token, {
  maxAge: 60 * 60 * 1000,
  httpOnly: true,
  sameSite: 'lax',
  secure: false // set true only when using https in production
}); // max age is in milisecs 
    res.status(201).send("User registered successfully");
    }
    catch(err){
    res.status(400).send("Error" + err);
    }
}
const deleteProfile = async (req,res) => {
    try{
       const userId = req.user._id;
       await user.findByIdAndDelete(userId); 
       res.status(200).send("User profile deleted successfully");
    }
    catch(err){
        res.status(500).send("Error" + err);
    }
}
const getProfile = async (req, res) => {
  try {
    const { _id, firstname, lastname, emailId, role } = req.user;
    res.status(200).send({ _id, firstname, lastname, emailId, role });
  } catch (err) {
    res.status(500).send("Error" + err);
  }
};
 module.exports = {register,login,logout,adminRegister,deleteProfile,getProfile};