// const db = require("../db/db");
const db = require("../db/models");

// exports.findPositionAll = async (id) =>
//   await db.ExecDataByIndex(
//     `SELECT * FROM Position
//      WHERE position.company_id = ?`,
//     id
//   );

exports.findPositionAll = async (id) =>
  await db.sequelize.query(
    `SELECT * FROM position
     WHERE position.company_id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

// exports.findListAll = async () =>
//   await db.ExecDataNoIndex(`SELECT
// CONVERT(id, CHAR(50)) as id,
// name,
// CONVERT(company_id, CHAR(50)) as companyId,
// created_at,
// updated_at
// FROM Position`);

exports.findListAll = async () =>
  await db.sequelize.query(
    `SELECT 
            CONVERT(id, CHAR(50)) as id,
            name,
            CONVERT(company_id, CHAR(50)) as companyId,
            created_at,
            updated_at 
            FROM position`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

// exports.getAllPosition = async () => {
//   return await db.ExecDataNoIndex(`
//     SELECT position.id, position.name,position.company_id,position.department_id, company.name_th as companyName,department.name as departmentName, position.status FROM Position
//     LEFT JOIN company  ON position.company_id = company.id
//     LEFT JOIN Department  ON position.department_id = department.id`);
// };

exports.getAllPosition = async () =>
  await db.sequelize.query(
    `SELECT position.id, position.name,position.company_id,position.department_id, company.name_th as companyName,department.name as departmentName, position.status FROM position 
    LEFT JOIN company  ON position.company_id = company.id
    LEFT JOIN department  ON position.department_id = department.id`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.create = async (data) => await db.position.create(data);

exports.update = async (id, data) =>
  await db.position.update(data, {
    where: {
      id: id,
    },
  });


exports.findByname = async (name,company_id) =>
await db.position.findOne({
   where: {
    name:name,
    company_id:company_id,
  },
});