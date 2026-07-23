const express = require('express');
const VideoRouter = express.Router();
const adminmiddleware = require('../middleware/adminMiddleware');
const {generateUploadSignature, saveVideoMetadata, deleteVideo} = require('../controllers/videoSection');

VideoRouter.get('/create/:problemId', adminmiddleware, generateUploadSignature);
VideoRouter.post('/save', adminmiddleware, saveVideoMetadata);
VideoRouter.delete('/delete/:problemId', adminmiddleware, deleteVideo);

module.exports = VideoRouter;