"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Like extends Model {
    static associate(models) {
      Like.belongsTo(models.User, { foreignKey: "fromUserId", as: "Liker" });
      Like.belongsTo(models.User, { foreignKey: "toUserId", as: "Liked" });
    }
  }
  Like.init(
    {
      fromUserId: DataTypes.INTEGER,
      toUserId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Like",
    },
  );
  return Like;
};
