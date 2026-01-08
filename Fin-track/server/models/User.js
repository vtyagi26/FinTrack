// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    balance: { type: Number, default: 10000 },
  },
  { timestamps: true }
);

// 1. Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 2. Add matchPassword method (IMPORTANT: Use the .methods property)
userSchema.methods.matchPassword = async function (enteredPassword) {
  // 'this.password' refers to the hashed password in the DB
  return await bcrypt.compare(enteredPassword, this.password);
};

// 3. Compile the model ONLY AFTER the methods are defined
const User = mongoose.model("User", userSchema);
export default User;