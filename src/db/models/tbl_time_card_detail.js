"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tbl_time_card_detail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.tbl_time_card, {
        foreignKey: "time_card_id",
      });

      this.hasMany(models.tbl_time_card_defect, {
        foreignKey: "time_card_log_id",
      });

      this.belongsTo(models.tbl_work_center, {
        foreignKey: "wc_id",
      });

      this.belongsTo(models.tbl_mch, {
        foreignKey: "mch_id",
      });

      this.hasOne(models.u_define_master, {
        foreignKey: "module_master_id",
      });

      this.belongsTo(models.tbl_worker, {
        foreignKey: "worker_id",
      });

      this.belongsTo(models.tbl_opn_ord, {
        foreignKey: "opn_ord_id",
      });

      this.belongsTo(models.item_master, {
        foreignKey: "item_id",
      });
      this.hasMany(models.tbl_time_card_detail_worker, {
        foreignKey: "time_card_detail_id",
      });
      
      this.belongsTo(models.tbl_opn_ord, {
        foreignKey: "opn_ord_id",
        targetKey: "id",
      });
    }
  }
  tbl_time_card_detail.init(
    {
      time_card_id: DataTypes.INTEGER,
      wo_running_no: DataTypes.STRING,
      opn_ord_id: DataTypes.INTEGER,
      wc_id: DataTypes.INTEGER,
      batch: DataTypes.INTEGER,
      mch_id: DataTypes.INTEGER,
      opn_desc: DataTypes.STRING,
      opn_id: DataTypes.INTEGER,
      item_id: DataTypes.INTEGER,
      worker_id: DataTypes.INTEGER,
      wo_type: DataTypes.STRING,
      downtime_id: DataTypes.INTEGER,
      setup_time: DataTypes.STRING,
      qty: DataTypes.INTEGER,
      time_card_date: DataTypes.DATE,
      time_start: DataTypes.STRING,
      time_end: DataTypes.STRING,
      work_hour: DataTypes.FLOAT,
      created_by: { type: DataTypes.INTEGER, defaultValue: 0 },
      created_at: DataTypes.DATE,
      updated_by: { type: DataTypes.INTEGER, defaultValue: 0 },
      updated_at: DataTypes.DATE,
      work_hours: DataTypes.INTEGER,
      end_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "tbl_time_card_detail",
      underscored: true,
      freezeTableName: true,
      underscoreAll: true,
      createdAt: "created_at",
      updateAt: "updated_at",
    }
  );
  return tbl_time_card_detail;
};
