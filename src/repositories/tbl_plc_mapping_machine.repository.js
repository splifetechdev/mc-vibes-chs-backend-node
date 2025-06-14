const db = require("../db/models");
// const dbquery = require("../db/db");

exports.findtbl_plc_mapping_machineAll = async (company_id) => await db.tbl_plc_mapping_machine.findAll({
    where: {
      company_id
    },
    include: [
      { model: db.company },
      { model: db.tbl_mch }
    ]
  });


  exports.findtbl_plc_mapping_machineAllByID = async (id, u_define_module_id) => await db.tbl_plc_mapping_machine.findOne({
    where: {
      id: id
    },
    include: [
      { model: db.u_define_master, where: { u_define_module_id } ,required: false},
    ]
  });



exports.create = async (data) => await db.tbl_plc_mapping_machine.create(data);

exports.update = async (id, data) =>
  await db.tbl_plc_mapping_machine.update(data, {
    where: {
      id: id,
    },
  });


exports.delete = async (id) =>
  await db.tbl_plc_mapping_machine.destroy({
    where: {
      id: id,
    },
  });
