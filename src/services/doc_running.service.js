const doc_runningRepository = require("../repositories/doc_running.repository");

exports.findById = async (id) => await doc_runningRepository.findById(id);

exports.findOneById = async (id) => await doc_runningRepository.findOne(id);

exports.findGroupByModule = async (module) =>
  await doc_runningRepository.findGroupByModule(module);

exports.findAll = async () => await doc_runningRepository.findAll();

exports.findAllByGroupPD = async () =>
  await doc_runningRepository.findAllByGroupPD();

exports.create = async (data) => await doc_runningRepository.create(data);

exports.update = async (id, data) =>
  await doc_runningRepository.update(id, data);

exports.delete = async (id) => await doc_runningRepository.delete(id);

exports.findByGroupName = async (doc_group_name, company_id) =>
  await doc_runningRepository.findByGroupName(doc_group_name, company_id);

exports.docGenerate = async (module_name) => {
  var docNumber = "";
  var data = null;
  var running_next = 0;

  const res_doc_module = await doc_runningRepository.findByModuleName(
    module_name
  );

  docNumber =
    res_doc_module.id_prefix +
    res_doc_module.running_year +
    docRunningNext(res_doc_module.running_next, res_doc_module.running_len);

  running_next = res_doc_module.running_next + 1;
  data = { running_next };
  await doc_runningRepository.update(res_doc_module.id, data);

  return docNumber;
};

function docRunningNext(running_next, len) {
  return String(running_next).padStart(len, "0");
  // var runningNumber = 0;
  // var finalRunningNumber = "0";
  // //   runningNumber = running_next + 1;
  // runningNumber = running_next;

  // if (runningNumber < 10) {
  //   finalRunningNumber = "000" + runningNumber;
  // } else if (runningNumber < 100) {
  //   finalRunningNumber = "00" + runningNumber;
  // } else if (runningNumber < 1000) {
  //   finalRunningNumber = "0" + runningNumber;
  // } else if (runningNumber < 10000) {
  //   finalRunningNumber = runningNumber;
  // }
  // return finalRunningNumber;
}
