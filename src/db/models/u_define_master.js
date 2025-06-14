"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class u_define_master extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.tbl_mch, {
        foreignKey: "module_master_id"
      })

      this.belongsTo(models.tbl_plc_mapping_machine, {
        foreignKey: "module_master_id"
      })

      this.belongsTo(models.tbl_time_card, {
        foreignKey: "module_master_id"
      })
    }
  }
  u_define_master.init(
    {
      company_id: DataTypes.INTEGER,
      module_master_id: DataTypes.INTEGER,
      u_define_module_id: DataTypes.INTEGER,
      numeric1: DataTypes.STRING,
      numeric2: DataTypes.STRING,
      date1: DataTypes.DATE,
      date2: DataTypes.DATE,
      boolean1: DataTypes.BOOLEAN,
      boolean2: DataTypes.BOOLEAN,
      char1: DataTypes.STRING,
      char2: DataTypes.STRING,
      text1: DataTypes.STRING,
      text2: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "u_define_master",
      underscored: true,
      freezeTableName: true,
      underscoreAll: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return u_define_master;
};
