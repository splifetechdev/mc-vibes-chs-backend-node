"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tbl_sheft extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tbl_sheft.init(
    {
      wh_id: DataTypes.STRING,
      lc_id: DataTypes.STRING,
      shf_id: DataTypes.STRING,
      sf_name: DataTypes.STRING,
      sf_status: DataTypes.STRING,
      user_create: DataTypes.INTEGER,
      user_update: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "tbl_sheft",
      underscored: true,
      freezeTableName: true,
      underscoreAll: true,
      //   timestamps: false,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  tbl_sheft.removeAttribute("id");
  return tbl_sheft;
};
