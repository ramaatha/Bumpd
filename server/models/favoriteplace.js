"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class FavoritePlace extends Model {
    static associate(models) {
      FavoritePlace.belongsTo(models.User, { foreignKey: "userId" });
    }
  }
  FavoritePlace.init(
    {
      userId: DataTypes.INTEGER,
      placeName: DataTypes.STRING,
      lat: DataTypes.FLOAT,
      long: DataTypes.FLOAT,
      note: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "FavoritePlace",
    },
  );
  return FavoritePlace;
};
