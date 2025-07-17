const express = require("express");
const router = express.Router();
const User = require("../model/UserModel");
const { Signup, Login, Logout } = require("../controller/AuthController");
const { userVerification } = require("../middleware/AuthMiddleware");

router.post("/signup", Signup);
router.post("/login", Login);
router.post("/logout", Logout);

router.get("/verify", userVerification, async (req, res) => {
  try {
    console.log("Verifying user...");
    console.log("Cookies:", req.cookies);

    const user = await User.findById(req.user).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("Verified User:", user);

    return res.status(200).json({
      success: true,
      message: "Token is valid",
      user, // contains username, email, etc.
    });
  } catch (error) {
    console.error("Verify Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during verification",
    });
  }
});

module.exports = router;