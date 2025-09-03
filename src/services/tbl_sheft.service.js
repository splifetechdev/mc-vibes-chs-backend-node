const tbl_sheftRepository = require("../repositories/tbl_sheft.repository");

exports.findById = async (id) => await tbl_sheftRepository.findById(id);

exports.findAll = async (id) =>
  await tbl_sheftRepository.findtbl_sheftAll(id);

exports.create = async (data) => await tbl_sheftRepository.create(data);

exports.update = async (id, data) =>
  await tbl_sheftRepository.update(id, data);

exports.delete = async (id) => await tbl_sheftRepository.delete(id);

exports.findSystemId = async () => await tbl_sheftRepository.findSystemId();

exports.findtbl_sheftByshf_id = async (wh_id,lc_id,shf_id) => await tbl_sheftRepository.findtbl_sheftByshf_id(wh_id,lc_id,shf_id);