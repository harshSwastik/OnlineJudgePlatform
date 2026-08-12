const express = require('express');
const submitRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const { submitCode,runCode } = require('../controllers/userSubmission');
const rateLimiter = require('../middleware/rateLimiter');


submitRouter.post('/submit/:id', userMiddleware, rateLimiter('submit_code', 3, 60), submitCode);
submitRouter.post('/run/:id', userMiddleware, rateLimiter('run_code', 5, 60), runCode);

module.exports = submitRouter;