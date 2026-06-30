const { FavoritePlace } = require("../models");

class PlaceController {
  static async getPlaces(req, res, next) {
    try {
      const places = await FavoritePlace.findAll({
        where: { userId: req.user.id },
        order: [["createdAt", "DESC"]],
      });

      res.status(200).json(places);
    } catch (error) {
      next(error);
    }
  }

  static async addPlace(req, res, next) {
    try {
      const { placeName, lat, long, note } = req.body;

      if (!placeName)
        throw { name: "BadRequest", message: "Place name is required" };

      // Reverse geocode dengan Nominatim
      let city = null;
      if (lat && long) {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${long}&format=json`,
          {
            headers: {
              "User-Agent": "Bumpd-App/1.0 (ramabm18@gmail.com)",
            },
          },
        );
        const geoData = await response.json();
        city =
          geoData.address?.city ||
          geoData.address?.town ||
          geoData.address?.county ||
          geoData.address?.state ||
          null;
      }

      const place = await FavoritePlace.create({
        userId: req.user.id,
        placeName,
        lat,
        long,
        note,
      });

      res.status(201).json({ ...place.toJSON(), city });
    } catch (error) {
      next(error);
    }
  }

  static async deletePlace(req, res, next) {
    try {
      const place = await FavoritePlace.findOne({
        where: { id: req.params.id, userId: req.user.id },
      });

      if (!place) throw { name: "NotFound", message: "Place not found" };

      await place.destroy();

      res.status(200).json({ message: "Place deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PlaceController;
