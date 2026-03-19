console.log("auth.js loaded");
const express = require('express')
const User = require('../models/User')
const router = express.Router()
const multer = require('multer');
const path = require('path');
const { OAuth2Client } = require('google-auth-library');
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '391677112340-os318qhu7dpb5fb7asg1nd2qtesbjtr6.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const neo4j = require('../config/neo4j');

async function syncUserToNeo4j(user) {
  const session = neo4j.session();

  try {
    await session.run(
      `MERGE (u:User {id: $userId})
       SET u.username = $username, u.email = $email`,
      {
        userId: user._id.toString(),
        username: user.username,
        email: user.email
      }
    );
  } catch (error) {
    console.error('Neo4j user sync failed:', error.message);
  } finally {
    await session.close();
  }
}

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
    const email = normalizeEmail(req.body.email);
    const { password, username, bio } = req.body;
    let titles = req.body.titles;
    if (titles && !Array.isArray(titles)) {
      titles = [titles];
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already exists' });
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
    await syncUserToNeo4j(user);
    res.status(201).json({ success: true, message: 'User created', userId: user._id });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Log in
router.post('/login', async (req, res) => {
  const email = normalizeEmail(req.body.email)
  const password = req.body.password
  const user = await User.findOne({ email })
  if (!user) return res.status(400).json({ success: false, error: 'Invalid credentials' })
  const isMatch = await user.comparePassword(password)
  if (!isMatch) return res.status(400).json({ success: false, error: 'Invalid credentials' })
  await syncUserToNeo4j(user);
  res.json({ success: true, message: 'Login successful', username: user.username, userId: user._id })
})

// Google Login
router.post('/google-login', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Google token is required'
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const email = normalizeEmail(payload.email);
    const username = payload.name || payload.given_name || 'Google User';

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Google account email not found'
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        username,
        googleUser: true
      });
    }

    await syncUserToNeo4j(user);

    return res.json({
      success: true,
      email: user.email,
      username: user.username,
      userId: user._id
    });
  } catch (error) {
    console.error('Google login error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Google sign up failed. Please try again.'
    });
  }
});

module.exports = router
