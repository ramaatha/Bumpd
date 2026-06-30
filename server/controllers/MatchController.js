const { Op } = require("sequelize");
const { Match, User, Profile } = require("../models");

class MatchController {
  static async getMatches(req, res, next) {
    try {
      const matches = await Match.findAll({
        where: {
          [Op.or]: [{ user1Id: req.user.id }, { user2Id: req.user.id }],
        },
        include: [
          {
            model: User,
            as: "User1",
            attributes: { exclude: ["password"] },
            include: [{ model: Profile }],
          },
          {
            model: User,
            as: "User2",
            attributes: { exclude: ["password"] },
            include: [{ model: Profile }],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      res.status(200).json(matches);
    } catch (error) {
      next(error);
    }
  }

  static async getNotifications(req, res, next) {
    try {
      const notifications = await Match.findAll({
        where: {
          isRead: false,
          [Op.or]: [{ user1Id: req.user.id }, { user2Id: req.user.id }],
        },
        include: [
          {
            model: User,
            as: "User1",
            attributes: { exclude: ["password"] },
            include: [{ model: Profile }],
          },
          {
            model: User,
            as: "User2",
            attributes: { exclude: ["password"] },
            include: [{ model: Profile }],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      res.status(200).json(notifications);
    } catch (error) {
      next(error);
    }
  }

  static async markNotificationsRead(req, res, next) {
    try {
      await Match.update(
        { isRead: true },
        {
          where: {
            isRead: false,
            [Op.or]: [{ user1Id: req.user.id }, { user2Id: req.user.id }],
          },
        },
      );

      res.status(200).json({ message: "Notifications marked as read" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MatchController;
