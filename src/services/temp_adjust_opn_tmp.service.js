const AdjustTempOpnTmpRepository = require("../repositories/temp_adjust_opn_tmp.repository");

exports.findAll = async (id) =>
  await AdjustTempOpnTmpRepository.findAdjustTempOpnTmpAll(id);

exports.findAllByID = async (id) =>
  await AdjustTempOpnTmpRepository.findAdjustTempOpnTmpAllByID(id);

exports.findDueDateByRouting = async (
  doc_running,
  rtg_id,
  item_master_id,
  opn_id
) =>
  await AdjustTempOpnTmpRepository.findDueDateByRouting(
    doc_running,
    rtg_id,
    item_master_id,
    opn_id
  );

exports.findPOTempByOPN = async (doc_running, rtg_id, item_master_id, opn_id) =>
  await AdjustTempOpnTmpRepository.findPOTempByOPN(
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
  await AdjustTempOpnTmpRepository.findPOTempByOPNMINStartDate(
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
  await AdjustTempOpnTmpRepository.findPOTempByOPNMINEndDate(
    doc_running,
    rtg_id,
    item_master_id,
    opn_id
  );

exports.findALLByRouting = async (doc_running, rtg_id, item_master_id) =>
  await AdjustTempOpnTmpRepository.findALLByRouting(
    doc_running,
    rtg_id,
    item_master_id
  );

exports.findALLByRoutingV2 = async (doc_running) =>
  await AdjustTempOpnTmpRepository.findALLByRoutingV2(doc_running);

exports.findListAll = async () => await AdjustTempOpnTmpRepository.findListAll();

exports.findListByCompany = async (company_id) =>
  await AdjustTempOpnTmpRepository.findListByCompany(company_id);
exports.getAlldata = async (id) => await AdjustTempOpnTmpRepository.getAlldata(id);

exports.create = async (data) => await AdjustTempOpnTmpRepository.create(data);

exports.update = async (doc_running, rtg_id, item_master_id, opn_id, data) =>
  await AdjustTempOpnTmpRepository.update(
    doc_running,
    rtg_id,
    item_master_id,
    opn_id,
    data
  );

exports.updateByID = async (id, data) =>
  await AdjustTempOpnTmpRepository.updateByID(id, data);

exports.updateByDocRunningAndOPN = async (
  doc_running,
  rtg_id,
  item_master_id,
  data
) =>
  await AdjustTempOpnTmpRepository.updateByDocRunningAndOPN(
    doc_running,
    rtg_id,
    item_master_id,
    data
  );

exports.getAlldatabycompany = async (id) =>
  await AdjustTempOpnTmpRepository.getAlldatabycompany(id);

exports.delete = async (id) => await AdjustTempOpnTmpRepository.delete(id);

exports.deleteByRunningNo = async (doc_running_no) =>
  await AdjustTempOpnTmpRepository.deleteByRunningNo(doc_running_no);

exports.dumpAdjustTempOpnTmpDataByDocRunning = async (doc_running) =>
  await AdjustTempOpnTmpRepository.dumpAdjustTempOpnTmpDataByDocRunning(doc_running);
