const { Op } = require("sequelize");
const { Like, Match, Profile, FavoritePlace, User } = require("../models");
const { genIcebreaker } = require("../helpers/gemini");

class LikeController {
  static async getReceivedCount(req, res, next) {
    try {
      const count = await Like.count({
        where: { toUserId: req.user.id },
      });
      res.status(200).json({ count });
    } catch (error) {
      next(error);
    }
  }

  static async getReceived(req, res, next) {
    try {
      const likes = await Like.findAll({
        where: { toUserId: req.user.id },
        include: [
          {
            model: User,
            as: "Liker",
            attributes: { exclude: ["password"] },
            include: [{ model: Profile }],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
      res.status(200).json(likes);
    } catch (error) {
      next(error);
    }
  }

  static async likeUser(req, res, next) {
    try {
      const fromUserId = req.user.id;
      const toUserId = Number(req.params.userId);

      if (isNaN(toUserId)) {
        throw { name: "BadRequest", message: "Invalid user ID" };
      }

      if (fromUserId === toUserId) {
        throw { name: "BadRequest", message: "You cannot like yourself" };
      }

      // Cek apakah sudah pernah like
      const existingLike = await Like.findOne({
        where: { fromUserId, toUserId },
      });
      if (existingLike) {
        throw { name: "BadRequest", message: "Already liked this user" };
      }

      // Buat like
      await Like.create({ fromUserId, toUserId });

      // Cek mutual — apakah toUser sudah like balik current user?
      const mutualLike = await Like.findOne({
        where: { fromUserId: toUserId, toUserId: fromUserId },
      });

      if (mutualLike) {
        // Ambil profile kedua user
        const [profile1, profile2] = await Promise.all([
          Profile.findOne({ where: { userId: fromUserId } }),
          Profile.findOne({ where: { userId: toUserId } }),
        ]);

        // Cari shared favorite places berdasarkan placeName
        const [places1, places2] = await Promise.all([
          FavoritePlace.findAll({ where: { userId: fromUserId } }),
          FavoritePlace.findAll({ where: { userId: toUserId } }),
        ]);

        // Gunakan note milik User 2 (toUser) sebagai basis icebreaker
        const places1Set = new Set(places1.map((p) => p.placeName.toLowerCase()));
        const sharedPlaces = places2.filter((p) =>
          places1Set.has(p.placeName.toLowerCase()),
        );

        // Generate icebreaker via Gemini
        let icebreaker = null;
        try {
          icebreaker = await genIcebreaker(
            profile1 || {},
            profile2 || {},
            sharedPlaces,
          );
        } catch (geminiError) {
          console.error("Gemini icebreaker failed:", geminiError.message);
          icebreaker = null;
        }

        // Guard against race condition: only create match if not already exists
        const existingMatch = await Match.findOne({
          where: {
            [Op.or]: [
              { user1Id: fromUserId, user2Id: toUserId },
              { user1Id: toUserId, user2Id: fromUserId },
            ],
          },
        });

        if (!existingMatch) {
          await Match.create({
            user1Id: fromUserId,
            user2Id: toUserId,
            icebreaker,
            isRead: false,
          });
        }

        return res
          .status(201)
          .json({ message: "It's a match! 🙌", matched: true });
      }

      res.status(201).json({ message: "Liked successfully", matched: false });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = LikeController;
