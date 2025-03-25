//resourceRoutes.js
const express = require('express');
const { generateResources, getAllResources } = require('../controllers/resourceController.js');

const resourceRouter = express.Router();

// ✅ Route to generate and store learning resources
resourceRouter.post('/generate/:topic', generateResources);

// ✅ Route to fetch all stored resources
resourceRouter.get('/', getAllResources);

module.exports = resourceRouter;
