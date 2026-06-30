const bcrypt = require("bcryptjs");

const hashPassword = (inputPass) => {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(inputPass, salt);
  return hash;
};

const comparePassword = (inputPassword, hashedPassword) => {
  return bcrypt.compareSync(inputPassword, hashedPassword);
};

module.exports = { hashPassword, comparePassword };
