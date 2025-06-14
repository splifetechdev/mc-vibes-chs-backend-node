const tbl_warehouseRepository = require("../repositories/tbl_warehouse.repository");

exports.findById = async (id) => await tbl_warehouseRepository.findById(id);

exports.findAll = async (id) => await tbl_warehouseRepository.findtbl_warehouseAll(id);

exports.create = async (data) => await tbl_warehouseRepository.create(data);

exports.update = async (id, data) => await tbl_warehouseRepository.update(id, data);

exports.delete = async (id) => await tbl_warehouseRepository.delete(id);


exports.findSystemId = async () => await tbl_warehouseRepository.findSystemId();
