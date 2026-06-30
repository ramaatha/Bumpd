"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Profiles", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      name: {
        type: Sequelize.STRING,
      },
      gender: {
        type: Sequelize.STRING,
      },
      age: {
        type: Sequelize.INTEGER,
      },
      bio: {
        type: Sequelize.TEXT,
      },
      photoUrl: {
        type: Sequelize.STRING,
      },
      city: {
        type: Sequelize.STRING,
      },
      lat: {
        type: Sequelize.FLOAT,
      },
      long: {
        type: Sequelize.FLOAT,
      },
      personality: {
        type: Sequelize.STRING,
      },
      interests: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: [],
      },
      relationshipGoals: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Profiles");
  },
};
