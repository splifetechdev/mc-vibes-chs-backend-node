"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class division extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  division.init(
    {
      code: DataTypes.STRING,
      name: DataTypes.STRING,
      department_id: DataTypes.INTEGER,
      company_id: DataTypes.INTEGER,
      user_create: DataTypes.INTEGER,
      user_update: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "division",
      underscored: true,
      freezeTableName: true,
      underscoreAll: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return division;
};
