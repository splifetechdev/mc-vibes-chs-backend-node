const tbl_ord_receiveRepository = require("../repositories/tbl_ord_receive.repository");

exports.findAll = async (id) => await tbl_ord_receiveRepository.findtbl_ord_receiveAll(id);

exports.findById = async (id) => await tbl_ord_receiveRepository.findById(id);

exports.create = async (data) => await tbl_ord_receiveRepository.create(data);

exports.update = async (id, data) => await tbl_ord_receiveRepository.update(id, data);

exports.delete = async (id) => await tbl_ord_receiveRepository.delete(id);
