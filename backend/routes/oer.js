const express = require('express');
const multer = require('multer');
const OER = require('../models/OER');
const router = express.Router();
const axios = require('axios');

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

router.post('/upload', upload.single('file'), async (req, res) => {
  console.log('OER upload called', req.body, req.file);
  try {
    const email = req.body.email;
    if (!email) return res.status(400).json({ error: 'Missing email' });
    const User = require('../models/User');
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const { title, description, type } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    if (!type) return res.status(400).json({ error: 'Resource type is required' });

    const oer = new OER({
      title,
      description,
      type,
      userId: user._id,
      file: {
        data: file.buffer,
        contentType: file.mimetype,
        originalName: file.originalname
      }
    });
    await oer.save();
    res.status(201).json({ message: 'OER uploaded successfully' });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
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

module.exports = router; 