'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbl_time_card_defect extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.tbl_time_card_detail, {
        foreignKey: 'time_card_log_id'
      })
    }

  }
  tbl_time_card_defect.init({
    time_card_log_id: DataTypes.INTEGER,
    defect_cause_id: DataTypes.INTEGER,
    qty: DataTypes.INTEGER,
    detail: DataTypes.STRING,
    created_by: { type: DataTypes.INTEGER, defaultValue: 0 },
    created_at: DataTypes.DATE,
    updated_by: { type: DataTypes.INTEGER, defaultValue: 0 },
    updated_at: DataTypes.DATE,
  },
    {
      sequelize,
      modelName: "tbl_time_card_defect",
      underscored: true,
      freezeTableName: true,
      underscoreAll: true,
      createdAt: "created_at",
      updateAt: "updated_at",
    });
  return tbl_time_card_defect;
};