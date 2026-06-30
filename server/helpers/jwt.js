const jwt = require("jsonwebtoken");

const signToken = (payload) => {
  return jwt.sign(payload, process.env.SECRET_KEY);
};

const verifyToken = (tokenValue) => {
  return jwt.verify(tokenValue, process.env.SECRET_KEY);
};

module.exports = { signToken, verifyToken };
