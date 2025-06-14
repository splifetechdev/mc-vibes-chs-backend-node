"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tbl_kpi_master extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tbl_kpi_master.init(
    {
      set_up_by: DataTypes.STRING,
      wcg_id: DataTypes.STRING,
      wc_id: DataTypes.STRING,
      title_id: DataTypes.INTEGER,
      target: DataTypes.DECIMAL,
      uom: DataTypes.STRING,
      company_id: DataTypes.INTEGER,
      date_start: DataTypes.DATE,
      date_end: DataTypes.DATE,
      user_create: DataTypes.INTEGER,
      user_update: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "tbl_kpi_master",
      underscored: true,
      freezeTableName: true,
      underscoreAll: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return tbl_kpi_master;
};
