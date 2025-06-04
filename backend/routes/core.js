const express = require('express');
const router = express.Router();
const axios = require('axios');

const CORE_API_KEY = process.env.CORE_API_KEY;
if (!CORE_API_KEY) {
  console.error('CORE_API_KEY is not set in environment variables');
}

router.get('/search', async (req, res) => {
  const { query, page } = req.query;
  if (!query) return res.status(400).json({ error: 'Missing query' });
  const limit = 50;
  const pageNum = parseInt(page) || 1;
  const offset = (pageNum - 1) * limit;

  try {
    // Call Core API (adjust endpoint/params as needed)
    const coreRes = await axios.get('https://api.core.ac.uk/v3/search/works', {
      params: { q: query, limit, offset },
      headers: { 'Authorization': `Bearer ${CORE_API_KEY}` }
    });
    res.json({
      results: coreRes.data.results || [],
      totalHits: coreRes.data.totalHits || 0,
      page: pageNum,
      limit
    });
  } catch (err) {
    res.status(500).json({ error: 'Core API search failed' });
  }
});

module.exports = router; 