const mongoose = require('mongoose');

const OERSchema = new mongoose.Schema({
  title: String,
  description: String,
  type: {
    type: String,
    enum: ['Mental Health', 'First Aid', 'Academic Skills', 'Career Development', 'Study Techniques', 'Other'],
    required: true
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  file: {
    data: Buffer,
    contentType: String,
    originalName: String
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('OER', OERSchema); 