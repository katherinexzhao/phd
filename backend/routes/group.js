// routes/group.js
const express = require('express');
const router = express.Router();
const driver = require('../config/neo4j');

router.get('/:groupId/posts', async (req, res) => {
  const { groupId } = req.params;

  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (u:User)-[:POSTED]->(p:Post)-[:IN]->(g:Group {id: $groupId})
      RETURN p.id AS postId, p.content AS content, p.createdAt AS createdAt, u.username AS author
      ORDER BY p.createdAt DESC
      `,
      { groupId }
    );

    const posts = result.records.map(record => ({
      postId: record.get('postId'),
      content: record.get('content'),
      createdAt: record.get('createdAt'),
      author: record.get('author')
    }));

    res.json({ posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  } finally {
    await session.close();
  }
});

router.get('/:groupId/info', async (req, res) => {
  const { groupId } = req.params;
  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (g:Group {id: $groupId})
      OPTIONAL MATCH (g)<-[:MEMBER_OF]-(u:User)
      RETURN g.name AS name,
             g.description AS description,
             g.rules AS rules,
             COUNT(u) AS memberCount
      `,
      { groupId }
    );

    const record = result.records[0];
    if (!record) return res.status(404).json({ error: 'Group not found' });

    res.json({
      name: record.get('name'),
      description: record.get('description'),
      rules: record.get('rules') || '',
      memberCount: record.get('memberCount').toInt?.() ?? 0,
    });
  } catch (err) {
    console.error('Error fetching group info:', err);
    res.status(500).json({ error: 'Failed to fetch group info' });
  } finally {
    await session.close();
  }
});

router.post('/', async (req, res) => {
  const session = driver.session();
  const { name, description } = req.body;

  if (!name || !description) {
    return res.status(400).json({ error: 'Name and description are required' });
  }

  try {
    const id = `group-${Date.now()}`;
    await session.run(
      `
      CREATE (g:Group {
        id: $id,
        name: $name,
        description: $description
      })
      `,
      { id, name, description }
    );
    res.status(201).json({ id, name, description });
  } catch (err) {
    console.error('Error creating group:', err);
    res.status(500).json({ error: 'Failed to create group' });
  } finally {
    await session.close();
  }
});
// 获取所有群组（供前端展示列表）
router.get('/', async (req, res) => {
  const session = driver.session();

  try {
    const result = await session.run(`
      MATCH (g:Group)
      OPTIONAL MATCH (g)<-[:MEMBER_OF]-(u:User)
      WITH g, COUNT(u) AS memberCount
      RETURN g.id AS id, g.name AS name, g.description AS description, memberCount
      ORDER BY g.name
    `);

    const groups = result.records.map(record => ({
      id: record.get('id'),
      name: record.get('name'),
      description: record.get('description'),
      memberCount: record.get('memberCount').toInt?.() ?? 0,
    }));

    res.json({ groups });
  } catch (err) {
    console.error('Error fetching groups:', err);
    res.status(500).json({ error: 'Failed to fetch groups' });
  } finally {
    await session.close();
  }
});

// join group
router.post('/:groupId/join', async (req, res) => {
  const session = driver.session();
  const { groupId } = req.params;
  const { userId } = req.body; // 前端传入 userId（可以用 localStorage 模拟）

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    await session.run(
      `
      MATCH (u:User {id: $userId}), (g:Group {id: $groupId})
      MERGE (u)-[:MEMBER_OF]->(g)
      `,
      { userId, groupId }
    );
    res.status(200).json({ message: 'Joined group successfully' });
  } catch (err) {
    console.error('Error joining group:', err);
    res.status(500).json({ error: 'Failed to join group' });
  } finally {
    await session.close();
  }
});

router.get('/:groupId/shared-posts', async (req, res) => {
  const session = driver.session();
  const { groupId } = req.params;

  try {
    const result = await session.run(
      `
      MATCH (p:Post)-[s:SHARED_TO]->(g:Group {id: $groupId})
      OPTIONAL MATCH (u:User)-[:POSTED]->(p)
      RETURN p.id AS postId,
             p.content AS content,
             s.sharedAt AS sharedAt,
             u.username AS author
      ORDER BY s.sharedAt DESC
      `,
      { groupId }
    );

    const posts = result.records.map(r => ({
      postId: r.get('postId'),
      content: r.get('content'),
      sharedAt: r.get('sharedAt'),
      author: r.get('author') || 'Unknown',
    }));

    res.json({ posts });
  } catch (err) {
    console.error('Error fetching shared posts:', err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  } finally {
    await session.close();
  }
});

module.exports = router;