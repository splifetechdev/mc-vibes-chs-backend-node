const versionService = require("../services/version.service");

exports.getAll = async (req, res) => res.json(await versionService.findAll());

exports.getAll_By_CompanyID = async (req, res) =>
  res.json(await versionService.findAll_By_CompanyID(req.params.id));

exports.create = async (req, res) =>
  res.json(await versionService.create(req.body));

exports.update = async (req, res) =>
  res.json(await versionService.update(req.params.id, req.body));

exports.delete = async (req, res) =>
  res.json(await versionService.delete(req.params.id));
