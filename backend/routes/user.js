const express = require('express');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/avatars/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Complete profile endpoint
router.post('/complete-profile', upload.single('avatar'), async (req, res) => {
  try {
    const { email, username, bio, titles } = req.body;
    let avatarUrl = req.file ? `/uploads/avatars/${req.file.filename}` : '';
    const titlesArray = typeof titles === 'string' ? [titles] : titles; // handle single/multiple

    let user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    user.username = username;
    user.bio = bio;
    user.titles = titlesArray;
    if (avatarUrl) user.avatarUrl = avatarUrl;
    await user.save();

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Add this route to save user interests
router.post('/interests', async (req, res) => {
  const { email, interests } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { email },
      { $set: { titles: interests } },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get profile endpoint
router.get('/profile', async (req, res) => {
  const { email } = req.query;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ success: false, error: 'User not found' });
  res.json({ success: true, user });
});

module.exports = router; 