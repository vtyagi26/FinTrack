const jwt = require("jsonwebtoken");

const userVerification = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized - No token found" });
  }

  jwt.verify(token, process.env.TOKEN_KEY, (err, decoded) => {
    if (err) {
      console.error("JWT Verification failed:", err.message);
      return res.status(403).json({ success: false, message: "Invalid token" });
    }

    req.user = decoded.id;
    next();
  });
};

module.exports = { userVerification };