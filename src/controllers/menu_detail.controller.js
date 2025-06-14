const menuDetailService = require("../services/menu_detail.service");

exports.getAll = async (req, res) =>
  res.json(await menuDetailService.findAll());

exports.getAllDetailGroupMenu = async (req, res) =>
  res.json(await menuDetailService.findAllDetailGroupMenu());

exports.getLast1MenuDetail = async (req, res) =>
  res.json(await menuDetailService.findLast1MenuDetail());

exports.create = async (req, res) =>
  res.json(await menuDetailService.create(req.body));

exports.update = async (req, res) =>
  res.json(await menuDetailService.update(req.params.id, req.body));

exports.delete = async (req, res) =>
  res.json(await menuDetailService.delete(req.params.id));
