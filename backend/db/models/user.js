'use strict';
const { Model, Validator } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Group, {
        foreignKey: 'organizerId', onDelete: 'CASCADE', hooks: 'true'
      });

      User.hasMany(models.Membership, {
        foreignKey: 'userId', onDelete: 'CASCADE', hooks: true
      });

      User.hasMany(models.Attendance, {
        foreignKey: 'userId', onDelete: 'CASCADE', hooks: true
      });

    }
  };

  User.init(
    {
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          args: true,
          msg: "User with that username already exists"
        },
        validate: {
          len: [4, 30],
          isNotEmail(value) {
            if (Validator.isEmail(value)) {
              throw new Error("Cannot be an email.");
            }
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          arg: true,
          msg: "User with that email already exists",
          // msg: "User already exists"

        },
        validate: {
          len: [3, 256],
          isEmail: true,
        },
      },
      hashedPassword: {
        type: DataTypes.STRING.BINARY,
        allowNull: false,
        validate: {
          len: [60, 60],
        },
      },
    },
    {
      sequelize,
      modelName: "User",
      defaultScope: {
        attributes: {
          exclude: ["hashedPassword", "email", "createdAt", "updatedAt"],
        },
      },
    }
  );
  return User;
};
