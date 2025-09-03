const db = require("../db/models");
// const dbquery = require("../db/db");

exports.finddefect_causeAll = async (id) =>
  await db.sequelize.query(
    `SELECT * FROM tbl_defect_cause
     WHERE tbl_defect_cause.company_id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.finddefect_causeAllByID = async (id, u_define_id) =>
  await db.sequelize.query(
    `SELECT tdc.* ,udm.*
    FROM tbl_defect_cause tdc
    LEFT JOIN u_define_master udm ON  tdc.id=udm.module_master_id
    and udm.u_define_module_id = :u_define_id
     WHERE tdc.id = :id`,
    {
      replacements: { id, u_define_id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );


exports.create = async (data) => await db.tbl_defect_cause.create(data);

exports.update = async (id, data) =>
  await db.tbl_defect_cause.update(data, {
    where: {
      id: id,
    },
  });


exports.delete = async (id) =>
  await db.tbl_defect_cause.destroy({
    where: {
      id: id,
    },
  });

exports.findBywaste_code = async (waste_code) =>
  await db.tbl_work_center.findOne({
    where: {
      waste_code:waste_code,
    },
  });