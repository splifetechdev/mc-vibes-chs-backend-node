"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tbl_holiday_mch extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tbl_holiday_mch.init(
    {
      holiday_id: DataTypes.INTEGER,
      machine_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "tbl_holiday_mch",
      underscored: true,
      freezeTableName: true,
      underscoreAll: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return tbl_holiday_mch;
};
