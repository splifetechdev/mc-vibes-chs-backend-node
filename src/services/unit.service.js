const UnitRepository = require("../repositories/unit.repository");

exports.findAll = async (id) => await UnitRepository.findUnitAll(id);

exports.findAllByID = async (id) =>
  await UnitRepository.findUnitAllByID(id);

exports.findListAll = async () => await UnitRepository.findListAll();

exports.findListByCompany = async (company_id) =>
  await UnitRepository.findListByCompany(company_id);
exports.getAlldata = async (id) => await UnitRepository.getAlldata(id);

exports.create = async (data) => await UnitRepository.create(data);

exports.update = async (id, data) => await UnitRepository.update(id, data);

exports.getAlldatabycompany = async (id) =>
  await UnitRepository.getAlldatabycompany(id);

exports.delete = async (id) => await UnitRepository.delete(id);

exports.findUnitByunit_name = async (id,company_id) => await UnitRepository.findUnitByunit_name(id,company_id);
