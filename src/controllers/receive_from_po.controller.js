const receive_from_poService = require("../services/receive_from_po.service");

exports.getReceiveAllByCompanyId = async (req, res) =>
  res.json(
    await receive_from_poService.getReceiveAllByCompanyId(req.params.company_id)
  );

exports.getTimeCardReceiveAllById = async (req, res) =>
  res.json(
    await receive_from_poService.getTimeCardReceiveAllById(req.params.id)
  );

exports.getReceiveAllByCompanyIdAndId = async (req, res) =>
  res.json(
    await receive_from_poService.getReceiveAllByCompanyIdAndId(
      req.params.company_id,
      req.params.id
    )
  );

exports.saveReceivePO = async (req, res) =>
  res.json(await receive_from_poService.saveReceivePO(req.body));

exports.deleteTimCardItem = async (req, res) =>
  res.json(
    await receive_from_poService.deleteTimCardItem(
      req.params.id,
      req.params.qty,
      req.params.time_card_id,
      req.params.opn_ord_id,
    )
  );

exports.findById = async (req, res) =>
  res.json(await receive_from_poService.findById(req.params.id));

exports.getReceivePODocIdPrefix = async (req, res) =>
  res.json(await receive_from_poService.getReceivePODocIdPrefix());

exports.getAll = async (req, res) =>
  res.json(await receive_from_poService.findAll(req.params.id));

exports.create = async (req, res) =>
  res.json(await receive_from_poService.create(req.body));

exports.update = async (req, res) => {
  res.json(await receive_from_poService.update(req.params.id, req.body));
};

exports.delete = async (req, res) => {
  res.json(await receive_from_poService.delete(req.params.id));
};
