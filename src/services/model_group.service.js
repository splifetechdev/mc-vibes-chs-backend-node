const ModelGroupRepository = require("../repositories/model_group.repository");

exports.findAll = async (id) => await ModelGroupRepository.findModelGroupAll(id);

exports.findAllByID = async (id) =>
  await ModelGroupRepository.findModelGroupAllByID(id);

exports.findListAll = async () => await ModelGroupRepository.findListAll();

exports.findListByCompany = async (company_id) =>
  await ModelGroupRepository.findListByCompany(company_id);
exports.getAlldata = async (id) => await ModelGroupRepository.getAlldata(id);

exports.create = async (data) => await ModelGroupRepository.create(data);

exports.update = async (id, data) => await ModelGroupRepository.update(id, data);

exports.getAlldatabycompany = async (id) =>
  await ModelGroupRepository.getAlldatabycompany(id);

exports.delete = async (id) => await ModelGroupRepository.delete(id);
