const ProductionOrderRepository = require("../repositories/production_order.repository");

exports.findAll = async (id) =>
  await ProductionOrderRepository.findProductionOrderAll(id);

exports.findProductionOrderAndName = async (id) =>
  await ProductionOrderRepository.findProductionOrderAndName(id);

exports.findAllByID = async (id, u_define_id) =>
  await ProductionOrderRepository.findProductionOrderAllByID(id, u_define_id);

exports.findListAll = async () => await ProductionOrderRepository.findListAll();

exports.findListByCompany = async (company_id) =>
  await ProductionOrderRepository.findListByCompany(company_id);
exports.getAlldata = async (id) =>
  await ProductionOrderRepository.getAlldata(id);

exports.create = async (data) => await ProductionOrderRepository.create(data);

exports.update = async (id, data) =>
  await ProductionOrderRepository.update(id, data);

exports.getAlldatabycompany = async (id) =>
  await ProductionOrderRepository.getAlldatabycompany(id);

exports.delete = async (id) => await ProductionOrderRepository.delete(id);

exports.productionstatusreport = async (data) =>
  await ProductionOrderRepository.productionstatusreport(data);

exports.putUpdateDockRunningNo = async (doc_running, data) =>
  await ProductionOrderRepository.putUpdateDockRunningNo(doc_running, data);


exports.updateTblOrd = async (id, data) =>
  await ProductionOrderRepository.updateTblOrd(id, data);
