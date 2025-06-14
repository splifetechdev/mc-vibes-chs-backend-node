const tbl_plc_mapping_machineRepository = require("../repositories/tbl_plc_mapping_machine.repository");

exports.findAll = async (id) => await tbl_plc_mapping_machineRepository.findtbl_plc_mapping_machineAll(id);

exports.findAllByID = async (id, u_define_id) =>
  await tbl_plc_mapping_machineRepository.findtbl_plc_mapping_machineAllByID(id, u_define_id);


exports.create = async (data) => await tbl_plc_mapping_machineRepository.create(data);

exports.update = async (id, data) => await tbl_plc_mapping_machineRepository.update(id, data);


exports.delete = async (id) => await tbl_plc_mapping_machineRepository.delete(id);
