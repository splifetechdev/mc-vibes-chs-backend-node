const KPIMasterRepository = require("../repositories/kpi_master.repository");

exports.findAll = async (id) => await KPIMasterRepository.findKPIMasterAll(id);

exports.findAllByID = async (id, u_define_id) =>
  await KPIMasterRepository.findKPIMasterAllByID(id, u_define_id);

exports.findListAll = async () => await KPIMasterRepository.findListAll();

exports.findListByCompany = async (company_id) =>
  await KPIMasterRepository.findListByCompany(company_id);
exports.getAlldata = async (id) => await KPIMasterRepository.getAlldata(id);

exports.create = async (data) => await KPIMasterRepository.create(data);

exports.update = async (id, data) => await KPIMasterRepository.update(id, data);

exports.getAlldatabycompany = async (id) =>
  await KPIMasterRepository.getAlldatabycompany(id);

exports.getKPIMasterList = async ( company_id) =>
  await KPIMasterRepository.getKPIMasterList( company_id);

exports.delete = async (id) => await KPIMasterRepository.delete(id);
