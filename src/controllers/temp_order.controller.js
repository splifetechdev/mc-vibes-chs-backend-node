const TempOrderService = require("../services/temp_order.service");

exports.getAll = async (req, res) =>
  res.json(await TempOrderService.findAll(req.params.id));

exports.getAllByID = async (req, res) =>
  res.json(
    await TempOrderService.findAllByID(req.params.id, req.params.u_define_id)
  );

exports.create = async (req, res) =>
  res.json(await TempOrderService.create(req.body));

exports.update = async (req, res) => {
  try {
    res.status(201).json(await TempOrderService.update(req.params.id, req.body));
  } catch (error) {
    res.json({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    res.status(200).json(await TempOrderService.delete(req.params.id));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
