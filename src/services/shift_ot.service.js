const shiftOTRepository = require("../repositories/shift_ot.repository");

exports.findAll = async () => await shiftOTRepository.findAll();

exports.findByShiftID = async (shift_id) =>
  await shiftOTRepository.findByShiftID(shift_id);

exports.create = async (data) => await shiftOTRepository.create(data);

exports.update = async (id, data) => await shiftOTRepository.update(id, data);

exports.delete = async (id) => await shiftOTRepository.delete(id);
