const sectionRepository = require("../repositories/section.repository");

exports.findAll = async (id) =>
  await sectionRepository.findsectionAll(id);

exports.findAllByID = async (id) =>
  await sectionRepository.findsectionAllByID(id);
  
exports.getAlldata = async (id) => await sectionRepository.getAlldata(id);

exports.create = async (data) => await sectionRepository.create(data);

exports.update = async (id, data) =>
  await sectionRepository.update(id, data);

exports.getAlldatabycompany = async (id) => await sectionRepository.getAlldatabycompany(id);

exports.delete = async (id) => await sectionRepository.delete(id)

exports.findBycode = async (code,company_id) => await sectionRepository.findBycode(code,company_id);
