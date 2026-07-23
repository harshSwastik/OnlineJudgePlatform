const express = require('express');
const app = express();
 const cors = require('cors');
require('dotenv').config();
const main = require('./config/db');
const cookie = require('cookie-parser');
const {authRouter} = require('./routes/userAuth');
const aiRouter = require('./routes/AiChatting');
const problemRouter = require('./routes/problemcreator');
const RedisClient = require('./config/redis');
const submitRouter = require('./routes/submit');
const VideoRouter = require('./routes/videoCreator');
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookie());
app.use('/user', authRouter);
app.use('/submission', submitRouter);
app.use('/problem', problemRouter);
app.use('/ai', aiRouter);
app.use('/video', VideoRouter);

const InitializeConnection = async () => {
 try{
  await Promise.all([main(), RedisClient.connect()]);
  console.log("DB Connnected");
  app.listen(process.env.PORT , () => {
  console.log("server listening on port " + process.env.PORT);

})
 }
 catch(err){
  console.log("Error: " + err);
 }
}
  
InitializeConnection();
 
