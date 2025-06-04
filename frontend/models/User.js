const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  bio: String,
  avatarUrl: String, 
  titles: [String], // interested learning topics
});

module.exports = mongoose.model('User', UserSchema);
