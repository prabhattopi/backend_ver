const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  fullname: { type: String },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneno: { type: Number, default: null },
  coutryphoneno: { type: String, defualt: null },
  country: { type: String, default: null },
  city: { type: String, default: null },
  address: { type: String, default: null },
  gender: { type: String, default: null },
  age: { type: Number, default: null },
  bio: { type: String, default: null },
  googleId: {
    type: String,
    default: null,
  },
});

// Hash the password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
