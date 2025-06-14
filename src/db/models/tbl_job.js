"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tbl_job extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.tbl_opn_ord, {
        foreignKey: "opn_ord_id",
        targetKey: "id",
      });

      this.hasMany(models.tbl_job_worker, {
        foreignKey: "job_id",
      });

      this.belongsTo(models.tbl_mch, {
        foreignKey: "mch_id",
      });

      this.belongsTo(models.map_production, {
        foreignKey: "mch_id",
        targetKey: "machine_id",
      });
    }
  }
  tbl_job.init(
    {
      opn_ord_id: DataTypes.INTEGER,
      mch_id: DataTypes.INTEGER,
      opn_desc: DataTypes.STRING,
      item_id: DataTypes.INTEGER,
      wo_running_no: DataTypes.STRING,
      worker_id: DataTypes.INTEGER,
      start_at: DataTypes.DATE,
      end_at: DataTypes.DATE,
      is_done: DataTypes.BOOLEAN,
      created_by: DataTypes.INTEGER,
      updated_by: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "tbl_job",
      underscored: true,
      freezeTableName: true,
      underscoreAll: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return tbl_job;
};
