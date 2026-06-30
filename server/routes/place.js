const express = require("express");
const router = express.Router();
const PlaceController = require("../controllers/PlaceController");
const authorization = require("../middlewares/authorization");

router.get("/", PlaceController.getPlaces);
router.post("/", PlaceController.addPlace);
router.delete("/:id", authorization, PlaceController.deletePlace);

module.exports = router;
