const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  failedLoginAttempts: { type: Number, default: 0 },
  isLocked: { type: Boolean, default: false },
  resetCode: { type: String },
  resetCodeExpires: { type: Date },
  twoFASecret: { type: String }, // 2FA секретный ключ
  is2FAEnabled: { type: Boolean, default: false }, // Включена ли 2FA
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }] // Избранные товары
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
