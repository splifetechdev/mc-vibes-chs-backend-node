"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tbl_mch extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.tbl_mch, {
        foreignKey: "machine_id"
      })

      this.belongsTo(models.tbl_shift, {
        foreignKey: "shift_id"
      })

      this.belongsTo(models.tbl_users, {
        foreignKey: "supervisor_id"
      })
    }
  }
  tbl_mch.init(
    {
      machine_id: DataTypes.STRING,
      shift_id: DataTypes.INTEGER,
      supervisor_id: DataTypes.INTEGER,
      created_by: DataTypes.INTEGER,
      updated_by: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: "tbl_mch_shift",
      underscored: true,
      freezeTableName: true,
      underscoreAll: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return tbl_mch;
};
