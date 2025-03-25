const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const UserAgent = require("user-agents");
const Resource = require("../models/Resource"); // Use your existing Resource model
const connectDB = require("../config/db");
require("dotenv").config();

// Use the stealth plugin
puppeteer.use(StealthPlugin());

// Ensure MongoDB is connected (handled by db.js)
connectDB();

// Helper delay function
function delay(ms = 2000) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Scrape Google search results for articles about the given query.
 * Retries up to 3 times if no results are found.
 * Returns up to 2 articles.
 */
async function fetchArticles(query) {
  const url = `https://www.google.com/search?q=${encodeURIComponent(query + " learning resources")}`;
  const attempts = 3;
  let results = [];
  for (let i = 0; i < attempts; i++) {
    results = await scrapeResources(url, "Google Articles");
    if (results.length > 0) break;
    console.log(`Retrying articles for "${query}" (attempt ${i + 2})`);
    await delay(2000);
  }
  return results.slice(0, 2);
}

/**
 * Scrape YouTube search results for videos about the given query.
 * Retries up to 3 times if no results are found.
 * Returns up to 3 videos.
 */
async function fetchVideos(query) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query + " tutorial")}`;
  const attempts = 3;
  let results = [];
  for (let i = 0; i < attempts; i++) {
    results = await scrapeResources(url, "YouTube Videos");
    if (results.length > 0) break;
    console.log(`Retrying videos for "${query}" (attempt ${i + 2})`);
    await delay(2000);
  }
  return results.slice(0, 3);
}

/**
 * Generalized scraping function using Puppeteer with stealth.
 * Uses different selectors based on the source.
 */
async function scrapeResources(url, source) {
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  const page = await browser.newPage();
  const userAgent = new UserAgent();
  await page.setUserAgent(userAgent.toString());

  console.log(`Scraping: ${url}`);

  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    let resources = [];
    if (source === "Google Articles") {
      // Wait for Google results container using "div.tF2Cxc"
      await page.waitForSelector("div.tF2Cxc", { timeout: 15000 }).catch(() => {});
      resources = await page.evaluate(() => {
        const results = [];
        const items = document.querySelectorAll("div.tF2Cxc");
        items.forEach(item => {
          const titleEl = item.querySelector("h3");
          const linkEl = item.querySelector("a");
          if (titleEl && linkEl) {
            results.push({
              title: titleEl.innerText.trim(),
              url: linkEl.href,
              type: "text",
              source: "Google Search"
            });
          }
        });
        return results;
      });
    } else if (source === "YouTube Videos") {
      // Wait for YouTube video renderers
      await page.waitForSelector("ytd-video-renderer", { timeout: 15000 }).catch(() => {});
      resources = await page.evaluate(() => {
        const results = [];
        const items = document.querySelectorAll("ytd-video-renderer");
        items.forEach(item => {
          const titleEl = item.querySelector("#video-title");
          if (titleEl) {
            results.push({
              title: titleEl.innerText.trim(),
              url: "https://www.youtube.com" + titleEl.getAttribute("href"),
              type: "video",
              source: "YouTube"
            });
          }
        });
        return results;
      });
    }

    console.log(`Scraped ${resources.length} resources from ${source}`);

    if (resources.length > 0) {
      // Store scraped resources in the database
      await Resource.insertMany(resources);
      console.log("Resources saved to database.");
    } else {
      console.log("No valid resources found.");
    }

    return resources;
  } catch (error) {
    console.error("Scraping failed:", error.message);
    return [];
  } finally {
    await browser.close();
  }
}

module.exports = { fetchArticles, fetchVideos };
