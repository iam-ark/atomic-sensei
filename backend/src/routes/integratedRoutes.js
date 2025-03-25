//integratedRoutes.js

const express = require('express');
const { generateIntegratedRoadmap } = require('../controllers/integratedController.js');

const roadmapRouter = express.Router();

// ✅ Route to get roadmap with resources
roadmapRouter.get('/integrated/:topic', generateIntegratedRoadmap);

module.exports = roadmapRouter;