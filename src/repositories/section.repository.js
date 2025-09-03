const db = require("../db/models");
// const dbquery = require("../db/db");

exports.findsectionAll = async (id) =>
  await db.sequelize.query(
    `SELECT * FROM section
     WHERE section.division_id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );


exports.findsectionAllByID = async (id) =>
  await db.sequelize.query(
    `SELECT * FROM section
     WHERE section.id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );


exports.getAlldata = async () =>
  await db.sequelize.query(
    `SELECT d.id,d.code as section_code,d.division_id,
    d.company_id,c.code AS company_code,d.name  AS section_name,c.name_th AS company_name,c.status 
    FROM section d 
    LEFT JOIN company c ON d.company_id = c.id`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.create = async (data) => await db.section.create(data);

exports.update = async (id, data) =>
  await db.section.update(data, {
    where: {
      id: id,
    },
  });

  exports.getAlldatabycompany = async (id) =>
  await db.sequelize.query(
    `SELECT d.id,d.code as section_code,d.division_id,
    d.company_id,c.code AS company_code,d.name  AS section_name,c.name_th AS company_name,c.status,
    dvs.name as division_name 
    FROM section d 
    LEFT JOIN company c ON d.company_id = c.id
    LEFT JOIN division dvs ON d.division_id = dvs.id
    WHERE d.company_id=${id}`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );


  exports.delete = async (id) => await db.section.destroy({
    where: {
        id: id
    }
})


exports.findBycode = async (code,company_id) =>
await db.section.findOne({
  where: {
    code:code,
    company_id:company_id,
  },
});