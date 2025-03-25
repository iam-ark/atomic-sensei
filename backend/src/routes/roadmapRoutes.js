//roadmapRoutes.js

const express = require('express');
const { generateRoadmap, generateRoadmapResources } = require('../controllers/roadmapController.js');
const { generateResources, getAllResources } = require('../controllers/resourceController.js');

const roadmapRouter = express.Router();

// ✅ Route to generate & store a roadmap
roadmapRouter.get('/roadmap/:topic', generateRoadmap);

// ✅ Route to fetch learning resources for a roadmap topic (articles + videos)
roadmapRouter.get('/roadmap/resources/:topic', generateRoadmapResources);

// ✅ Route to generate & store resources in the database
roadmapRouter.get('/resources/:topic', generateResources);

// ✅ Route to get all stored resources
roadmapRouter.get('/resources', getAllResources);

module.exports = roadmapRouter;
