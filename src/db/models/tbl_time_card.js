"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tbl_time_card extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.tbl_work_center, {
        foreignKey: "wc_id",
      });

      this.belongsTo(models.tbl_opn_ord, {
        foreignKey: "opn_ord_id",
      });

      this.belongsTo(models.tbl_mch, {
        foreignKey: "mch_id",
      });

      this.hasOne(models.u_define_master, {
        foreignKey: "module_master_id",
      });

      this.belongsTo(models.tbl_worker, {
        foreignKey: "mch_id",
      });

      this.hasMany(models.tbl_time_card_detail, {
        foreignKey: "time_card_id",
      });

      this.belongsTo(models.doc_running, {
        foreignKey: "doc_running_id",
      });

      this.belongsTo(models.tbl_shift, {
        foreignKey: "shift_id",
      });
    }
  }
  tbl_time_card.init(
    {
      doc_running_id: DataTypes.INTEGER,
      doc_running_no: DataTypes.STRING,
      wo_running_no: DataTypes.STRING,
      company_id: DataTypes.INTEGER,
      status: DataTypes.STRING,
      wc_id: DataTypes.INTEGER,
      mch_id: DataTypes.INTEGER,
      wo_id: DataTypes.INTEGER,
      worker_id: DataTypes.INTEGER,
      opn_ord_id: DataTypes.INTEGER,
      time_card_type: DataTypes.STRING,
      doc_date: DataTypes.DATE,
      created_by: { type: DataTypes.INTEGER, defaultValue: 0 },
      created_at: DataTypes.DATE,
      updated_by: { type: DataTypes.INTEGER, defaultValue: 0 },
      updated_at: DataTypes.DATE,
      worker_ids: DataTypes.STRING,
      shift_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "tbl_time_card",
      underscored: true,
      freezeTableName: true,
      underscoreAll: true,
      createdAt: "created_at",
      updateAt: "updated_at",
    }
  );
  return tbl_time_card;
};
