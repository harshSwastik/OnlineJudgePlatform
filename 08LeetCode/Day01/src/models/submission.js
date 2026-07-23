const mongoose = require('mongoose');
const {Schema} = mongoose;
    
const submissionSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'problem',
        required: true
    },
    code :{
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true,
        enum: ['cpp', 'java','javascript']
    },  
    status: {
        type: String,
        enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Compilation Error', 'Runtime Error','Pending'],
        default: 'Pending'
    },
    runtime:{
        type: Number,
        default: 0
    },
    memory:{
        type: Number,
        default: 0
    },
    errorMessage: {
        type: String,
        default: ''
    },
    testCasesPassed: {
        type: Number,
        default: 0
    },
    totalTestCases: {
        type: Number,
        default: 0
    }
},{timestamps: true});

submissionSchema.index({ userId: 1, problemId: 1 }); 

const Submission = mongoose.model('Submission', submissionSchema);
module.exports = Submission;
