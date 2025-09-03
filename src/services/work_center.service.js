const WorkCenterRepository = require("../repositories/work_center.repository");

exports.findAll = async (id) =>
  await WorkCenterRepository.findWorkCenterAll(id);

exports.findWorkCenterAndName = async (id) =>
  await WorkCenterRepository.findWorkCenterAndName(id);

  exports.getbyWorkcentergroup = async (wc_group) =>
  await WorkCenterRepository.getbyWorkcentergroup(wc_group);

exports.findAllByID = async (id, u_define_id) =>
  await WorkCenterRepository.findWorkCenterAllByID(id, u_define_id);

exports.findListAll = async () => await WorkCenterRepository.findListAll();

exports.findListByCompany = async (company_id) =>
  await WorkCenterRepository.findListByCompany(company_id);
exports.getAlldata = async (id) => await WorkCenterRepository.getAlldata(id);

exports.create = async (data) => await WorkCenterRepository.create(data);

exports.update = async (id, data) =>
  await WorkCenterRepository.update(id, data);

exports.getAlldatabycompany = async (id) =>
  await WorkCenterRepository.getAlldatabycompany(id);

exports.delete = async (id) => await WorkCenterRepository.delete(id);

exports.findWorkCenterAllforganttchart = async (id,data) =>
  await WorkCenterRepository.findWorkCenterAllforganttchart(id,data);

  exports.findWorkCenterAllforganttchartday = async (id,data) =>
  await WorkCenterRepository.findWorkCenterAllforganttchartday(id,data);

  exports.findBywc_id = async (wc_id,company_id) => await WorkCenterRepository.findBywc_id(wc_id,company_id);