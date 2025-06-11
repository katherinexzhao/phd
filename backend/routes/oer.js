const express = require('express');
const multer = require('multer');
const OER = require('../models/OER');
const router = express.Router();
const axios = require('axios');
const neo4j = require('../neo4j');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Add new route to check if user has uploaded
router.get('/check-upload', async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) return res.status(400).json({ error: 'Missing email' });
    const User = require('../models/User');
    const user = await User.findOne({ email });
    if (!user) return res.json({ hasUploaded: false });
    const oer = await OER.findOne({ userId: user._id });
    res.json({ hasUploaded: !!oer });
  } catch (err) {
    console.error('Check upload error:', err);
    res.status(500).json({ error: 'Failed to check upload status' });
  }
});

router.post('/upload', async (req, res) => {
  try {
    const { title, description, url, tags, uploader } = req.body;

    // Create OER in MongoDB
    const oer = new OER({
      title,
      description,
      url,
      tags,
      uploader
    });

    await oer.save();

    // Sync tags to Neo4j
    const session = neo4j.session();
    try {
      // Create OER node in Neo4j with only title, uploader, and topic
      await session.run(
        `MERGE (o:OER {id: $id})
         SET o.title = $title,
             o.uploader = $uploader,
             o.topic = $topic`,
        {
          id: oer._id.toString(),
          title,
          uploader: uploader ? uploader.toString() : '',
          topic: tags && tags.length > 0 ? tags[0] : '' 
        }
      );

      // Create tag nodes and relationships
      for (const tag of tags) {
        await session.run(
          `MATCH (o:OER {id: $oerId})
           MERGE (t:Tag {name: $tagName})
           MERGE (o)-[:HAS_TAG]->(t)`,
          { oerId: oer._id.toString(), tagName: tag }
        );
      }

      // Create UPLOADED relationship from User to OER
      await session.run(
        `MATCH (u:User {id: $userId}), (o:OER {id: $oerId})
         MERGE (u)-[:UPLOADED]->(o)`,
        {
          userId: uploader ? uploader.toString() : '',
          oerId: oer._id.toString()
        }
      );

      res.status(201).json({ 
        message: 'OER uploaded and tags synced successfully',
        oer 
      });
    } finally {
      await session.close();
    }
  } catch (error) {
    console.error('Error uploading OER:', error);
    res.status(500).json({ error: 'Error uploading OER' });
  }
});

// Proxy OER Commons search
router.get('/external-oer', async (req, res) => {
  const { search } = req.query;
  if (!search) return res.status(400).json({ error: 'Missing search keyword' });

  try {
    const response = await axios.get('https://www.oercommons.org/api/v2/resources', {
      params: { search }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch from OER Commons' });
  }
});

// Get all OERs
router.get('/', async (req, res) => {
  try {
    const oers = await OER.find().populate('uploader', 'username');
    res.json(oers);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching OERs' });
  }
});

// Get OER by ID
router.get('/:id', async (req, res) => {
  try {
    const oer = await OER.findById(req.params.id).populate('uploader', 'username');
    if (!oer) {
      return res.status(404).json({ error: 'OER not found' });
    }
    res.json(oer);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching OER' });
  }
});

module.exports = router; 