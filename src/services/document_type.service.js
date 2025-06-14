const document_typeRepository = require("../repositories/document_type.repository");

exports.findById = async (id) => await document_typeRepository.findById(id);

exports.findAll = async () => await document_typeRepository.findAll();

exports.create = async (data) => await document_typeRepository.create(data);

exports.update = async (id, data) =>
  await document_typeRepository.update(id, data);

exports.delete = async (id) => await document_typeRepository.delete(id);
