const reportallRepository = require("../repositories/reportall.repository");

exports.findAll = async () => await reportallRepository.findAll();

exports.findOne = async () => await reportallRepository.findOne()

exports.findAll_By_CompanyID = async (company_id) =>
  await reportallRepository.findAll_By_CompanyID(company_id);

exports.create = async (data) => await reportallRepository.create(data);

exports.update = async (id, data) => await reportallRepository.update(id, data);

exports.delete = async (id) => await reportallRepository.delete(id);

exports.cloth_registration_mch = async (sql) => await reportallRepository.cloth_registration_mch(sql);

exports.cloth_registration_sum = async (sql) => await reportallRepository.cloth_registration_sum(sql);

exports.cloth_registration_detail = async (sql) => await reportallRepository.cloth_registration_detail(sql);
