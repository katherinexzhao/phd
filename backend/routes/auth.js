console.log("auth.js loaded");
const express = require('express')
const User = require('../models/User')
const router = express.Router()
const multer = require('multer');
const path = require('path');

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

// Sign up
router.post('/signup', upload.single('avatar'), async (req, res) => {
  try {
    const { email, password, username, bio } = req.body;
    let titles = req.body.titles;
    if (titles && !Array.isArray(titles)) {
      titles = [titles];
    }
    let avatarUrl = req.file ? `/uploads/avatars/${req.file.filename}` : '';
    const user = new User({
      email,
      password,
      username,
      bio,
      avatarUrl,
      titles
    });
    await user.save();
    res.status(201).json({ success: true, message: 'User created' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Log in
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })
  if (!user) return res.status(400).json({ success: false, error: 'Invalid credentials' })
  const isMatch = await user.comparePassword(password)
  if (!isMatch) return res.status(400).json({ success: false, error: 'Invalid credentials' })
  res.json({ success: true, message: 'Login successful', username: user.username })
})

module.exports = router
