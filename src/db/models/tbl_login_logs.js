"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tbl_login_logs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tbl_login_logs.init(
    {
      user_id: DataTypes.INTEGER,
      login_sta: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "tbl_login_logs",
      underscored: true,
      freezeTableName: true,
      underscoreAll: true,
      createdAt: "created_at",
      updateAt: "updated_at",
    }
  );
  return tbl_login_logs;
};
