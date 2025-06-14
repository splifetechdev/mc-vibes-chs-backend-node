const versionRepository = require("../repositories/version.repository");

exports.findAll = async () => await versionRepository.findAll();

exports.findOne = async () => await versionRepository.findOne()

exports.findAll_By_CompanyID = async (company_id) =>
  await versionRepository.findAll_By_CompanyID(company_id);

exports.create = async (data) => await versionRepository.create(data);

exports.update = async (id, data) => await versionRepository.update(id, data);

exports.delete = async (id) => await versionRepository.delete(id);
