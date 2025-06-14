"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tbl_plc_mapping_machine extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.tbl_mch, {
        foreignKey: "machine_id"
      });
      this.belongsTo(models.company, {
        foreignKey: "company_id"
      });
      this.hasOne(models.u_define_master, {
        foreignKey: "module_master_id"
      })
    }
  }
  tbl_plc_mapping_machine.init(
    {
      plc_id: DataTypes.STRING,
      machine_id: DataTypes.INTEGER,
      company_id: DataTypes.INTEGER,
      user_create: DataTypes.INTEGER,
      user_update: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "tbl_plc_mapping_machine",
      underscored: true,
      freezeTableName: true,
      underscoreAll: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return tbl_plc_mapping_machine;
};
