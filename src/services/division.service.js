const divisionRepository = require("../repositories/division.repository");

exports.findAll = async (id) =>
  await divisionRepository.finddivisionAll(id);

exports.findAllByID = async (id) =>
  await divisionRepository.finddivisionAllByID(id);

  exports.getAllByDepartment = async (id) =>
  await divisionRepository.getAllByDepartment(id);
  
exports.getAlldata = async (id) => await divisionRepository.getAlldata(id);

exports.create = async (data) => await divisionRepository.create(data);

exports.update = async (id, data) =>
  await divisionRepository.update(id, data);

exports.getAlldatabycompany = async (id) => await divisionRepository.getAlldatabycompany(id);

exports.delete = async (id) => await divisionRepository.delete(id)

exports.findBycode = async (code,company_id) => await divisionRepository.findBycode(code,company_id);
