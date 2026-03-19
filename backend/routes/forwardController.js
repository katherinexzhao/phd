// forwardController.js
const { Post } = require('../models/Post'); // MongoDB Mongoose model
const neo4jDriver = require('../config/neo4j');

async function handleForwardPost(req, res) {
  const {
    title,
    description,
    coverUrl,
    tags,
    resourceUrl,
    uploader,
    isForwarded,
    originalSource,
    comment
  } = req.body;

  if (!uploader) return res.status(400).json({ error: 'Missing uploader' });

  try {
    // 1. Save to MongoDB
    const newPost = new Post({
      title,
      description,
      coverUrl,
      tags,
      resourceUrl,
      uploader,
      isForwarded,
      originalSource,
      comment
    });
    const savedPost = await newPost.save();

    // 2. Save user-forwarded relationship to Neo4j
    const session = neo4jDriver.session();
    await session.run(
      `
      MERGE (u:User {id: $uploader})
      CREATE (p:Post {
        id: $postId,
        title: $title,
        url: $resourceUrl,
        cover: $coverUrl
      })
      MERGE (u)-[:FORWARDED {comment: $comment}]->(p)
      `,
      {
        uploader,
        postId: savedPost._id.toString(),
        title,
        resourceUrl,
        coverUrl,
        comment: comment || ''
      }
    );
    await session.close();

    res.status(200).json({ message: 'Forward saved successfully' });
  } catch (err) {
    console.error('Forward error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { handleForwardPost };
