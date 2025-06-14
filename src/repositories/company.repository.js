const db = require("../db/models");

// exports.findById = async (id) =>
//   await dbquery.ExecDataNoIndex(`SELECT * FROM company where id=${id} `);

exports.findById = async (id) =>
  await db.sequelize.query(`SELECT * FROM company where id=${id}`, {
    type: db.sequelize.QueryTypes.SELECT,
  });

// exports.findCompanyAll = async (id) =>
//   await dbquery.ExecDataNoIndex(`SELECT * FROM company `);

exports.findCompanyAll = async (id) =>
  await db.sequelize.query(`SELECT * FROM company `, {
    type: db.sequelize.QueryTypes.SELECT,
  });

exports.create = async (data) => await db.company.create(data);

exports.update = async (id, data) =>
  await db.company.update(data, {
    where: {
      id: id,
    },
  });


  exports.findSystemId = async () =>
    await db.sequelize.query(
      "SELECT TOP 1 c.id FROM company c  ORDER BY c.id DESC ",
      {
        type: db.sequelize.QueryTypes.SELECT,
      }
    );