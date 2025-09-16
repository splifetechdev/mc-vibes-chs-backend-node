const OrderRepository = require("../repositories/order.repository");

exports.findAll = async (id) => await OrderRepository.findOrderAll(id);

exports.findAllByOrdId = async (id) => await OrderRepository.findAllByOrdId(id);

exports.getOrderByQuery = async (id, data) =>
  await OrderRepository.getOrderByQuery(id, data);

exports.findIdByDocRunning = async (doc_running,id) =>
  await OrderRepository.findIdByDocRunning(doc_running, id);

exports.findIdByDocRunningV2 = async (doc_running) =>
  await OrderRepository.findIdByDocRunningV2(doc_running);

exports.findAdjustPlanDraftByDocRunning = async (doc_running) =>
  await OrderRepository.findAdjustPlanDraftByDocRunning(doc_running);

exports.findAllByID = async (id, u_define_id) =>
  await OrderRepository.findOrderAllByID(id, u_define_id);

exports.create = async (data) => await OrderRepository.create(data);

exports.update = async (id, data) => await OrderRepository.update(id, data);

exports.updateByDocRunning = async (doc_running_no, data) =>
  await OrderRepository.updateByDocRunning(doc_running_no, data);

exports.delete = async (id) => await OrderRepository.delete(id);

exports.V_ORD_From_Econs = async () => await OrderRepository.V_ORD_From_Econs();