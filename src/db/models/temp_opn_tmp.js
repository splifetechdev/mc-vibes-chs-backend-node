"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class temp_opn_tmp extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  temp_opn_tmp.init(
    {
      doc_running_no: DataTypes.STRING,
      item_id: DataTypes.INTEGER,
      item_master_id: DataTypes.INTEGER,
      order_qty: DataTypes.INTEGER,
      rtg_id: DataTypes.STRING,
      opn_id: DataTypes.STRING,
      pcs_hr: DataTypes.INTEGER,
      time_process_by_opn: DataTypes.DECIMAL,
      setup_time: DataTypes.DECIMAL,
      real_qty_order_scrap_by_opn: DataTypes.INTEGER,
      machine_id: DataTypes.STRING,
      scrap_per: DataTypes.DECIMAL,
      overlap_time: DataTypes.DECIMAL,
      setup_timehr_per: DataTypes.STRING,
      batch: DataTypes.INTEGER,
      opn_start_date_time: DataTypes.DATE,
      opn_end_date_time: DataTypes.DATE,
      overlab_time_cal: DataTypes.DECIMAL,
      overlab_opn_id: DataTypes.STRING,
      predecessor: DataTypes.STRING,
      dependency: DataTypes.STRING,
      company_id: DataTypes.INTEGER,
      user_create: DataTypes.INTEGER,
      user_update: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "temp_opn_tmp",
      underscored: true,
      freezeTableName: true,
      underscoreAll: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return temp_opn_tmp;
};
