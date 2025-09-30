"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tbl_routing extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.item_master, {
        foreignKey: "item_master_id",
      });
      this.belongsTo(models.company, {
        foreignKey: "company_id",
      });
      this.hasOne(models.u_define_master, {
        foreignKey: "module_master_id",
      });
      this.belongsTo(models.tbl_work_center, {
        foreignKey: "work_center_id",
      });
      this.hasOne(models.tbl_opn_ord, {
        foreignKey: "rtg_id",
        targetKey: "rtg_id",
      });
      // this.hasOne(models.tbl_opn_ord, {
      //   foreignKey: "rtg_id",
      //   targetKey: "rtg_id",
      // });
    }
  }
  tbl_routing.init(
    {
      rtg_id: DataTypes.STRING,
      company_id: DataTypes.INTEGER,
      item_master_id: DataTypes.INTEGER,
      opn_id: DataTypes.STRING,
      opn_name: DataTypes.STRING,
      work_center_id: DataTypes.INTEGER,
      no_of_machine: DataTypes.STRING,
      machine_id: DataTypes.STRING,
      unit_id: DataTypes.INTEGER,
      predecessor: DataTypes.INTEGER,
      dependency: DataTypes.STRING,
      setup_time: DataTypes.DECIMAL,
      setup_timehr_per: DataTypes.STRING,
      eoq: DataTypes.INTEGER,
      pcs_hr: DataTypes.FLOAT,
      hr_pcs: DataTypes.FLOAT,
      qty_per: DataTypes.INTEGER,
      qty_by: DataTypes.INTEGER,
      scrap: DataTypes.INTEGER,
      batch: DataTypes.INTEGER,
      over_lap_time: DataTypes.DECIMAL,
      over_lap_unit: DataTypes.INTEGER,
      std_cost: DataTypes.BOOLEAN,
      std_dl: DataTypes.DECIMAL,
      std_foh: DataTypes.DECIMAL,
      std_voh: DataTypes.DECIMAL,
      std_setup_time_pc: DataTypes.DECIMAL,
      operation_cost: DataTypes.DECIMAL,
      iot_um_conv: DataTypes.DECIMAL,
      leadtime: DataTypes.INTEGER,
      bath_pcs: DataTypes.DECIMAL,
      user_create: DataTypes.INTEGER,
      user_update: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "tbl_routing",
      underscored: true,
      freezeTableName: true,
      underscoreAll: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return tbl_routing;
};
