const OrderService = require("../services/order.service");

exports.getAll = async (req, res) =>
  res.json(await OrderService.findAll(req.params.id));

exports.getAllByOrdId = async (req, res) =>
  res.json(await OrderService.findAllByOrdId(req.params.id));

exports.getOrderByQuery = async (req, res) =>
  res.json(await OrderService.getOrderByQuery(req.params.id, req.body));

exports.findIdByDocRunning = async (req, res) =>
  res.json(await OrderService.findIdByDocRunning(req.params.doc_running , req.params.id));

exports.findAdjustPlanDraftByDocRunning = async (req, res) =>
  res.json(
    await OrderService.findAdjustPlanDraftByDocRunning(req.params.doc_running)
  );

exports.getAllByID = async (req, res) =>
  res.json(
    await OrderService.findAllByID(req.params.id, req.params.u_define_id)
  );

exports.create = async (req, res) =>
  res.json(await OrderService.create(req.body));

exports.update = async (req, res) => {
  try {
    res.status(201).json(await OrderService.update(req.params.id, req.body));
  } catch (error) {
    res.json({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    res.status(200).json(await OrderService.delete(req.params.id));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
