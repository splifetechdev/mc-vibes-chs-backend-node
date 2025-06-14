const tbl_shiftRepository = require("../repositories/tbl_shift.repository");

exports.findAll = async (id) => await tbl_shiftRepository.findtbl_shiftAll(id);

exports.findAllByID = async (id, u_define_id) =>
  await tbl_shiftRepository.findtbl_shiftAllByID(id, u_define_id);


exports.create = async (data) => await tbl_shiftRepository.create(data);

exports.update = async (id, data) => await tbl_shiftRepository.update(id, data);


exports.delete = async (id) => await tbl_shiftRepository.delete(id);
