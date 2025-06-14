"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tbl_location extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tbl_location.init(
    {
      wh_id: DataTypes.STRING,
      lc_id: DataTypes.STRING,
      lc_name: DataTypes.STRING,
      lc_status: DataTypes.STRING,
      user_create: DataTypes.INTEGER,
      user_update: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "tbl_location",
      underscored: true,
      freezeTableName: true,
      underscoreAll: true,
      //   timestamps: false,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  tbl_location.removeAttribute("id");
  return tbl_location;
};
