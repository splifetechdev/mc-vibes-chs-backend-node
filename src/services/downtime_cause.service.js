const DownTimeCauseRepository = require("../repositories/downtime_cause.repository");

exports.findAll = async (id) =>
  await DownTimeCauseRepository.findDownTimeCauseAll(id);

exports.findAllByID = async (id, u_define_id) =>
  await DownTimeCauseRepository.findDownTimeCauseAllByID(id, u_define_id);

exports.findListAll = async () => await DownTimeCauseRepository.findListAll();

exports.findListByCompany = async (company_id) =>
  await DownTimeCauseRepository.findListByCompany(company_id);
exports.getAlldata = async (id) =>
  await DownTimeCauseRepository.getAlldata(id);

exports.create = async (data) => await DownTimeCauseRepository.create(data);

exports.update = async (id, data) =>
  await DownTimeCauseRepository.update(id, data);

exports.getAlldatabycompany = async (id) =>
  await DownTimeCauseRepository.getAlldatabycompany(id);

exports.delete = async (id) => await DownTimeCauseRepository.delete(id);
