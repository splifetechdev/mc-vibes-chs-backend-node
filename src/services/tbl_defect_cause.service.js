const defect_causeRepository = require("../repositories/tbl_defect_cause.repository");

exports.findAll = async (id) => await defect_causeRepository.finddefect_causeAll(id);

exports.findAllByID = async (id, u_define_id) =>
  await defect_causeRepository.finddefect_causeAllByID(id, u_define_id);


exports.create = async (data) => await defect_causeRepository.create(data);

exports.update = async (id, data) => await defect_causeRepository.update(id, data);


exports.delete = async (id) => await defect_causeRepository.delete(id);

exports.findBywaste_code = async (waste_code) => await defect_causeRepository.findBywaste_code(waste_code);
