const { comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
const { User, Profile } = require("../models");
const axios = require("axios");

class AuthController {
  static async register(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email) throw { name: "BadRequest", message: "Email is required" };
      if (!password)
        throw { name: "BadRequest", message: "Password is required" };

      const user = await User.create({ email, password });

      await Profile.create({ userId: user.id });

      const access_token = signToken({ id: user.id, email: user.email });

      res.status(201).json({ access_token, email: user.email });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email) throw { name: "BadRequest", message: "Email is required" };
      if (!password)
        throw { name: "BadRequest", message: "Password is required" };

      const user = await User.findOne({ where: { email } });
      if (!user)
        throw {
          name: "Unauthorized",
          message: "Email not registered, register first to find your match!",
        };

      const isValid = comparePassword(password, user.password);
      if (!isValid)
        throw { name: "Unauthorized", message: "Invalid email/password" };

      const access_token = signToken({ id: user.id, email: user.email });

      res.status(200).json({ access_token, email: user.email });
    } catch (error) {
      next(error);
    }
  }

  static async googleLogin(req, res, next) {
    try {
      const { access_token_google } = req.headers;

      if (!access_token_google)
        throw { name: "BadRequest", message: "Invalid token" };

      const { data: payload } = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        { headers: { Authorization: `Bearer ${access_token_google}` } }
      );

      if (!payload.email_verified) {
        throw { name: "BadRequest", message: "Email is not verified" };
      }

      const [user, created] = await User.findOrCreate({
        where: { email: payload.email },
        defaults: { password: null },
      });

      if (created) {
        await Profile.create({ userId: user.id });
      }

      const access_token = signToken({ id: user.id, email: user.email });

      res.status(200).json({ access_token, email: user.email });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
