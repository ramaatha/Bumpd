"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Profile extends Model {
    static associate(models) {
      Profile.belongsTo(models.User, { foreignKey: "userId" });
    }
  }
  Profile.init(
    {
      userId: DataTypes.INTEGER,
      name: DataTypes.STRING,
      gender: DataTypes.STRING,
      age: DataTypes.INTEGER,
      bio: DataTypes.TEXT,
      photoUrl: DataTypes.STRING,
      city: DataTypes.STRING,
      lat: DataTypes.FLOAT,
      long: DataTypes.FLOAT,
      personality: DataTypes.STRING,
      interests: DataTypes.ARRAY(DataTypes.STRING),
      relationshipGoals: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Profile",
    },
  );
  return Profile;
};
