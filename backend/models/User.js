const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: function () {
        return !this.googleUser;
      },
    },

    googleUser: {
      type: Boolean,
      default: false,
    },

    bio: {
      type: String,
      default: '',
    },

    avatarUrl: {
      type: String,
      default: '',
    },

    titles: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (!this.password) return next();
  if (!this.isModified('password')) return next();

  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.methods.comparePassword = async function (password) {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);