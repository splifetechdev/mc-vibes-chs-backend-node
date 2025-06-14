const costingRepository = require("../repositories/costing.repository");
const cost_foh_per_opnRepository = require("../repositories/cost_foh_per_opn.repository");
const cost_labor_per_opnRepository = require("../repositories/cost_labor_per_opn.repository");
const cost_per_timecardRepository = require("../repositories/cost_per_timecard.repository");

exports.searchByV_ORD_costing = async (data) =>
  await costingRepository.searchByV_ORD_costing(data);

exports.runcostbymanual = async (data) =>
  await costingRepository.runcostbymanual(data);

exports.deletecost_foh_per_opnbydate = async (date) =>
  await cost_foh_per_opnRepository.deletebydate(date);

exports.deletecost_labor_per_opnbydate = async (date) =>
  await cost_labor_per_opnRepository.deletebydate(date);

exports.deletecost_per_timecardbydate = async (date) =>
  await cost_per_timecardRepository.deletebydate(date);


exports.SearchORDCostingDetailH = async (doc_running_no) =>
  await costingRepository.SearchORDCostingDetailH(doc_running_no);

exports.SearchORDCostingDetailD = async (doc_running_no) =>
  await costingRepository.SearchORDCostingDetailD(doc_running_no);