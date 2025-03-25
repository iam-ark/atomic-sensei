const axios = require('axios');
require('dotenv').config();

/**
 * Fetch articles using Google Custom Search API.
 * Requires GOOGLE_API_KEY and GOOGLE_CX set in your .env file.
 */
async function fetchArticlesAPI(topic) {
    try {
        const query = `${topic} learning resources`;
        const apiKey = process.env.GOOGLE_API_KEY;
        const cx = process.env.GOOGLE_CX;
        const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}`;
        const response = await axios.get(url);
        const items = response.data.items || [];
        const articles = items.map(item => ({
            title: item.title,
            url: item.link,
            type: "text",
            source: "Google Custom Search"
        }));
        return articles.slice(0, 2);
    } catch (error) {
        console.error("Error fetching articles via API:", error.message);
        return [];
    }
}

/**
 * Fetch videos using the YouTube Data API.
 * Requires YOUTUBE_API_KEY set in your .env file.
 */
async function fetchVideosAPI(topic) {
    try {
        const query = `${topic} tutorial`;
        const apiKey = process.env.YOUTUBE_API_KEY;
        const url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&part=snippet&type=video&q=${encodeURIComponent(query)}`;
        const response = await axios.get(url);
        const items = response.data.items || [];
        const videos = items.map(item => ({
            title: item.snippet.title,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            type: "video",
            source: "YouTube Data API"
        }));
        return videos.slice(0, 3);
    } catch (error) {
        console.error("Error fetching videos via API:", error.message);
        return [];
    }
}

module.exports = { fetchArticlesAPI, fetchVideosAPI };
