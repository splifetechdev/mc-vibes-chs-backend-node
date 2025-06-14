const tbl_locationRepository = require("../repositories/tbl_location.repository");

exports.findById = async (id) => await tbl_locationRepository.findById(id);

exports.findAll = async (id) =>
  await tbl_locationRepository.findtbl_locationAll(id);

exports.create = async (data) => await tbl_locationRepository.create(data);

exports.update = async (id, data) =>
  await tbl_locationRepository.update(id, data);

exports.delete = async (id) => await tbl_locationRepository.delete(id);

exports.findSystemId = async () => await tbl_locationRepository.findSystemId();
