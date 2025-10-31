const jwt = require("jsonwebtoken");

const createSecretToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      username: user.username,
    },
    process.env.TOKEN_KEY,
    {
      expiresIn: "3d",
    }
  );
};

module.exports = { createSecretToken };