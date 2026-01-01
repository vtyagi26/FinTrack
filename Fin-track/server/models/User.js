import mongoose from "mongoose"; // Object data modelling library for database interaction
import bcrypt from "bcrypt"; // used to hash passwords and store in database -> security

const userSchema = new mongoose.Schema( // defines structure of documents in mongodb collection
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true } // automatically adds createdat and updatedat fields to the document
);

// hash password before saving
userSchema.pre("save", async function (next) { // defines middleware that runs before saving
  if (!this.isModified("password")) return next(); // checks if pass modified, if not skip hashing
  this.password = await bcrypt.hash(this.password, 10); // hashes passwords, salt rounds = 10
  next(); // calls next middleware or continues saving doc
});

// compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) { // adds matchpass method in schem
  return await bcrypt.compare(enteredPassword, this.password);
}; // takes enteredPassword - plaintext and compares with existing hashed password in db
// true if they match & vice versa

const User = mongoose.model("User", userSchema); // creates mongoose model user using userschema
export default User; // exports this model for other usage