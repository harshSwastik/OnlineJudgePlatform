const Problem = require('../models/problem');
const Submission = require('../models/submission');
const{ getLanguageById,submitBatch,submitToken} = require('../utils/problemUtility');
 
 

const submitCode = async (req, res) => {
 try{
  const userId = req.user._id;
  const problemId = req.params.id;
  const {code, language} = req.body;
  if(!code || !language || !userId || !problemId){
    return res.status(400).send("Some fields are missing");
  }
  const problem = await Problem.findById(problemId); // fetching problem from the db 
  if(!problem){
    return res.status(404).send("Problem not found");
  }
 const submittedResult = await Submission.create({
    userId,
    problemId,
    code,
    language,
    status: 'Pending',
    totalTestCases: problem.hiddenTestCases.length 
 });
  const languageId = getLanguageById(language);
  const submissions =   problem.hiddenTestCases.map((testcase) => ({
          source_code: code,
          language_id: languageId,
          stdin: testcase.input,
          expected_output: testcase.output,
        }));

  const submitResult = await submitBatch(submissions);
  const  resultTokens = submitResult.map((value) => value.token);
  const testResults = await  submitToken(resultTokens);
let testCasesPassed = 0;
let runtime = 0;
let memory = 0;
let status = 'Accepted'; 
let errorMessage = ''; // <-- New variable declared here

for (const test of testResults) {
  // Always add time and check max memory, safeguarding against null/undefined
  runtime += parseFloat(test.time || 0);
  memory = Math.max(memory, test.memory || 0);

  if (test.status_id === 3) {
    testCasesPassed++;
  } else if (status === 'Accepted') {
    // We hit our FIRST failing test case! Lock in the status and the error message.
    
    if (test.status_id === 4) {
      status = 'Wrong Answer';
      errorMessage = 'Your code produced output that did not match the expected test case output.';
      
    } else if (test.status_id === 5) {
      status = 'Time Limit Exceeded';
      errorMessage = 'Your code took too long to run. Check for infinite loops or inefficient algorithms.';
      
    } else if (test.status_id === 6) {
      status = 'Compilation Error';
      // Execution engines usually send compilation details in 'compile_output'
      errorMessage = test.compile_output || 'Your code failed to compile. Check for syntax errors.';
      
    } else if (test.status_id >= 7 && test.status_id <= 12) {
      status = 'Runtime Error';
      // Execution engines usually send runtime crashes (like array out of bounds) in 'stderr'
      errorMessage = test.stderr || test.message || 'An error occurred while your code was running.';
      
    } else {
      status = 'Runtime Error';
      errorMessage = 'An unknown execution error occurred.';
    }
  }
}
submittedResult.testCasesPassed = testCasesPassed;
submittedResult.runtime = runtime;
submittedResult.memory = memory;
submittedResult.status = status;
submittedResult.errorMessage = errorMessage;   // <-- Set the error message here

if(!req.user.problemsSolved.includes(problemId)){
  req.user.problemsSolved.push(problemId);
  await req.user.save();
}
await submittedResult.save();
 const accepted = (status === 'Accepted');

res.status(200 ).json({
 accepted,
 testCasesPassed,
 totalTestCases: submittedResult.totalTestCases,
 passedTestCases: testCasesPassed,
runtime,
 memory,
 status,            
errorMessage
});
 }

 catch(err){
  res.status(500).send("Error" + err);
 }
}
const runCode = async (req, res) => {
  try{
  const userId = req.user._id;
  const problemId = req.params.id;
  const {code, language} = req.body;
  if(!code || !language || !userId || !problemId){
    return res.status(400).send("Some fields are missing");
  }
  const problem = await Problem.findById(problemId); // fetching problem from the db 
  if(!problem){
    return res.status(404).send("Problem not found");
  }
 
  const languageId = getLanguageById(language);
  const submissions =   problem.visibleTestCases.map((testcase) => ({
          source_code: code,
          language_id: languageId,
          stdin: testcase.input,
          expected_output: testcase.output,
        }));

  const submitResult = await submitBatch(submissions);
  const  resultTokens = submitResult.map((value) => value.token);
   const testResults = await  submitToken(resultTokens);
let testCasesPassed = 0;
let runtime = 0;
let memory = 0;
let status = 'Accepted'; 
let errorMessage = ''; // <-- New variable declared here

  for (const test of testResults) {
  // Always add time and check max memory, safeguarding against null/undefined
  runtime += parseFloat(test.time || 0);
  memory = Math.max(memory, test.memory || 0);

  if (test.status_id === 3) {
    testCasesPassed++;
  } else if (status === 'Accepted') {
    // We hit our FIRST failing test case! Lock in the status and the error message.
    
    if (test.status_id === 4) {
      status = 'Wrong Answer';
      errorMessage = 'Your code produced output that did not match the expected test case output.';
      
    } else if (test.status_id === 5) {
      status = 'Time Limit Exceeded';
      errorMessage = 'Your code took too long to run. Check for infinite loops or inefficient algorithms.';
      
    } else if (test.status_id === 6) {
      status = 'Compilation Error';
      // Execution engines usually send compilation details in 'compile_output'
      errorMessage = test.compile_output || 'Your code failed to compile. Check for syntax errors.';
      
    } else if (test.status_id >= 7 && test.status_id <= 12) {
      status = 'Runtime Error';
      // Execution engines usually send runtime crashes (like array out of bounds) in 'stderr'
      errorMessage = test.stderr || test.message || 'An error occurred while your code was running.';
      
    } else {
      status = 'Runtime Error';
      errorMessage = 'An unknown execution error occurred.';
    }
  }
}
  
res.status(200).json({
  success : status,
  testCase: testResults,
  runtime,
  memory
});
  }
  catch(err){
    res.status(500).send("Error" + err);
  }
}
module.exports = {submitCode,runCode };
