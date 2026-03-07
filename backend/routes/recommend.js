// routes/recommend.js
const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const User = require('../models/User');
const OER = require('../models/OER'); 
const Comment = require('../models/Comment');

const router = express.Router();



// 推荐用户上传的 OER 内容
router.post('/recommend-oers', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    const user = await User.findById(userId);
    console.log('📌 Fetched user for OERs:', user);
    console.log('🎯 User interests:', user.titles);
    if (!user || !user.titles || user.titles.length === 0) {
      // 如果没兴趣标签，也可以返回最新的公开 OER
      const fallback = await OER.find().sort({ createdAt: -1 }).limit(10);
      return res.json(fallback);
    }

    const regexInterests = user.titles.map(tag => new RegExp(tag, 'i'));

    const matchedOers = await OER.find({
      tags: { $in: regexInterests }
    }).sort({ createdAt: -1 });

    // 如果匹配数量不够，可以追加最新上传的补齐
    if (matchedOers.length < 10) {
      const supplement = await OER.find()
        .sort({ createdAt: -1 })
        .limit(10 - matchedOers.length);
      matchedOers.push(...supplement.filter(o => !matchedOers.includes(o)));
    }

    const oersWithComments = await Promise.all(
      matchedOers.map(async (oer) => {
        const count = await Comment.countDocuments({
          targetId: oer._id.toString(),
          targetType: 'OER'
        });
        return { ...oer.toObject(), commentCount: count };
      })
    );

    return res.json(oersWithComments);
  } catch (err) {
    console.error('Error fetching recommended OERs:', err);
    return res.status(500).json({ error: 'Failed to fetch recommended resources' });
  }
});

module.exports = router;
