const db = require("../db/models");

exports.findById = async (id) =>
  await db.sequelize.query(
    `SELECT *, concat(wh_id,':',wh_name) as fwh_name FROM tbl_warehouse where id=${id}`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findtbl_warehouseAll = async (id) =>
  await db.sequelize.query(
    `SELECT * , concat(wh_id,':',wh_name) as fwh_name FROM tbl_warehouse `,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.create = async (data) => {
  console.log("Warehouse create:", JSON.stringify(data));
  try {
    return await db.tbl_warehouse.create(data);
  } catch (error) {
    console.log("Warehouse create:", error);
    return null;
  }
};

exports.update = async (id, data) =>
  await db.tbl_warehouse.update(data, {
    where: {
      wh_id: id,
    },
  });

exports.delete = async (id) =>
  await db.tbl_warehouse.destroy({
    where: {
      wh_id: id,
    },
  });

exports.findSystemId = async () =>
  await db.sequelize.query(
    "SELECT TOP 1 c.id FROM tbl_warehouse c  ORDER BY c.id DESC ",
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );
