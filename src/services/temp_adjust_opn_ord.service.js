const AdjustTempOpnOrdRepository = require("../repositories/temp_adjust_opn_ord.repository");

exports.findAll = async (id) =>
  await AdjustTempOpnOrdRepository.findAdjustTempOpnOrdAll(id);

exports.findAllByID = async (id) =>
  await AdjustTempOpnOrdRepository.findAdjustTempOpnOrdAllByID(id);

exports.findProdOrderPlanByID = async (doc_running, rtg_id, item_master_id) =>
  await AdjustTempOpnOrdRepository.findProdOrderPlanByID(
    doc_running,
    rtg_id,
    item_master_id
  );

exports.findALLByRoutingV3 = async (doc_running) =>
  await AdjustTempOpnOrdRepository.findALLByRoutingV3(doc_running);

exports.findListAll = async () => await AdjustTempOpnOrdRepository.findListAll();

exports.findListByCompany = async (company_id) => {
  return await AdjustTempOpnOrdRepository.findListByCompany(company_id);
};

exports.getAlldata = async () => await AdjustTempOpnOrdRepository.getAlldata();

exports.create = async (data) => await AdjustTempOpnOrdRepository.create(data);

exports.update = async (id, data) =>
  await AdjustTempOpnOrdRepository.update(id, data);

exports.getAlldatabycompany = async (id) =>
  await AdjustTempOpnOrdRepository.getAlldatabycompany(id);

exports.delete = async (id, force) =>
  await AdjustTempOpnOrdRepository.delete(id, force);

exports.deleteByRunningNo = async (doc_running_no) =>
  await AdjustTempOpnOrdRepository.deleteByRunningNo(doc_running_no);

exports.dumpAdjustTempOpnOrdDataByDocRunning = async (doc_running) =>
  await AdjustTempOpnOrdRepository.dumpAdjustTempOpnOrdDataByDocRunning(doc_running);
