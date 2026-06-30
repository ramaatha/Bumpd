if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();
const cors = require("cors");
const errorHandler = require("./middlewares/errorHandler");
const authentication = require("./middlewares/authentication");
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const placeRouter = require("./routes/place");
const userRouter = require("./routes/user");
const likeRouter = require("./routes/like");
const matchRouter = require("./routes/match");
const uploadRouter = require("./routes/upload");

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/auth", authRouter);

app.use(authentication);

app.use("/profile", profileRouter);
app.use("/places", placeRouter);
app.use("/users", userRouter);
app.use("/likes", likeRouter);
app.use("/matches", matchRouter);
app.use("/upload", uploadRouter);

app.use(errorHandler);

module.exports = app;
