const KPITitleRepository = require("../repositories/kpi_title.repository");

exports.findAll = async (id) =>
  await KPITitleRepository.findKPITitleAll(id);

exports.findAllByID = async (id, u_define_id) =>
  await KPITitleRepository.findKPITitleAllByID(id, u_define_id);

exports.findListAll = async () => await KPITitleRepository.findListAll();

exports.findListByCompany = async (company_id) =>
  await KPITitleRepository.findListByCompany(company_id);
exports.getAlldata = async (id) => await KPITitleRepository.getAlldata(id);

exports.create = async (data) => await KPITitleRepository.create(data);

exports.update = async (id, data) =>
  await KPITitleRepository.update(id, data);

exports.getAlldatabycompany = async (id) =>
  await KPITitleRepository.getAlldatabycompany(id);

exports.delete = async (id) => await KPITitleRepository.delete(id);
