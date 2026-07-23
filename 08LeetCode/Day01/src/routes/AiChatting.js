const express = require('express');
const aiRouter = express.Router();
const DoubtSolving = require('../controllers/DoubtSolving');
const userMiddleware = require('../middleware/userMiddleware');

aiRouter.post('/chat', userMiddleware, DoubtSolving);
module.exports = aiRouter;