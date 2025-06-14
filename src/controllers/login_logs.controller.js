const loginLogsService = require("../services/login_logs.service");

exports.getAll = async (req, res) =>
  res.json(await loginLogsService.findAll());

exports.create = async (req, res) =>
  res.json(await loginLogsService.create(req.body));

exports.update = async (req, res) =>
  res.json(await loginLogsService.update(req.params.id, req.body));

exports.delete = async (req, res) =>
  res.json(await loginLogsService.delete(req.params.id));
