"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class tbl_shift_ot extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // ตัวอย่าง: สร้างความสัมพันธ์กับ shift table
      // tbl_shift_ot.belongsTo(models.tbl_shift, {
      //   foreignKey: 'shift_id',
      //   as: 'shift'
      // });
    }
  }

  tbl_shift_ot.init(
    {
      //   id: {
      //     type: DataTypes.INTEGER,
      //     primaryKey: true,
      //     autoIncrement: true,
      //     allowNull: false,
      //   },
      shift_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      ot_start_time: {
        type: DataTypes.TIME, // รองรับ time(7) ใน SQL Server
        allowNull: true,
      },
      ot_end_time: {
        type: DataTypes.TIME, // รองรับ time(7) ใน SQL Server
        allowNull: true,
      },
      ot_rate: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: true,
      },
      //   created_at: {
      //     type: DataTypes.DATE,
      //     allowNull: true,
      //   },
      //   updated_at: {
      //     type: DataTypes.DATE,
      //     allowNull: true,
      //   },
    },
    {
      sequelize,
      modelName: "tbl_shift_ot",
      tableName: "tbl_shift_ot", // กำหนดชื่อตารางให้ตรงกับ database
      underscored: true,
      freezeTableName: true, // ไม่ให้ Sequelize เปลี่ยนชื่อตาราง
      timestamps: true, // ใช้ timestamp fields
      createdAt: "created_at", // กำหนดชื่อ field สำหรับ created timestamp
      updatedAt: "updated_at", // กำหนดชื่อ field สำหรับ updated timestamp
    }
  );

  return tbl_shift_ot;
};
