const dotenv = require("dotenv");
const express = require("express");
const { fetchArticlesAPI, fetchVideosAPI } = require("../scrapers/apis.js");
const { fetchArticles, fetchVideos } = require("../scrapers/scraper.js");
const router = express.Router();

dotenv.config();

/**
 * Extracts and structures roadmap topics into three levels.
 */
function parseRoadmapLevels(roadmapText) {
    const levels = { beginner: [], intermediate: [], advanced: [] };
    let currentLevel = null;
    
    roadmapText.split("\n").forEach(line => {
        const trimmed = line.trim();
        if (trimmed.toLowerCase().includes("beginner")) {
            currentLevel = "beginner";
        } else if (trimmed.toLowerCase().includes("intermediate")) {
            currentLevel = "intermediate";
        } else if (trimmed.toLowerCase().includes("advanced")) {
            currentLevel = "advanced";
        } else if (trimmed.length > 0 && currentLevel) {
            levels[currentLevel].push(trimmed);
        }
    });
    
    return levels;
}

/**
 * Generates a structured roadmap using OpenRouter API.
 */
async function generateRoadmap(query) {
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
                    "content": `Generate a structured learning roadmap for ${query}. Include beginner, intermediate, and advanced topics. Avoid explanations and provide a concise roadmap in bullet points or numbered steps.`
                }
            ]
        })
    });
    
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Failed to generate roadmap");
    }
    
    return parseRoadmapLevels(data.choices[0].message.content);
}

/**
 * Fetches resources for a given roadmap level (beginner, intermediate, advanced).
 * Prioritizes API-based search first, then falls back to scraping if needed.
 */
async function fetchLevelResources(level, query) {
    const searchQuery = `${level} level resources for ${query}`;
    
    let articles = await fetchArticlesAPI(searchQuery);
    if (articles.length === 0) {
        console.log(`API did not return articles for "${searchQuery}", falling back to scraping...`);
        articles = await fetchArticles(searchQuery);
    }
    
    let videos = await fetchVideosAPI(searchQuery);
    if (videos.length === 0) {
        console.log(`API did not return videos for "${searchQuery}", falling back to scraping...`);
        videos = await fetchVideos(searchQuery);
    }
    
    return { articles, videos };
}

/**
 * Integrated function to generate roadmap and fetch level-based resources.
 */
async function generateIntegratedRoadmap(req, res) {
    try {
        const query = req.params.topic;
        const roadmap = await generateRoadmap(query);
        
        const [beginnerResources, intermediateResources, advancedResources] = await Promise.all([
            fetchLevelResources("Beginner", query),
            fetchLevelResources("Intermediate", query),
            fetchLevelResources("Advanced", query)
        ]);
        
        res.json({
            query,
            roadmap,
            resources: {
                beginner: beginnerResources,
                intermediate: intermediateResources,
                advanced: advancedResources
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

router.get("/integrated/:topic", generateIntegratedRoadmap);

module.exports = { generateIntegratedRoadmap };