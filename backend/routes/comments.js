// routes/comments.js
const express = require('express');
const Comment = require('../models/Comment');
const router = express.Router();

// 创建评论
router.post('/', async (req, res) => {
  try {
    const { targetId, targetType, userId, text } = req.body;
    if (!targetId || !targetType || !userId || !text) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const newComment = new Comment({ targetId, targetType, userId, text });
    await newComment.save();
    await newComment.populate('userId', 'username');

    res.json({ success: true, comment: newComment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 获取某个资源或论文的所有评论
router.get('/:targetId', async (req, res) => {
  try {
    const { targetId } = req.params;
    const comments = await Comment.find({ targetId })
      .sort({ createdAt: -1 })
      .populate('userId', 'username');
    res.json({ success: true, comments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// count comments
router.get('/count/:targetId', async (req, res) => {
  try {
    const { targetId } = req.params;
    const count = await Comment.countDocuments({ targetId });
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;