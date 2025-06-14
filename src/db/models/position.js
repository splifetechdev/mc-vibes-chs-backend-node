"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class position extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  position.init(
    {
      name: DataTypes.STRING,
      company_id: DataTypes.INTEGER,
      department_id: DataTypes.INTEGER,
      status: DataTypes.STRING,
      user_create: DataTypes.INTEGER,
      user_update: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    {
      sequelize,
      modelName: "position",
      underscored: true,
      freezeTableName: true,
      underscoreAll: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return position;
};
