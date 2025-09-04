"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tbl_opn_ord extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.tbl_time_card_detail, {
        foreignKey: "opn_ord_id",
        sourceKey: "id",
      });
      this.hasMany(models.tbl_routing, {
        foreignKey: "rtg_id",
        sourceKey: "rtg_id",
      });
      this.belongsTo(models.tbl_ord, {
        foreignKey: "doc_running_no",
        targetKey: "doc_running_no",
      });
    }
  }
  tbl_opn_ord.init(
    {
      doc_group_name: DataTypes.STRING,
      doc_running_no: DataTypes.STRING,
      item_master_id: DataTypes.INTEGER,
      order_qty: DataTypes.FLOAT,
      opn_qty: DataTypes.FLOAT,
      rtg_id: DataTypes.STRING,
      opn_id: DataTypes.STRING,
      pcs_hr: DataTypes.INTEGER,
      time_process_by_opn: DataTypes.DECIMAL,
      setup_time: DataTypes.DECIMAL,
      real_qty_order_scrap_by_opn: DataTypes.INTEGER,
      machine_id: DataTypes.INTEGER,
      overlap_time: DataTypes.DECIMAL,
      setup_timehr_per: DataTypes.STRING,
      batch: DataTypes.INTEGER,
      batch_count: DataTypes.INTEGER,
      batch_amount: DataTypes.INTEGER,
      company_id: DataTypes.INTEGER,
      predecessor: DataTypes.STRING,
      dependency: DataTypes.STRING,
      production_time: DataTypes.DECIMAL,
      due_date: DataTypes.DATE,
      due_time: DataTypes.TIME,
      doc_module_name: DataTypes.STRING,
      order_date: DataTypes.DATE,
      status: DataTypes.STRING,
      prod_status: DataTypes.STRING,
      std_labor_cost: DataTypes.DECIMAL,
      std_foh_cost: DataTypes.DECIMAL,
      std_voh_cost: DataTypes.DECIMAL,
      receive_qty: DataTypes.DECIMAL,
      act_setup_time: DataTypes.DECIMAL,
      act_prod_time: DataTypes.DECIMAL,
      act_labor_cost: DataTypes.DECIMAL,
      act_foh_cost: DataTypes.DECIMAL,
      act_voh_cost: DataTypes.DECIMAL,
      user_create: DataTypes.INTEGER,
      user_update: DataTypes.INTEGER,
      opn_start_date_time: DataTypes.DATE,
      opn_end_date_time: DataTypes.DATE,
      routing_id: DataTypes.INTEGER,
      iot_um_conv: DataTypes.DECIMAL,
      deleted_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "tbl_opn_ord",
      underscored: true,
      freezeTableName: true,
      underscoreAll: true,
      //   timestamps: false,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  //   tbl_opn_ord.removeAttribute("id");
  return tbl_opn_ord;
};
