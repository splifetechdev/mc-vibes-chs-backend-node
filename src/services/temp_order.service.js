const TempOrderRepository = require("../repositories/temp_order.repository");

exports.findAll = async (id) => await TempOrderRepository.findTempOrderAll(id);

exports.findTempOrderByDocRunning = async (doc_running_no) =>
  await TempOrderRepository.findTempOrderByDocRunning(doc_running_no);

exports.findAllByID = async (id, u_define_id) =>
  await TempOrderRepository.findTempOrderAllByID(id, u_define_id);

exports.create = async (data) => await TempOrderRepository.create(data);

exports.update = async (id, data) => await TempOrderRepository.update(id, data);

exports.delete = async (id) => await TempOrderRepository.delete(id);
