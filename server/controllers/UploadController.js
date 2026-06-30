const cloudinary = require("cloudinary").v2;
const { Profile } = require("../models");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class UploadController {
  static async uploadPhoto(req, res, next) {
    try {
      if (!req.file) {
        throw { name: "BadRequest", message: "Photo is required" };
      }

      const profile = await Profile.findOne({ where: { userId: req.user.id } });

      if (!profile) {
        throw { name: "NotFound", message: "Profile not found" };
      }

      const base64Img = req.file.buffer.toString("base64");
      const base64DataUri = `data:${req.file.mimetype};base64,${base64Img}`;

      const result = await cloudinary.uploader.upload(base64DataUri);

      await profile.update({ photoUrl: result.secure_url });

      res.status(200).json({ photoUrl: result.secure_url });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UploadController;
