"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Match extends Model {
    static associate(models) {
      Match.belongsTo(models.User, { foreignKey: "user1Id", as: "User1" });
      Match.belongsTo(models.User, { foreignKey: "user2Id", as: "User2" });
    }
  }
  Match.init(
    {
      user1Id: DataTypes.INTEGER,
      user2Id: DataTypes.INTEGER,
      icebreaker: DataTypes.TEXT,
      isRead: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Match",
    },
  );
  return Match;
};
