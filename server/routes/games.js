import express from "express";

const router = express.Router();

router.get("/search", async (req, res) => {
  const { search, page } = req.query;

  if (!search) {
    return res.status(400).json({ error: "Missing search query" });
  }

  try {
    const response = await fetch(
      `https://api.rawg.io/api/games?search=${encodeURIComponent(search)}}&page=${page || 1}&page_size=10&key=${process.env.RAWG_API_KEY}`,
    );

    const data = await response.json();
    res.json({
      results: data.results,
      count: data.count,
      hasNext: data.next !== null,
      hasPrevious: data.previous !== null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Search failed" });
  }
});

router.get("/search-platforms", async (req, res) => {
  try {
    const page1Response = await fetch(
      `https://api.rawg.io/api/platforms?key=${process.env.RAWG_API_KEY}&page=1`,
    );
    const page2Response = await fetch(
      `https://api.rawg.io/api/platforms?key=${process.env.RAWG_API_KEY}&page=2`,
    );

    const page1Data = await page1Response.json();
    const page2Data = await page2Response.json();

    const allPlatforms = page1Data.results.concat(page2Data.results);

    res.json(allPlatforms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch platforms" });
  }
});

export default router;
