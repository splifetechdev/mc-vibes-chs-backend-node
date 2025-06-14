const TempOpnTmpRepository = require("../repositories/temp_opn_tmp.repository");

exports.findAll = async (id) =>
  await TempOpnTmpRepository.findTempOpnTmpAll(id);

exports.findAllByID = async (id) =>
  await TempOpnTmpRepository.findTempOpnTmpAllByID(id);

exports.findDueDateByRouting = async (
  doc_running,
  rtg_id,
  item_master_id,
  opn_id
) =>
  await TempOpnTmpRepository.findDueDateByRouting(
    doc_running,
    rtg_id,
    item_master_id,
    opn_id
  );

exports.findPOTempByOPN = async (doc_running, rtg_id, item_master_id, opn_id) =>
  await TempOpnTmpRepository.findPOTempByOPN(
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
  await TempOpnTmpRepository.findPOTempByOPNMINStartDate(
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
  await TempOpnTmpRepository.findPOTempByOPNMINEndDate(
    doc_running,
    rtg_id,
    item_master_id,
    opn_id
  );

exports.findALLByRouting = async (doc_running, rtg_id, item_master_id) =>
  await TempOpnTmpRepository.findALLByRouting(
    doc_running,
    rtg_id,
    item_master_id
  );

exports.findALLByRoutingV2 = async (doc_running) =>
  await TempOpnTmpRepository.findALLByRoutingV2(doc_running);

exports.findListAll = async () => await TempOpnTmpRepository.findListAll();

exports.findListByCompany = async (company_id) =>
  await TempOpnTmpRepository.findListByCompany(company_id);
exports.getAlldata = async (id) => await TempOpnTmpRepository.getAlldata(id);

exports.create = async (data) => await TempOpnTmpRepository.create(data);

exports.update = async (doc_running, rtg_id, item_master_id, opn_id, data) =>
  await TempOpnTmpRepository.update(
    doc_running,
    rtg_id,
    item_master_id,
    opn_id,
    data
  );

exports.updateByID = async (id, data) =>
  await TempOpnTmpRepository.updateByID(id, data);

exports.updateByDocRunningAndOPN = async (
  doc_running,
  rtg_id,
  item_master_id,
  data
) =>
  await TempOpnTmpRepository.updateByDocRunningAndOPN(
    doc_running,
    rtg_id,
    item_master_id,
    data
  );

exports.getAlldatabycompany = async (id) =>
  await TempOpnTmpRepository.getAlldatabycompany(id);

exports.delete = async (id) => await TempOpnTmpRepository.delete(id);

exports.deleteByRunningNo = async (doc_running_no) =>
  await TempOpnTmpRepository.deleteByRunningNo(doc_running_no);

exports.dumpTempOpnTmpDataByDocRunning = async (doc_running) =>
  await TempOpnTmpRepository.dumpTempOpnTmpDataByDocRunning(doc_running);

//update machine_id by doc_running_no
exports.updateMachineIDByDocRunning = async (doc_running_no, data) =>
  await TempOpnTmpRepository.updateMachineIDByDocRunning(doc_running_no, data);