// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // ADD THIS FIELD:
    balance: { type: Number, default: 10000 }, 
  },
  { timestamps: true }
);

// ... keep your existing password hashing and matchPassword methods ...

const User = mongoose.model("User", userSchema);
export default User;