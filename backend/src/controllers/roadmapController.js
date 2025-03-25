//roadmapController.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
// const fetch = async () => await import("node-fetch"); // Dynamically importing node-fetch
const { fetchArticles, fetchVideos } = require("../scrapers/scraper.js");
require('dotenv').config();

const router = express.Router();

// ✅ Roadmap Schema (Stored in MongoDB)
const roadmapSchema = new mongoose.Schema({
    topic: { type: String, required: true, unique: true },
    roadmap: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
const Roadmap = mongoose.model("Roadmap", roadmapSchema);

// ✅ Function to generate and store roadmap
const generateRoadmap = async (req, res) => {
    try {
        const { topic } = req.params;
        if (!topic) return res.status(400).json({ message: "Topic is required" });

        // Check if roadmap already exists
        let existingRoadmap = await Roadmap.findOne({ topic });
        if (existingRoadmap) {
            return res.json({ roadmap: existingRoadmap.roadmap });
        }

        // Generate roadmap using OpenRouter API
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "deepseek/deepseek-r1-distill-llama-70b:free",
                "messages": [
                    {
                        "role": "system",
                        "content": `Generate a structured learning roadmap for ${topic}. Include beginner, intermediate, and advanced topics. Avoid explanations and provide a concise roadmap in bullet points or numbered steps.`
                    }
                ]
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Failed to generate roadmap");
        }

        let roadmap = extractRoadmap(data.choices[0].message.content);

        // Store roadmap in MongoDB
        const newRoadmap = new Roadmap({ topic, roadmap });
        await newRoadmap.save();

        res.json({ roadmap });
    } catch (error) {
        console.error("Error generating roadmap:", error);
        res.status(500).json({ message: "Error generating roadmap", error: error.message });
    }
};

// ✅ Function to extract structured roadmap
const extractRoadmap = (text) => {
    const roadmapStart = text.indexOf("Beginner") !== -1 ? text.indexOf("Beginner") : text.indexOf("1.");
    return roadmapStart !== -1 ? text.slice(roadmapStart).trim() : text;
};

// ✅ Function to generate learning resources for roadmap
const generateRoadmapResources = async (req, res) => {
    try {
        const { topic } = req.params;

        const [articles, videos] = await Promise.all([
            fetchArticles(`${topic} roadmap`),
            fetchVideos(`${topic} roadmap`),
        ]);

        res.json({ topic, roadmap: { articles, videos } });
    } catch (error) {
        console.error("Error generating roadmap resources:", error);
        res.status(500).json({ message: "Error generating roadmap resources", error: error.message });
    }
};

router.get("/roadmap/:topic", generateRoadmap);
router.get("/roadmap/resources/:topic", generateRoadmapResources);

// ✅ Export functions using CommonJS
module.exports = {
    generateRoadmap,
    generateRoadmapResources,
    router
};
