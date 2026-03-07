const express = require('express');
const router = express.Router();
const driver = require('../config/neo4j');
const { v4: uuidv4 } = require('uuid');




router.get('/saved-plans', async (req, res) => {
  const { username } = req.query;
  console.log('📥 Received request for saved plans from:', username);
  if (!username) return res.status(400).json({ error: 'Missing username' });

  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (u:User {username:$username})-[:HAS_PLAN]->(pl:Plan)
      RETURN pl.id AS planId, pl.content AS content, pl.updatedAt AS updatedAt
      `,
      { username }
    );
    console.log('📦 Neo4j returned records:', result.records.length);

    const plans = result.records.map(r => {
      const raw = r.get('content');
      let parsed;

      if (typeof raw === 'string') {
        try {
          parsed = JSON.parse(raw);
        } catch (e) {
          console.error('JSON parse error:', e);
          parsed = {};
        }
      } else if (typeof raw === 'object' && raw !== null) {
        parsed = raw;
      } else {
        parsed = {};
      }

      return {
  planId: r.get('planId'),
  data: parsed, 
  updatedAt: r.get('updatedAt'),
      };
    });
console.log('📋 Final parsed plans:', plans);


    res.json(plans);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Fetch failed' });
  } finally {
    await session.close();
  }
});

// DELETE /api/plan/:id
router.delete('/plan/:id', async (req, res) => {
  const { id } = req.params;
  const session = driver.session();
  try {
    await session.run(
      `
      MATCH (pl:Plan {id: $id})
      DETACH DELETE pl
      `,
      { id }
    );
    res.json({ message: 'Plan deleted', id });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete plan' });
  } finally {
    await session.close();
  }
});

// GET /api/plan/:id
router.get('/plan/:id', async (req, res) => {
  const { id } = req.params;
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (pl:Plan {id: $id})
      RETURN pl.id AS planId, pl.content AS content, pl.updatedAt AS updatedAt
      `,
      { id }
    );

    if (result.records.length === 0) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    const record = result.records[0];
    const raw = record.get('content');
    let parsedContent;

    if (typeof raw === 'string') {
      try {
        parsedContent = JSON.parse(raw);
        console.log('✅ Successfully parsed:', parsedContent);
      } catch (e) {
        console.error('❌ Failed to parse plan content:', e);
        console.error(raw);
        parsedContent = {};
      }
    } else {
      parsedContent = raw;
    }

    res.json({
      planId: record.get('planId'),
      content: parsedContent,
      updatedAt: record.get('updatedAt'),
    });
  } catch (err) {
    console.error('❌ Error fetching plan:', err);
    res.status(500).json({ error: 'Failed to fetch plan' });
  } finally {
    await session.close();
  }
});


// POST /api/plan/save — for FastAPI-style frontend
router.post('/plan/save', async (req, res) => {
  const { username, plan } = req.body;
  if (!username || !plan) {
    return res.status(422).json({ error: 'Missing username or plan' });
  }

  const session = driver.session();
  const planId = uuidv4();
  const content = typeof plan === 'string' ? plan : JSON.stringify(plan);

  try {
    await session.run(
      `
      MERGE (u:User {username: $username})
      MERGE (pl:Plan {id: $planId})
      SET pl.content = $content,
          pl.updatedAt = datetime()
      MERGE (u)-[:HAS_PLAN]->(pl)
      `,
      { username, planId, content }
    );
    res.json({ message: 'Plan saved successfully', planId });
  } catch (err) {
    console.error('❌ Failed to save plan:', err);
    res.status(500).json({ error: 'Failed to save plan' });
  } finally {
    await session.close();
  }
});

module.exports = router;