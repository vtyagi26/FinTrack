import express from "express";

const router = express.Router();

router.get("/unread-count", (req, res) => {
  return res.status(200).json({
    count: 0
  });
});

export default router;