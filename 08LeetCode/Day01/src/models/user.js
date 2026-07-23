const mongoose = require('mongoose');
const {Schema} = mongoose;

const userSchema = new Schema({
  firstname: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 20
  },
  lastname: {
    type: String,
    minlength: 3,
    maxlength: 20
  },
  password:{
   type: String,
   required: true 
  }, 
  emailId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    imutable: true,
  },
  age :{
   type: Number,
   min: 6,
   max : 80,
  },
  role :{
  type: String,
  enum: ['user', 'admin'],
  default: 'user'
  },
 problemsSolved : [{
  type :mongoose.Schema.Types.ObjectId,
  ref : 'problem',
  unique: true
 }]
},{timestamps: true} 
);

userSchema.post('findOneAndDelete', async function(userinfo) {
 if(userinfo) {
 await mongoose.model('Submission').deleteMany({ userId: userinfo._id }).exec();
 }
});
// this post fxn will delete all the submissions of the user when the user is deleted from the database.
const User = mongoose.model('User', userSchema);
module.exports = User;
