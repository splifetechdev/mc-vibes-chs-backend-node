const DimGroupRepository = require("../repositories/dim_group.repository");

exports.findAll = async (id) => await DimGroupRepository.findDimGroupAll(id);

exports.findAllByID = async (id) =>
  await DimGroupRepository.findDimGroupAllByID(id);

exports.findListAll = async () => await DimGroupRepository.findListAll();

exports.findListByCompany = async (company_id) =>
  await DimGroupRepository.findListByCompany(company_id);
exports.getAlldata = async (id) => await DimGroupRepository.getAlldata(id);

exports.create = async (data) => await DimGroupRepository.create(data);

exports.update = async (id, data) => await DimGroupRepository.update(id, data);

exports.getAlldatabycompany = async (id) =>
  await DimGroupRepository.getAlldatabycompany(id);

exports.delete = async (id) => await DimGroupRepository.delete(id);
