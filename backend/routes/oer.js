const express = require('express');
const multer = require('multer');
const OER = require('../models/OER');
const router = express.Router();
const axios = require('axios');
const neo4j = require('../config/neo4j');
const path = require('path');
const mongoose = require('mongoose');

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
    console.log("Uploader received:", uploader);

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

// Get OERs uploaded by a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const oers = await OER.find({ uploader: userId }).sort({ createdAt: -1 });
    res.json(oers);
  } catch (err) {
    console.error('Error fetching user resources:', err);
    res.status(500).json({ error: 'Failed to fetch user resources' });
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

// DELETE a specific OER by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await OER.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'OER not found' });
    }
    res.json({ message: 'OER deleted successfully' });
  } catch (error) {
    console.error('Error deleting OER:', error);
    res.status(500).json({ error: 'Failed to delete OER' });
  }
});


// Update resource by ID
router.put('/:id', async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    const updated = await OER.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        tags: tags || []
      },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error('Error updating resource:', err);
    res.status(500).json({ error: 'Failed to update resource' });
  }
});


// POST /api/oer/recommend - 推荐资源
router.post('/recommend', async (req, res) => {
  try {
    const { tags } = req.body;
    const regexTags = tags.map(tag => new RegExp(tag, 'i'));

    const matched = await OER.find({ tags: { $in: regexTags } })
                             .sort({ createdAt: -1 })
                             .limit(12);
    res.json(matched);
  } catch (err) {
    console.error('Error in /oer/recommend:', err);
    res.status(500).json({ error: 'Failed to fetch recommended resources' });
  }
});

// GET /api/oer/trending - 获取最新上传的资源作为补充
router.get('/trending', async (req, res) => {
  try {
    const latest = await OER.find()
                            .sort({ createdAt: -1 })
                            .limit(10);
    res.json(latest);
  } catch (err) {
    console.error('Error in /oer/trending:', err);
    res.status(500).json({ error: 'Failed to fetch trending resources' });
  }
});




// File upload to disk (with metadata and Neo4j sync)
const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + file.fieldname + ext);
  }
});

const diskUpload = multer({ storage: diskStorage });

router.post('/upload-file', diskUpload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'coverFile', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      title,
      description,
      topic,
      uploader,
      subjects,
      educationLevels,
      materialTypes,
      languages,
      mediaFormats,
      educationalUse,
      primaryUser,
      accessibility,
      tags
    } = req.body;

    if (!req.files.file || !uploader) {
      return res.status(400).json({ error: 'Missing file or uploader ID' });
    }

    const resourceUrl = `http://localhost:5001/uploads/${req.files.file[0].filename}`;
    const coverUrl = req.files.coverFile
      ? `http://localhost:5001/uploads/${req.files.coverFile[0].filename}`
      : '';

    const newOER = new OER({
      title,
      description,
      topic,
      uploader: new mongoose.Types.ObjectId(uploader),
      resourceUrl,
      coverUrl,
      tags: tags?.split(',').map(t => t.trim()).filter(Boolean) || [],
      subjects,
      educationLevels,
      materialTypes,
      languages,
      mediaFormats,
      educationalUse,
      primaryUser,
      accessibility
    });

    const saved = await newOER.save();
    console.log('✅ Saved to MongoDB:', saved);

    const session = neo4j.session();
    try {
      await session.run(
        `MERGE (o:OER {id: $id})
         SET o.title = $title,
             o.uploader = $uploader,
             o.topic = $topic`,
        {
          id: newOER._id.toString(),
          title,
          uploader: uploader?.toString() || '',
          topic: topic || (newOER.tags && newOER.tags[0]) || ''
        }
      );

      for (const tag of newOER.tags) {
        await session.run(
          `MATCH (o:OER {id: $oerId})
           MERGE (t:Tag {name: $tagName})
           MERGE (o)-[:HAS_TAG]->(t)`,
          { oerId: newOER._id.toString(), tagName: tag }
        );
      }

      await session.run(
        `MATCH (u:User {id: $userId}), (o:OER {id: $oerId})
         MERGE (u)-[:UPLOADED]->(o)`,
        {
          userId: uploader.toString(),
          oerId: newOER._id.toString()
        }
      );

    } finally {
      await session.close();
    }

    res.status(201).json({ message: 'File uploaded successfully', oer: newOER });
  } catch (err) {
    console.error('File Upload Error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// ✅ Forwarded resource (from CORE or arXiv)
router.post('/', async (req, res) => {
  try {
    const { title, description, coverUrl, tags, resourceUrl, uploader, isForwarded, originalSource, comment } = req.body;

    const oer = new OER({
      title,
      description,
      coverUrl,
      tags,
      resourceUrl,
      uploader,
      isForwarded: isForwarded || false,
      originalSource: originalSource || '',
      comment: comment || ''
    });

    await oer.save();

    const session = neo4j.session();
    try {
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

      for (const tag of tags || []) {
        await session.run(
          `MATCH (o:OER {id: $oerId})
           MERGE (t:Tag {name: $tagName})
           MERGE (o)-[:HAS_TAG]->(t)`,
          { oerId: oer._id.toString(), tagName: tag }
        );
      }

      await session.run(
        `MATCH (u:User {id: $userId}), (o:OER {id: $oerId})
         MERGE (u)-[:UPLOADED]->(o)`,
        {
          userId: uploader ? uploader.toString() : '',
          oerId: oer._id.toString()
        }
      );

      res.status(201).json({ message: 'Forwarded OER saved', oer });
    } finally {
      await session.close();
    }
  } catch (err) {
    console.error('Error forwarding resource:', err);
    res.status(500).json({ error: 'Failed to save forwarded resource' });
  }
});

module.exports = router;
