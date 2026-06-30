"use strict";

const bcrypt = require("bcryptjs");
const hashedPassword = bcrypt.hashSync("password123", 10);

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("Users", [
      // Males (15)
      {
        email: "andi.pratama@gmail.com",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "budi.santoso@gmail.com",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "dimas.aditya@gmail.com",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "fajar.nugroho@gmail.com",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "rizky.ramadhan@gmail.com",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "hendra.wijaya@gmail.com",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "bagas.setiawan@gmail.com",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "yogi.prasetyo@gmail.com",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "kevin.santoso@gmail.com",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "gilang.purnama@gmail.com",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "arya.wibowo@gmail.com",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "fauzi.rahman@gmail.com",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "reza.mahendra@gmail.com",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "galih.kusuma@gmail.com",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "ryan.hidayat@gmail.com",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Females (15)
      {
        email: "sari.dewi@gmail.com",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "rina.kusuma@gmail.com",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "maya.putri@gmail.com",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "citra.lestari@gmail.com",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "nadia.permata@gmail.com",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "tania.rahayu@gmail.com",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "vina.maharani@gmail.com",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "laila.sari@gmail.com",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "risa.amelia@gmail.com",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "tika.wardani@gmail.com",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "shinta.dewi@gmail.com",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "dian.pertiwi@gmail.com",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "ayu.fitriani@gmail.com",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "indah.permata@gmail.com",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "mega.wulandari@gmail.com",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users", null, {});
  },
};
