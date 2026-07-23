 const express = require('express');
 const authRouter = express.Router();
 const {register,login,logout,adminRegister,deleteProfile,getProfile} = require('../controllers/userAuthn');
 const {submittedProblem} = require('../controllers/userProblem');
 const userMiddleware = require('../middleware/userMiddleware');
 const adminMiddleware = require('../middleware/adminMiddleware');


 
authRouter.post('/register',register);
authRouter.post('/login',login);
authRouter.post('/logout',userMiddleware,logout);
authRouter.post('/admin/register',adminMiddleware,adminRegister);
authRouter.get('/getProfile',userMiddleware,getProfile);
authRouter.delete('/deleteProfile',userMiddleware,deleteProfile);
authRouter.get('/submittedProblem/:id',userMiddleware,submittedProblem);
authRouter.get('/check',userMiddleware,(req,res)=>{
    const reply = {
     firstName:req.user.firstName,
     email:req.user.email,
     _id:req.user._id,  
     role :req.user.role
    }
    res.status(200).json({
        user:reply,
        message:"Authenticated User",
    });
})

 module.exports = {authRouter};