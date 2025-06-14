const tbl_ord_receiveService = require("../services/tbl_ord_receive.service");

exports.getAll = async (req, res) =>
  res.json(await tbl_ord_receiveService.findAll(req.params.id));

exports.findById = async (req, res) =>
  res.json(await tbl_ord_receiveService.findById(req.params.id));


exports.create = async (req, res) =>
  res.json(await tbl_ord_receiveService.create(req.body));

exports.update = async (req, res) => {
  try {
    res.status(201).json(await tbl_ord_receiveService.update(req.params.id, req.body));
  } catch (error) {
    res.json({ message: error.message });
    return;
  }
};

exports.delete = async (req, res) => {
  try {
    res.json(await tbl_ord_receiveService.delete(req.params.id));
  } catch (error) {
    res.json({ message: error.message });
    return;
  }
};