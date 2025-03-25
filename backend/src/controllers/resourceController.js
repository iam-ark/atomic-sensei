const express = require("express");
const dotenv = require("dotenv");
const { fetchArticles, fetchVideos } = require("../scrapers/scraper.js");
const { fetchArticlesAPI, fetchVideosAPI } = require("../scrapers/apis.js");

dotenv.config();
const router = express.Router();

// Import the existing Resource model from your Resource.js file
const Resource = require("../models/Resource");

/**
 * Hybrid function to generate and store resources for a given topic.
 * It first attempts to fetch via official APIs, and falls back to scraping if APIs return no results.
 */
const generateResources = async (req, res) => {
    try {
        const { topic } = req.params;
        if (!topic) return res.status(400).json({ message: "Topic is required" });

        // Try fetching via APIs first
        let [articlesAPI, videosAPI] = await Promise.all([
            fetchArticlesAPI(topic),
            fetchVideosAPI(topic),
        ]);

        // Fallback to scraping if API returns no results
        if (articlesAPI.length === 0) {
            console.log("Falling back to scraping for articles...");
            articlesAPI = await fetchArticles(topic);
        }
        if (videosAPI.length === 0) {
            console.log("Falling back to scraping for videos...");
            videosAPI = await fetchVideos(topic);
        }
        
        const allResources = [...articlesAPI, ...videosAPI];

        if (allResources.length === 0) {
            return res.status(404).json({ message: "No resources found" });
        }

        // Store resources in DB
        await Resource.insertMany(allResources);
        res.status(201).json({ message: "Resources added successfully", resources: allResources });
    } catch (error) {
        console.error("Error generating resources:", error);
        res.status(500).json({ message: "Error generating resources", error: error.message });
    }
};

/**
 * Function to get all stored resources.
 */
const getAllResources = async (req, res) => {
    try {
        const resources = await Resource.find();
        res.json(resources);
    } catch (error) {
        console.error("Error fetching resources:", error);
        res.status(500).json({ message: "Server error" });
    }
};

router.get("/resources/:topic", generateResources);
router.get("/resources", getAllResources);

module.exports = {
    generateResources,
    getAllResources,
    router
};
