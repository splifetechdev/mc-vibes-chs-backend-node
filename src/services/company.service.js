const companyRepository = require("../repositories/company.repository");

exports.findById = async (id) => await companyRepository.findById(id);

exports.findAll = async (id) => await companyRepository.findCompanyAll(id);

exports.create = async (data) => await companyRepository.create(data);

exports.update = async (id, data) => await companyRepository.update(id, data);

exports.findSystemId = async () => await companyRepository.findSystemId();