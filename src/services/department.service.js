const departmentRepository = require("../repositories/department.repository");

exports.findAll = async (id) =>
  await departmentRepository.findDepartmentAll(id);

exports.findAllByID = async (id) =>
  await departmentRepository.findDepartmentAllByID(id);

exports.findListAll = async () => await departmentRepository.findListAll();

exports.findListByCompany = async (company_id) =>
  await departmentRepository.findListByCompany(company_id);
exports.getAlldata = async (id) => await departmentRepository.getAlldata(id);

exports.create = async (data) => await departmentRepository.create(data);

exports.update = async (id, data) =>
  await departmentRepository.update(id, data);

exports.getAlldatabycompany = async (id) => await departmentRepository.getAlldatabycompany(id);

exports.delete = async (id) => await departmentRepository.delete(id)

exports.findBycode = async (code,company_id) => await departmentRepository.findBycode(code,company_id);
