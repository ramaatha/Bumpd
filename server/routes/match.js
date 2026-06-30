const express = require("express");
const router = express.Router();
const MatchController = require("../controllers/MatchController");

router.get("/", MatchController.getMatches);
router.get("/notifications", MatchController.getNotifications);
router.patch("/notifications/read", MatchController.markNotificationsRead);

module.exports = router;
