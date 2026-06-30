const { User, Profile, FavoritePlace } = require("../models");

class ProfileController {
  static async getMyProfile(req, res, next) {
    try {
      const user = await User.findOne({
        where: { id: req.user.id },
        attributes: { exclude: ["password"] },
        include: [{ model: Profile }, { model: FavoritePlace }],
      });

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const {
        name,
        gender,
        age,
        bio,
        photoUrl,
        city,
        lat,
        long,
        personality,
        interests,
        relationshipGoals,
      } = req.body;

      const profile = await Profile.findOne({ where: { userId: req.user.id } });

      if (!profile) throw { name: "NotFound", message: "Profile not found" };

      await profile.update({
        name,
        gender,
        age,
        bio,
        photoUrl,
        city,
        lat,
        long,
        personality,
        interests,
        relationshipGoals,
      });

      res.status(200).json(profile);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProfileController;
