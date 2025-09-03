const db = require("../db/models");
// const dbquery = require("../db/db");

exports.finddivisionAll = async (id) =>
  await db.sequelize.query(
    `SELECT * FROM division
     WHERE division.company_id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );


exports.finddivisionAllByID = async (id) =>
  await db.sequelize.query(
    `SELECT * FROM division
     WHERE division.id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

  exports.getAllByDepartment = async (id) =>
  await db.sequelize.query(
    `SELECT * FROM division
     WHERE division.department_id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );


exports.getAlldata = async () =>
  await db.sequelize.query(
    `SELECT d.id,d.code as division_code,d.department_id,
    d.company_id,c.code AS company_code,d.name  AS division_name,c.name_th AS company_name,c.status 
    FROM division d 
    LEFT JOIN company c ON d.company_id = c.id`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.create = async (data) => await db.division.create(data);

exports.update = async (id, data) =>
  await db.division.update(data, {
    where: {
      id: id,
    },
  });

  exports.getAlldatabycompany = async (id) =>
  await db.sequelize.query(
    `SELECT d.id,d.code as division_code,d.department_id,
    d.company_id,c.code AS company_code,d.name  AS division_name,c.name_th AS company_name,c.status,
    dpm.name as department_name
    FROM division d 
    LEFT JOIN company c ON d.company_id = c.id
    LEFT JOIN department dpm ON d.department_id = dpm.id
    WHERE d.company_id=${id}`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );


  exports.delete = async (id) => await db.division.destroy({
    where: {
        id: id
    }
})


exports.findBycode = async (code,company_id) =>
await db.division.findOne({
  where: {
    code:code,
    company_id:company_id,
  },
});