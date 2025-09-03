const db = require("../db/models");
// const dbquery = require("../db/db");

// exports.findDepartmentAll = async (id) =>
//   await dbquery.ExecDataByIndex(
//     `SELECT * FROM department
//      WHERE department.company_id = ?`,
//     id
//   );

exports.findDepartmentAll = async (id) =>
  await db.sequelize.query(
    `SELECT * FROM department
     WHERE department.company_id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

// exports.findDepartmentAllByID = async (id) =>
//   await dbquery.ExecDataByIndex(
//     `SELECT * FROM department
//      WHERE department.id = ?`,
//     id
//   );

exports.findDepartmentAllByID = async (id) =>
  await db.sequelize.query(
    `SELECT * FROM department
     WHERE department.id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

// exports.findListBycompany = async (company_id) =>
//   await dbquery.ExecDataByIndex(
//     `SELECT
//         CONVERT(id, CHAR(50)) as id,
//         name,
//         CONVERT(company_id, CHAR(50)) as companyId,
//         created_at as createdAt,
//         updated_at as updatedAt
//         FROM department
//      WHERE department.company_id = ?`,
//     company_id
//   );

exports.findListByCompany = async (company_id) =>
  await db.sequelize.query(
    `SELECT 
        CONVERT(id, CHAR(50)) as id,
        name,
        CONVERT(company_id, CHAR(50)) as companyId,
        created_at as createdAt,
        updated_at as updatedAt 
        FROM department
     WHERE department.company_id = :company_id`,
    {
      replacements: { company_id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

// exports.findListAll = async () =>
//   await dbquery.ExecDataNoIndex(`SELECT
//         CONVERT(id, CHAR(50)) as id,
//         name,
//         CONVERT(company_id, CHAR(50)) as companyId,
//         created_at as createdAt,
//         updated_at as updatedAt
//         FROM department`);

exports.findListAll = async () =>
  await db.sequelize.query(
    `SELECT 
        CONVERT(id, CHAR(50)) as id,code,
        name,
        CONVERT(company_id, CHAR(50)) as companyId,
        created_at as createdAt,
        updated_at as updatedAt 
        FROM department`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );


exports.getAlldata = async () =>
  await db.sequelize.query(
    `SELECT d.id,d.code as department_code,
    d.company_id,c.code AS company_code,d.name  AS department_name,c.name_th AS company_name,c.status 
    FROM department d 
    LEFT JOIN company c ON d.company_id = c.id`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.create = async (data) => await db.department.create(data);

exports.update = async (id, data) =>
  await db.department.update(data, {
    where: {
      id: id,
    },
  });

  exports.getAlldatabycompany = async (id) =>
  await db.sequelize.query(
    `SELECT d.id,d.code as department_code,
    d.company_id,c.code AS company_code,d.name  AS department_name,c.name_th AS company_name,c.status 
    FROM department d 
    LEFT JOIN company c ON d.company_id = c.id
    WHERE d.company_id=${id}`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );


  exports.delete = async (id) => await db.department.destroy({
    where: {
        id: id
    }
});


  exports.findBycode = async (code,company_id) =>
  await db.department.findOne({
    where: {
      code:code,
      company_id:company_id,
    },
  });