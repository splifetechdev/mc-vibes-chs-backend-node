const ProductionOrderTempRepository = require("../repositories/production_order_tmp.repository");

exports.findAll = async (id) =>
  await ProductionOrderTempRepository.findProductionOrderTempAll(id);

exports.findAllByID = async (id) =>
  await ProductionOrderTempRepository.findProductionOrderTempAllByID(id);

exports.findDueDateByRouting = async (
  doc_running,
  rtg_id,
  item_master_id,
  opn_id
) =>
  await ProductionOrderTempRepository.findDueDateByRouting(
    doc_running,
    rtg_id,
    item_master_id,
    opn_id
  );

exports.findPOTempByOPN = async (doc_running, rtg_id, item_master_id, opn_id) =>
  await ProductionOrderTempRepository.findPOTempByOPN(
    doc_running,
    rtg_id,
    item_master_id,
    opn_id
  );

exports.findPOTempByOPNMINStartDate = async (
  doc_running,
  rtg_id,
  item_master_id,
  opn_id
) =>
  await ProductionOrderTempRepository.findPOTempByOPNMINStartDate(
    doc_running,
    rtg_id,
    item_master_id,
    opn_id
  );

exports.findPOTempByOPNMINEndDate = async (
  doc_running,
  rtg_id,
  item_master_id,
  opn_id
) =>
  await ProductionOrderTempRepository.findPOTempByOPNMINEndDate(
    doc_running,
    rtg_id,
    item_master_id,
    opn_id
  );

exports.findALLByRouting = async (doc_running, rtg_id, item_master_id) =>
  await ProductionOrderTempRepository.findALLByRouting(
    doc_running,
    rtg_id,
    item_master_id
  );

exports.findALLByRoutingV2 = async (doc_running) =>
  await ProductionOrderTempRepository.findALLByRoutingV2(doc_running);

exports.findListAll = async () =>
  await ProductionOrderTempRepository.findListAll();

exports.findListByCompany = async (company_id) =>
  await ProductionOrderTempRepository.findListByCompany(company_id);
exports.getAlldata = async (id) =>
  await ProductionOrderTempRepository.getAlldata(id);

exports.create = async (data) => {
  try {
    const res = await ProductionOrderTempRepository.create(data);
    console.log("ProductionOrderTempRepository.create : ", "create success");
    return res;
  } catch (error) {
    console.log("ProductionOrderTempRepository.create : ", error);
  }
};

exports.update = async (doc_running, rtg_id, item_master_id, opn_id, data) =>
  await ProductionOrderTempRepository.update(
    doc_running,
    rtg_id,
    item_master_id,
    opn_id,
    data
  );

exports.updateByID = async (id, data) =>
  await ProductionOrderTempRepository.updateByID(id, data);

exports.updateByDocRunningAndOPN = async (
  doc_running,
  rtg_id,
  item_master_id,
  data
) =>
  await ProductionOrderTempRepository.updateByDocRunningAndOPN(
    doc_running,
    rtg_id,
    item_master_id,
    data
  );

exports.getAlldatabycompany = async (id) =>
  await ProductionOrderTempRepository.getAlldatabycompany(id);

exports.delete = async (id) => await ProductionOrderTempRepository.delete(id);

exports.deleteByRunningNo = async (doc_running_no) =>
  await ProductionOrderTempRepository.deleteByRunningNo(doc_running_no);
