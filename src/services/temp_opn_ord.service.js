const TempOpnOrdRepository = require("../repositories/temp_opn_ord.repository");

exports.findAll = async (id) =>
  await TempOpnOrdRepository.findTempOpnOrdAll(id);

exports.findAllByID = async (id) =>
  await TempOpnOrdRepository.findTempOpnOrdAllByID(id);

exports.findProdOrderPlanByID = async (doc_running, rtg_id, item_master_id) =>
  await TempOpnOrdRepository.findProdOrderPlanByID(
    doc_running,
    rtg_id,
    item_master_id
  );

exports.findALLByRoutingV3 = async (doc_running) =>
  await TempOpnOrdRepository.findALLByRoutingV3(doc_running);

exports.findListAll = async () => await TempOpnOrdRepository.findListAll();

exports.findListByCompany = async (company_id) => {
  return await TempOpnOrdRepository.findListByCompany(company_id);
};

exports.getAlldata = async () => await TempOpnOrdRepository.getAlldata();

exports.create = async (data) => await TempOpnOrdRepository.create(data);

exports.update = async (id, data) =>
  await TempOpnOrdRepository.update(id, data);

exports.getAlldatabycompany = async (id) =>
  await TempOpnOrdRepository.getAlldatabycompany(id);

exports.delete = async (id, force) =>
  await TempOpnOrdRepository.delete(id, force);

exports.deleteByRunningNo = async (doc_running_no) =>
  await TempOpnOrdRepository.deleteByRunningNo(doc_running_no);

exports.dumpTempOpnOrdDataByDocRunning = async (doc_running) =>
  await TempOpnOrdRepository.dumpTempOpnOrdDataByDocRunning(doc_running);
