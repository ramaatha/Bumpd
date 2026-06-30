const express = require("express");
const router = express.Router();
const UploadController = require("../controllers/UploadController");
const upload = require("../helpers/multer");

router.patch("/photo", upload.single("photo"), UploadController.uploadPhoto);

module.exports = router;
