const { Op } = require("sequelize");
const { User, Profile, FavoritePlace, Like } = require("../models");
const haversine = require("../helpers/haversine");

class UserController {
  static async getAllUsers(req, res, next) {
    try {
      // Ambil profile current user untuk koordinat
      const myProfile = await Profile.findOne({
        where: { userId: req.user.id },
      });

      // Ambil ID user yang sudah di-like oleh current user
      const likedUsers = await Like.findAll({
        where: { fromUserId: req.user.id },
        attributes: ["toUserId"],
      });
      const likedIds = likedUsers.map((l) => l.toUserId);

      // Filter opsional berdasarkan lookingFor (query param)
      const whereProfile = {};
      if (req.query.relationshipGoals) {
        whereProfile.relationshipGoals = req.query.relationshipGoals;
      }

      const users = await User.findAll({
        where: {
          id: { [Op.notIn]: [req.user.id, ...likedIds] },
        },
        attributes: { exclude: ["password"] },
        include: [
          {
            model: Profile,
            where: Object.keys(whereProfile).length ? whereProfile : undefined,
          },
        ],
      });

      // Tambahkan jarak haversine ke tiap user
      const result = users.map((user) => {
        const u = user.toJSON();
        if (
          myProfile?.lat &&
          myProfile?.long &&
          u.Profile?.lat &&
          u.Profile?.long
        ) {
          u.distance = haversine(
            myProfile.lat,
            myProfile.long,
            u.Profile.lat,
            u.Profile.long,
          );
        } else {
          u.distance = null;
        }
        return u;
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(req, res, next) {
    try {
      const myProfile = await Profile.findOne({
        where: { userId: req.user.id },
      });

      const user = await User.findOne({
        where: { id: req.params.id },
        attributes: { exclude: ["password"] },
        include: [{ model: Profile }, { model: FavoritePlace }],
      });

      if (!user) throw { name: "NotFound", message: "User not found" };

      const result = user.toJSON();
      if (
        myProfile?.lat &&
        myProfile?.long &&
        result.Profile?.lat &&
        result.Profile?.long
      ) {
        result.distance = haversine(
          myProfile.lat,
          myProfile.long,
          result.Profile.lat,
          result.Profile.long,
        );
      } else {
        result.distance = null;
      }

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
