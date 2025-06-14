"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tbl_mch extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.company, {
        foreignKey: "company_id"
      })
      this.hasMany(models.tbl_mch_shift, {
        foreignKey: "id"
      })
      this.hasOne(models.u_define_master, {
        foreignKey: "module_master_id"
      })
      this.belongsTo(models.tbl_work_center, {
        foreignKey: "work_center_id"
      })
      this.hasMany(models.tbl_plc_mapping_machine, {
        foreignKey: "id"
      });

      this.hasMany(models.tbl_opn_ord, {
        foreignKey: "machine_id"
      });

      this.hasOne(models.tbl_job, {
        foreignKey: 'id'
      })

    }
  }
  tbl_mch.init(
    {
      machine_id: DataTypes.STRING,
      work_center_id: DataTypes.INTEGER,
      company_id: DataTypes.INTEGER,
      name: DataTypes.STRING,
      is_active: DataTypes.BOOLEAN,
      created_by: DataTypes.INTEGER,
      updated_by: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: "tbl_mch",
      underscored: true,
      freezeTableName: true,
      underscoreAll: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return tbl_mch;
};
