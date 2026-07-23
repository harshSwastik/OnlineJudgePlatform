
const Problem = require('../models/problem');
const User = require('../models/user');
const Submission = require('../models/submission');
const { getLanguageById, submitBatch, submitToken, getErrorMessage } = require('../utils/problemUtility');
const SolutionVideo = require('../models/SolutionVideo');
const mongoose = require('mongoose');
 
 
async function createProblem(req, res) {
 const { title, description, difficulty, tags, visibleTestCases,
     hiddenTestCases, startCode, referenceSolution } = req.body;
  
     try {
        for (const { language, completeCode } of referenceSolution) {
        const languageId = getLanguageById(language);
        const submissions =  visibleTestCases.map((testcase) => ({
          source_code: completeCode,
          language_id: languageId,
          stdin: testcase.input,
          expected_output: testcase.output,
        }));
      
      const submitResult = await submitBatch(submissions);
      // this submitresult will be in form of an array of objects containing tokens 
      const  resultTokens = submitResult.map((value) => value.token);
      const testResults = await  submitToken(resultTokens);   
      for (const test of testResults) {
        if (test.status.id != 3) {
          return res.status(400).send(getErrorMessage(test.status.id));
        }
    } 
  }
     // now we can save the problem to the database
     const userProblem = new Problem({
       ...req.body,
       ProblemCreator: req.user._id 
       
    });
    await userProblem.save();
    res.status(201).send("Problem created successfully");
  }
     catch(err) {
      res.status(500).send("Error" + err);
    }
}
async function updateProblem(req, res) {
  // brefore updating the problem we need to check if the problem is working 
  // fine or not to ensure their is no err 
   const id = req.params.id;
   const { title, description, difficulty, tags, visibleTestCases,
     hiddenTestCases, startCode, referenceSolution } = req.body;
  try{
     if(!id){
      return res.status(400).send("Missing Id Field");
     }
    const DsaProblem = await Problem.findById(id);
    if (!DsaProblem) {
      return res.status(404).send("Id not present in the database");
    }
      for (const { language, completeCode } of referenceSolution) {
        const languageId = getLanguageById(language);
        const submissions =  visibleTestCases.map((testcase) => ({
          source_code: completeCode,
          language_id: languageId,
          stdin: testcase.input,
          expected_output: testcase.output,
        }));
      
      const submitResult = await submitBatch(submissions);
      // this submitresult will be in form of an array of objects containing tokens 
      const  resultTokens = submitResult.map((value) => value.token);
      const testResults = await  submitToken(resultTokens);   
      for (const test of testResults) {
        if (test.status.id != 3) {
          return res.status(400).send(getErrorMessage(test.status.id));
        }
    } 
  }
  const newProblem = await Problem.findByIdAndUpdate(id, req.body, {runValidators: true, new: true });
   res.status(200).send(newProblem);
  }
  catch(err) {
    res.status(500).send("Error" + err);
  }
}
async function deleteProblem(req, res) {
  const id = req.params.id;
  try {
    if (!id) {
      return res.status(400).send("Missing Id Field");
    }
    const DsaProblem = await Problem.findById(id);
    if (!DsaProblem) {
      return res.status(404).send("Id not present in the database");
    }
    await Problem.findByIdAndDelete(id);
    res.status(200).send("Problem deleted successfully");
  }
  catch(err) {
    res.status(500).send("Error" + err);
  }
}
async function getProblemById(req, res) {
  const id = req.params.id;
  try {
    if (!id) {
      return res.status(400).send("Missing Id Field");
    }
    const DsaProblem = await Problem.findById(id).select('_id title description difficulty tags visibleTestCases  startCode referenceSolution');

    if (!DsaProblem) {
      return res.status(404).send("Problem is Missing");
    }
  const Video = await SolutionVideo.findOne({ problemId: id });
  if(Video){
     const responseData = {
      ...DsaProblem.toObject(),
      secureUrl: Video.secureUrl,
      thumbnailUrl: Video.thumbnailUrl,
      duration: Video.duration,
      cloudinaryPublicId: Video.cloudinaryPublicId
    };
    res.status(200).send(responseData);
  } else {
    return res.status(200).send(DsaProblem);
  }
}
  catch(err) {
    res.status(500).send("Error" + err);
  }
}
async function getAllProblems(req, res) {
  try{
   const AllProblems = await Problem.find({},'_id title tags difficulty') ;
   if (AllProblems.length === 0) {
    return res.status(404).send("Problems are Missing");
   }
   res.status(200).send(AllProblems); 

  }
  catch(err) {
    res.status(500).send("Error" + err);
  }
}
async function solvedProblemsbyUser(req,res){
  try{
    const userid = req.user._id;
    const user = await User.findById(userid).populate({
      path: 'problemsSolved',
      select: '_id title difficulty tags '
    });
    if(!user) {
      return res.status(404).send("User not found");
    }
    res.status(200).send(user.problemsSolved);
  }
  catch(err){
    res.status(500).send("Error" + err);
  }
}

async function submittedProblem(req, res) {
  try {
    const userId = req.user._id;
    
    // Grab the exact parameter name you used in your router!
    const rawProblemId = req.params.pid;
    
    if (!rawProblemId) {
      return res.status(400).send("Problem ID (pid) is missing from the URL parameters.");
    }
    
    // Clean it up and cast it to a strict MongoDB ObjectId
    const problemString = rawProblemId.trim(); 
    const problemObjectId = new mongoose.Types.ObjectId(problemString);

    // Execute the exact match query
    const ans = await Submission.find({ 
      userId: userId, 
      problemId: problemObjectId 
    }).sort({ createdAt: -1 });

    res.status(200).send(ans);
   
  } catch(err) {
    console.error("Error fetching submission history:", err);
    res.status(500).send("Error " + err);
  }
}
module.exports = { createProblem , updateProblem, deleteProblem, getProblemById, getAllProblems, solvedProblemsbyUser,submittedProblem};