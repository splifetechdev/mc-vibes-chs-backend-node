"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tbl_job_worker extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.tbl_job, {
        foreignKey: 'job_id',
        targetKey: 'id'
      })
    }
  }
  tbl_job_worker.init(
    {
      job_id: DataTypes.INTEGER,
      worker_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "tbl_job_worker",
      underscored: true,
      freezeTableName: true,
      underscoreAll: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return tbl_job_worker;
};
