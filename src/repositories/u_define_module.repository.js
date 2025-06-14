const db = require("../db/models");
// const dbquery = require("../db/db");

exports.findu_define_moduleAll = async () =>
  await db.sequelize.query(`SELECT * FROM u_define_module`, {
    type: db.sequelize.QueryTypes.SELECT,
  });

exports.findu_define_moduleAllByID = async (id) =>
  await db.sequelize.query(
    `SELECT * FROM u_define_module
     WHERE u_define_module.id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.getAllByCompany = async (id) =>
  await db.sequelize.query(
    `SELECT * FROM u_define_module
     WHERE u_define_module.company_id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.getUdefineIDByCompanyAndModuleName = async (module_name, company_id) =>
  await db.sequelize.query(
    `SELECT * FROM u_define_module
     WHERE u_define_module.company_id = :company_id AND u_define_module.module_name = :module_name`,
    {
      replacements: { module_name, company_id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.getAlldata = async () =>
  await db.sequelize.query(
    `SELECT d.id,d.code as u_define_module_code,d.department_id,
    d.company_id,c.code AS company_code,d.name  AS u_define_module_name,c.name_th AS company_name,c.status 
    FROM u_define_module d 
    LEFT JOIN company c ON d.company_id = c.id`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.create = async (data) => await db.u_define_module.create(data);

exports.update = async (id, data) =>
  await db.u_define_module.update(data, {
    where: {
      id: id,
    },
  });

exports.updateBymodulemasterid = async (id, data) =>
  await db.u_define_module.update(data, {
    where: {
      module_master_id: id,
    },
  });

// exports.updateByModuleMasterIdANDUdefineModuleId = async (
//   module_master_id,
//   u_define_module_id,
//   data
// ) =>
//   await db.u_define_module.update(data, {
//     where: {
//       module_master_id: module_master_id,
//       u_define_module_id: u_define_module_id,
//     },
//   });

exports.getAlldatabycompany = async (id) =>
  await db.sequelize.query(
    `SELECT u.*,g.name as u_define_group_name
    FROM u_define_module u 
    LEFT JOIN u_define_group g ON d.u_define_group_id = g.id
    WHERE u.u_define_group_id=${id}`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.delete = async (id) =>
  await db.u_define_module.destroy({
    where: {
      id: id,
    },
  });
