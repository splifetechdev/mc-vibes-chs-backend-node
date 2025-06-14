"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tbl_shift extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.tbl_mch_shift, {
        foreignKey: "id"
      })
    }
  }
  tbl_shift.init(
    {
      shift_id: DataTypes.STRING,
      shift_name: DataTypes.STRING,
      start_time: DataTypes.TIME,
      end_time: DataTypes.TIME,
      break_start: DataTypes.TIME,
      break_end: DataTypes.TIME,
      summary_time: DataTypes.TIME,
      company_id: DataTypes.INTEGER,
      user_create: DataTypes.INTEGER,
      user_update: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "tbl_shift",
      underscored: true,
      freezeTableName: true,
      underscoreAll: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return tbl_shift;
};
