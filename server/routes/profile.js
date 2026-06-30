const express = require("express");
const router = express.Router();
const ProfileController = require("../controllers/ProfileController");

router.get("/me", ProfileController.getMyProfile);
router.put("/me", ProfileController.updateProfile);

module.exports = router;
