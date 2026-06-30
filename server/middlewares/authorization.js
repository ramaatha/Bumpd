const { FavoritePlace } = require("../models");

const authorization = async (req, res, next) => {
  try {
    const place = await FavoritePlace.findOne({
      where: { id: req.params.id },
    });

    if (!place) {
      throw { name: "NotFound", message: "Place not found" };
    }

    if (place.userId !== req.user.id) {
      throw { name: "Forbidden", message: "You are not authorized" };
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authorization;
