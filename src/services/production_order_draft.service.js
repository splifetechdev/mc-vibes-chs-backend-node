const DraftProdOrderPlanRepository = require("../repositories/production_order_draft.repository");

exports.findAll = async (id) =>
  await DraftProdOrderPlanRepository.findDraftProdOrderPlanAll(id);

exports.findAllByID = async (id) =>
  await DraftProdOrderPlanRepository.findDraftProdOrderPlanAllByID(id);

exports.getDataCheckBatchForAddNewOPN = async (
  doc_running_no,
  rtg_id,
  item_master_id,
  opn_id,
  batch_count
) =>
  await DraftProdOrderPlanRepository.getDataCheckBatchForAddNewOPN(
    doc_running_no,
    rtg_id,
    item_master_id,
    opn_id,
    batch_count
  );

//greater than or equal to
exports.findAllGreaterThanOrEqualToID = async (id, doc_running_no) =>
  await DraftProdOrderPlanRepository.findAllGreaterThanOrEqualToID(
    id,
    doc_running_no
  );

exports.findProdOrderByMachine = async (company_id, machine_id) => {
  return await DraftProdOrderPlanRepository.findApproveProdOrderOptionListByMachine(
    company_id,
    machine_id
  );
};

exports.findProdOrderPlanByID = async (doc_running, rtg_id, item_master_id) =>
  await DraftProdOrderPlanRepository.findProdOrderPlanByID(
    doc_running,
    rtg_id,
    item_master_id
  );

exports.findListAll = async () =>
  await DraftProdOrderPlanRepository.findListAll();

exports.findListByCompany = async (company_id) => {
  return await DraftProdOrderPlanRepository.findListByCompany(company_id);
};

exports.getAlldata = async () =>
  await DraftProdOrderPlanRepository.getAlldata();

exports.create = async (data) =>
  await DraftProdOrderPlanRepository.create(data);
exports.createV2 = async (data) =>
  await DraftProdOrderPlanRepository.createV2(data);

exports.update = async (id, data) =>
  await DraftProdOrderPlanRepository.update(id, data);

exports.closeWorkOrder = async (doc_running_no, data) =>
  await DraftProdOrderPlanRepository.closeWorkOrder(doc_running_no, data);

exports.approveWorkOrder = async (doc_running_no, data) =>
  await DraftProdOrderPlanRepository.approveWorkOrder(doc_running_no, data);

exports.getAlldatabycompany = async (id) =>
  await DraftProdOrderPlanRepository.getAlldatabycompany(id);

exports.delete = async (id, force) =>
  await DraftProdOrderPlanRepository.delete(id, force);

exports.deleteByRunningNo = async (doc_running_no) =>
  await DraftProdOrderPlanRepository.deleteByRunningNo(doc_running_no);

exports.deleteOPNById = async (id) =>
  await DraftProdOrderPlanRepository.deleteOPNById(id);
