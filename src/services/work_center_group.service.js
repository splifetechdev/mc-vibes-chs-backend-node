const WorkCenterGroupRepository = require("../repositories/work_center_group.repository");

exports.findAll = async (id) =>
  await WorkCenterGroupRepository.findWorkCenterGroupAll(id);
exports.findWorkCenterGroupAndName = async (id) =>
  await WorkCenterGroupRepository.findWorkCenterGroupAndName(id);

exports.findWorkCenterGroupByMachineId = async (machine_id) =>
  await WorkCenterGroupRepository.findWorkCenterGroupByMachineId(machine_id);

exports.findAllByID = async (id, u_define_id) =>
  await WorkCenterGroupRepository.findWorkCenterGroupAllByID(id, u_define_id);

exports.findListAll = async () => await WorkCenterGroupRepository.findListAll();

exports.findListByCompany = async (company_id) =>
  await WorkCenterGroupRepository.findListByCompany(company_id);
exports.getAlldata = async (id) =>
  await WorkCenterGroupRepository.getAlldata(id);

exports.create = async (data) => await WorkCenterGroupRepository.create(data);

exports.update = async (id, data) =>
  await WorkCenterGroupRepository.update(id, data);

exports.getAlldatabycompany = async (id) =>
  await WorkCenterGroupRepository.getAlldatabycompany(id);

exports.delete = async (id) => await WorkCenterGroupRepository.delete(id);

exports.findWorkCenterAllforganttchart = async (id, data) =>
  await WorkCenterGroupRepository.findWorkCenterAllforganttchart(id, data);

exports.findWorkCenterAllforganttchartday = async (id, data) =>
  await WorkCenterGroupRepository.findWorkCenterAllforganttchartday(id, data);

exports.findBywork_center_group_id = async (work_center_group_id,company_id) => await WorkCenterGroupRepository.findBywork_center_group_id(work_center_group_id,company_id);