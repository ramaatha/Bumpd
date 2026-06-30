"use strict";
const { Model } = require("sequelize");
const { hashPassword } = require("../helpers/bcrypt");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasOne(models.Profile, { foreignKey: "userId" });
      User.hasMany(models.FavoritePlace, { foreignKey: "userId" });
      User.hasMany(models.Like, { foreignKey: "fromUserId", as: "SentLikes" });
      User.hasMany(models.Like, {
        foreignKey: "toUserId",
        as: "ReceivedLikes",
      });
      User.hasMany(models.Match, {
        foreignKey: "user1Id",
        as: "MatchesAsUser1",
      });
      User.hasMany(models.Match, {
        foreignKey: "user2Id",
        as: "MatchesAsUser2",
      });
    }
  }
  User.init(
    {
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          args: true,
          msg: "Email already exist",
        },
        validate: {
          notNull: { msg: "Email is required" },
          notEmpty: { msg: "Email is required" },
          isEmail: { msg: "Invalid email format" },
        },
      },
      password: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: { msg: "Password is required" },
          len: { args: [5], msg: "Password min. 5 characters" },
        },
      },
    },
    {
      sequelize,
      modelName: "User",
    },
  );

  User.beforeCreate((user) => {
    if (user.password) {
      user.password = hashPassword(user.password);
    }
  });

  return User;
};
