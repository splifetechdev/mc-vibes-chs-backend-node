"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class map_production extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasOne(models.tbl_job, {
        foreignKey: 'mch_id',
        sourceKey:"machine_id"
      })
    }
  }
  map_production.init(
    {
        IOTID: DataTypes.INTEGER,
        ID:DataTypes.INTEGER,
        DataDateTime: DataTypes.STRING,
        MachineID: DataTypes.INTEGER,
        TimeON: DataTypes.DECIMAL,
        TimeOFF: DataTypes.DECIMAL,
        Qty:DataTypes.INTEGER,
        DTflag:DataTypes.INTEGER,
        OEflag:DataTypes.INTEGER,
        machine_id:DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "map_production",
      underscored: false,
      freezeTableName: true,
      underscoreAll: true,
      timestamps: false,
    //   createdAt: "created_at",
    //   updatedAt: "updated_at",
    }
  );
  map_production.removeAttribute('id');
  return map_production;
};
