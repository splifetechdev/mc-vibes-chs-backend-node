const db = require("../db/models");

exports.findloginLogsById = async (id) =>
  await db.sequelize.query(
    `SELECT *
        FROM tbl_login_logs
        WHERE id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findAll = async () => await db.tbl_login_logs.findAll();

exports.create = async (data) => await db.tbl_login_logs.create(data);

exports.update = async (id, data) =>
  await db.tbl_login_logs.update(data, {
    where: {
      id: id,
    },
  });

exports.delete = async (id) =>
  await db.tbl_login_logs.destroy({
    where: {
      id,
    },
  });
