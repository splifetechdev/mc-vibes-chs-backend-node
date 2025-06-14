const tbl_routingRepository = require("../repositories/tbl_routing.repository");

exports.findAll = async (id) =>
  await tbl_routingRepository.findtbl_routingAll(id);

exports.findRoutingByRTGID = async (id) =>
  await tbl_routingRepository.findRoutingByRTGID(id);

exports.findroutingByID = async (id) =>
  await tbl_routingRepository.findroutingByID(id);

exports.findRoutingWorkOrder = async (item_master_id, company_id) =>
  await tbl_routingRepository.findRoutingWorkOrder(item_master_id, company_id);

exports.findRoutingWorkOrderByRTGID = async (
  item_master_id,
  rtg_id,
  company_id
) =>
  await tbl_routingRepository.findRoutingWorkOrderByRTGID(
    item_master_id,
    rtg_id,
    company_id
  );

exports.findRoutingHoliday = async (machine_id, company_id) =>
  await tbl_routingRepository.findRoutingHoliday(machine_id, company_id);

exports.findRoutingHolidayByMachineID = async (machine_id, company_id) =>
  await tbl_routingRepository.findRoutingHolidayByMachineID(
    machine_id,
    company_id
  );

exports.findRoutingShift = async (machine_id, company_id) =>
  await tbl_routingRepository.findRoutingShift(machine_id, company_id);

exports.findtbl_routingAllgroupby = async (id) =>
  await tbl_routingRepository.findtbl_routingAllgroupby(id);

exports.findAllByID = async (id, u_define_id) =>
  await tbl_routingRepository.findtbl_routingAllByID(id, u_define_id);

exports.searchbyitem_rtg = async (
  item_master_id,
  rtg_id,
  company_id,
  u_define_module_id
) =>
  await tbl_routingRepository.searchbyitem_rtg(
    item_master_id,
    rtg_id,
    company_id,
    u_define_module_id
  );

exports.checkvalidaterouting = async (data) =>
  await tbl_routingRepository.checkvalidaterouting(data);

exports.create = async (data) => await tbl_routingRepository.create(data);

exports.update = async (id, data) =>
  await tbl_routingRepository.update(id, data);

exports.delete = async (id) => await tbl_routingRepository.delete(id);


exports.getrtg_id_item_id = async (id, item_master_id,rtg_id) =>
  await tbl_routingRepository.getrtg_id_item_id(id, item_master_id,rtg_id);

  exports.getSumSTD = async (item_master_id,rtg_id) =>
  await tbl_routingRepository.getSumSTD(item_master_id,rtg_id);

  exports.getIsrtg_idanditem_id = async (id, item_master_id,rtg_id) =>
  await tbl_routingRepository.getIsrtg_idanditem_id(id, item_master_id,rtg_id);


  exports.getItemhavestd_cost = async (item_master_id,company_id) =>
  await tbl_routingRepository.getItemhavestd_cost(item_master_id,company_id);