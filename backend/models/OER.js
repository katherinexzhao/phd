const mongoose = require('mongoose');

const OERSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  resourceUrl: {  // 🆕 实际资源文件 URL
    type: String,
    required: true
  },
  coverUrl: {      // 🆕 封面图片（可选）
    type: String
  },
  tags: [{
    type: String
  }],
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isForwarded: { type: Boolean, default: false },
  originalSource: { type: String }, 
});

module.exports = mongoose.model('OER', OERSchema);