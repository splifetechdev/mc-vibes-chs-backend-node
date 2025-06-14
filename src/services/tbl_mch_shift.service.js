const tbl_mch_shift_repository = require("../repositories/tbl_mch_shift.repository");

exports.find_all = async (mch_id) =>
  await tbl_mch_shift_repository.find_all(mch_id);

// exports.findAllByID = async (id, u_define_id) =>
//   await tbl_mch_shift_repository.findtbl_shiftAllByID(id, u_define_id);
exports.find_by_id = async (id) =>
  await tbl_mch_shift_repository.find_by_id(id);

exports.create = async (data) => {
  return await tbl_mch_shift_repository.create(data);
};

exports.update = async (id, data) =>
  await tbl_mch_shift_repository.update(id, data);

exports.delete = async (_, shift_id) =>
  await tbl_mch_shift_repository.delete(shift_id);

exports.findMachineCostByID = async (id) =>
  await tbl_mch_shift_repository.findMachineCostByID(id);
