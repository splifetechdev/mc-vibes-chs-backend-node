const document_typeService = require("../services/document_type.service");

exports.findById = async (req, res) =>
  res.json(await document_typeService.findById(req.params.id));

exports.getAll = async (req, res) =>
  res.json(await document_typeService.findAll());

exports.create = async (req, res) =>
  res.json(await document_typeService.create(req.body));

exports.update = async (req, res) =>
  res.json(await document_typeService.update(req.params.id, req.body));

exports.delete = async (req, res) =>
  res.json(await document_typeService.delete(req.params.id));
