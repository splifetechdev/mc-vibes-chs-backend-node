const RoutingTmpRepository = require("../repositories/tbl_routing_tmp.repository");

exports.getPONewMachine = async (company_id) =>
  await RoutingTmpRepository.getPONewMachine(company_id);

exports.getPONewMachineName = async (company_id) =>
  await RoutingTmpRepository.getPONewMachineName(company_id);

exports.getMainRoutingByItemAndRtgId = async (item_master_id, rtg_id, company_id) =>
  await RoutingTmpRepository.getMainRoutingByItemAndRtgId(item_master_id, rtg_id, company_id);

exports.getMainRoutingById = async (id) =>
  await RoutingTmpRepository.getMainRoutingById(id);

exports.getRoutingTmpNewByRtgMainId = async (rtg_main_id) =>
  await RoutingTmpRepository.getRoutingTmpNewByRtgMainId(rtg_main_id);

exports.getRoutingTmpById = async (id) =>
  await RoutingTmpRepository.getRoutingTmpById(id);

exports.saveRoutingTmpNew = async (data) =>
  await RoutingTmpRepository.saveRoutingTmpNew(data);

exports.deleteRoutingTmpNew = async (id) =>
  await RoutingTmpRepository.deleteRoutingTmpNew(id);

exports.saveRoutingTmp = async (data) =>
  await RoutingTmpRepository.saveRoutingTmp(data);

exports.deleteRoutingTmp = async (id) =>
  await RoutingTmpRepository.deleteRoutingTmp(id);

exports.findById = async (id) => await RoutingTmpRepository.findById(id);

exports.findAll = async (id) =>
  await RoutingTmpRepository.findRoutingTmpAll(id);

exports.create = async (data) => await RoutingTmpRepository.create(data);

exports.update = async (id, data) =>
  await RoutingTmpRepository.update(id, data);

exports.findSystemId = async () => await RoutingTmpRepository.findSystemId();

exports.delete = async (id) => await RoutingTmpRepository.delete(id);

exports.updateMainRouting = async (id, data) =>
  await RoutingTmpRepository.updateMainRouting(id, data);
