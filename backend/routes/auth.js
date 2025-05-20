console.log("auth.js loaded");
const express = require('express')
const User = require('../models/User')
const router = express.Router()

// Sign up
router.post('/signup', async (req, res) => {
  console.log('Signup API called:', req.body);
  const { username, password } = req.body
  try {
    const user = new User({ username, password })
    await user.save()
    console.log('User saved:', user);
    res.status(201).json({ message: 'User created' })
  } catch (err) {
    res.status(400).json({ error: 'Username already exists' })
  }
})

// Log in
router.post('/login', async (req, res) => {
  const { username, password } = req.body
  const user = await User.findOne({ username })
  if (!user) return res.status(400).json({ error: 'Invalid credentials' })
  const isMatch = await user.comparePassword(password)
  if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' })
  res.json({ message: 'Login successful' })
})

module.exports = router
