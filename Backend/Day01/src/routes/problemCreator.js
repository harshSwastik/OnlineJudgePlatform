 const express = require('express');
const problemRouter = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware');
const {createProblem,updateProblem,deleteProblem,getProblemById,getAllProblems,solvedProblemsbyUser,submittedProblem} = require('../controllers/userProblem');
const userMiddleware = require('../middleware/userMiddleware');
 
// create problms , fetch problems, update problems, delete problems
problemRouter.post('/create',adminMiddleware,createProblem);
problemRouter.put('/update/:id',adminMiddleware,updateProblem);
problemRouter.delete('/delete/:id',adminMiddleware,deleteProblem);

problemRouter.get('/problemById/:id',userMiddleware,getProblemById); 
problemRouter.get('/getAllProblems',userMiddleware,getAllProblems);
problemRouter.get('/problemsSolvedByUser',userMiddleware,solvedProblemsbyUser);
problemRouter.get("/submittedProblem/:pid",userMiddleware,submittedProblem);

module.exports = problemRouter;   


