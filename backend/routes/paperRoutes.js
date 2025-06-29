const express = require('express');
const router  = express.Router();
const driver  = require('../config/neo4j');

router.get('/test', (req, res) => {
  res.send('✅ Route works!');
});

// GET /api/tags?username=xxx
router.get('/tags', async (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ error: 'Missing username' });

  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {username:$username})-[:USES]->(t:Tag)
       RETURN t.name AS tag`,
      { username }
    );
    const tags = result.records.map(r => r.get('tag'));
    res.json(tags);            
  } catch (e) {
    res.status(500).json({ error: 'Tag fetch failed' });
  } finally { await session.close(); }
});

// GET /api/saved?username=xxx   →  { tag1:[…], tag2:[…] }
router.get('/saved', async (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ error: 'Missing username' });

  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (u:User {username:$username})-[:SAVED]->(p)
      OPTIONAL MATCH (p)-[:TAGGED_AS]->(t)
      RETURN COALESCE(t.name, 'Untagged') AS tag, p
      `,
      { username }
    );

    const grouped = {};
    result.records.forEach(r => {
      const tag = r.get('tag');
      const paper = r.get('p').properties;
      (grouped[tag] ||= []).push(paper);
    });

    res.json(grouped);
  } catch (e) {
    console.error('❌ Fetch error:', e);
    res.status(500).json({ error: 'Neo4j fetch failed' });
  } finally {
    await session.close();
  }
});

// POST /api/save
router.post('/save', async (req, res) => {
  const { username, paper, tag } = req.body;

  if (!username || !paper || !tag) {
    return res.status(400).json({ error: 'Missing field(s)' });
  }

  const session = driver.session();
  try {
    await session.run(
      `
      MERGE (u:User {username:$username})
      MERGE (p:Paper {id:$id})
      SET   p.title=$title, p.url=$url
      MERGE (u)-[:SAVED]->(p)
      MERGE (t:Tag {name:$tag})
      MERGE (u)-[:USES]->(t)
      MERGE (p)-[:TAGGED_AS]->(t)
      `,
      {
        username,
        id: paper.id,
        title: paper.title,
        url: paper.url,
        tag,
      }
    );

    res.json({ message: '✅ Saved with tag' });
  } catch (err) {
    console.error('❌ Save failed:', err);
    res.status(500).json({ error: 'Save failed' });
  } finally {
    await session.close();
  }
});

// DELETE /api/saved
router.post('/unsave', async (req, res) => {
  console.log('📩 /unsave route hit:', req.body);
  const { username, paperId } = req.body;
  if (!username || !paperId) {
    return res.status(400).json({ error: 'Missing username or paperId' });
  }
 
  const session = driver.session();
  try {
    await session.run(
      `MATCH (u:User {username: $username})-[r:SAVED]->(p:Paper {id: $paperId}) DELETE r`,
      { username, paperId }
    );
    res.json({ message: '✅ Paper unsaved successfully' });
  } catch (err) {
    console.error('❌ Delete error:', err);
    res.status(500).json({ error: 'Failed to unsave paper' });
  } finally {
    await session.close();
  }
});

// DELETE /api/tag
router.delete('/tag', async (req, res) => {
  const { username, tag } = req.body;
  if (!username || !tag) return res.status(400).json({ error: 'Missing username or tag' });
  const session = driver.session();
  try {
    await session.run(
      `MATCH (u:User {username:$username})-[r:USES]->(t:Tag {name:$tag})
       DELETE r`,
      { username, tag }
    );
    res.json({ message: 'Tag deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete tag' });
  } finally {
    await session.close();
  }
});

module.exports = router;