const db = require("../db/models");
// const dbquery = require("../db/db");

exports.findu_define_masterAll = async () =>
  await db.sequelize.query(`SELECT * FROM u_define_master`, {
    type: db.sequelize.QueryTypes.SELECT,
  });

exports.findu_define_masterAllByID = async (id) =>
  await db.sequelize.query(
    `SELECT * FROM u_define_master
     WHERE u_define_master.id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.getAllByGroup = async (id) =>
  await db.sequelize.query(
    `SELECT * FROM u_define_master
     WHERE u_define_master.u_define_group_id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.getAlldata = async () =>
  await db.sequelize.query(
    `SELECT d.id,d.code as u_define_master_code,d.department_id,
    d.company_id,c.code AS company_code,d.name  AS u_define_master_name,c.name_th AS company_name,c.status 
    FROM u_define_master d 
    LEFT JOIN company c ON d.company_id = c.id`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.create = async (data) => await db.u_define_master.create(data);

exports.update = async (id, data) =>
  await db.u_define_master.update(data, {
    where: {
      id: id,
    },
  });

exports.updateBymodulemasterid = async (id, data) =>
  await db.u_define_master.update(data, {
    where: {
      module_master_id: id,
    },
  });

exports.updateByModuleMasterIdANDUdefineModuleId = async (
  module_master_id,
  u_define_module_id,
  data
) =>
  await db.u_define_master.update(data, {
    where: {
      module_master_id: module_master_id,
      u_define_module_id: u_define_module_id,
    },
  });

exports.getAlldatabycompany = async (id) =>
  await db.sequelize.query(
    `SELECT u.*,g.name as u_define_group_name
    FROM u_define_master u 
    LEFT JOIN u_define_group g ON d.u_define_group_id = g.id
    WHERE u.u_define_group_id=${id}`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.delete = async (id) =>
  await db.u_define_master.destroy({
    where: {
      id: id,
    },
  });

  exports.deletemodule_master_and_udefine = async (id,u_define_module_id) =>
  await db.u_define_master.destroy({
    where: {
      module_master_id: id,
      u_define_module_id:u_define_module_id
    },
  });
