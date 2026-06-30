const express = require("express");
const router = express.Router();
const LikeController = require("../controllers/LikeController");

router.get("/received-count", LikeController.getReceivedCount);
router.get("/received", LikeController.getReceived);
router.post("/:userId", LikeController.likeUser);

module.exports = router;
