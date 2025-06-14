const db = require("../db/models");

exports.findById = async (id) =>
  await db.sequelize.query(
    `SELECT * , concat(lc_id,':',lc_name) as flc_name FROM tbl_location where wh_id='${id}'`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findtbl_locationAll = async (id) =>
  await db.sequelize.query(
    `SELECT lc.*, concat(lc_id,':',lc_name) as flc_name ,wh_name
      FROM tbl_location lc 
      left join tbl_warehouse wh
      on lc.wh_id = wh.id`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.create = async (data) => {
  try {
    return await db.tbl_location.create(data);
  } catch (error) {
    console.log(`location create error:`, error);
    return error;
  }
};

exports.update = async (id, data) =>
  await db.tbl_location.update(data, {
    where: {
      lc_id: id,
    },
  });

exports.delete = async (id) =>
  await db.tbl_location.destroy({
    where: {
      lc_id: id,
    },
  });

exports.findSystemId = async () =>
  await db.sequelize.query(
    "SELECT TOP 1 c.id FROM tbl_location c  ORDER BY c.id DESC ",
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );
