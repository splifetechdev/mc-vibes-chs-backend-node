const receive_from_poRepository = require("../repositories/receive_from_po.repository");
const doc_runningService = require("../services/doc_running.service");

exports.getReceiveAllByCompanyId = async (company_id) =>
  await receive_from_poRepository.getReceiveAllByCompanyId(company_id);

exports.getTimeCardReceiveAllById = async (id) =>
  await receive_from_poRepository.getTimeCardReceiveAllById(id);

exports.getReceiveAllByCompanyIdAndId = async (company_id, id) =>
  await receive_from_poRepository.getReceiveAllByCompanyIdAndId(company_id, id);

exports.findById = async (id) => await receive_from_poRepository.findById(id);

exports.saveReceivePO = async (data) => {
  data.timecard_doc_running_no = await doc_runningService.docGenerate(
    "TC-FAC1"
  );
  return await receive_from_poRepository.saveReceivePO(data);
};

exports.deleteTimCardItem = async (id, qty, time_card_id, opn_ord_id) =>
  await receive_from_poRepository.deleteTimCardItem(
    id,
    qty,
    time_card_id,
    opn_ord_id
  );

exports.getReceivePODocIdPrefix = async () =>
  await receive_from_poRepository.getReceivePODocIdPrefix();


exports.findAll = async (id) =>
  await receive_from_poRepository.findreceive_from_poAll(id);

exports.create = async (data) => await receive_from_poRepository.create(data);

exports.update = async (id, data) =>
  await receive_from_poRepository.update(id, data);

exports.delete = async (id) => await receive_from_poRepository.delete(id);

exports.findSystemId = async () =>
  await receive_from_poRepository.findSystemId();
